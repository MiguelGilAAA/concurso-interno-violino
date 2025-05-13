// src/components/JuryFinalScoresPage.jsx (or FinalScoresPage.jsx if that's the jury one)
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy as fbOrderBy } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Assuming auth is needed for useAuthState
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

// import Navbar from '../components/Navbar'; // Assuming Navbar is provided by JuryLayout
import '../styles/FinalScoresPage.css'; // Ensure this path is correct

const CRITERIA_KEYS = ['afinacao', 'ritmo', 'som', 'tecnica', 'expressividade', 'presenca'];
// Ensure your CATEGORY_ORDER in the submission form matches these keys if they are different
const CATEGORY_ORDER = ['A - 2º ano de iniciação', 'B - 3º e 4º ano de iniciação', 'C - 1º e 2º Grau', 'D - 3º e 4º Grau', 'E - 5º e 6º Grau', 'F - 7º e 8º Grau'];


// Helper Function to calculate a single jury's average score
const calculateJuryAverageForParticipant = (scores) => {
  let totalScore = 0;
  let criteriaCount = 0;
  CRITERIA_KEYS.forEach(key => {
    if (scores && scores[key] !== undefined) { // Added check for scores existence
      totalScore += scores[key];
      criteriaCount++;
    }
  });
  return criteriaCount > 0 ? parseFloat((totalScore / criteriaCount).toFixed(2)) : 0;
};

// Helper Function to aggregate evaluations
const aggregateEvaluations = (evaluations) => {
  const participantData = {};
  evaluations.forEach(evaluation => {
    const { participantId, participantName, participantCategoria, juryEmail, scores } = evaluation;
    if (!participantId || !scores || !juryEmail) {
      console.warn('Skipping evaluation due to missing data:', evaluation);
      return;
    }
    if (!participantData[participantId]) {
      participantData[participantId] = {
        id: participantId,
        name: participantName || 'Nome Desconhecido',
        category: participantCategoria || 'Categoria Desconhecida', // This should match CATEGORY_ORDER values
        juryScores: {},
        criteriaTotals: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
        criteriaCounts: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      };
    }
    const currentP = participantData[participantId];
    const juryAverage = calculateJuryAverageForParticipant(scores);
    if (juryAverage > 0 || (scores && Object.keys(scores).length > 0)) { // Consider if jury gave all zeros
        currentP.juryScores[juryEmail] = juryAverage;
    }
    CRITERIA_KEYS.forEach(key => {
      if (scores && scores[key] !== undefined) {
        currentP.criteriaTotals[key] += scores[key];
        currentP.criteriaCounts[key]++;
      }
    });
  });
  return participantData;
};

// --- UPDATED: Helper Function to calculate final scores, group, and rank with Ex Aequo ---
const calculateAndGroupScores = (participantData) => {
  const scoresByCategory = {};

  // Calculate overall averages for all participants first
  const participantsWithAverages = Object.values(participantData).map(p => {
    const individualJuryOverallScores = Object.values(p.juryScores);
    let finalAverageScore = 0;
    if (individualJuryOverallScores.length > 0) {
      const sumOfJuryAverages = individualJuryOverallScores.reduce((sum, score) => sum + score, 0);
      finalAverageScore = sumOfJuryAverages / individualJuryOverallScores.length;
    }

    const displayCriteriaAverages = {};
    CRITERIA_KEYS.forEach(key => {
      displayCriteriaAverages[key] = p.criteriaCounts[key] > 0
        ? parseFloat((p.criteriaTotals[key] / p.criteriaCounts[key]).toFixed(2))
        : 0;
    });

    return {
      ...p,
      overallAverage: parseFloat(finalAverageScore.toFixed(2)),
      criteriaAveragesForDisplay: displayCriteriaAverages,
      numberOfJuriesWhoScored: individualJuryOverallScores.length,
    };
  });

  // Group by category
  participantsWithAverages.forEach(participantResult => {
    const category = participantResult.category || 'Sem Categoria';
    if (!scoresByCategory[category]) {
      scoresByCategory[category] = [];
    }
    scoresByCategory[category].push(participantResult);
  });

  // Sort and assign places within each category
  for (const categoryKey in scoresByCategory) {
    // Sort by overallAverage descending, then by name ascending for stable sort on ties
    scoresByCategory[categoryKey].sort((a, b) => {
      if (b.overallAverage !== a.overallAverage) {
        return b.overallAverage - a.overallAverage;
      }
      return a.name.localeCompare(b.name);
    });

    // Assign places considering ties (Ex Aequo)
    let currentRank = 0;
    let lastScore = -1; // Initialize with a score no one can get
    let participantsAtCurrentRank = 0;

    scoresByCategory[categoryKey].forEach((participant, index) => {
      if (participant.overallAverage !== lastScore) {
        // New score, so this is a new rank
        currentRank = index + 1; // Simple rank progression (1st, 2nd, 3rd after ties)
        participantsAtCurrentRank = 1;
        participant.place = currentRank;
        participant.isExAequo = false;
      } else {
        // Same score as previous, so same rank
        participant.place = currentRank;
        participantsAtCurrentRank++;
        participant.isExAequo = true;
        // Mark the previous one(s) also as exAequo if they share this rank
        // This ensures all members of a tied group are marked
        for (let i = 1; i < participantsAtCurrentRank; i++) {
            if (scoresByCategory[categoryKey][index - i].overallAverage === participant.overallAverage) {
                scoresByCategory[categoryKey][index - i].isExAequo = true;
            } else {
                break; // Stop if scores differ
            }
        }
      }
      lastScore = participant.overallAverage;
    });
  }
  return scoresByCategory;
};


