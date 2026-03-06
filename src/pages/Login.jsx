import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users/login', {
        email,
        senha
      });
      
      console.log('🔐 [Login] Resposta completa do backend:', response.data);
      
      if (response.data.pessoa || response.data.user) {
        const pessoa = response.data.pessoa || response.data.user;
        
        // Armazenar token se existir
        if (response.data.token) {
          console.log('🔑 [Login] Token recebido:', response.data.token);
          localStorage.setItem('token', response.data.token);
        }
        
        login({
          id: pessoa.id,
          nome: pessoa.nome,
          email: pessoa.email,
          telefone: pessoa.telefone,
          foto: pessoa.foto,
          role: pessoa.role
        });
        navigate(from, { replace: true });
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (err) {
      console.error('Detalhes do erro:', err.response?.data || err.message);
      
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Email ou senha inválidos');
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen-container-login">
      <div className="login-wrapper">
        {/* Painel Esquerdo */}
        <div className="left-panel-login">
          <div className="left-panel-content-login">
            <div className="welcome-icon-login">
              <i className="bi bi-box-arrow-in-right"></i>
            </div>
            <h1 className="welcome-title-login">Bem-vindo de Volta!</h1>
            <p className="welcome-subtitle-login">
              Faça login para acessar seu painel e gerenciar suas ofertas
            </p>
            <div className="features-list-login">
              <div className="feature-item-login">
                <i className="bi bi-shield-check"></i>
                <span>Login seguro e criptografado</span>
              </div>
              <div className="feature-item-login">
                <i className="bi bi-lightning"></i>
                <span>Acesso rápido ao sistema</span>
              </div>
              <div className="feature-item-login">
                <i className="bi bi-heart"></i>
                <span>Suas ofertas te aguardam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito */}
        <div className="right-panel-login">
          <div className="form-container-login">
            <div className="form-header-login">
              <h2>Fazer Login</h2>
              <p className="form-subtitle-login">Entre com suas credenciais</p>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="alert-error-login">
                <i className="bi bi-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Mensagem Informativa */}
            {location.state?.message && (
              <div className="alert-info-login">
                <i className="bi bi-info-circle"></i>
                <span>{location.state.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="form-group-login">
                <label htmlFor="email">
                  Email <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper-login">
                  <i className="input-icon-login bi bi-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                    className={email ? 'has-value' : ''}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="form-group-login">
                <label htmlFor="senha">
                  Senha <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper-login password-wrapper">
                  <i className="input-icon-login bi bi-lock"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    disabled={loading}
                    className={senha ? 'has-value' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle-login"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                <div className="forgot-password-link">
                  <Link to="/forgot-password">
                    <i className="bi bi-question-circle"></i>
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                className="submit-btn-login"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-login"></span>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </form>

            {/* Link para Cadastro */}
            <div className="register-link-section">
              <p>
                Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
