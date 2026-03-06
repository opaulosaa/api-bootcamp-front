import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Offers() {
  const [ofertas, setOfertas] = useState([]);
  const [ofertasFiltradas, setOfertasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [filtros, setFiltros] = useState({
    busca: '',
    nivel: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadOfertas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ofertas, filtros]);

  const aplicarFiltros = () => {
    let resultado = [...ofertas];

    // Filtro de busca por texto
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      resultado = resultado.filter(oferta =>
        oferta.titulo?.toLowerCase().includes(buscaLower) ||
        oferta.descricao?.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro por nível
    if (filtros.nivel) {
      resultado = resultado.filter(oferta => oferta.nivel === filtros.nivel);
    }

    setOfertasFiltradas(resultado);
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      nivel: ''
    });
  };

  const loadOfertas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ofertas');
      // API retorna {count, ofertas} ao invés de array direto
      const ofertasArray = response.data?.ofertas || response.data || [];
      setOfertas(ofertasArray);
    } catch (error) {
      setMessage('Erro ao carregar ofertas: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      return;
    }

    try {
      await api.delete(`/ofertas/${id}`);
      setMessage('Oferta excluída com sucesso!');
      setMessageType('success');
      loadOfertas(); // Recarregar lista
    } catch (error) {
      setMessage('Erro ao excluir oferta: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    }
  };

  const getNivelBadgeClass = (nivel) => {
    switch (nivel) {
      case 'basico':
        return 'bg-success';
      case 'intermediario':
        return 'bg-warning';
      case 'avancado':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatNivel = (nivel) => {
    switch (nivel) {
      case 'basico':
        return 'Básico';
      case 'intermediario':
        return 'Intermediário';
      case 'avancado':
        return 'Avançado';
      default:
        return nivel;
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Ofertas de Conhecimento</h2>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <i className="bi bi-funnel"></i> {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          <Link to="/create-offer" className="btn btn-primary">
            <i className="bi bi-plus-circle"></i> Nova Oferta
          </Link>
        </div>
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-search"></i> Busca Avançada
            </h5>
            <div className="row g-3">
              <div className="col-md-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Buscar por título ou descrição..."
                  name="busca"
                  value={filtros.busca}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  name="nivel"
                  value={filtros.nivel}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos Níveis</option>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-sm btn-secondary" onClick={limparFiltros}>
                <i className="bi bi-x-circle"></i> Limpar Filtros
              </button>
              <span className="ms-3 text-muted">
                {ofertasFiltradas.length} {ofertasFiltradas.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
              </span>
            </div>
          </div>
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

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : ofertasFiltradas.length === 0 ? (
        <div className="alert alert-info text-center">
          {ofertas.length === 0 
            ? <>Nenhuma oferta cadastrada. <Link to="/create-offer">Criar primeira oferta</Link></>
            : 'Nenhuma oferta encontrada com os filtros selecionados. Tente ajustar os critérios de busca.'}
        </div>
      ) : (
        <div className="row">
          {ofertasFiltradas.map((oferta) => (
            <div key={oferta.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{oferta.titulo}</h5>
                    <span className={`badge ${getNivelBadgeClass(oferta.nivel)}`}>
                      {formatNivel(oferta.nivel)}
                    </span>
                  </div>
                  
                  <p className="card-text">
                    {oferta.descricao || 'Sem descrição'}
                  </p>

                </div>
                
                <div className="card-footer bg-white border-top-0">
                  <div className="d-grid gap-2">
                    <Link
                      to={`/offer-details/${oferta.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="bi bi-eye"></i> Ver Detalhes
                    </Link>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/edit-offer/${oferta.id}`}
                        className="btn btn-sm btn-outline-primary flex-fill"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(oferta.id)}
                        className="btn btn-sm btn-outline-danger flex-fill"
                      >
                        <i className="bi bi-trash"></i> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Offers;
