import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // certifique-se de que o caminho está correto
import '../FichaAvaliacao.css';

export default function FichaAvaliacao() {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    afinacao: 5,
    ritmo: 5,
    som: 5,
    tecnica: 5,
    expressividade: 5,
    presenca: 5,
    pontoForte: '',
    sugestao: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.categoria) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await addDoc(collection(db, 'avaliacoes'), {
        ...formData,
        timestamp: serverTimestamp(),
      });

      setSuccessMessage('✅ Avaliação enviada com sucesso!');
      setFormData({
        nome: '',
        categoria: '',
        afinacao: 5,
        ritmo: 5,
        som: 5,
        tecnica: 5,
        expressividade: 5,
        presenca: 5,
        pontoForte: '',
        sugestao: '',
      });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      setErrorMessage('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="form-wrapper">
        <h2 className="form-title">Ficha de Avaliação 🎻</h2>

        {successMessage && <div className="message success-message">{successMessage}</div>}
        {errorMessage && <div className="message error-message">{errorMessage}</div>}

        <div className="form-group">
          <input
            type="text"
            id="nome"
            name="nome"
            placeholder="Nome do aluno"
            value={formData.nome}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Selecione a categoria</option>
            <option value="Iniciante">Iniciante</option>
            <option value="Intermédio">Intermédio</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>

        {['afinacao', 'ritmo', 'som', 'tecnica', 'expressividade', 'presenca'].map((campo) => (
          <div key={campo} className="range-slider-container">
            <label htmlFor={campo} className="form-label">{campo}</label>
            <div className="range-slider-wrapper">
              <input
                type="range"
                id={campo}
                name={campo}
                min="0"
                max="10"
                value={formData[campo]}
                onChange={handleSliderChange}
                className="form-range"
              />
              <div className="range-value">{formData[campo]}</div>
            </div>
          </div>
        ))}

        <div className="form-group">
          <textarea
            id="pontoForte"
            name="pontoForte"
            placeholder="Ponto forte da atuação"
            value={formData.pontoForte}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <textarea
            id="sugestao"
            name="sugestao"
            placeholder="Sugestão para evolução"
            value={formData.sugestao}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </button>
      </form>
    </div>
  );
}
