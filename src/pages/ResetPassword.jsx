import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ResetPassword.css';

function ResetPassword() {
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há dados de recuperação válidos
    const recuperacaoData = localStorage.getItem('recuperacao_senha');
    if (!recuperacaoData) {
      setMessage('Nenhuma solicitação de recuperação encontrada.');
      setMessageType('warning');
    } else {
      const data = JSON.parse(recuperacaoData);
      const agora = new Date().getTime();
      if (agora > data.expira) {
        setMessage('O código de recuperação expirou. Solicite um novo.');
        setMessageType('danger');
        localStorage.removeItem('recuperacao_senha');
      }
    }
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNovaSenha(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getStrengthLabel = () => {
    const labels = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];
    return labels[passwordStrength] || 'Muito Fraca';
  };

  const getStrengthColor = () => {
    const colors = ['danger', 'warning', 'info', 'primary', 'success'];
    return colors[passwordStrength] || 'danger';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Validações
      if (novaSenha !== confirmarSenha) {
        setMessage('As senhas não coincidem.');
        setMessageType('danger');
        setLoading(false);
        return;
      }

      if (passwordStrength < 3) {
        setMessage('Por favor, use uma senha mais forte (mínimo 8 caracteres com letras maiúsculas, minúsculas e números).');
        setMessageType('warning');
        setLoading(false);
        return;
      }

      // Verificar código de recuperação
      const recuperacaoData = localStorage.getItem('recuperacao_senha');
      if (!recuperacaoData) {
        setMessage('Sessão expirada. Solicite uma nova recuperação.');
        setMessageType('danger');
        setLoading(false);
        return;
      }

      const data = JSON.parse(recuperacaoData);
      const agora = new Date().getTime();

      if (agora > data.expira) {
        setMessage('O código expirou. Solicite uma nova recuperação.');
        setMessageType('danger');
        localStorage.removeItem('recuperacao_senha');
        setLoading(false);
        return;
      }

      if (codigo.toUpperCase() !== data.codigo) {
        setMessage('Código de recuperação inválido.');
        setMessageType('danger');
        setLoading(false);
        return;
      }

      // Buscar usuário e atualizar senha
      const response = await api.get('/users');
      const pessoas = response.data.pessoas || response.data;
      const pessoa = pessoas.find(p => p.email === data.email);

      if (pessoa) {
        // Atualizar senha
        await api.patch(`/users/${pessoa.id}`, {
          senha: novaSenha
        });

        setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
        setMessageType('success');

        // Limpar dados de recuperação
        localStorage.removeItem('recuperacao_senha');

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Senha alterada com sucesso! Faça login com sua nova senha.' } 
          });
        }, 2000);
      } else {
        setMessage('Usuário não encontrado.');
        setMessageType('danger');
      }
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setMessage('Erro ao redefinir senha. Tente novamente.');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen-container-reset">
      <div className="reset-wrapper">
        {/* Painel Esquerdo */}
        <div className="left-panel-reset">
          <div className="left-panel-content-reset">
            <div className="welcome-icon-reset">
              <i className="bi bi-key-fill"></i>
            </div>
            <h1 className="welcome-title-reset">Nova Senha</h1>
            <p className="welcome-subtitle-reset">
              Digite o código recebido por email e crie uma nova senha segura para sua conta
            </p>
            <div className="features-list-reset">
              <div className="feature-item-reset">
                <i className="bi bi-shield-check"></i>
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className="feature-item-reset">
                <i className="bi bi-lock-fill"></i>
                <span>Use letras e números</span>
              </div>
              <div className="feature-item-reset">
                <i className="bi bi-check-circle"></i>
                <span>Senha forte e segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito */}
        <div className="right-panel-reset">
          <div className="form-container-reset">
            <div className="form-header-reset">
              <h2>Redefinir Senha</h2>
              <p className="form-subtitle-reset">Digite o código e sua nova senha</p>
            </div>

            {/* Mensagens */}
            {message && (
              <div className={`alert-reset alert-${messageType}-reset`}>
                <i className={`bi bi-${messageType === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="reset-form">
              {/* Código */}
              <div className="form-group-reset">
                <label htmlFor="codigo">
                  Código de Recuperação <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper-reset">
                  <i className="input-icon-reset bi bi-shield-lock"></i>
                  <input
                    type="text"
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Digite o código recebido"
                    required
                    disabled={loading}
                    maxLength={10}
                    className={codigo ? 'has-value' : ''}
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="form-group-reset">
                <label htmlFor="novaSenha">
                  Nova Senha <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper-reset">
                  <i className="input-icon-reset bi bi-lock"></i>
                  <input
                    type="password"
                    id="novaSenha"
                    value={novaSenha}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua nova senha"
                    required
                    disabled={loading}
                    minLength={8}
                    className={novaSenha ? 'has-value' : ''}
                  />
                </div>
                {novaSenha && (
                  <div className="password-strength-reset">
                    <div className="strength-bar-container-reset">
                      <div
                        className={`strength-bar-fill-reset strength-${getStrengthColor()}-reset`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <small className={`strength-label-reset text-${getStrengthColor()}-reset`}>
                      Força: {getStrengthLabel()}
                    </small>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="form-group-reset">
                <label htmlFor="confirmarSenha">
                  Confirmar Nova Senha <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper-reset">
                  <i className="input-icon-reset bi bi-lock-fill"></i>
                  <input
                    type="password"
                    id="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    disabled={loading}
                    className={confirmarSenha ? 'has-value' : ''}
                  />
                </div>
                {confirmarSenha && novaSenha !== confirmarSenha && (
                  <small className="field-hint-reset error">
                    <i className="bi bi-x-circle"></i>
                    As senhas não coincidem
                  </small>
                )}
                {confirmarSenha && novaSenha === confirmarSenha && (
                  <small className="field-hint-reset success">
                    <i className="bi bi-check-circle"></i>
                    As senhas coincidem
                  </small>
                )}
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                className="submit-btn-reset"
                disabled={loading || !novaSenha || novaSenha !== confirmarSenha}
              >
                {loading ? (
                  <>
                    <span className="spinner-reset"></span>
                    <span>Redefinindo...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    <span>Redefinir Senha</span>
                  </>
                )}
              </button>
            </form>

            {/* Link Voltar */}
            <div className="back-link-section-reset">
              <Link to="/login" className="back-link-reset">
                <i className="bi bi-arrow-left"></i>
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
