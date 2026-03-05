import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { criarNotificacao } from '../utils/notificationsHelper';

function CreateOffer() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    nivel: 'basico',
    pessoa_id: '',
    prerequisitos: '',
    duracao: '',
    modalidade: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Calcular progresso do formulário
  const calcularProgresso = () => {
    const campos = [
      formData.titulo,
      formData.categoria,
      formData.pessoa_id,
      formData.descricao
    ];
    const camposPreenchidos = campos.filter(campo => campo && campo.toString().trim() !== '').length;
    return Math.round((camposPreenchidos / campos.length) * 100);
  };

  const loadPessoas = async () => {
    try {
      const response = await api.get('/users');
      setPessoas(response.data.pessoas || response.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadPessoas();
  }, []);

  // Auto-save: Carregar rascunho ao montar componente
  useEffect(() => {
    const rascunho = localStorage.getItem('rascunho_createoffer');
    if (rascunho) {
      const dados = JSON.parse(rascunho);
      setFormData(prevData => ({ ...prevData, ...dados }));
    }
  }, []);

  // Auto-save: Salvar rascunho automaticamente (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.titulo || formData.descricao) {
        localStorage.setItem('rascunho_createoffer', JSON.stringify(formData));
        setAutoSaveStatus('💾 Rascunho salvo automaticamente');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.titulo || !formData.categoria || !formData.pessoa_id) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setMessageType('danger');
      return;
    }

    try {
      const response = await api.post('/conhecimentos', formData);
      setMessage('Oferta criada com sucesso!');
      setMessageType('success');
      
      // Criar notificação para todos os usuários
      criarNotificacao(
        'nova_oferta',
        '📚 Nova Oferta Disponível!',
        `Uma nova oferta de ${formData.categoria} (nível ${formData.nivel}) foi criada: "${formData.titulo}"`,
        `/offer-details/${response.data.id}`,
        'usuarios@sistema.com'
      );
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/offers');
      }, 2000);
    } catch (error) {
      setMessage('Erro ao criar oferta: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Criar Nova Oferta</h2>
              
              {/* Barra de Progresso */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Progresso do formulário</small>
                  <small className="text-muted fw-bold">{calcularProgresso()}%</small>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar progress-bar-striped progress-bar-animated ${
                      calcularProgresso() === 100 ? 'bg-success' : 'bg-primary'
                    }`}
                    role="progressbar"
                    style={{ width: `${calcularProgresso()}%` }}
                    aria-valuenow={calcularProgresso()}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              {/* Indicador de Auto-save */}
              {autoSaveStatus && (
                <div className="alert alert-info py-2 px-3 d-flex justify-content-between align-items-center">
                  <small>{autoSaveStatus}</small>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      localStorage.removeItem('rascunho_createoffer');
                      setAutoSaveStatus('');
                      window.location.reload();
                    }}
                  >
                    Limpar rascunho
                  </button>
                </div>
              )}

              {message && (
                <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                  {message}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage('')}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="titulo" className="form-label">
                    Título <span className="text-danger">*</span>
                    <i 
                      className="bi bi-question-circle text-muted ms-2" 
                      title="Escolha um título claro e atrativo que descreva sua oferta de conhecimento"
                      style={{ cursor: 'help' }}
                    ></i>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Curso de React para Iniciantes"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="descricao" className="form-label">
                    Descrição
                    <i 
                      className="bi bi-question-circle text-muted ms-2" 
                      title="Detalhe o conteúdo, metodologia e objetivos de aprendizagem"
                      style={{ cursor: 'help' }}
                    ></i>
                  </label>
                  <textarea
                    className="form-control"
                    id="descricao"
                    name="descricao"
                    rows="3"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descreva o que será ensinado e o que os alunos vão aprender..."
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="categoria" className="form-label">
                      Categoria <span className="text-danger">*</span>
                      <i 
                        className="bi bi-question-circle text-muted ms-2" 
                        title="Selecione a área de conhecimento que melhor representa sua oferta"
                        style={{ cursor: 'help' }}
                      ></i>
                    </label>
                    <select
                      className="form-select"
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Negócios">Negócios</option>
                      <option value="Idiomas">Idiomas</option>
                      <option value="Arte">Arte</option>
                      <option value="Música">Música</option>
                      <option value="Esportes">Esportes</option>
                      <option value="Culinária">Culinária</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="nivel" className="form-label">
                      Nível <span className="text-danger">*</span>
                      <i 
                        className="bi bi-question-circle text-muted ms-2" 
                        title="Básico: Para iniciantes | Intermediário: Requer conhecimento prévio | Avançado: Para especialistas"
                        style={{ cursor: 'help' }}
                      ></i>
                    </label>
                    <select
                      className="form-select"
                      id="nivel"
                      name="nivel"
                      value={formData.nivel}
                      onChange={handleChange}
                      required
                    >
                      <option value="basico">Básico</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="duracao" className="form-label">
                      Duração Estimada <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="duracao"
                      name="duracao"
                      value={formData.duracao}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="1-2 horas">1-2 horas</option>
                      <option value="3-5 horas">3-5 horas</option>
                      <option value="6-10 horas">6-10 horas</option>
                      <option value="1-2 semanas">1-2 semanas</option>
                      <option value="3-4 semanas">3-4 semanas</option>
                      <option value="1-2 meses">1-2 meses</option>
                      <option value="3+ meses">3+ meses</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="modalidade" className="form-label">
                      Modalidade <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="modalidade"
                      name="modalidade"
                      value={formData.modalidade}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Presencial">🏢 Presencial</option>
                      <option value="Online">💻 Online</option>
                      <option value="Híbrido">🔄 Híbrido</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="prerequisitos" className="form-label">
                    Pré-requisitos
                  </label>
                  <textarea
                    className="form-control"
                    id="prerequisitos"
                    name="prerequisitos"
                    rows="2"
                    value={formData.prerequisitos}
                    onChange={handleChange}
                    placeholder="Ex: Conhecimento básico de HTML e CSS, computador com acesso à internet..."
                  ></textarea>
                  <small className="text-muted">Liste os conhecimentos ou recursos necessários para participar</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="pessoa_id" className="form-label">
                    Instrutor <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="pessoa_id"
                    name="pessoa_id"
                    value={formData.pessoa_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione uma pessoa...</option>
                    {pessoas.map((pessoa) => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.nome} - {pessoa.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/offers')}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Criar Oferta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOffer;
