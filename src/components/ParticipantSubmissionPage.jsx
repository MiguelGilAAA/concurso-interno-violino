// src/components/ParticipantSubmissionPage.jsx
import React, { useState } from 'react';
import '../styles/ParticipantSubmissionPage.css'; // Ensure this CSS is updated
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import sideImage from '../assets/images/side.png'; // Your decorative image
import SimpleModal from './SimpleModal'; // Import the modal component

const CATEGORIAS = ['A - 2º ano de iniciação', 'B - 3º e 4º ano de iniciação', 'C - 1º e 2º Grau', 'D - 3º e 4º Grau', 'E - 5º e 6º Grau', 'F - 7º e 8º Grau'];
const GRAUS = ['2º ano de iniciação', '3º ano de iniciação', '4º ano de iniciação', '1º Grau', '2º Grau', '3º Grau', '4º Grau', '5º Grau', '6º Grau', '7º Grau', '8º Grau'];

export default function ParticipantSubmissionPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    categoria: '',
    grau: '',
    nomeProfessor: '',
    peca1: '',
    peca2: '',
    partitura1File: null,
    partitura2File: null,
    fotoFile: null,
    comprovativoFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  // State for controlling the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const uploadFileAndGetURL = async (file, participantName, pathPrefix) => {
    if (!file) return null;
    const sanitizedParticipantName = participantName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'participante_desconhecido';
    const storagePath = `inscricoes/${sanitizedParticipantName}/${pathPrefix}/${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [`${pathPrefix}_${file.name}`]: Math.round(progress) }));
        },
        (error) => {
          console.error(`Upload failed for ${file.name} in ${pathPrefix}:`, error);
          setUploadProgress(prev => ({ ...prev, [`${pathPrefix}_${file.name}`]: 'Erro no Upload!' }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(prev => ({ ...prev, [`${pathPrefix}_${file.name}`]: 100 }));
            resolve(downloadURL);
          } catch (error) {
            console.error(`Failed to get download URL for ${file.name} in ${pathPrefix}:`, error);
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress({}); // Reset progress for new submission

    // Validation
    if (!formData.nome || !formData.email || !formData.categoria || !formData.grau || !formData.nomeProfessor || !formData.peca1) {
      setModalContent({ title: 'Campos Obrigatórios', message: 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Categoria, Grau, Professor, Peça 1).' });
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setModalContent({ title: 'E-mail Inválido', message: 'Por favor, insira um endereço de e-mail válido.' });
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }
    if (!formData.partitura1File || !formData.fotoFile || !formData.comprovativoFile) {
      setModalContent({ title: 'Ficheiros Obrigatórios', message: 'Partitura da Peça 1, Foto do Participante e Comprovativo de Inscrição são obrigatórios.' });
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      const participantNameForPath = formData.nome;

      // Upload files
      const partitura1Url = await uploadFileAndGetURL(formData.partitura1File, participantNameForPath, 'partituraPeca1');
      let partitura2Url = formData.partitura2File ? await uploadFileAndGetURL(formData.partitura2File, participantNameForPath, 'partituraPeca2') : null;
      const fotoUrl = await uploadFileAndGetURL(formData.fotoFile, participantNameForPath, 'fotoParticipante');
      const comprovativoUrl = await uploadFileAndGetURL(formData.comprovativoFile, participantNameForPath, 'comprovativoInscricao');

      if (!partitura1Url || !fotoUrl || !comprovativoUrl) {
          throw new Error("Falha no upload de um ou mais ficheiros obrigatórios. Verifique o progresso individual dos ficheiros.");
      }

      const inscriptionData = {
        nome: formData.nome,
        email: formData.email,
        categoria: formData.categoria,
        grau: formData.grau,
        nomeProfessor: formData.nomeProfessor,
        peca1: formData.peca1,
        peca2: formData.peca2 || '',
        partitura1Url: partitura1Url,
        partitura2Url: partitura2Url || '',
        fotoUrl: fotoUrl,
        comprovativoInscricaoUrl: comprovativoUrl,
        dataInscricao: serverTimestamp(),
        status: 'Pendente',
      };

      await addDoc(collection(db, 'inscricoes'), inscriptionData);

      setModalContent({ title: 'Sucesso!', message: 'Inscrição submetida com sucesso! Obrigado pela sua participação.' });
      setIsModalOpen(true);
      // Reset form fields
      setFormData({
        nome: '', email: '', categoria: '', grau: '', nomeProfessor: '', peca1: '', peca2: '',
        partitura1File: null, partitura2File: null, fotoFile: null, comprovativoFile: null,
      });
      if (e.target && typeof e.target.reset === 'function') {
          e.target.reset(); // Visually clears file inputs
      }
      setUploadProgress({}); // Clear progress indicators after successful submission

    } catch (error) {
      console.error("Erro ao submeter inscrição:", error);
      setModalContent({ title: 'Erro na Submissão', message: `Ocorreu um erro ao enviar a sua inscrição: ${error.message || 'Por favor, tente novamente ou contacte o suporte.'}` });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="submission-page-container">
      <SimpleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
      >
        <p>{modalContent.message}</p>
      </SimpleModal>

      <header className="page-header-submission">
        <h1>Formulário de Inscrição</h1>
        <p>V Concurso Interno de Violino</p>
      </header>

      <div className="submission-layout-grid">
        <div className="submission-form-container">
          <form onSubmit={handleSubmit} className="submission-form-content">
            {/* Inline submission status message is removed, modal handles it */}

            <div className="form-section">
              <h3>Dados do Participante</h3>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo:</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail de Contacto:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="exemplo@dominio.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="categoria">Categoria:</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione a Categoria...</option>
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="grau">Grau de Ensino Artístico:</label>
                <select
                  id="grau"
                  name="grau"
                  value={formData.grau}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o Grau...</option>
                  {GRAUS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="nomeProfessor">Nome do Professor:</label>
                <input
                  type="text"
                  id="nomeProfessor"
                  name="nomeProfessor"
                  value={formData.nomeProfessor}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Repertório</h3>
              <div className="form-group">
                <label htmlFor="peca1">Peça 1 (Título e Compositor):</label>
                <input
                  type="text"
                  id="peca1"
                  name="peca1"
                  value={formData.peca1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="peca2">Peça 2 (Título e Compositor - Opcional):</label>
                <input
                  type="text"
                  id="peca2"
                  name="peca2"
                  value={formData.peca2}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Documentos (PDF ou Imagem)</h3>
              <div className="form-group file-group">
                <label htmlFor="partitura1File">Partitura Peça 1:</label>
                <input
                  type="file"
                  id="partitura1File"
                  name="partitura1File"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {formData.partitura1File && <span className="file-name-display">{formData.partitura1File.name}</span>}
              </div>
              <div className="form-group file-group">
                <label htmlFor="partitura2File">Partitura Peça 2 (Opcional):</label>
                <input
                  type="file"
                  id="partitura2File"
                  name="partitura2File"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {formData.partitura2File && <span className="file-name-display">{formData.partitura2File.name}</span>}
              </div>
              <div className="form-group file-group">
                <label htmlFor="fotoFile">Fotografia do Participante:</label>
                <input
                  type="file"
                  id="fotoFile"
                  name="fotoFile"
                  onChange={handleChange}
                  accept=".jpg,.jpeg,.png"
                  required
                />
                {formData.fotoFile && <span className="file-name-display">{formData.fotoFile.name}</span>}
              </div>
              <div className="form-group file-group">
                <label htmlFor="comprovativoFile">Comprovativo Inscrição:</label>
                <input
                  type="file"
                  id="comprovativoFile"
                  name="comprovativoFile"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {formData.comprovativoFile && <span className="file-name-display">{formData.comprovativoFile.name}</span>}
              </div>
            </div>

            {/* Upload Progress Display */}
            {isLoading && Object.keys(uploadProgress).length > 0 && (
                <div className="form-section upload-progress-display">
                    <h4>Progresso do Upload:</h4>
                    {Object.entries(uploadProgress).map(([fileNameWithPrefix, progress]) => (
                        <div key={fileNameWithPrefix} className="progress-item">
                            <span className="file-name-progress">
                                {fileNameWithPrefix.length > 40 ? '...' + fileNameWithPrefix.slice(-37) : fileNameWithPrefix}:
                            </span>
                            <div className="progress-bar-container">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${typeof progress === 'number' ? progress : 0}%` }}
                                >
                                    {(typeof progress === 'number' && progress > 5) || typeof progress === 'string' ?
                                     (typeof progress === 'number' ? `${progress}%` : progress)
                                     : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
              type="submit"
              className="submit-btn-submission"
              disabled={isLoading}
            >
              {isLoading ? 'A Enviar Inscrição...' : 'Submeter Inscrição'}
            </button>
          </form>
        </div>

        <div className="submission-image-container">
          <img
            src={sideImage}
            alt="Concurso de Violino"
            className="submission-side-image"
          />
        </div>
      </div>
    </div>
  );
}