// src/components/JuryFinalScoresPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy as fbOrderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

import '../styles/FinalScoresPage.css'; // Ensure this path is correct

const CRITERIA_KEYS = ['afinacao', 'ritmo', 'som', 'postura', 'expressividade', 'presenca'];
const CATEGORY_ORDER = ['A - 2º ano de iniciação', 'B - 3º e 4º ano de iniciação', 'C - 1º e 2º Grau', 'D - 3º e 4º Grau', 'E - 5º e 6º Grau', 'F - 7º e 8º Grau'];

// --- HELPER FUNCTIONS (Defined at module scope) ---

const getNumericalPlace = (awardString) => {
    if (!awardString || awardString === '' || awardString.toLowerCase().includes('calcular') || awardString.toLowerCase().includes('não definido')) return 999;
    if (awardString.toLowerCase().includes('menção honrosa')) return 99;
    if (awardString.toLowerCase().includes('não atribuído')) return 998;
    const match = awardString.match(/^(\d+)/);
    if (match && parseInt(match[1], 10) === 0) return 997;
    return match ? parseInt(match[1], 10) : 996;
};

const processAwardString = (awardString) => {
    let numericalPlace = 999;
    let displayString = awardString;
    let isExAequoByString = false;
    if (!awardString || awardString === '' || awardString.toLowerCase().includes('calcular') || awardString.toLowerCase().includes('não definido')) {
        numericalPlace = 999; displayString = '';
    } else if (awardString.toLowerCase().includes('menção honrosa')) {
        numericalPlace = 99; displayString = 'Menção Honrosa';
        if (awardString.toLowerCase().includes('ex aequo')) isExAequoByString = true;
    } else if (awardString.toLowerCase().includes('não atribuído')) {
        numericalPlace = 998; displayString = 'Não Atribuído';
    } else {
        const match = awardString.match(/^(\d+)/);
        if (match) {
            numericalPlace = parseInt(match[1], 10);
            if (numericalPlace === 0) numericalPlace = 997;
        } else { numericalPlace = 996; }
        if (awardString.toLowerCase().includes('ex aequo')) isExAequoByString = true;
    }
    return { numericalPlace, displayString, isExAequoByString };
};

const calculateJuryAverageForParticipant = (scores) => {
  let totalScore = 0;
  let criteriaCount = 0;
  CRITERIA_KEYS.forEach(key => {
    if (scores && scores[key] !== undefined) {
      totalScore += scores[key];
      criteriaCount++;
    }
  });
  return criteriaCount > 0 ? parseFloat((totalScore / criteriaCount).toFixed(2)) : 0;
};

const aggregateParticipantData = async () => {
    const participantDataMap = new Map();
    const inscricoesQuery = query(collection(db, "inscricoes"), fbOrderBy("dataInscricao", "desc"));
    const inscricoesSnapshot = await getDocs(inscricoesQuery);

    inscricoesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        participantDataMap.set(doc.id, {
            id: doc.id,
            name: data.nome || 'Nome Desconhecido',
            category: data.categoria || 'Categoria Desconhecida',
            grau: data.grau || 'Grau não especificado',
            finalOfficialAward: data.finalOfficialAward || '',
            juryScores: {}, // Initialize as empty object
            criteriaTotals: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
            criteriaCounts: CRITERIA_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
            email: data.email || '',
        });
    });

    const avaliacoesQuery = query(collection(db, 'avaliacoes'), fbOrderBy('timestamp', 'desc'));
    const avaliacoesSnapshot = await getDocs(avaliacoesQuery);

    avaliacoesSnapshot.docs.forEach(doc => {
        const evaluation = doc.data();
        const { participantId, juryEmail, scores } = evaluation;
        if (participantDataMap.has(participantId) && scores && juryEmail) {
            const currentP = participantDataMap.get(participantId);
            const juryAverage = calculateJuryAverageForParticipant(scores);
            if (Object.keys(scores).length > 0 && (juryAverage >= 0)) { // Check if scores object has keys and average is valid
                 currentP.juryScores[juryEmail] = juryAverage;
            }
            CRITERIA_KEYS.forEach(key => {
                if (scores[key] !== undefined) {
                    currentP.criteriaTotals[key] += scores[key];
                    currentP.criteriaCounts[key]++;
                }
            });
        } else if (participantId && (!scores || !juryEmail)) {
            console.warn('Skipping evaluation: missing scores/juryEmail for participantId:', participantId, evaluation);
        }
    });
    return Object.fromEntries(participantDataMap);
};

