// Função auxiliar para criar notificações
export const criarNotificacao = (tipo, titulo, mensagem, link = null, emailDestinatario = null) => {
  const notificacoesStorage = localStorage.getItem('notificacoes');
  const notificacoes = notificacoesStorage ? JSON.parse(notificacoesStorage) : [];

  const novaNotificacao = {
    id: Date.now(),
    tipo,
    titulo,
    mensagem,
    link,
    data: new Date().toISOString(),
    lida: false,
    emailSimulado: emailDestinatario
      ? {
          destinatario: emailDestinatario,
          assunto: titulo
        }
      : null
  };

  notificacoes.unshift(novaNotificacao);
  
  // Manter no máximo 50 notificações
  if (notificacoes.length > 50) {
    notificacoes.pop();
  }

  localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
  
  return novaNotificacao;
};

// Função para obter quantidade de notificações não lidas
export const getNotificacoesNaoLidas = () => {
  const notificacoesStorage = localStorage.getItem('notificacoes');
  if (!notificacoesStorage) return 0;
  
  const notificacoes = JSON.parse(notificacoesStorage);
  return notificacoes.filter((n) => !n.lida).length;
};
