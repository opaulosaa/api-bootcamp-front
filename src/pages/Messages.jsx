import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

function Messages() {
  const [searchParams] = useSearchParams();
  const destinatarioId = searchParams.get('to');
  
  const [pessoas, setPessoas] = useState([]);
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (destinatarioId && pessoas.length > 0) {
      const destinatario = pessoas.find(p => p.id === parseInt(destinatarioId));
      if (destinatario) {
        iniciarConversa(destinatario);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinatarioId, pessoas]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar pessoas
      const pessoasResponse = await api.get('/users');
      setPessoas(pessoasResponse.data.pessoas || pessoasResponse.data);

      // Simular usuário logado (primeira pessoa da lista ou criar um padrão)
      const usuarioLogadoStorage = localStorage.getItem('usuario_logado');
      if (usuarioLogadoStorage) {
        setUsuarioAtual(JSON.parse(usuarioLogadoStorage));
      } else if (pessoasResponse.data.length > 0) {
        // Usar a primeira pessoa como usuário logado por padrão
        const usuario = pessoasResponse.data[0];
        setUsuarioAtual(usuario);
        localStorage.setItem('usuario_logado', JSON.stringify(usuario));
      }

      // Carregar conversas do localStorage
      const conversasStorage = localStorage.getItem('conversas');
      if (conversasStorage) {
        setConversas(JSON.parse(conversasStorage));
      }
    } catch (error) {
      setMessage('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const iniciarConversa = (destinatario) => {
    if (!usuarioAtual) return;

    // Verificar se já existe conversa
    let conversa = conversas.find(
      (c) =>
        (c.usuario1_id === usuarioAtual.id && c.usuario2_id === destinatario.id) ||
        (c.usuario1_id === destinatario.id && c.usuario2_id === usuarioAtual.id)
    );

    if (!conversa) {
      // Criar nova conversa
      conversa = {
        id: Date.now(),
        usuario1_id: usuarioAtual.id,
        usuario2_id: destinatario.id,
        usuario1_nome: usuarioAtual.nome,
        usuario2_nome: destinatario.nome,
        ultima_mensagem: null,
        data_ultima_mensagem: null
      };
      
      const novasConversas = [...conversas, conversa];
      setConversas(novasConversas);
      localStorage.setItem('conversas', JSON.stringify(novasConversas));
    }

    setConversaAtiva(conversa);
    carregarMensagens(conversa.id);
  };

  const carregarMensagens = (conversaId) => {
    const mensagensStorage = localStorage.getItem(`mensagens_${conversaId}`);
    if (mensagensStorage) {
      setMensagens(JSON.parse(mensagensStorage));
    } else {
      setMensagens([]);
    }
  };

  const handleEnviarMensagem = (e) => {
    e.preventDefault();

    if (!novaMensagem.trim() || !conversaAtiva || !usuarioAtual) {
      return;
    }

    const mensagem = {
      id: Date.now(),
      conversa_id: conversaAtiva.id,
      remetente_id: usuarioAtual.id,
      remetente_nome: usuarioAtual.nome,
      texto: novaMensagem,
      data: new Date().toISOString(),
      lida: false
    };

    const novasMensagens = [...mensagens, mensagem];
    setMensagens(novasMensagens);
    localStorage.setItem(`mensagens_${conversaAtiva.id}`, JSON.stringify(novasMensagens));

    // Atualizar conversa com última mensagem
    const conversasAtualizadas = conversas.map((c) =>
      c.id === conversaAtiva.id
        ? { ...c, ultima_mensagem: novaMensagem, data_ultima_mensagem: mensagem.data }
        : c
    );
    setConversas(conversasAtualizadas);
    localStorage.setItem('conversas', JSON.stringify(conversasAtualizadas));

    // Atualizar conversa ativa
    setConversaAtiva({
      ...conversaAtiva,
      ultima_mensagem: novaMensagem,
      data_ultima_mensagem: mensagem.data
    });

    setNovaMensagem('');
  };

  const getDestinatarioNome = (conversa) => {
    if (!usuarioAtual) return '';
    return conversa.usuario1_id === usuarioAtual.id
      ? conversa.usuario2_nome
      : conversa.usuario1_nome;
  };

  const formatData = (dataISO) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    const hoje = new Date();
    const ehHoje = data.toDateString() === hoje.toDateString();
    
    if (ehHoje) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

  if (!usuarioAtual) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Você precisa estar cadastrado para acessar as mensagens.{' '}
          <Link to="/register">Cadastre-se aqui</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12 mb-3">
          <h2>💬 Mensagens</h2>
          <p className="text-muted">Conectado como: <strong>{usuarioAtual.nome}</strong></p>
        </div>
      </div>

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

      <div className="row" style={{ height: '70vh' }}>
        {/* Lista de Conversas */}
        <div className="col-md-4 border-end">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Conversas</h5>
            <button
              className="btn btn-sm btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#novaConversaModal"
            >
              <i className="bi bi-plus-circle"></i> Nova
            </button>
          </div>

          <div className="list-group" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {conversas.length === 0 ? (
              <div className="text-center text-muted p-4">
                <i className="bi bi-chat-dots fs-1"></i>
                <p className="mt-2">Nenhuma conversa ainda</p>
              </div>
            ) : (
              conversas
                .sort((a, b) => {
                  if (!a.data_ultima_mensagem) return 1;
                  if (!b.data_ultima_mensagem) return -1;
                  return new Date(b.data_ultima_mensagem) - new Date(a.data_ultima_mensagem);
                })
                .map((conversa) => (
                  <button
                    key={conversa.id}
                    className={`list-group-item list-group-item-action ${
                      conversaAtiva?.id === conversa.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setConversaAtiva(conversa);
                      carregarMensagens(conversa.id);
                    }}
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">{getDestinatarioNome(conversa)}</h6>
                      <small>{formatData(conversa.data_ultima_mensagem)}</small>
                    </div>
                    <p className="mb-1 text-truncate small">
                      {conversa.ultima_mensagem || 'Sem mensagens'}
                    </p>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="col-md-8 d-flex flex-column">
          {conversaAtiva ? (
            <>
              {/* Cabeçalho da conversa */}
              <div className="border-bottom pb-3 mb-3">
                <h5>{getDestinatarioNome(conversaAtiva)}</h5>
              </div>

              {/* Mensagens */}
              <div
                className="flex-grow-1 overflow-auto mb-3 p-3"
                style={{ backgroundColor: '#f8f9fa', maxHeight: '50vh' }}
              >
                {mensagens.length === 0 ? (
                  <div className="text-center text-muted">
                    <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
                  </div>
                ) : (
                  mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`d-flex mb-3 ${
                        msg.remetente_id === usuarioAtual.id
                          ? 'justify-content-end'
                          : 'justify-content-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded ${
                          msg.remetente_id === usuarioAtual.id
                            ? 'bg-primary text-white'
                            : 'bg-white border'
                        }`}
                        style={{ maxWidth: '70%' }}
                      >
                        <p className="mb-1">{msg.texto}</p>
                        <small
                          className={
                            msg.remetente_id === usuarioAtual.id
                              ? 'text-white-50'
                              : 'text-muted'
                          }
                        >
                          {formatData(msg.data)}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulário de nova mensagem */}
              <form onSubmit={handleEnviarMensagem} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send"></i> Enviar
                </button>
              </form>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <i className="bi bi-chat-text fs-1"></i>
                <p className="mt-3">Selecione uma conversa ou inicie uma nova</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nova Conversa */}
      <div
        className="modal fade"
        id="novaConversaModal"
        tabIndex="-1"
        aria-labelledby="novaConversaModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="novaConversaModalLabel">
                Nova Conversa
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="text-muted">Selecione uma pessoa para iniciar uma conversa:</p>
              <div className="list-group">
                {pessoas
                  .filter((p) => p.id !== usuarioAtual.id)
                  .map((pessoa) => (
                    <button
                      key={pessoa.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        iniciarConversa(pessoa);
                        // Fechar modal
                        const modal = document.getElementById('novaConversaModal');
                        const bsModal = window.bootstrap.Modal.getInstance(modal);
                        if (bsModal) bsModal.hide();
                      }}
                    >
                      <div className="d-flex align-items-center">
                        {pessoa.foto && (
                          <img
                            src={pessoa.foto}
                            alt={pessoa.nome}
                            className="rounded-circle me-2"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <h6 className="mb-0">{pessoa.nome}</h6>
                          <small className="text-muted">{pessoa.email}</small>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