const calculateAndGroupScores = (rawParticipantData) => {
  const scoresByCategory = {};

  if (!rawParticipantData || typeof rawParticipantData !== 'object') {
    console.error("calculateAndGroupScores received invalid rawParticipantData:", rawParticipantData);
    return scoresByCategory;
  }

  const participantsWithDetails = Object.values(rawParticipantData).map(p => {
    if (!p) { // Safeguard for undefined participant object
        console.warn("Encountered undefined participant in rawParticipantData");
        return null; // Will be filtered out later
    }

    const individualJuryOverallScores = (p.juryScores && typeof p.juryScores === 'object') ? Object.values(p.juryScores) : [];
    let finalAverageScore = 0;
    if (individualJuryOverallScores.length > 0) {
      finalAverageScore = individualJuryOverallScores.reduce((sum, score) => sum + score, 0) / individualJuryOverallScores.length;
    }

    const displayCriteriaAverages = {};
    if (p.criteriaCounts && typeof p.criteriaCounts === 'object' && p.criteriaTotals && typeof p.criteriaTotals === 'object') {
        CRITERIA_KEYS.forEach(key => {
          displayCriteriaAverages[key] = p.criteriaCounts[key] > 0
            ? parseFloat((p.criteriaTotals[key] / p.criteriaCounts[key]).toFixed(2))
            : 0;
        });
    } else {
        CRITERIA_KEYS.forEach(key => { displayCriteriaAverages[key] = 0; });
        // console.warn("Missing criteriaCounts or criteriaTotals for participant:", p.id);
    }

    const awardInfo = processAwardString(p.finalOfficialAward);

    return {
      ...p,
      overallAverage: parseFloat(finalAverageScore.toFixed(2)),
      criteriaAveragesForDisplay: displayCriteriaAverages,
      numberOfJuriesWhoScored: individualJuryOverallScores.length,
      awardNumericalPlace: awardInfo.numericalPlace,
      awardDisplayStringFromJury: awardInfo.displayString,
      awardIsExAequoByJuryString: awardInfo.isExAequoByString,
    };
  }).filter(p => p !== null); // Filter out any null participants from malformed data

  participantsWithDetails.forEach(participantResult => {
    if (!participantResult || !participantResult.category) {
        console.warn("Skipping participant result due to missing data:", participantResult);
        return;
    }
    const category = participantResult.category; // Assuming category is always present now
    if (!scoresByCategory[category]) scoresByCategory[category] = [];
    scoresByCategory[category].push(participantResult);
  });

  for (const categoryKey in scoresByCategory) {
    const categoryParticipants = scoresByCategory[categoryKey];

    categoryParticipants.sort((a, b) => {
      if (!a || !b) return 0; // Safeguard
      const placeNumA = a.awardNumericalPlace;
      const placeNumB = b.awardNumericalPlace;
      if (placeNumA !== placeNumB) return placeNumA - placeNumB;
      if (b.overallAverage !== a.overallAverage) return b.overallAverage - a.overallAverage;
      return a.name.localeCompare(b.name);
    });

    let scoreBasedRankCounter = 0;
    let lastScoreForRanking = -Infinity;
    categoryParticipants.forEach(p => {
      if (!p) return;
      if (p.awardNumericalPlace === 999) {
        if (p.overallAverage !== lastScoreForRanking) {
          scoreBasedRankCounter++;
        }
        p.scoreBasedNumericalRank = scoreBasedRankCounter;
        lastScoreForRanking = p.overallAverage;
      } else {
        p.scoreBasedNumericalRank = p.awardNumericalPlace;
      }
    });

    categoryParticipants.forEach((participant, index) => {
      if (!participant) return;
      participant.isExAequo = false;

      if (participant.awardNumericalPlace !== 999) {
        participant.placeDisplayString = participant.awardDisplayStringFromJury;
        participant.isExAequo = participant.awardIsExAequoByJuryString;
        if (!participant.isExAequo && index > 0) {
          const prev = categoryParticipants[index - 1];
          if (prev && participant.awardDisplayStringFromJury === prev.awardDisplayStringFromJury &&
              participant.awardNumericalPlace < 99 && prev.awardNumericalPlace < 99) {
            participant.isExAequo = true;
            prev.isExAequo = true;
          }
        }
        if (participant.isExAequo && !participant.placeDisplayString.toLowerCase().includes('ex aequo') && participant.awardNumericalPlace < 99) {
            participant.placeDisplayString += " (Ex Aequo)";
        }
      } else {
        participant.placeDisplayString = `${participant.scoreBasedNumericalRank}º`;
        participant.isExAequo = false;
        const prev = categoryParticipants[index - 1];
        const next = categoryParticipants[index + 1];
        const tiedWithPreviousScore = prev && prev.awardNumericalPlace === 999 && participant.overallAverage === prev.overallAverage && participant.scoreBasedNumericalRank === prev.scoreBasedNumericalRank;
        const tiedWithNextScore = next && next.awardNumericalPlace === 999 && participant.overallAverage === next.overallAverage && participant.scoreBasedNumericalRank === next.scoreBasedNumericalRank;

        if (tiedWithPreviousScore || tiedWithNextScore) {
            participant.isExAequo = true;
        }
        if (participant.isExAequo) {
          if (tiedWithPreviousScore && !prev.placeDisplayString.toLowerCase().includes('ex aequo')) {
              prev.placeDisplayString = `${prev.scoreBasedNumericalRank}º (Ex Aequo)`;
          }
          if (!participant.placeDisplayString.toLowerCase().includes('ex aequo')) {
              participant.placeDisplayString += " (Ex Aequo)";
          }
        }
        if (participant.scoreBasedNumericalRank > 3) {
          participant.placeDisplayString = 'Menção Honrosa';
          participant.isExAequo = false;
        }
      }
      if (participant.placeDisplayString === "0º") participant.placeDisplayString = "Não Atribuído";
      if (!participant.placeDisplayString || ["999º","998º","997º","996º"].includes(participant.placeDisplayString) || participant.placeDisplayString === "") {
          participant.placeDisplayString = "-";
      }
    });

    // Final sort based on the numerical interpretation of the final display string
    categoryParticipants.sort((a, b) => {
        if (!a || !b) return 0;
        const finalPlaceNumA = getNumericalPlace(a.placeDisplayString);
        const finalPlaceNumB = getNumericalPlace(b.placeDisplayString);
        if (finalPlaceNumA !== finalPlaceNumB) return finalPlaceNumA - finalPlaceNumB;
        if (b.overallAverage !== a.overallAverage) return b.overallAverage - a.overallAverage;
        return a.name.localeCompare(b.name);
    });
  }
  return scoresByCategory;
};

