// src/pages/PublicMainPage.jsx
import React from 'react';
import '../styles/PublicMainPage.css'; // Create this CSS file


import logoConcurso2025 from '../assets/images/logo2025.png';

export default function PublicMainPage() {
  return (
    <div className="public-main-page">
      <header className="hero-section">
             {/* Use the logo image here */}
             <img
               src={logoConcurso2025}
               alt="V Concurso Interno de Violino 2025"
               className="hero-logo" // Specific class for this logo
             />
             {/* Optional: Keep a tagline or remove if the logo is sufficient */}
             <p className="hero-tagline">
               Bem-vindo à página oficial do nosso concurso! Descubra talentos, consulte o regulamento e acompanhe os resultados.
             </p>
           </header>
      <section className="contest-info">
       <h2>Sobre o Concurso</h2>
       <p>
         Este é um espaço dedicado à celebração da música e do talento jovem no violino.
         Organizado pela Escola Artística do Conservatório de Música Calouste Gulbenkian de Aveiro,
         o Concurso Interno de Violino tem como principais objetivos estimular o estudo do instrumento entre os alunos da instituição e incentivar a sua evolução artística através da preparação para uma atuação em contexto de apresentação pública.
       </p>
       <p>
         Para além de ser uma oportunidade para os participantes mostrarem o trabalho desenvolvido ao longo do ano letivo, o concurso promove o intercâmbio de experiências musicais, permitindo o contacto com diferentes abordagens interpretativas.
         Através deste evento, a escola procura também identificar e valorizar jovens talentos, contribuindo para o seu crescimento musical e pessoal num ambiente de partilha e motivação.
       </p>

      </section>

      <section className="key-dates">
        <h2>Datas Importantes</h2>
        <ul>
          <li><strong>Inscrições:</strong> até 10/06/2025</li>
          <li><strong>Concurso:</strong> 14 de Junho de 2025</li>
          <li><strong>Divulgação de Resultados:</strong> 14 de Junho de 2025 (após o término)</li>
        </ul>
      </section>
      {/* Add more sections as needed: sponsors, previous editions, etc. */}
    </div>
  );
}