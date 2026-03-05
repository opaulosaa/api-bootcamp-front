import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Notifications() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [_usuarioAtual, setUsuarioAtual] = useState(null);

  const loadNotificacoes = () => {
    // Carregar usuário atual
    const usuarioLogadoStorage = localStorage.getItem('usuario_logado');
    if (usuarioLogadoStorage) {
      setUsuarioAtual(JSON.parse(usuarioLogadoStorage));
    }

    // Carregar notificações do localStorage
    const notificacoesStorage = localStorage.getItem('notificacoes');
    if (notificacoesStorage) {
      const todasNotificacoes = JSON.parse(notificacoesStorage);
      // Ordenar por data (mais recentes primeiro)
      todasNotificacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
      setNotificacoes(todasNotificacoes);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadNotificacoes();
  }, []);

  const marcarComoLida = (id) => {
    const notificacoesAtualizadas = notificacoes.map((n) =>
      n.id === id ? { ...n, lida: true } : n
    );
    setNotificacoes(notificacoesAtualizadas);
    localStorage.setItem('notificacoes', JSON.stringify(notificacoesAtualizadas));
  };

  const marcarTodasComoLidas = () => {
    const notificacoesAtualizadas = notificacoes.map((n) => ({ ...n, lida: true }));
    setNotificacoes(notificacoesAtualizadas);
    localStorage.setItem('notificacoes', JSON.stringify(notificacoesAtualizadas));
  };

  const excluirNotificacao = (id) => {
    const notificacoesAtualizadas = notificacoes.filter((n) => n.id !== id);
    setNotificacoes(notificacoesAtualizadas);
    localStorage.setItem('notificacoes', JSON.stringify(notificacoesAtualizadas));
  };

  const limparTodasNotificacoes = () => {
    if (window.confirm('Deseja excluir todas as notificações?')) {
      setNotificacoes([]);
      localStorage.removeItem('notificacoes');
    }
  };

  const getIcone = (tipo) => {
    switch (tipo) {
      case 'nova_oferta':
        return { icone: '📚', cor: 'primary' };
      case 'nova_avaliacao':
        return { icone: '⭐', cor: 'warning' };
      case 'nova_mensagem':
        return { icone: '💬', cor: 'info' };
      case 'novo_usuario':
        return { icone: '👤', cor: 'success' };
      case 'match':
        return { icone: '🎯', cor: 'danger' };
      default:
        return { icone: '🔔', cor: 'secondary' };
    }
  };

  const formatData = (dataISO) => {
    const data = new Date(dataISO);
    const hoje = new Date();
    const diferenca = Math.floor((hoje - data) / 1000); // diferença em segundos

    if (diferenca < 60) return 'Agora mesmo';
    if (diferenca < 3600) return `${Math.floor(diferenca / 60)} minutos atrás`;
    if (diferenca < 86400) return `${Math.floor(diferenca / 3600)} horas atrás`;
    if (diferenca < 604800) return `${Math.floor(diferenca / 86400)} dias atrás`;
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const notificacoesFiltradas =
    filtroTipo === 'todas'
      ? notificacoes
      : filtroTipo === 'nao_lidas'
      ? notificacoes.filter((n) => !n.lida)
      : notificacoes.filter((n) => n.tipo === filtroTipo);

  const quantidadeNaoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>🔔 Notificações</h2>
              {quantidadeNaoLidas > 0 && (
                <span className="badge bg-danger">{quantidadeNaoLidas} não lidas</span>
              )}
            </div>
            <div>
              <button
                className="btn btn-outline-primary me-2"
                onClick={marcarTodasComoLidas}
                disabled={quantidadeNaoLidas === 0}
              >
                <i className="bi bi-check-all"></i> Marcar todas como lidas
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={limparTodasNotificacoes}
                disabled={notificacoes.length === 0}
              >
                <i className="bi bi-trash"></i> Limpar todas
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${filtroTipo === 'todas' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFiltroTipo('todas')}
                >
                  Todas ({notificacoes.length})
                </button>
                <button
                  type="button"
                  className={`btn ${
                    filtroTipo === 'nao_lidas' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setFiltroTipo('nao_lidas')}
                >
                  Não lidas ({quantidadeNaoLidas})
                </button>
                <button
                  type="button"
                  className={`btn ${
                    filtroTipo === 'nova_oferta' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setFiltroTipo('nova_oferta')}
                >
                  📚 Ofertas
                </button>
                <button
                  type="button"
                  className={`btn ${
                    filtroTipo === 'nova_mensagem' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setFiltroTipo('nova_mensagem')}
                >
                  💬 Mensagens
                </button>
                <button
                  type="button"
                  className={`btn ${
                    filtroTipo === 'nova_avaliacao' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setFiltroTipo('nova_avaliacao')}
                >
                  ⭐ Avaliações
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Notificações */}
          {notificacoesFiltradas.length === 0 ? (
            <div className="alert alert-info text-center">
              <i className="bi bi-bell-slash fs-1"></i>
              <p className="mt-2">
                {filtroTipo === 'todas'
                  ? 'Você não tem notificações ainda.'
                  : 'Nenhuma notificação encontrada com este filtro.'}
              </p>
              <Link to="/offers" className="btn btn-primary mt-2">
                Ver Ofertas
              </Link>
            </div>
          ) : (
            <div className="list-group">
              {notificacoesFiltradas.map((notificacao) => {
                const { icone, cor } = getIcone(notificacao.tipo);
                return (
                  <div
                    key={notificacao.id}
                    className={`list-group-item ${!notificacao.lida ? 'list-group-item-light' : ''}`}
                  >
                    <div className="d-flex w-100 align-items-start">
                      <div className={`me-3 text-${cor}`} style={{ fontSize: '2rem' }}>
                        {icone}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className={`mb-1 ${!notificacao.lida ? 'fw-bold' : ''}`}>
                            {notificacao.titulo}
                          </h6>
                          <small className="text-muted">{formatData(notificacao.data)}</small>
                        </div>
                        <p className="mb-2">{notificacao.mensagem}</p>
                        
                        {notificacao.link && (
                          <Link to={notificacao.link} className="btn btn-sm btn-outline-primary me-2">
                            Ver detalhes
                          </Link>
                        )}
                        
                        {!notificacao.lida && (
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            onClick={() => marcarComoLida(notificacao.id)}
                          >
                            <i className="bi bi-check"></i> Marcar como lida
                          </button>
                        )}
                        
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => excluirNotificacao(notificacao.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>

                        {/* Simulação de email */}
                        {notificacao.emailSimulado && (
                          <div className="mt-2 p-2 border-start border-3 border-info bg-light">
                            <small className="text-muted">
                              <i className="bi bi-envelope"></i> <strong>Email simulado:</strong>
                            </small>
                            <br />
                            <small>
                              <strong>Para:</strong> {notificacao.emailSimulado.destinatario}
                            </small>
                            <br />
                            <small>
                              <strong>Assunto:</strong> {notificacao.emailSimulado.assunto}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card informativo */}
      <div className="card mt-4 bg-light">
        <div className="card-body">
          <h5 className="card-title">📧 Sobre as Notificações por Email</h5>
          <p className="card-text">
            As notificações exibidas aqui também seriam enviadas para o seu email em um ambiente
            de produção. Você receberá notificações sobre:
          </p>
          <ul>
            <li>Novas ofertas de conhecimento que correspondem aos seus interesses</li>
            <li>Avaliações recebidas nas suas ofertas</li>
            <li>Novas mensagens de outros usuários</li>
            <li>Matches com pessoas que têm interesses complementares</li>
          </ul>
          <p className="mb-0">
            <small className="text-muted">
              <i className="bi bi-info-circle"></i> As notificações são salvas localmente neste
              navegador para fins de demonstração.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
