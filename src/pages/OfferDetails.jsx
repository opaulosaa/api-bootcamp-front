import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function OfferDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oferta, setOferta] = useState(null);
  const [instrutor, setInstrutor] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    nota: 5,
    comentario: '',
    nome_avaliador: ''
  });
  const [mostrarFormAvaliacao, setMostrarFormAvaliacao] = useState(false);

  useEffect(() => {
    loadOfferDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOfferDetails = async () => {
    try {
      setLoading(true);
      
      // Carregar oferta
      const ofertasResponse = await api.get('/ofertas');
      // API retorna {count, ofertas} ao invés de array direto
      const ofertasArray = ofertasResponse.data?.ofertas || ofertasResponse.data || [];
      const ofertaEncontrada = ofertasArray.find((o) => o.id === id);
      
      if (!ofertaEncontrada) {
        setMessage('Oferta não encontrada');
        setMessageType('danger');
        return;
      }
      
      setOferta(ofertaEncontrada);

      // Carregar instrutor
      if (ofertaEncontrada.pessoa_id) {
        const pessoasResponse = await api.get('/users');
        const pessoas = pessoasResponse.data.pessoas || pessoasResponse.data;
        const instrutorEncontrado = pessoas.find(
          (p) => p.id === ofertaEncontrada.pessoa_id
        );
        setInstrutor(instrutorEncontrado);
      }

      // Carregar avaliações do localStorage (simulado)
      const avaliacoesStorage = localStorage.getItem(`avaliacoes_${id}`);
      if (avaliacoesStorage) {
        setAvaliacoes(JSON.parse(avaliacoesStorage));
      }
    } catch (error) {
      setMessage('Erro ao carregar detalhes: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAvaliacaoChange = (e) => {
    setNovaAvaliacao({
      ...novaAvaliacao,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitAvaliacao = (e) => {
    e.preventDefault();

    if (!novaAvaliacao.nome_avaliador.trim()) {
      setMessage('Por favor, informe seu nome');
      setMessageType('warning');
      return;
    }

    const avaliacaoComData = {
      ...novaAvaliacao,
      data: new Date().toISOString(),
      id: Date.now()
    };

    const novasAvaliacoes = [...avaliacoes, avaliacaoComData];
    setAvaliacoes(novasAvaliacoes);
    
    // Salvar no localStorage (simulando backend)
    localStorage.setItem(`avaliacoes_${id}`, JSON.stringify(novasAvaliacoes));

    setMessage('Avaliação enviada com sucesso!');
    setMessageType('success');
    setNovaAvaliacao({ nota: 5, comentario: '', nome_avaliador: '' });
    setMostrarFormAvaliacao(false);
  };

  const handleDeleteAvaliacao = (avaliacaoId) => {
    if (!window.confirm('Deseja excluir esta avaliação?')) {
      return;
    }

    const novasAvaliacoes = avaliacoes.filter((av) => av.id !== avaliacaoId);
    setAvaliacoes(novasAvaliacoes);
    localStorage.setItem(`avaliacoes_${id}`, JSON.stringify(novasAvaliacoes));
    
    setMessage('Avaliação excluída');
    setMessageType('info');
  };

  const calcularMediaAvaliacoes = () => {
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + parseInt(av.nota), 0);
    return (soma / avaliacoes.length).toFixed(1);
  };

  const renderStars = (nota, interactive = false, onChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={interactive ? 'star-interactive' : ''}
          style={{ 
            color: i <= nota ? '#ffc107' : '#e4e5e9',
            cursor: interactive ? 'pointer' : 'default',
            fontSize: interactive ? '2rem' : '1.2rem'
          }}
          onClick={() => interactive && onChange && onChange(i)}
        >
          ★
        </span>
      );
    }
    return stars;
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

  const formatData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!oferta) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Oferta não encontrada. <Link to="/offers">Voltar para ofertas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
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

      <div className="row">
        <div className="col-lg-8">
          {/* Card principal da oferta */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="card-title mb-0">{oferta.titulo}</h2>
                <span className={`badge ${getNivelBadgeClass(oferta.nivel)} fs-6`}>
                  {formatNivel(oferta.nivel)}
                </span>
              </div>

              <h5 className="mt-4">Descrição</h5>
              <p className="text-muted">{oferta.descricao || 'Sem descrição disponível'}</p>

            </div>
          </div>

          {/* Seção de Avaliações */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>⭐ Avaliações ({avaliacoes.length})</h4>
                {avaliacoes.length > 0 && (
                  <div>
                    <span className="fs-3 text-warning">{renderStars(Math.round(calcularMediaAvaliacoes()))}</span>
                    <span className="ms-2 text-muted">{calcularMediaAvaliacoes()} de 5</span>
                  </div>
                )}
              </div>

              {!mostrarFormAvaliacao ? (
                <button
                  className="btn btn-primary mb-3"
                  onClick={() => setMostrarFormAvaliacao(true)}
                >
                  <i className="bi bi-star"></i> Deixar Avaliação
                </button>
              ) : (
                <form onSubmit={handleSubmitAvaliacao} className="mb-4 p-3 bg-light rounded">
                  <h5 className="mb-3">Nova Avaliação</h5>
                  
                  <div className="mb-3">
                    <label className="form-label">Seu Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nome_avaliador"
                      value={novaAvaliacao.nome_avaliador}
                      onChange={handleAvaliacaoChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nota</label>
                    <div>
                      {renderStars(
                        novaAvaliacao.nota, 
                        true, 
                        (nota) => setNovaAvaliacao({ ...novaAvaliacao, nota })
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Comentário</label>
                    <textarea
                      className="form-control"
                      name="comentario"
                      rows="3"
                      value={novaAvaliacao.comentario}
                      onChange={handleAvaliacaoChange}
                      placeholder="Compartilhe sua experiência com esta oferta..."
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      Enviar Avaliação
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setMostrarFormAvaliacao(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de avaliações */}
              {avaliacoes.length === 0 ? (
                <div className="alert alert-info">
                  Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                </div>
              ) : (
                <div className="avaliacoes-list">
                  {avaliacoes.map((avaliacao) => (
                    <div key={avaliacao.id} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{avaliacao.nome_avaliador}</h6>
                            <small className="text-muted">{formatData(avaliacao.data)}</small>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-warning">
                              {renderStars(avaliacao.nota)}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteAvaliacao(avaliacao.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        {avaliacao.comentario && (
                          <p className="mt-2 mb-0">{avaliacao.comentario}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Card do Instrutor */}
        <div className="col-lg-4">
          {instrutor && (
            <div className="card shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
              <div className="card-body text-center">
                <h5 className="card-title">👨‍🏫 Instrutor</h5>
                {instrutor.foto && (
                  <img
                    src={instrutor.foto}
                    alt={instrutor.nome}
                    className="rounded-circle mb-3"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                )}
                <h6>{instrutor.nome}</h6>
                <p className="text-muted small">
                  <i className="bi bi-envelope"></i> {instrutor.email}
                </p>
                {instrutor.telefone && (
                  <p className="text-muted small">
                    <i className="bi bi-telephone"></i> {instrutor.telefone}
                  </p>
                )}
                {instrutor.descricao && (
                  <p className="small mt-3">{instrutor.descricao}</p>
                )}
                <Link
                  to={`/messages?to=${instrutor.id}`}
                  className="btn btn-primary w-100 mt-3"
                >
                  <i className="bi bi-chat-dots"></i> Enviar Mensagem
                </Link>
              </div>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Ações</h5>
              <div className="d-grid gap-2">
                <Link
                  to={`/edit-offer/${oferta.id}`}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-pencil"></i> Editar Oferta
                </Link>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/offers')}
                >
                  <i className="bi bi-arrow-left"></i> Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferDetails;
