// src/pages/FinalScoresPage.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { collection, getDocs, query, orderBy as fbOrderBy } from 'firebase/firestore'; // Renamed orderBy to fbOrderBy
import { db } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

import Navbar from '../components/Navbar';
import '../styles/FinalScoresPage.css';

const CRITERIA_KEYS = ['afinacao', 'ritmo', 'som', 'tecnica', 'expressividade', 'presenca'];
const CATEGORY_ORDER = ['Iniciante', 'Intermédio', 'Avançado']; // Define desired order

// --- Helper Function to calculate a single jury's average score for a participant ---
const calculateJuryAverageForParticipant = (scores) => {
  let totalScore = 0;
  let criteriaCount = 0;
  CRITERIA_KEYS.forEach(key => {
    if (scores[key] !== undefined) {
      totalScore += scores[key];
      criteriaCount++;
    }
  });
  return criteriaCount > 0 ? parseFloat((totalScore / criteriaCount).toFixed(2)) : 0;
};

// --- Helper Function to aggregate evaluations into participant data ---
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
        category: participantCategoria || 'Categoria Desconhecida',
        juryScores: {}, // { juryEmail1: score1, juryEmail2: score2 }
        criteriaTotals: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
        criteriaCounts: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      };
    }

    const currentP = participantData[participantId];
    const juryAverage = calculateJuryAverageForParticipant(scores);
    if (juryAverage > 0) { // Only add if the jury actually scored something
        currentP.juryScores[juryEmail] = juryAverage;
    }


    CRITERIA_KEYS.forEach(key => {
      if (scores[key] !== undefined) {
        currentP.criteriaTotals[key] += scores[key];
        currentP.criteriaCounts[key]++;
      }
    });
  });
  return participantData;
};

// --- Helper Function to calculate final scores and group by category ---
const calculateAndGroupScores = (participantData) => {
  const scoresByCategory = {};

  Object.values(participantData).forEach(p => {
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
        : 0; // Or 'N/A'
    });

    const participantResult = {
      ...p,
      overallAverage: parseFloat(finalAverageScore.toFixed(2)),
      criteriaAveragesForDisplay: displayCriteriaAverages,
      numberOfJuriesWhoScored: individualJuryOverallScores.length,
    };

    if (!scoresByCategory[p.category]) {
      scoresByCategory[p.category] = [];
    }
    scoresByCategory[p.category].push(participantResult);
  });

  // Sort participants within each category
  for (const category in scoresByCategory) {
    scoresByCategory[category].sort((a, b) => {
      if (b.overallAverage !== a.overallAverage) {
        return b.overallAverage - a.overallAverage;
      }
      return a.name.localeCompare(b.name); // Tie-breaking by name
    });
  }
  return scoresByCategory;
};


export default function FinalScoresPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  // Store scores grouped by category
  const [scoresByCategories, setScoresByCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/");
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (user) {
      const fetchAndProcess = async () => {
        setIsLoading(true);
        setError('');
        try {
          const q = query(collection(db, 'avaliacoes'), fbOrderBy('timestamp', 'desc'));
          const querySnapshot = await getDocs(q);
          const evaluations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const aggregatedData = aggregateEvaluations(evaluations);
          const finalGroupedScores = calculateAndGroupScores(aggregatedData);
          setScoresByCategories(finalGroupedScores);

        } catch (err) {
          console.error("Error fetching evaluations:", err);
          setError('Erro ao carregar as avaliações. Tente novamente.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndProcess();
    }
  }, [user]);

  // Memoize sorted category keys to maintain order
  const sortedCategoryNames = useMemo(() => {
    return Object.keys(scoresByCategories).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      // Handle categories not in CATEGORY_ORDER by pushing them to the end
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [scoresByCategories]);


  if (loadingAuth || (isLoading && !error && Object.keys(scoresByCategories).length === 0)) {
    return (
      <div className="page-loading-container">
        <p className="loading-text">Carregando resultados finais...</p>
      </div>
    );
  }

  return (
    <div className="final-scores-page-container">
      <main className="final-scores-content">
        <h1 className="page-title">Resultados Finais do Concurso</h1>

        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && sortedCategoryNames.length === 0 && (
          <p>Ainda não há avaliações submetidas para exibir os resultados.</p>
        )}

        {sortedCategoryNames.map(categoryName => (
          <div key={categoryName} className="category-section">
            <h2 className="category-title">{categoryName}</h2>
            {scoresByCategories[categoryName] && scoresByCategories[categoryName].length > 0 ? (
              <div className="scores-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Lugar</th>
                      <th>Participante</th>
                      {/* Removed Categoria from table as it's in the section title */}
                      {CRITERIA_KEYS.map(key => (
                        <th key={key} className="criterion-header">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                      ))}
                      <th>Júris</th>
                      <th>Média Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoresByCategories[categoryName].map((participant, index) => (
                      <tr key={participant.id}>
                        <td>{index + 1}º</td>
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
            ) : (
              <p>Sem avaliações para esta categoria.</p>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}