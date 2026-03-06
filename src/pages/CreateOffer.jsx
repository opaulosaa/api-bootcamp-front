import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function CreateOffer() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nivel: 'basico',
    pessoa_id: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Calcular progresso do formulário
  const calcularProgresso = () => {
    const campos = [
      formData.titulo,
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
    if (!formData.titulo || !formData.pessoa_id) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setMessageType('danger');
      return;
    }

    try {
      // Preparar payload com campos no formato esperado pelo backend
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: 'Geral', // Categoria padrão até o backend não exigir mais
        nivel: formData.nivel,
        pessoaId: formData.pessoa_id // Backend espera camelCase
      };
      
      const response = await api.post('/ofertas', payload);
      setMessage('Oferta criada com sucesso!');
      setMessageType('success');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
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
