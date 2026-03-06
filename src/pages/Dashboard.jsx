import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ofertas, setOfertas] = useState([]);
  const [ofertasFiltradas, setOfertasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOferta, setSelectedOferta] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    data: '',
    horario: '',
    mensagem: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadOfertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    aplicarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ofertas, searchTerm]);

  const loadOfertas = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Dashboard] Carregando ofertas...');
      const response = await api.get('/ofertas');
      console.log('✅ [Dashboard] Ofertas recebidas:', response.data);
      // API retorna {count, ofertas} ao invés de array direto
      const ofertasArray = response.data?.ofertas || response.data || [];
      console.log('📋 [Dashboard] Array de ofertas:', ofertasArray);
      setOfertas(ofertasArray);
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao carregar ofertas:', error);
      showAlert('danger', 'Erro ao carregar ofertas');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...ofertas];

    if (searchTerm) {
      const buscaLower = searchTerm.toLowerCase();
      resultado = resultado.filter(oferta =>
        oferta.titulo?.toLowerCase().includes(buscaLower) ||
        oferta.descricao?.toLowerCase().includes(buscaLower)
      );
    }

    setOfertasFiltradas(resultado);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  const handleSchedule = (oferta) => {
    setSelectedOferta(oferta);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scheduleForm.data || !scheduleForm.horario) {
      showAlert('warning', 'Preencha data e horário');
      return;
    }

    try {
      await api.post('/agendamentos', {
        conhecimento_id: selectedOferta.id,
        pessoa_id: user.id,
        data: scheduleForm.data,
        horario: scheduleForm.horario,
        mensagem: scheduleForm.mensagem,
        status: 'pendente'
      });
      
      showAlert('success', 'Agendamento realizado com sucesso!');
      setShowScheduleModal(false);
      setScheduleForm({ data: '', horario: '', mensagem: '' });
      setSelectedOferta(null);
    } catch (error) {
      console.error('Erro ao agendar:', error);
      showAlert('danger', 'Erro ao realizar agendamento');
    }
  };

  const getNivelBadgeClass = (nivel) => {
    const classes = {
      'Iniciante': 'badge-iniciante',
      'Intermediário': 'badge-intermediario',
      'Avançado': 'badge-avancado',
      'Todos os níveis': 'badge-todos'
    };
    return classes[nivel] || 'badge-todos';
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="dashboard-title">
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                Dashboard
              </h1>
              <p className="dashboard-subtitle">
                Olá, <strong>{user?.nome}</strong>! Explore e agende conhecimentos
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <button 
                className="btn btn-create"
                onClick={() => navigate('/create-offer')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Adicionar Conhecimento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Alert */}
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            <i className={`bi bi-${alert.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
          </div>
        )}

        {/* Filtros */}
        <div className="filters-section">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="search-box">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="results-info">
          <i className="bi bi-funnel me-2"></i>
          {ofertasFiltradas.length} {ofertasFiltradas.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
        </div>

        {/* Cards de Ofertas */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : ofertasFiltradas.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h3>Nenhuma oferta encontrada</h3>
            <p>Tente ajustar os filtros ou adicione uma nova oferta</p>
          </div>
        ) : (
          <div className="row g-4">
            {ofertasFiltradas.map((oferta) => (
              <div key={oferta.id} className="col-md-6 col-lg-4">
                <div className="oferta-card">
                  <div className="oferta-card-header">
                    <span className={`nivel-badge ${getNivelBadgeClass(oferta.nivel)}`}>
                      {oferta.nivel}
                    </span>
                  </div>
                  <div className="oferta-card-body">
                    <h5 className="oferta-title">{oferta.titulo}</h5>
                    <p className="oferta-description">{oferta.descricao}</p>
                  </div>
                  <div className="oferta-card-footer">
                    <button
                      className="btn btn-schedule"
                      onClick={() => handleSchedule(oferta)}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Agendar
                    </button>
                    <button
                      className="btn btn-details"
                      onClick={() => navigate(`/offer-details/${oferta.id}`)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Agendamento */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>
                <i className="bi bi-calendar-check me-2"></i>
                Agendar: {selectedOferta?.titulo}
              </h5>
              <button 
                className="btn-close-custom"
                onClick={() => setShowScheduleModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-body-custom">
                <div className="mb-3">
                  <label className="form-label">Data *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={scheduleForm.data}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, data: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Horário *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={scheduleForm.horario}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, horario: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mensagem (opcional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Deixe uma mensagem para o responsável..."
                    value={scheduleForm.mensagem}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mensagem: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-lg me-2"></i>
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
