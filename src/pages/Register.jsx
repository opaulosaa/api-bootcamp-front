import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { criarNotificacao } from '../utils/notificationsHelper';
import './Register.css';

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Estado para tipo de usuário
  const [tipoUsuario, setTipoUsuario] = useState('ALUNO');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    descricao: '',
    foto: '',
    senha: '',
    confirmarSenha: '',
    // Campos específicos para ESPECIALISTA
    areaAtuacao: '',
    uf: '',
    linkPortfolio: '',
    especialidadePrincipal: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Progresso agora é visual via steps, não mais cálculo percentual

  // Validação de CPF
  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  // Calcular força da senha
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  // Removida getPasswordStrengthColor - cores aplicadas inline no JSX

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Fraca';
    if (passwordStrength <= 3) return 'Média';
    return 'Forte';
  };

  // Máscara de CPF
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Máscara de telefone
  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Validar formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Verificar disponibilidade de email (com debounce)
  useEffect(() => {
    if (!formData.email || !isValidEmail(formData.email)) {
      setEmailAvailable(null);
      return;
    }

    const checkEmailAvailability = async () => {
      setCheckingEmail(true);
      try {
        const response = await api.get('/users');
        const emailExists = response.data.pessoas?.some(pessoa => pessoa.email === formData.email);
        setEmailAvailable(!emailExists);
      } catch (error) {
        console.error('Erro ao verificar email:', error);
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmailAvailability, 800);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatPhone(value);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });

    // Calcular força da senha
    if (name === 'senha') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage('A foto deve ter no máximo 2MB');
        setMessageType('warning');
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({
          ...formData,
          foto: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.nome || !formData.email || !formData.senha || !formData.telefone) {
      setMessage('Por favor, preencha os campos obrigatórios (nome, email, telefone e senha).');
      setMessageType('danger');
      return;
    }

    // Validações específicas para ESPECIALISTA
    if (tipoUsuario === 'ESPECIALISTA') {
      if (!formData.areaAtuacao || !formData.uf || !formData.especialidadePrincipal) {
        setMessage('Especialistas devem preencher: Área de Atuação, UF e Especialidade Principal.');
        setMessageType('warning');
        return;
      }
    }

    if (!acceptedTerms) {
      setMessage('Você deve aceitar os termos de uso para continuar.');
      setMessageType('warning');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setMessage('As senhas não coincidem.');
      setMessageType('danger');
      return;
    }

    if (passwordStrength < 3) {
      setMessage('A senha é muito fraca. Use pelo menos 8 caracteres, letras maiúsculas, minúsculas e números.');
      setMessageType('warning');
      return;
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      setMessage('CPF inválido.');
      setMessageType('danger');
      return;
    }

    try {
      // Verificar se e-mail já existe (validação final)
      if (emailAvailable === false) {
        setMessage('Este e-mail já está cadastrado no sistema.');
        setMessageType('danger');
        return;
      }

      // Preparar dados para envio
      const { confirmarSenha: _confirmarSenha, ...dataToSend } = formData;
      
      // Adicionar tipoUsuario aos dados
      dataToSend.tipoUsuario = tipoUsuario;
      
      // Se for ALUNO, remover campos profissionais (não enviar)
      if (tipoUsuario === 'ALUNO') {
        delete dataToSend.areaAtuacao;
        delete dataToSend.uf;
        delete dataToSend.linkPortfolio;
        delete dataToSend.especialidadePrincipal;
      }
      
      console.log('Dados sendo enviados para cadastro:', dataToSend);
      
      const response = await api.post('/users', dataToSend);
      
      setMessage('Pessoa cadastrada com sucesso! Redirecionando...');
      setMessageType('success');
      
      // Criar notificação de novo usuário (não bloqueia o fluxo se falhar)
      try {
        criarNotificacao(
          'novo_usuario',
          `👤 Novo ${tipoUsuario === 'ALUNO' ? 'Aluno' : 'Especialista'} Registrado!`,
          `${formData.nome} acabou de se cadastrar no sistema!`,
          null,
          'admin@sistema.com'
        );
      } catch (notifError) {
        console.warn('Erro ao criar notificação:', notifError);
      }
      
      // Login automático após cadastro
      if (response.data.pessoa) {
        login({
          id: response.data.pessoa.id,
          nome: response.data.pessoa.nome,
          email: response.data.pessoa.email,
          telefone: response.data.pessoa.telefone,
          foto: response.data.pessoa.foto,
          role: response.data.pessoa.role || 'USER',
          tipoUsuario: response.data.pessoa.tipoUsuario
        });
      }
      
      // Redirecionar para ofertas após 1 segundo
      setTimeout(() => {
        navigate('/offers');
      }, 1000);
    } catch (error) {
      console.error('Erro detalhado no cadastro:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      setMessage('Erro ao cadastrar pessoa: ' + errorMessage);
      setMessageType('danger');
    }
  };

  const descricaoMaxLength = 500;
  const descricaoLength = formData.descricao.length;
  
  // Lista de áreas e UFs
  const areasAtuacao = [
    'Tecnologia da Informação',
    'Design e UX/UI',
    'Marketing Digital',
    'Negócios e Gestão',
    'Educação e Ensino',
    'Saúde e Bem-estar',
    'Engenharia',
    'Artes e Criatividade',
    'Direito e Legislação',
    'Ciências e Pesquisa',
    'Outra'
  ];

  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="split-screen-container">
      <div className="register-wrapper">
        {/* Painel Esquerdo - Azul com texto de boas-vindas */}
        <div className="left-panel">
          <div className="left-panel-content">
            <div className="welcome-icon">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <h1 className="welcome-title">Bem-vindo!</h1>
            <p className="welcome-subtitle">
              Junte-se à nossa comunidade de aprendizado
            </p>
            <div className="features-list">
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Aprendizado colaborativo</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Networking profissional</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Desenvolvimento contínuo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito - Branco com formulário */}
        <div className="right-panel">
          <div className="form-container-split">
            {/* Link Voltar */}
            <Link to="/login" className="back-link">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </Link>

            {/* Cabeçalho do Formulário */}
            <div className="form-header-split">
              <h2>Criar Conta</h2>
              <p className="form-subtitle">Escolha seu perfil e complete o cadastro</p>
            </div>

            {/* Mensagens */}
            {message && (
              <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                <i className={`bi bi-${messageType === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                {message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMessage('')}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form-split">
            {/* Toggle Tipo de Usuário */}
            <div className="user-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${tipoUsuario === 'ALUNO' ? 'active' : ''}`}
                onClick={() => setTipoUsuario('ALUNO')}
              >
                <i className="bi bi-person-circle me-2"></i>
                Aluno
              </button>
              <button
                type="button"
                className={`toggle-btn ${tipoUsuario === 'ESPECIALISTA' ? 'active' : ''}`}
                onClick={() => setTipoUsuario('ESPECIALISTA')}
              >
                <i className="bi bi-award me-2"></i>
                Especialista
              </button>
            </div>

            {/* Foto de Perfil */}
            <div className="photo-upload-section">
              <div className="photo-circle">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" />
                ) : (
                  <i className="bi bi-camera-fill"></i>
                )}
              </div>
              <input
                type="file"
                id="photoInput"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="photoInput" className="photo-upload-btn">
                <i className="bi bi-upload me-2"></i>
                {photoPreview ? 'Alterar Foto' : 'Adicionar Foto'}
              </label>
              <small className="text-muted d-block mt-1">PNG, JPG (máx. 2MB)</small>
            </div>

            {/* Campos Principais */}
            <div className="form-grid">
              {/* Nome */}
              <div className="form-group-split">
                <label htmlFor="nome">
                  Nome Completo <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-person input-icon-split"></i>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                    className={formData.nome ? 'has-value' : ''}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group-split">
                <label htmlFor="email">
                  E-mail <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-envelope input-icon-split"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    className={
                      formData.email && isValidEmail(formData.email)
                        ? emailAvailable === true 
                          ? 'has-value valid' 
                          : emailAvailable === false 
                          ? 'has-value invalid' 
                          : 'has-value'
                        : ''
                    }
                  />
                  {checkingEmail && (
                    <small className="field-hint">
                      <i className="bi bi-hourglass-split"></i> Verificando...
                    </small>
                  )}
                  {!checkingEmail && emailAvailable === true && formData.email && (
                    <small className="field-hint success">
                      <i className="bi bi-check-circle"></i> Disponível
                    </small>
                  )}
                  {!checkingEmail && emailAvailable === false && formData.email && (
                    <small className="field-hint error">
                      <i className="bi bi-x-circle"></i> Já cadastrado
                    </small>
                  )}
                </div>
              </div>

              {/* CPF */}
              <div className="form-group-split">
                <label htmlFor="cpf">CPF</label>
                <div className="input-wrapper">
                  <i className="bi bi-card-text input-icon-split"></i>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength="14"
                    className={
                      formData.cpf && validateCPF(formData.cpf) 
                        ? 'has-value valid' 
                        : formData.cpf 
                        ? 'has-value invalid' 
                        : ''
                    }
                  />
                  {formData.cpf && !validateCPF(formData.cpf) && (
                    <small className="field-hint error">
                      <i className="bi bi-x-circle"></i> CPF inválido
                    </small>
                  )}
                  {formData.cpf && validateCPF(formData.cpf) && (
                    <small className="field-hint success">
                      <i className="bi bi-check-circle"></i> CPF válido
                    </small>
                  )}
                </div>
              </div>

              {/* Telefone */}
              <div className="form-group-split">
                <label htmlFor="telefone">
                  Telefone <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-telephone input-icon-split"></i>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                    required
                    className={formData.telefone && formData.telefone.length >= 14 ? 'has-value' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="form-group-split full-width">
              <label htmlFor="descricao">Sobre Você</label>
              <textarea
                id="descricao"
                name="descricao"
                rows="3"
                value={formData.descricao}
                onChange={handleChange}
                maxLength={descricaoMaxLength}
                placeholder="Conte sobre seus interesses e objetivos..."
                className={formData.descricao ? 'has-value' : ''}
              ></textarea>
              <div className={`char-counter-split ${descricaoLength > descricaoMaxLength * 0.9 ? 'warning' : ''}`}>
                {descricaoLength} / {descricaoMaxLength}
              </div>
            </div>

            {/* Campos Condicionais para ESPECIALISTA */}
            {tipoUsuario === 'ESPECIALISTA' && (
              <div className="especialista-fields">
                <div className="section-divider">
                  <i className="bi bi-award-fill me-2"></i>
                  <span>Informações Profissionais</span>
                </div>

                <div className="form-grid">
                  {/* Área de Atuação */}
                  <div className="form-group-split">
                    <label htmlFor="areaAtuacao">
                      Área de Atuação <span className="required-asterisk">*</span>
                    </label>
                    <div className="input-wrapper">
                      <i className="bi bi-briefcase input-icon-split"></i>
                      <select
                        id="areaAtuacao"
                        name="areaAtuacao"
                        value={formData.areaAtuacao}
                        onChange={handleChange}
                        required
                        className={formData.areaAtuacao ? 'has-value' : ''}
                      >
                        <option value="">Selecione uma área</option>
                        {areasAtuacao.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* UF */}
                  <div className="form-group-split">
                    <label htmlFor="uf">
                      Estado (UF) <span className="required-asterisk">*</span>
                    </label>
                    <div className="input-wrapper">
                      <i className="bi bi-geo-alt input-icon-split"></i>
                      <select
                        id="uf"
                        name="uf"
                        value={formData.uf}
                        onChange={handleChange}
                        required
                        className={formData.uf ? 'has-value' : ''}
                      >
                        <option value="">Selecione um estado</option>
                        {estadosBrasileiros.map(estado => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Especialidade Principal */}
                  <div className="form-group-split">
                    <label htmlFor="especialidadePrincipal">
                      Especialidade Principal <span className="required-asterisk">*</span>
                    </label>
                    <div className="input-wrapper">
                      <i className="bi bi-star input-icon-split"></i>
                      <input
                        type="text"
                        id="especialidadePrincipal"
                        name="especialidadePrincipal"
                        value={formData.especialidadePrincipal}
                        onChange={handleChange}
                        placeholder="Ex: React Development"
                        required
                        className={formData.especialidadePrincipal ? 'has-value' : ''}
                      />
                    </div>
                  </div>

                  {/* Link Portfolio */}
                  <div className="form-group-split">
                    <label htmlFor="linkPortfolio">Portfólio / LinkedIn</label>
                    <div className="input-wrapper">
                      <i className="bi bi-link-45deg input-icon-split"></i>
                      <input
                        type="url"
                        id="linkPortfolio"
                        name="linkPortfolio"
                        value={formData.linkPortfolio}
                        onChange={handleChange}
                        placeholder="https://seu-portfolio.com"
                        className={formData.linkPortfolio ? 'has-value' : ''}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Segurança */}
            <div className="section-divider">
              <i className="bi bi-shield-lock-fill me-2"></i>
              <span>Segurança da Conta</span>
            </div>

            <div className="form-grid">
              {/* Senha */}
              <div className="form-group-split">
                <label htmlFor="senha">
                  Senha <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-lock input-icon-split"></i>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength="8"
                    className={formData.senha ? 'has-value' : ''}
                  />
                </div>
                {formData.senha && (
                  <>
                    <div className="password-strength">
                      <div className="strength-bars-split">
                        {[1, 2, 3, 4, 5].map(level => (
                          <div
                            key={level}
                            className={`strength-bar-split ${passwordStrength >= level ? 'active' : ''}`}
                            data-strength={
                              passwordStrength <= 2 ? 'weak' : 
                              passwordStrength === 3 ? 'medium' : 
                              'strong'
                            }
                          ></div>
                        ))}
                      </div>
                      <span className="strength-label">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="password-requirements-split">
                      <small className={formData.senha.length >= 8 ? 'met' : ''}>
                        <i className={`bi bi-${formData.senha.length >= 8 ? 'check-circle-fill' : 'circle'}`}></i>
                        Mínimo 8 caracteres
                      </small>
                      <small className={/[A-Z]/.test(formData.senha) ? 'met' : ''}>
                        <i className={`bi bi-${/[A-Z]/.test(formData.senha) ? 'check-circle-fill' : 'circle'}`}></i>
                        Letra maiúscula
                      </small>
                      <small className={/[a-z]/.test(formData.senha) ? 'met' : ''}>
                        <i className={`bi bi-${/[a-z]/.test(formData.senha) ? 'check-circle-fill' : 'circle'}`}></i>
                        Letra minúscula
                      </small>
                      <small className={/[0-9]/.test(formData.senha) ? 'met' : ''}>
                        <i className={`bi bi-${/[0-9]/.test(formData.senha) ? 'check-circle-fill' : 'circle'}`}></i>
                        Número
                      </small>
                    </div>
                  </>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="form-group-split">
                <label htmlFor="confirmarSenha">
                  Confirmar Senha <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-lock-fill input-icon-split"></i>
                  <input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className={
                      formData.confirmarSenha && formData.senha === formData.confirmarSenha 
                        ? 'has-value valid' 
                        : formData.confirmarSenha 
                        ? 'has-value invalid' 
                        : ''
                    }
                  />
                  {formData.confirmarSenha && (
                    <small className={`field-hint ${formData.senha === formData.confirmarSenha ? 'success' : 'error'}`}>
                      <i className={`bi bi-${formData.senha === formData.confirmarSenha ? 'check' : 'x'}-circle`}></i>
                      {formData.senha === formData.confirmarSenha ? 'Senhas coincidem' : 'Senhas diferentes'}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* Termos de Uso */}
            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  Li e aceito os <a href="#" onClick={(e) => e.preventDefault()}>Termos de Uso</a> e a{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Política de Privacidade</a>
                  <span className="required-asterisk">*</span>
                </span>
              </label>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              className="submit-btn-split"
              disabled={
                !acceptedTerms || 
                !formData.nome || 
                !formData.email || 
                !formData.telefone ||
                !formData.senha || 
                formData.senha !== formData.confirmarSenha ||
                emailAvailable === false ||
                checkingEmail ||
                (tipoUsuario === 'ESPECIALISTA' && (!formData.areaAtuacao || !formData.uf || !formData.especialidadePrincipal))
              }
            >
              <i className="bi bi-check-circle me-2"></i>
              Criar Minha Conta
            </button>

            {/* Link para Login */}
            <div className="login-link-section">
              <p>
                Já tem uma conta?{' '}
                <Link to="/login">Faça login aqui</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Register;
