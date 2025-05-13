// src/components/PublicFinalScoresPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, doc, getDoc, orderBy as fbOrderBy } from 'firebase/firestore'; // Added doc, getDoc
import { db } from '../firebase';
import '../styles/PublicFinalScoresPage.css';

const CATEGORY_ORDER = ['Iniciante', 'Intermédio', 'Avançado'];

export default function PublicFinalScoresPage() {
  const [scoresByCategories, setScoresByCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultsAreLive, setResultsAreLive] = useState(false); // State to track if results should be shown

  // Effect 1: Check if results should be published (from contestConfig)
  useEffect(() => {
    const checkResultsStatus = async () => {
      setIsLoading(true); // Start loading while checking config
      try {
        const configDocRef = doc(db, 'contestConfig', 'vConcurso2025'); // Adjust if your doc ID is different
        const docSnap = await getDoc(configDocRef);

        if (docSnap.exists() && docSnap.data().resultsLive === true) {
          setResultsAreLive(true);
        } else {
          setResultsAreLive(false);
          // console.log("Results are not live or config not found.");
        }
      } catch (e) {
        console.error("Error fetching contest config:", e);
        setResultsAreLive(false); // Default to not showing on error
        setError("Não foi possível verificar o estado da publicação dos resultados.");
      }
      // Don't set isLoading to false here yet, let the next effect handle it after fetching scores if needed
    };
    checkResultsStatus();
  }, []); // Run once on mount

  // Effect 2: Fetch actual scores if resultsAreLive is true
  useEffect(() => {
    if (!resultsAreLive) {
      setIsLoading(false); // If results are not live, we are done loading
      setScoresByCategories({}); // Clear any old scores
      return;
    }

    const fetchPublishedScores = async () => {
      // setIsLoading(true); // Already set by the first effect or will be set if resultsAreLive was false then true
      setError('');
      try {
        const q = query(
          collection(db, 'publishedScores_v2025'), // Fetch from your pre-processed collection
          fbOrderBy('category'), // Order by category first
          fbOrderBy('place')     // Then by place within each category
        );
        const querySnapshot = await getDocs(q);
        const publishedResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Group results by category
        const groupedScores = publishedResults.reduce((acc, item) => {
          const category = item.category || 'Sem Categoria';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});

        setScoresByCategories(groupedScores);

      } catch (err) {
        console.error("Error fetching published scores:", err);
        setError('Não foi possível carregar os resultados publicados. Por favor, tente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedScores();
  }, [resultsAreLive]); // Re-run this effect if resultsAreLive status changes

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
        <div className="public-final-scores-page">
            <header className="page-header-pfs"><h1>Resultados Finais do Concurso</h1></header>
            <p className="loading-text-pfs">A verificar e carregar resultados...</p>
        </div>
    );
  }

  if (!resultsAreLive) {
    return (
      <div className="public-final-scores-page">
        <header className="page-header-pfs"><h1>Resultados Finais do Concurso</h1></header>
        <div className="results-pending-message">
            <p>Os resultados finais serão divulgados após a conclusão e apuramento do concurso.</p>
            <p>Por favor, volte mais tarde!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-final-scores-page">
      <header className="page-header-pfs">
        <h1>Resultados Finais do Concurso</h1>
        <p className="page-subtitle-pfs">Classificação final por categoria.</p>
      </header>

      {error && <p className="error-message-pfs">{error}</p>}

      {!error && sortedCategoryNames.length === 0 && !isLoading && (
        <p className="no-results-message-pfs">Ainda não há resultados disponíveis para consulta.</p>
      )}

      {sortedCategoryNames.map(categoryName => (
        scoresByCategories[categoryName] && scoresByCategories[categoryName].length > 0 && (
          <div key={categoryName} className="category-section-pfs">
            <h2 className="category-title-pfs">{categoryName}</h2>
            <table className="scores-table-pfs">
              <thead>
                <tr>
                  <th>Lugar</th>
                  <th>Participante</th>
                </tr>
              </thead>
              <tbody>
                {scoresByCategories[categoryName].map((participant) => ( // No index needed if 'place' comes from data
                  <tr key={participant.id || participant.name}> {/* Use participant.id if available */}
                    <td>{participant.place}º</td> {/* Use place from data */}
                    <td>{participant.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ))}
    </div>
  );
}