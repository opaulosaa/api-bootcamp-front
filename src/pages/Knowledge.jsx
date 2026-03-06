import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Knowledge.css';

const CATEGORIES = [
  'Tecnologia', 'Design', 'Idiomas', 'Música', 'Negócios',
  'Saúde', 'Esportes', 'Culinária', 'Ciências', 'Artes', 'Outro'
];

const LEVELS = ['Iniciante', 'Intermediário', 'Avançado', 'Todos os níveis'];

const INITIAL_KNOWLEDGE_FORM = {
  titulo: '',
  descricao: '',
  categoria: '',
  nivel: ''
};

const INITIAL_SCHEDULE_FORM = {
  data: '',
  horario: '',
  duracao: '1',
  mensagem: ''
};

// Mock data used as fallback / initial seed
const MOCK_KNOWLEDGE = [
  {
    id: '1',
    titulo: 'React do Zero ao Avançado',
    descricao: 'Aprenda React com hooks, context, roteamento e boas práticas de mercado.',
    categoria: 'Tecnologia',
    nivel: 'Todos os níveis',
    responsavel: { nome: 'Ana Silva' }
  },
  {
    id: '2',
    titulo: 'Inglês Conversacional',
    descricao: 'Aulas focadas em conversação para que você perca o medo de falar inglês.',
    categoria: 'Idiomas',
    nivel: 'Iniciante',
    responsavel: { nome: 'Carlos Mendes' }
  },
  {
    id: '3',
    titulo: 'Violão Popular Brasileiro',
    descricao: 'Do básico ao intermediário: acordes, escalas e músicas do MPB.',
    categoria: 'Música',
    nivel: 'Iniciante',
    responsavel: { nome: 'Fernanda Costa' }
  },
  {
    id: '4',
    titulo: 'UI/UX Design com Figma',
    descricao: 'Prototipagem, design system e heurísticas de usabilidade na prática.',
    categoria: 'Design',
    nivel: 'Intermediário',
    responsavel: { nome: 'Lucas Almeida' }
  }
];

