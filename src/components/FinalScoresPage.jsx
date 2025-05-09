// src/pages/FinalScoresPage.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as necessary
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

import Navbar from '../components/Navbar'; // Adjust path
import '../styles/FinalScoresPage.css';

const CRITERIA_KEYS = ['afinacao', 'ritmo', 'som', 'tecnica', 'expressividade', 'presenca'];

export default function FinalScoresPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [finalScores, setFinalScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/");
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (user) {
      const fetchAndProcessScores = async () => {
        setIsLoading(true);
        setError('');
        try {
          const q = query(collection(db, 'avaliacoes'), orderBy('timestamp', 'desc'));
          const querySnapshot = await getDocs(q);
          const evaluations = [];
          querySnapshot.forEach((doc) => {
            evaluations.push({ id: doc.id, ...doc.data() });
          });

          processEvaluations(evaluations);

        } catch (err) {
          console.error("Error fetching evaluations:", err);
          setError('Erro ao carregar as avaliações. Tente novamente.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAndProcessScores();
    }
  }, [user]);

  const processEvaluations = (evaluations) => {
    const participantData = {}; // Store data per participant

    evaluations.forEach(evaluation => {
      const { participantId, participantName, participantCategoria, juryEmail, scores } = evaluation;

      // Ensure essential data is present
      if (!participantId || !scores || !juryEmail) {
          console.warn('Skipping evaluation due to missing data:', evaluation);
          return;
      }

      if (!participantData[participantId]) {
        participantData[participantId] = {
          id: participantId,
          name: participantName || 'Nome Desconhecido',
          category: participantCategoria || 'Categoria Desconhecida',
          juryScores: {}, // Object to store overall score from each jury { juryEmail1: score1, juryEmail2: score2 }
          // For displaying detailed criteria averages across all juries (optional, but good for transparency)
          criteriaTotals: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
          criteriaCounts: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
        };
      }

      const currentParticipant = participantData[participantId];

      // Calculate this specific jury's overall score for this participant
      let juryOverallScoreForParticipant = 0;
      let criteriaScoredByThisJury = 0;
      CRITERIA_KEYS.forEach(key => {
        if (scores[key] !== undefined) {
          juryOverallScoreForParticipant += scores[key];
          criteriaScoredByThisJury++;

          // Accumulate for overall criteria averages (for display in table)
          currentParticipant.criteriaTotals[key] += scores[key];
          currentParticipant.criteriaCounts[key]++;
        }
      });

      if (criteriaScoredByThisJury > 0) {
        const averageScoreFromThisJury = juryOverallScoreForParticipant / criteriaScoredByThisJury;
        // Store this jury's average score for this participant, keyed by juryEmail to avoid double counting if a jury submits twice by mistake.
        // If a jury *can* submit multiple times and you want the latest, you'd need to handle that (e.g., by timestamp if stored).
        // For now, we assume one final evaluation per jury per participant.
        currentParticipant.juryScores[juryEmail] = parseFloat(averageScoreFromThisJury.toFixed(2));
      }
    });

    const aggregatedScores = Object.values(participantData).map(p => {
      const individualJuryOverallScores = Object.values(p.juryScores);
      let finalAverageScore = 0;

      if (individualJuryOverallScores.length > 0) {
        const sumOfJuryAverages = individualJuryOverallScores.reduce((sum, score) => sum + score, 0);
        finalAverageScore = sumOfJuryAverages / individualJuryOverallScores.length;
      }

      // Calculate overall criteria averages (for table display)
      const displayCriteriaAverages = {};
      CRITERIA_KEYS.forEach(key => {
        if (p.criteriaCounts[key] > 0) {
          displayCriteriaAverages[key] = parseFloat((p.criteriaTotals[key] / p.criteriaCounts[key]).toFixed(2));
        } else {
          displayCriteriaAverages[key] = 0; // Or 'N/A'
        }
      });

      return {
        ...p,
        overallAverage: parseFloat(finalAverageScore.toFixed(2)),
        criteriaAveragesForDisplay: displayCriteriaAverages, // These are averages across all juries for each criterion
        numberOfJuriesWhoScored: individualJuryOverallScores.length,
      };
    });

    // Sort by overallAverage descending, then by name ascending
    aggregatedScores.sort((a, b) => {
      if (b.overallAverage !== a.overallAverage) {
        return b.overallAverage - a.overallAverage;
      }
      return a.name.localeCompare(b.name);
    });

    setFinalScores(aggregatedScores);
  };

  // ... (rest of the component remains the same as before: isLoading, error handling, rendering table)
  // Ensure the table rendering part uses `participant.criteriaAveragesForDisplay` for the criteria columns
  // and `participant.overallAverage` for the "Média Final"

  if (loadingAuth || (isLoading && !error)) {
    return (
        <div className="page-loading-container">
            <Navbar user={user} />
            <p className="loading-text">Carregando resultados finais...</p>
        </div>
    );
  }

  return (
    <div className="final-scores-page-container">
      <Navbar user={user} />
      <main className="final-scores-content">
        <h1 className="page-title">Resultados Finais do Concurso</h1>

        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && finalScores.length === 0 && (
          <p>Ainda não há avaliações submetidas para exibir os resultados.</p>
        )}

        {!isLoading && !error && finalScores.length > 0 && (
          <div className="scores-table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Participante</th>
                  <th>Categoria</th>
                  {/* Optional: Display individual criteria averages across all juries */}
                  {CRITERIA_KEYS.map(key => (
                    <th key={key} className="criterion-header">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                  ))}
                  <th>Júris</th>
                  <th>Média Final</th>
                </tr>
              </thead>
              <tbody>
                {finalScores.map((participant, index) => (
                  <tr key={participant.id}>
                    <td>{index + 1}º</td>
                    <td>{participant.name}</td>
                    <td>{participant.category}</td>
                    {/* Displaying criteria averages across all juries */}
                    {CRITERIA_KEYS.map(key => (
                      <td key={key}>{participant.criteriaAveragesForDisplay[key] !== undefined ? participant.criteriaAveragesForDisplay[key].toFixed(2) : 'N/A'}</td>
                    ))}
                    <td>{participant.numberOfJuriesWhoScored}</td>
                    <td><strong>{participant.overallAverage.toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}