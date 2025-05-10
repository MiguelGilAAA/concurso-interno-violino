// src/pages/PublicMainPage.jsx
import React from 'react';
import '../styles/PublicMainPage.css'; // Create this CSS file

export default function PublicMainPage() {
  return (
    <div className="public-main-page">
      <header className="hero-section">
        <h1>IV Concurso Interno de Violino</h1>
        <p>Bem-vindo à página oficial do nosso concurso! Descubra talentos, consulte o regulamento e acompanhe os resultados.</p>
        {/* You can add an image or carousel here */}
      </header>

      <section className="contest-info">
        <h2>Sobre o Concurso</h2>
        <p>
          Este é um espaço dedicado à celebração da música e do talento jovem no violino.
          Organizado pela Escola Artística do Conservatório de Música Calouste Gulbenkian de Aveiro...
          {/* More details about the contest */}
        </p>
      </section>

      <section className="key-dates">
        <h2>Datas Importantes</h2>
        <ul>
          <li><strong>Inscrições:</strong> DD/MM/AAAA - DD/MM/AAAA</li>
          <li><strong>Concurso:</strong> 15 de Junho de 2024</li>
          <li><strong>Divulgação de Resultados:</strong> DD/MM/AAAA (após o término)</li>
        </ul>
      </section>
      {/* Add more sections as needed: sponsors, previous editions, etc. */}
    </div>
  );
}