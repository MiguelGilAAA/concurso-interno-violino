// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Login.css"; // Import your CSS file

// Import your logos (adjust paths as needed)
import logoGulbenkian from "../assets/images/logo-gulbenkian.png"; // Replace with your actual path
import logoRepublica from "../assets/images/logo-republica-portuguesa.png"; // Replace with your actual path

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/avaliar"); // redireciona após login
    } catch (err) {
      setError("Email ou senha inválidos");
    }
  };

  return (
    <div className="login-container">
      <Link to="/" className="login-logo-link"> {/* <<< ADDED Link WRAPPER */}
              <img
                src={logoGulbenkian}
                alt="Logótipo Calouste Gulbenkian - Ir para Página Principal" // More descriptive alt text
                className="login-logo-main"
              />
      </Link>
      <h1 className="title-title">Concurso Interno Violino 2025</h1>
      <h3 className="login-title">Login do Júri</h3>
      <form onSubmit={handleLogin} className="login-form">
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="login-error">{error}</p>}
        <button className="login-button" type="submit">
          Entrar
        </button>
      </form>
      <img
        src={logoRepublica}
        alt="República Portuguesa Logo"
        className="login-logo-footer"
      />
    </div>
  );
}