export default function JuryFinalScoresPage() { // Renamed for clarity if this is the jury version
  const [user, loadingAuth] = useAuthState(auth); // Assuming this page is protected
  const navigate = useNavigate();
  const [scoresByCategories, setScoresByCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This page should be wrapped by JuryLayout which handles auth redirect
    if (!loadingAuth && !user) {
      // navigate("/jurylogin"); // Handled by JuryLayout
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (user) { // Only fetch if user (jury) is available
      const fetchAndProcess = async () => {
        setIsLoading(true);
        setError('');
        try {
          // Fetch all evaluations
          const q = query(collection(db, 'avaliacoes'), fbOrderBy('timestamp', 'desc'));
          const querySnapshot = await getDocs(q);
          const evaluations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const aggregatedData = aggregateEvaluations(evaluations);
          const finalGroupedScores = calculateAndGroupScores(aggregatedData); // Uses the updated function
          setScoresByCategories(finalGroupedScores);

        } catch (err) {
          console.error("Error fetching evaluations:", err);
          setError('Erro ao carregar as avaliações. Tente novamente.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndProcess();
    } else if (!loadingAuth && !user) {
        // If not loading and still no user, might indicate an issue or direct access attempt
        setIsLoading(false); // Stop loading if no user and not in auth loading state
        setError("Autenticação necessária para ver esta página.");
    }
  }, [user, loadingAuth]); // Depend on user and loadingAuth

  const sortedCategoryNames = useMemo(() => {
    return Object.keys(scoresByCategories).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [scoresByCategories]);

  // Loading state for authentication is handled by JuryLayout
  // So we mainly care about isLoading for data fetching.
  if (isLoading) {
    return (
      // Navbar is in JuryLayout
      <div className="page-content-centered"> {/* Simple centered loading */}
        <p className="loading-text">Carregando resultados finais...</p>
      </div>
    );
  }

  return (
    // Navbar is in JuryLayout
    // The className "final-scores-page-container" might be redundant if JuryLayout's wrapper provides main styling
    <div className="jury-final-scores-content-area"> {/* More specific class for this page's content */}
      <main className="final-scores-content"> {/* Keep this for consistent max-width and centering */}
        <h1 className="page-title">Resultados Finais do Concurso (Júri)</h1>

        {error && <p className="error-message">{error}</p>}

        {!error && sortedCategoryNames.length === 0 && !isLoading && (
          <p>Ainda não há avaliações submetidas para exibir os resultados.</p>
        )}

        {sortedCategoryNames.map(categoryName => (
          scoresByCategories[categoryName] && scoresByCategories[categoryName].length > 0 && ( // Check if category exists and has items
            <div key={categoryName} className="category-section">
              <h2 className="category-title">{categoryName}</h2>
              <div className="scores-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Lugar</th>
                      <th>Participante</th>
                      {CRITERIA_KEYS.map(key => (
                        <th key={key} className="criterion-header">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                      ))}
                      <th>Júris</th>
                      <th>Média Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoresByCategories[categoryName].map((participant) => (
                      <tr key={participant.id}>
                        <td>
                          {participant.place}º
                          {participant.isExAequo && <span className="ex-aequo-tag"> (Ex Aequo)</span>}
                        </td>
                        <td>{participant.name}</td>
                        {CRITERIA_KEYS.map(key => (
                          <td key={key}>{participant.criteriaAveragesForDisplay[key]?.toFixed(2) ?? 'N/A'}</td>
                        ))}
                        <td>{participant.numberOfJuriesWhoScored}</td>
                        <td><strong>{participant.overallAverage.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ))}
      </main>
    </div>
  );
}