# Bootcamp Frontend - Aplicação React + Vite

Este repositório contém a aplicação frontend construída com React e Vite para a plataforma de trocas de conhecimentos/ofertas (aulas, mentorias, etc.). A interface permite cadastro/login, criação e listagem de ofertas, agendamento de aulas e um painel de administração.

## Tecnologias principais

- Frontend: React + Vite
- Roteamento: `react-router-dom`
- Requisições HTTP: `axios` (com interceptor para envio de token)
- Estilização: Bootstrap 5 + CSS nos componentes
- Autenticação: integração com backend Node.js (bcrypt para senhas)

## Visão geral da aplicação

- Página inicial / Landing Page
- Cadastro e Login de usuários
- Dashboard (rota `/dashboard` renderiza a central de conhecimentos)
- CRUD de ofertas (`/ofertas`) — criar, editar, remover
- Detalhes da oferta e agendamento de aulas (`/agendamentos`)
- Painel administrativo (`/admin`)

## Endpoints (backend esperado)

O frontend espera um backend rodando em `http://localhost:3000` (via proxy do Vite). Os endpoints usados incluem:

- `POST /users` — criar usuário
- `POST /users/login` — autenticar (esperado retornar dados do usuário e opcionalmente um `token`)
- `GET /users` — listar usuários
- `GET /ofertas` — listar ofertas (a API pode retornar `{count, ofertas}`; o frontend trata ambos os formatos)
- `POST /ofertas` — criar oferta
- `PUT /ofertas/:id` — editar oferta
- `DELETE /ofertas/:id` — excluir oferta
- `POST /agendamentos` — agendar aula

> Observação: o backend valida campos como `titulo`, `categoria`, `nivel`, `pessoaId`. O frontend atualmente envia `categoria: 'Geral'` como workaround temporário até o backend aceitar ofertas sem categoria.

## Como rodar (desenvolvimento)

1. Instale dependências:

```bash
npm install
```

2. Inicie o dev server do Vite:

```bash
npm run dev
```

3. Acesse a aplicação em `http://localhost:5173` (ou a porta indicada pelo Vite).

O `vite.config.js` inclui proxy para encaminhar chamadas à API para `http://localhost:3000` (ajuste conforme seu backend).

## Autenticação e token

- O frontend salva o usuário em `localStorage` e, se o backend fornecer um `token`, o armazena em `localStorage.token`.
- Um interceptor em `src/services/api.js` adiciona automaticamente o header `Authorization: Bearer <token>` em todas as requisições.
- No logout o token e os dados do usuário são removidos.

Se o backend usar sessão/cookies ao invés de JWT, será necessário configurar `axios` com `withCredentials` e ajustar o backend para aceitar requisições cross-origin com cookies.

## Recursos úteis na interface

- **Limpar Tudo**: na aba "Meus Conhecimentos" há um botão `Limpar Tudo` que exclui todas as ofertas do usuário (útil para reset de dados de teste).
- Logs de depuração com emoji: componentes principais (Dashboard, Knowledge, Login) possuem logs com emojis (`🔄`, `✅`, `❌`, `🔐`) para facilitar o debug.

## Estrutura do projeto (resumo)

- `src/`
  - `components/` — componentes (Navbar, Footer, rotas privadas)
  - `pages/` — páginas (Knowledge, Offers, CreateOffer, EditOffer, Login, Register, etc.)
  - `services/api.js` — instância axios + interceptors
  - `contexts/AuthContext.jsx` — provê autenticação

## Verificação rápida (manualmente)

1. Criar conta / Logar
2. Criar uma oferta (ex.: "Aulas de Tênis")
3. Verificar em `/dashboard` ou em "Meus Conhecimentos" se a oferta aparece
4. Testar exclusão individual ou usar "Limpar Tudo" para remover todas as ofertas do usuário

## Contribuição

Contribuições são bem-vindas. Abra issues para bugs ou feature requests ou envie PRs.

## Licença

Projeto aberto para uso e aprendizado. Adicione uma licença se desejar padronizar o uso.

---

Arquivo principal de referência: [src/pages/Knowledge.jsx](src/pages/Knowledge.jsx)
