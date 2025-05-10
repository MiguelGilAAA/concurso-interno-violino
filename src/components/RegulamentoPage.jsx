// src/components/RegulamentoPage.jsx
import React from 'react';
import '../styles/RegulamentoPage.css'; // We'll create this CSS file

export default function RegulamentoPage() {
  return (
    <div className="regulamento-page-container">
      <header className="page-header-rg">
        <h1>Regulamento do V Concurso Interno de Violino</h1>
      </header>

      <section className="regulamento-section">
        <h2>Artigo 1º – Objetivos</h2>
        <p>
          O V Concurso Interno de Violino, promovido pela Escola Artística do Conservatório de Música Calouste Gulbenkian de Aveiro, visa:
        </p>
        <ul>
          <li>Estimular o estudo do violino entre os alunos da instituição.</li>
          <li>Proporcionar uma plataforma para a apresentação pública do trabalho desenvolvido.</li>
          <li>Promover o intercâmbio de experiências musicais entre os participantes.</li>
          <li>Identificar e valorizar jovens talentos.</li>
        </ul>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 2º – Elegibilidade e Categorias</h2>
        <ol>
          <li>
            <strong>Elegibilidade:</strong> Podem concorrer todos os alunos regularmente matriculados na disciplina de Violino da Escola Artística do Conservatório de Música Calouste Gulbenkian de Aveiro no presente ano letivo.
          </li>
          <li>
            <strong>Categorias:</strong> O concurso está dividido nas seguintes categorias, de acordo com o nível de proficiência e idade (exemplos):
            <ul>
              <li>Categoria A: Iniciantes (até X anos de estudo / Y idade)</li>
              <li>Categoria B: Intermédios Nível 1 (até X anos de estudo / Y idade)</li>
              <li>Categoria C: Intermédios Nível 2 (até X anos de estudo / Y idade)</li>
              <li>Categoria D: Avançados (mais de X anos de estudo / Y idade)</li>
            </ul>
            <p><em>Nota: A definição exata das categorias será detalhada pela organização.</em></p>
          </li>
        </ol>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 3º – Inscrições</h2>
        <p>
          As inscrições deverão ser efetuadas online através do formulário disponível na página do concurso, dentro do prazo estipulado.
          Será necessário submeter:
        </p>
        <ul>
          <li>Ficha de inscrição devidamente preenchida.</li>
          <li>Indicação das peças a apresentar (conforme Artigo 4º).</li>
          <li>Comprovativo de pagamento da taxa de inscrição (se aplicável).</li>
          <li>Partituras das peças (em formato PDF).</li>
          <li>Fotografia tipo passe do participante.</li>
        </ul>
        <p><em>A não submissão de todos os elementos dentro do prazo poderá invalidar a inscrição.</em></p>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 4º – Repertório</h2>
        <p>
          Cada participante deverá apresentar X peças de estilos contrastantes, sendo uma delas obrigatoriamente de compositor português (ou outra especificação).
          A duração total da apresentação não deverá exceder:
        </p>
        <ul>
          <li>Categoria A: Y minutos</li>
          <li>Categoria B: Z minutos</li>
          {/* ... etc ... */}
        </ul>
        <p>As peças devem ser executadas de memória (ou indicar se é opcional/obrigatório).</p>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 5º – Júri</h2>
        <p>
          O júri será constituído por personalidades de reconhecido mérito no panorama musical e pedagógico. A composição do júri será divulgada na página oficial do concurso. As decisões do júri são soberanas e irrecorríveis.
        </p>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 6º – Avaliação e Classificação</h2>
        <p>
          Os critérios de avaliação incluirão, mas не se limitarão a:
        </p>
        <ul>
          <li>Afinação</li>
          <li>Rigor rítmico e métrico</li>
          <li>Qualidade sonora (Timbre, Projeção, Articulação)</li>
          <li>Técnica instrumental (Posição, Arcos, Dedilhação)</li>
          <li>Interpretação (Expressividade, Fraseado, Dinâmicas, Carácter)</li>
          <li>Presença em palco e adequação postural</li>
        </ul>
        <p>Serão atribuídos prémios aos primeiros classificados de cada categoria. Poderão ser atribuídas menções honrosas a critério do júri.</p>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 7º – Disposições Finais</h2>
        <p>
          Casos omissos neste regulamento serão resolvidos pela comissão organizadora do concurso. A participação no concurso implica a aceitação integral do presente regulamento.
        </p>
      </section>

      <footer className="page-footer-rg">
        <p>Escola Artística do Conservatório de Música Calouste Gulbenkian de Aveiro</p>
        <p>Data da última atualização do regulamento: DD/MM/AAAA</p>
      </footer>
    </div>
  );
}