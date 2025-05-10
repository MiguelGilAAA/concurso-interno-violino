// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Layout Components
import MainLayout from './components/MainLayout';
import JuryLayout from './components/JuryLayout';

// Public Pages
import PublicMainPage from './components/PublicMainPage';
import ParticipantSubmissionPage from './components/ParticipantSubmissionPage';
import RegulamentoPage from './components/RegulamentoPage';
import ParticipantesVEdicaoPage from './components/ParticipantesVEdicaoPage';
import JuriInfoPage from './components/JuriInfoPage';
import PublicFinalScoresPage from './components/PublicFinalScoresPage';

// Jury Specific Pages
import Login from './components/Login'; // Your original Login component
import JuryDashboardPage from './components/JuryDashboard';
import JuryFinalScoresPage from './components/FinalScoresPage';

function App() {
  return (
    <Router basename="/concurso-interno-violino">
      <Routes>
        {/* --- Public Routes (using MainLayout with Hidden Menu) --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<PublicMainPage />} />
          <Route path="/inscricao" element={<ParticipantSubmissionPage />} />
          <Route path="/regulamento" element={<RegulamentoPage />} />
          <Route path="/participantes" element={<ParticipantesVEdicaoPage />} />
          <Route path="/juri" element={<JuriInfoPage />} />
          <Route path="/resultados" element={<PublicFinalScoresPage />} />
        </Route>

        {/* --- Jury Routes --- */}
        <Route path="/jurylogin" element={<Login />} />
        <Route element={<JuryLayout />}>
          <Route path="/avaliar" element={<JuryDashboardPage />} />
          <Route path="/resultados-juri" element={<JuryFinalScoresPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;