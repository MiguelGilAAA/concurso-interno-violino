// Example in App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import JuryDashboard from './components/JuryDashboard';
import FinalScoresPage from './components/FinalScoresPage';


function App() {
  return (
    <Router basename="/concurso-interno-violino">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/avaliar" element={<JuryDashboard />} />
        <Route path="/final-scores" element={<FinalScoresPage />} />

        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;