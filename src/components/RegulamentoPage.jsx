// src/components/RegulamentoPage.jsx
import React from 'react';
import '../styles/RegulamentoPage.css'; // We'll create this CSS file

const CATEGORIAS_REGULAMENTO = [
  { id: 'A', description: 'Categoria A: ( 2º ano de Iniciação)' },
  { id: 'B', description: 'Categoria B: ( 3º e 4º ano de Iniciação)' },
  { id: 'C', description: 'Categoria C: ( 1º e 2º Grau do Ensino Artístico Especializado)' },
  { id: 'D', description: 'Categoria D: ( 3º e 4º Grau do Ensino Artístico Especializado)' },
  { id: 'E', description: 'Categoria E: ( 5º e 6º Grau do Ensino Artístico Especializado)' },
  { id: 'F', description: 'Categoria F: ( 7º e 8º Grau do Ensino Artístico Especializado)' }
];

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
            <strong>Categorias:</strong> O concurso está dividido nas seguintes categorias:
            <ul className="category-list-rg">
                          {CATEGORIAS_REGULAMENTO.map(cat => (
                            <li key={cat.id}>{cat.description}</li>
                          ))}
                        </ul>

          </li>
        </ol>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 3º – Inscrições</h2>
        <p>
          As inscrições deverão ser efetuadas online através do formulário disponível na página do concurso até à data de <strong> 10 de junho de 2025</strong>.
          Será necessário submeter:
        </p>
        <ul>
          <li>Ficha de inscrição devidamente preenchida.</li>
          <li>Indicação das peças a apresentar (conforme Artigo 4º).</li>
          <li>Comprovativo de pagamento da taxa de inscrição.
              <p><ul>A inscrição terá um valor de 30€ e deverá ser paga a para o IBAN PT50 0035 0123 00134544930 85</ul></p>
              </li>
          <li>Partituras das peças (em formato PDF).</li>
          <li>Fotografia do participante.</li>
        </ul>
        <p><em>A não submissão de todos os elementos dentro do prazo poderá invalidar a inscrição.</em></p>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 4º – Repertório</h2>
        <p>
          Cada participante deverá apresentar 2 peças de estilos contrastantes.
          A duração total da apresentação não deverá exceder:
        </p>
        <ul>
          <li>Categoria A: 5 minutos</li>
          <li>Categoria B: 5 minutos</li>
          <li>Categoria C: 10 minutos</li>
          <li>Categoria D: 10 minutos</li>
          <li>Categoria E: 15 minutos</li>
          <li>Categoria F: 15 minutos</li>
        </ul>

      </section>

      <section className="regulamento-section">
        <h2>Artigo 5º – Júri</h2>
        <p>
          O júri será constituído por personalidades de reconhecido mérito no panorama musical e pedagógico. A composição do júri será divulgada na página oficial do concurso. As decisões do júri são soberanas e irrecorríveis.
        </p>
      </section>

      <section className="regulamento-section">
        <h2>Artigo 6º – Avaliação e Classificação/Prémios</h2>
        <p>
          Os critérios de avaliação incluirão:
        </p>
        <ul>
          <li>Afinação</li>
          <li>Rigor rítmico e métrico</li>
          <li>Qualidade sonora</li>
          <li>Postura</li>
          <li>Interpretação</li>
          <li>Presença em palco</li>
        </ul>
        <p>Serão atribuídos prémios aos primeiros classificados das categoria D,E e F. Poderão ser atribuídas menções honrosas a critério do júri.</p>
        <p>Serão atribuídos diplomas a todos os participantes do concurso.</p>
        <p>Os primeiros classificados poderão participar no concerto de laureados a ser realizado no próprio dia na parte da tarde em horário a definir.</p>
      </section>



      <section className="regulamento-section">
            <h2>Artigo 7º – Datas</h2>
            <p>
              Para a presente edição serão de considerar as seguintes datas:
              <ul>
                        <li>Inscrições: até 10 de junho</li>
                        <li>Calendarização: disponível a 12 de junho</li>
                        <li>Provas: 14 de junho</li>
                        <li>Resultados: 14 de junho (após término de todas as categorias)</li>
                        <li>Concerto Laureados (1º prémios): 14 de junho - horário a definir</li>
                      </ul>

            </p>
          </section>

     <section className="regulamento-section">
        <h2>Artigo 8º – Disposições Finais</h2>
        <p>
          Casos omissos neste regulamento serão resolvidos pela comissão organizadora do concurso. A participação no concurso implica a aceitação integral do presente regulamento.
        </p>
      </section>


    <section className="regulamento-section">
            <h2>Artigo 9º – Contactos</h2>
            <p>
             Para esclarecimentos adicionais poderão contactar a organização através do e-mail miguel.gil@cmacg.pt
            </p>
          </section>

      <footer className="page-footer-rg">
        <p>Escola Artística do Conservatório de Música Calouste Gulbenkian de Aveiro</p>
      </footer>
    </div>
  );
}