export default function JuryFinalScoresPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const navigate = useNavigate();
  const [scoresByCategories, setScoresByCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loadingAuth && !user) {
      // navigate("/jurylogin"); // Handled by JuryLayout
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (user) {
      const fetchAndProcess = async () => {
        setIsLoading(true); setError('');
        try {
          const aggregatedRawData = await aggregateParticipantData();
          const finalGroupedScores = calculateAndGroupScores(aggregatedRawData);
          setScoresByCategories(finalGroupedScores);
        } catch (err) {
          console.error("Error fetching or processing evaluations:", err);
          setError('Erro ao carregar as avaliações. Tente novamente.');
        } finally { setIsLoading(false); }
      };
      fetchAndProcess();
    } else if (!loadingAuth && !user) {
        setIsLoading(false); setError("Autenticação necessária para ver esta página.");
    }
  }, [user, loadingAuth]);

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

  if (isLoading) {
    return (
      <div className="page-content-centered">
        <p className="loading-text">Carregando resultados finais...</p>
      </div>
    );
  }

  return (
    <div className="jury-final-scores-content-area">
      <main className="final-scores-content">
        <h1 className="page-title">Resultados Finais do Concurso (Júri)</h1>
        {error && <p className="error-message">{error}</p>}
        {!error && sortedCategoryNames.length === 0 && !isLoading && (
          <p>Ainda não há dados de participantes ou avaliações para exibir os resultados.</p>
        )}
        {sortedCategoryNames.map(categoryName => (
          scoresByCategories[categoryName] && scoresByCategories[categoryName].length > 0 && (
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
                      <th>Júris (Nº)</th>
                      <th>Média Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoresByCategories[categoryName].map((participant) => (
                      // Add a null check for participant before trying to access its properties
                      participant ? (
                        <tr key={participant.id}>
                          <td>
                            {participant.placeDisplayString}
                          </td>
                          <td>{participant.name}</td>
                          {CRITERIA_KEYS.map(key => (
                            <td key={key}>
                              {participant.criteriaAveragesForDisplay && participant.criteriaAveragesForDisplay[key] !== undefined
                                ? participant.criteriaAveragesForDisplay[key].toFixed(2)
                                : 'N/A'}
                            </td>
                          ))}
                          <td>{participant.numberOfJuriesWhoScored}</td>
                          <td><strong>{participant.overallAverage?.toFixed(2) ?? 'N/A'}</strong></td>
                        </tr>
                      ) : null // Or some placeholder for a null participant if that can happen
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