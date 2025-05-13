// src/components/JuriInfoPage.jsx
import React from 'react';
import '../styles/JuriInfoPage.css'; // We'll still use the same CSS for consistent styling

// Import your actual images or use placeholders
// Ensure these files exist at the specified paths or use URLs
import juriImage1 from '../assets/images/juri-placeholder-1.jpeg'; // Replace with actual image path
import juriImage2 from '../assets/images/juri-placeholder-2.jpeg'; // Replace with actual image path
import juriImage3 from '../assets/images/juri-placeholder-3.jpeg'; // Replace with actual image path

export default function JuriInfoPage() {
  return (
    <div className="juri-info-page-container">
      <header className="page-header-ji">
        <h1>Membros do Júri</h1>

      </header>

      <div className="jury-members-grid">
        {/* Jury Member 1 */}
        <div className="jury-member-card">
          <div className="jury-member-image-container">
            <img src={juriImage1} alt="David Bento" className="jury-member-image" />
          </div>
          <div className="jury-member-info">
            <h3>David Bento</h3>
            <h4>Jovem promessa do violino português</h4>
            <p className="jury-member-bio">
              David Bento conta-se entre os violinistas portugueses mais activos da sua geração, e tem atuado regularmente em recital e a solo com orquestra, tanto na sua terra natal como no estrangeiro.

              Como entusiasta apaixonado de música de câmara, atua regularmente em festivais internacionais de destaque tais como Stockholm Kammermusik Festival, ProMusica Carynthia, Attergau Kulturtage, Styriarte Festival, Steirische Kammermusikfestival, Marvão International Music Festival entre outros.

              David Bento colabora com músicos proeminentes e músicos jovens, tais como Tero Latvala, Varoujan Bartikian, Alexander Zemtsov, Franz Bartholomey, Eszter Haffner, Jevgēnijs Čepoveckis, Markus Schirmer, Reinhard Latzko, Benjamin Herzl.

              Nos últimos anos tem vindo a apresentar-se em alguns dos mais prestigiados salões internacionais, tais como, Salzburg Festspielhaus, Paris Philarmonie, Palau de la Musica Catalana, Wien Musikverein e Graz Musikverein.
            </p>

          </div>
        </div>

        {/* Jury Member 2 */}
        <div className="jury-member-card">
          <div className="jury-member-image-container">
            <img src={juriImage2} alt="Judit Bánk" className="jury-member-image" />
          </div>
          <div className="jury-member-info">
            <h3>Judit Bánk</h3>
            <h4>Chefe de Naipe de Viola da Orquestra Filarmonia das Beiras</h4>
           <p className="jury-member-bio">
             Judit Bánk estudou violino e viola de arco na Hungria e na Áustria, tendo concluído diplomas de solista e de ensino.
             Foi bolseira ERASMUS na Escola Superior de Música e Artes do Espetáculo do Instituto Politécnico do Porto, onde estudou com o professor Ryszard Woycicki e a professora Amandine Beyer.
             É viola solista da Orquestra Filarmonia das Beiras desde 2009 e já se apresentou com várias orquestras internacionais.
             Mantém intensa atividade na música de câmara, colaborando com diversas formações de cordas, incluindo o Trio Atlântico.
           </p>


          </div>
        </div>

        {/* Jury Member 3 */}
        <div className="jury-member-card">
          <div className="jury-member-image-container">
            <img src={juriImage3} alt="Elitza Mladenova" className="jury-member-image" />
          </div>
          <div className="jury-member-info">
            <h3>Elitza Mladenova</h3>
            <h4>1º violino da Orquestra Filarmonia das Beiras</h4>
            <p className="jury-member-bio">

            </p>

          </div>
        </div>

        {/* Add more jury members directly here if needed */}

      </div>
    </div>
  );
}