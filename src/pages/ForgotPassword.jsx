import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Verificar se o email existe no sistema
      const response = await api.get('/users');
      const pessoas = response.data.pessoas || response.data;
      const pessoa = pessoas.find(p => p.email === email);

      if (pessoa) {
        // Simular envio de email de recuperação
        // Em um sistema real, aqui seria enviado um email com link de recuperação
        
        // Gerar código de recuperação simulado
        const codigoRecuperacao = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Armazenar temporariamente no localStorage (em produção, isso seria no backend)
        const recuperacaoData = {
          email: pessoa.email,
          codigo: codigoRecuperacao,
          timestamp: new Date().getTime(),
          expira: new Date().getTime() + (15 * 60 * 1000) // 15 minutos
        };
        localStorage.setItem('recuperacao_senha', JSON.stringify(recuperacaoData));

        setMessage(
          `Um código de recuperação foi enviado para seu email! 
          Por questões de demonstração, o código é: ${codigoRecuperacao}. 
          Este código expira em 15 minutos.`
        );
        setMessageType('success');

        // Redirecionar para página de redefinição após 3 segundos
        setTimeout(() => {
          navigate('/reset-password', { state: { email: pessoa.email } });
        }, 3000);
      } else {
        setMessage('Email não encontrado no sistema.');
        setMessageType('danger');
      }
    } catch (err) {
      console.error('Erro ao processar recuperação:', err);
      setMessage('Erro ao processar solicitação. Tente novamente.');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen-container-forgot">
      <div className="forgot-wrapper">
        {/* Painel Esquerdo */}
        <div className="left-panel-forgot">
          <div className="left-panel-content-forgot">
            <div className="welcome-icon-forgot">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h1 className="welcome-title-forgot">Esqueceu sua Senha?</h1>
            <p className="welcome-subtitle-forgot">
              Não se preocupe! Digite seu email e enviaremos um código para redefinir sua senha
            </p>
            <div className="features-list-forgot">
              <div className="feature-item-forgot">
                <i className="bi bi-envelope-check"></i>
                <span>Código enviado por email</span>
              </div>
              <div className="feature-item-forgot">
                <i className="bi bi-clock"></i>
                <span>Válido por 15 minutos</span>
              </div>
              <div className="feature-item-forgot">
                <i className="bi bi-shield-check"></i>
                <span>Processo seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito */}
        <div className="right-panel-forgot">
          <div className="form-container-forgot">
            <div className="form-header-forgot">
              <h2>Recuperar Senha</h2>
              <p className="form-subtitle-forgot">Digite seu email cadastrado</p>
            </div>

            {/* Mensagens */}
            {message && (
              <div className={`alert-forgot alert-${messageType}-forgot`}>
                <i className={`bi bi-${messageType === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
                <div style={{ whiteSpace: 'pre-line' }}>{message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="forgot-form">
              {/* Email */}
              <div className="form-group-forgot">
                <label htmlFor="email">
                  Email <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper-forgot">
                  <i className="input-icon-forgot bi bi-envelope"></i>
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
                <small className="field-hint-forgot">
                  Enviaremos um código de recuperação para este email
                </small>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                className="submit-btn-forgot"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-forgot"></span>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    <span>Enviar Código</span>
                  </>
                )}
              </button>
            </form>

            {/* Links */}
            <div className="links-section-forgot">
              <Link to="/login" className="back-link-forgot">
                <i className="bi bi-arrow-left"></i>
                Voltar ao Login
              </Link>
              <p className="register-text-forgot">
                Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