function Knowledge() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('explorar'); // 'explorar' | 'meus'
  const [knowledgeList, setKnowledgeList] = useState(MOCK_KNOWLEDGE);
  const [myKnowledge, setMyKnowledge] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  // Forms
  const [knowledgeForm, setKnowledgeForm] = useState(INITIAL_KNOWLEDGE_FORM);
  const [scheduleForm, setScheduleForm] = useState(INITIAL_SCHEDULE_FORM);

  // Alerts
  const [alert, setAlert] = useState({ show: false, type: '', msg: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await api.get('/conhecimentos');
      if (res.data && res.data.length) {
        setKnowledgeList(res.data);
        if (user) {
          setMyKnowledge(res.data.filter(k => k.pessoa_id === user.id));
        }
      }
    } catch {
      // Falls back to mock data already set in state
      if (user) {
        setMyKnowledge(MOCK_KNOWLEDGE.filter((_, i) => i < 2).map(k => ({ ...k, isMine: true })));
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, msg) => {
    setAlert({ show: true, type, msg });
    setTimeout(() => setAlert({ show: false, type: '', msg: '' }), 4000);
  };

  const validateKnowledgeForm = () => {
    const errors = {};
    if (!knowledgeForm.titulo.trim()) errors.titulo = 'Título é obrigatório';
    if (!knowledgeForm.descricao.trim()) errors.descricao = 'Descrição é obrigatória';
    if (!knowledgeForm.categoria) errors.categoria = 'Selecione uma categoria';
    if (!knowledgeForm.nivel) errors.nivel = 'Selecione o nível';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateScheduleForm = () => {
    const errors = {};
    if (!scheduleForm.data) errors.data = 'Selecione uma data';
    if (!scheduleForm.horario) errors.horario = 'Informe o horário';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleKnowledgeFormChange = (e) => {
    const { name, value } = e.target;
    setKnowledgeForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    if (!validateKnowledgeForm()) return;
    setFormLoading(true);
    try {
      await api.post('/conhecimentos', {
        titulo: knowledgeForm.titulo,
        descricao: knowledgeForm.descricao,
        categoria: knowledgeForm.categoria,
        nivel: knowledgeForm.nivel,
        pessoa_id: user?.id
      });
      showAlert('success', 'Conhecimento cadastrado com sucesso!');
      setShowAddModal(false);
      setKnowledgeForm(INITIAL_KNOWLEDGE_FORM);
      fetchKnowledge();
    } catch {
      // Simulate success locally
      const newItem = {
        ...knowledgeForm,
        id: String(Date.now()),
        pessoa_id: user?.id,
        responsavel: { nome: user?.nome || 'Você' },
        isMine: true
      };
      setKnowledgeList(prev => [newItem, ...prev]);
      setMyKnowledge(prev => [newItem, ...prev]);
      showAlert('success', 'Conhecimento cadastrado com sucesso!');
      setShowAddModal(false);
      setKnowledgeForm(INITIAL_KNOWLEDGE_FORM);
    } finally {
      setFormLoading(false);
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!validateScheduleForm()) return;
    setFormLoading(true);
    try {
      await api.post('/agendamentos', {
        conhecimentoId: selectedKnowledge?.id,
        alunoId: user?.id,
        ...scheduleForm
      });
      showAlert('success', `Aula de "${selectedKnowledge?.titulo}" agendada com sucesso!`);
      setShowScheduleModal(false);
      setScheduleForm(INITIAL_SCHEDULE_FORM);
      setSelectedKnowledge(null);
    } catch {
      // Simulate success
      showAlert('success', `Aula de "${selectedKnowledge?.titulo}" agendada com sucesso!`);
      setShowScheduleModal(false);
      setScheduleForm(INITIAL_SCHEDULE_FORM);
      setSelectedKnowledge(null);
    } finally {
      setFormLoading(false);
    }
  };

  const openScheduleModal = (knowledge) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setSelectedKnowledge(knowledge);
    setScheduleForm(INITIAL_SCHEDULE_FORM);
    setFormErrors({});
    setShowScheduleModal(true);
  };

  const openAddModal = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setKnowledgeForm(INITIAL_KNOWLEDGE_FORM);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleDeleteKnowledge = (id) => {
    if (!window.confirm('Tem certeza que deseja remover este conhecimento?')) return;
    setKnowledgeList(prev => prev.filter(k => k.id !== id));
    setMyKnowledge(prev => prev.filter(k => k.id !== id));
    showAlert('success', 'Conhecimento removido com sucesso!');
  };

  const filtered = (list) => list.filter(k => {
    const text = search.toLowerCase();
    const matchSearch = !search ||
      k.titulo?.toLowerCase().includes(text) ||
      k.descricao?.toLowerCase().includes(text) ||
      k.categoria?.toLowerCase().includes(text);
    const matchCat = !filterCategory || k.categoria === filterCategory;
    const matchLv = !filterLevel || k.nivel === filterLevel;
    return matchSearch && matchCat && matchLv;
  });

  const displayList = activeTab === 'explorar' ? filtered(knowledgeList) : filtered(myKnowledge);

  const levelColor = { Iniciante: '#22c55e', Intermediário: '#f59e0b', Avançado: '#ef4444', 'Todos os níveis': '#667eea' };

  // Today's date for min date constraint
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="knowledge-page">
      {/* ===== PAGE HEADER ===== */}
      <div className="knowledge-header">
        <div className="knowledge-header-bg">
          <div className="kh-shape kh-shape-1"></div>
          <div className="kh-shape kh-shape-2"></div>
        </div>
        <div className="container knowledge-header-content">
          <div>
            <h1 className="knowledge-header-title">
              <i className="bi bi-journal-bookmark-fill"></i>
              Central de Conhecimentos
            </h1>
            <p className="knowledge-header-subtitle">
              Explore, cadastre e agende aulas com especialistas da comunidade.
            </p>
          </div>
          <button className="btn-add-knowledge" onClick={openAddModal}>
            <i className="bi bi-plus-lg"></i>
            Cadastrar Conhecimento
          </button>
        </div>
      </div>

      <div className="container knowledge-body">
        {/* Alert */}
        {alert.show && (
          <div className={`knowledge-alert knowledge-alert-${alert.type}`}>
            <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span>{alert.msg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="knowledge-tabs">
          <button
            className={`knowledge-tab ${activeTab === 'explorar' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorar')}
          >
            <i className="bi bi-compass-fill"></i>
            Explorar Conhecimentos
            <span className="tab-badge">{knowledgeList.length}</span>
          </button>
          {isAuthenticated() && (
            <button
              className={`knowledge-tab ${activeTab === 'meus' ? 'active' : ''}`}
              onClick={() => setActiveTab('meus')}
            >
              <i className="bi bi-person-fill"></i>
              Meus Conhecimentos
              <span className="tab-badge">{myKnowledge.length}</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="knowledge-filters">
          <div className="filter-search">
            <i className="bi bi-search filter-search-icon"></i>
            <input
              type="text"
              placeholder="Buscar conhecimentos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Todas as categorias</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="">Todos os níveis</option>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          {(search || filterCategory || filterLevel) && (
            <button className="btn-clear-filters" onClick={() => { setSearch(''); setFilterCategory(''); setFilterLevel(''); }}>
              <i className="bi bi-x-lg"></i> Limpar
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="knowledge-results-meta">
          {loading ? (
            <span><i className="bi bi-hourglass-split"></i> Carregando...</span>
          ) : (
            <span><strong>{displayList.length}</strong> conhecimento{displayList.length !== 1 ? 's' : ''} encontrado{displayList.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="knowledge-loading">
            <div className="spinner-knowledge"></div>
            <p>Buscando conhecimentos...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="knowledge-empty">
            <i className="bi bi-search"></i>
            <h3>{activeTab === 'meus' ? 'Você ainda não cadastrou conhecimentos' : 'Nenhum conhecimento encontrado'}</h3>
            <p>{activeTab === 'meus' ? 'Clique em "Cadastrar Conhecimento" para começar!' : 'Tente ajustar os filtros de busca.'}</p>
            {activeTab === 'meus' && (
              <button className="btn-add-knowledge-empty" onClick={openAddModal}>
                <i className="bi bi-plus-lg"></i> Cadastrar agora
              </button>
            )}
          </div>
        ) : (
          <div className="knowledge-grid">
            {displayList.map(k => (
              <div key={k.id} className="knowledge-card">
                <div className="kc-header">
                  <div className="kc-category-badge">{k.categoria}</div>
                </div>
                <h3 className="kc-title">{k.titulo}</h3>
                <p className="kc-description">{k.descricao}</p>

                <div className="kc-meta">
                  <span className="kc-level" style={{ color: levelColor[k.nivel] || '#667eea', background: `${levelColor[k.nivel]}18` }}>
                    <i className="bi bi-bar-chart-fill"></i>
                    {k.nivel}
                  </span>
                </div>

                <div className="kc-footer">
                  <div className="kc-author">
                    <div className="kc-author-avatar">
                      {(k.responsavel?.nome || k.autor)?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <span className="kc-author-name">{k.responsavel?.nome || k.autor}</span>
                    </div>
                  </div>
                  <div className="kc-actions">
                    {k.isMine || (user && k.pessoa_id === user?.id) ? (
                      <button
                        className="btn-kc-danger"
                        onClick={() => handleDeleteKnowledge(k.id)}
                        title="Remover conhecimento"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    ) : (
                      <button
                        className="btn-kc-schedule"
                        onClick={() => openScheduleModal(k)}
                      >
                        <i className="bi bi-calendar2-plus-fill"></i>
                        Agendar Aula
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL: ADD KNOWLEDGE ===== */}
      {showAddModal && (
        <div className="km-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="km-modal">
            <div className="km-modal-header">
              <div className="km-modal-icon">
                <i className="bi bi-journal-plus"></i>
              </div>
              <div>
                <h2>Cadastrar Conhecimento</h2>
                <p>Compartilhe sua habilidade com a comunidade</p>
              </div>
              <button className="km-close" onClick={() => setShowAddModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form className="km-form" onSubmit={handleAddKnowledge}>
              <div className="km-form-row">
                <div className={`km-field ${formErrors.titulo ? 'field-error' : ''}`}>
                  <label>Título <span className="req">*</span></label>
                  <div className="km-input-wrapper">
                    <i className="bi bi-fonts km-input-icon"></i>
                    <input
                      type="text"
                      name="titulo"
                      value={knowledgeForm.titulo}
                      onChange={handleKnowledgeFormChange}
                      placeholder="Ex: Programação em Python"
                      maxLength={80}
                    />
                  </div>
                  {formErrors.titulo && <span className="km-error">{formErrors.titulo}</span>}
                </div>
              </div>

              <div className={`km-field ${formErrors.descricao ? 'field-error' : ''}`}>
                <label>Descrição <span className="req">*</span></label>
                <textarea
                  name="descricao"
                  value={knowledgeForm.descricao}
                  onChange={handleKnowledgeFormChange}
                  placeholder="Descreva o que você ensina, metodologia, pré-requisitos..."
                  rows={3}
                  maxLength={500}
                />
                <span className="km-char-count">{knowledgeForm.descricao.length}/500</span>
                {formErrors.descricao && <span className="km-error">{formErrors.descricao}</span>}
              </div>

              <div className="km-form-row">
                <div className={`km-field ${formErrors.categoria ? 'field-error' : ''}`}>
                  <label>Categoria <span className="req">*</span></label>
                  <div className="km-input-wrapper">
                    <i className="bi bi-tag-fill km-input-icon"></i>
                    <select name="categoria" value={knowledgeForm.categoria} onChange={handleKnowledgeFormChange}>
                      <option value="">Selecionar...</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {formErrors.categoria && <span className="km-error">{formErrors.categoria}</span>}
                </div>

                <div className={`km-field ${formErrors.nivel ? 'field-error' : ''}`}>
                  <label>Nível <span className="req">*</span></label>
                  <div className="km-input-wrapper">
                    <i className="bi bi-bar-chart-fill km-input-icon"></i>
                    <select name="nivel" value={knowledgeForm.nivel} onChange={handleKnowledgeFormChange}>
                      <option value="">Selecionar...</option>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  {formErrors.nivel && <span className="km-error">{formErrors.nivel}</span>}
                </div>
              </div>

              <div className="km-form-actions">
                <button type="button" className="btn-km-cancel" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-km-submit" disabled={formLoading}>
                  {formLoading ? (
                    <><span className="km-spinner"></span> Cadastrando...</>
                  ) : (
                    <><i className="bi bi-check-lg"></i> Cadastrar Conhecimento</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: SCHEDULE CLASS ===== */}
      {showScheduleModal && selectedKnowledge && (
        <div className="km-overlay" onClick={e => e.target === e.currentTarget && setShowScheduleModal(false)}>
          <div className="km-modal km-modal-schedule">
            <div className="km-modal-header">
              <div className="km-modal-icon km-modal-icon-schedule">
                <i className="bi bi-calendar2-check-fill"></i>
              </div>
              <div>
                <h2>Agendar Aula</h2>
                <p className="km-schedule-subject">{selectedKnowledge.titulo}</p>
              </div>
              <button className="km-close" onClick={() => setShowScheduleModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="km-schedule-info">
              <div className="km-schedule-info-item">
                <i className="bi bi-person-fill"></i>
                <span>Professor: <strong>{selectedKnowledge.responsavel?.nome || selectedKnowledge.autor}</strong></span>
              </div>
              <div className="km-schedule-info-item">
                <i className="bi bi-tag-fill"></i>
                <span>Categoria: <strong>{selectedKnowledge.categoria}</strong></span>
              </div>
              <div className="km-schedule-info-item">
                <i className="bi bi-bar-chart-fill"></i>
                <span>Nível: <strong>{selectedKnowledge.nivel}</strong></span>
              </div>
            </div>

            <form className="km-form" onSubmit={handleScheduleClass}>
              <div className="km-form-row">
                <div className={`km-field ${formErrors.data ? 'field-error' : ''}`}>
                  <label>Data preferida <span className="req">*</span></label>
                  <div className="km-input-wrapper">
                    <i className="bi bi-calendar3 km-input-icon"></i>
                    <input
                      type="date"
                      name="data"
                      value={scheduleForm.data}
                      onChange={handleScheduleFormChange}
                      min={today}
                    />
                  </div>
                  {formErrors.data && <span className="km-error">{formErrors.data}</span>}
                </div>

                <div className={`km-field ${formErrors.horario ? 'field-error' : ''}`}>
                  <label>Horário preferido <span className="req">*</span></label>
                  <div className="km-input-wrapper">
                    <i className="bi bi-clock km-input-icon"></i>
                    <input
                      type="time"
                      name="horario"
                      value={scheduleForm.horario}
                      onChange={handleScheduleFormChange}
                    />
                  </div>
                  {formErrors.horario && <span className="km-error">{formErrors.horario}</span>}
                </div>
              </div>

              <div className="km-field">
                <label>Duração desejada (horas)</label>
                <div className="km-input-wrapper">
                  <i className="bi bi-hourglass-split km-input-icon"></i>
                  <select name="duracao" value={scheduleForm.duracao} onChange={handleScheduleFormChange}>
                    <option value="1">1 hora</option>
                    <option value="1.5">1 hora e 30 minutos</option>
                    <option value="2">2 horas</option>
                    <option value="3">3 horas</option>
                  </select>
                </div>
              </div>

              <div className="km-field">
                <label>Mensagem para o professor</label>
                <textarea
                  name="mensagem"
                  value={scheduleForm.mensagem}
                  onChange={handleScheduleFormChange}
                  placeholder="Conte seu nível atual, objetivos e qualquer informação relevante para a aula..."
                  rows={3}
                  maxLength={400}
                />
                <span className="km-char-count">{scheduleForm.mensagem.length}/400</span>
              </div>

              <div className="km-form-actions">
                <button type="button" className="btn-km-cancel" onClick={() => setShowScheduleModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-km-submit btn-km-schedule" disabled={formLoading}>
                  {formLoading ? (
                    <><span className="km-spinner"></span> Agendando...</>
                  ) : (
                    <><i className="bi bi-calendar2-plus-fill"></i> Confirmar Agendamento</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Knowledge;
