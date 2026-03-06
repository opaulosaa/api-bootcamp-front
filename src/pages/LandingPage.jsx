import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: 'bi-lightbulb-fill',
      title: 'Compartilhe Conhecimento',
      description: 'Cadastre suas habilidades e conhecimentos para ensinar outras pessoas da comunidade.',
      color: '#667eea',
    },
    {
      icon: 'bi-calendar2-check-fill',
      title: 'Agende Aulas',
      description: 'Encontre especialistas e agende aulas no horário que melhor se adapta à sua rotina.',
      color: '#764ba2',
    },
    {
      icon: 'bi-people-fill',
      title: 'Conecte-se',
      description: 'Construa uma rede de aprendizado colaborativo com pessoas de diversas áreas.',
      color: '#667eea',
    },
    {
      icon: 'bi-mortarboard-fill',
      title: 'Aprenda Sempre',
      description: 'Acesse conteúdos em diversas categorias e evolua continuamente.',
      color: '#764ba2',
    },
    {
      icon: 'bi-star-fill',
      title: 'Avalie Experiências',
      description: 'Deixe avaliações e ajude outros usuários a escolher os melhores professores.',
      color: '#667eea',
    },
    {
      icon: 'bi-shield-check-fill',
      title: 'Plataforma Segura',
      description: 'Seus dados e interações são protegidos com criptografia de ponta a ponta.',
      color: '#764ba2',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Crie sua conta',
      description: 'Cadastre-se gratuitamente em menos de 2 minutos e configure seu perfil.',
      icon: 'bi-person-plus-fill',
    },
    {
      number: '02',
      title: 'Cadastre seus conhecimentos',
      description: 'Liste suas habilidades e especialidades para que outros possam te encontrar.',
      icon: 'bi-journal-plus',
    },
    {
      number: '03',
      title: 'Encontre ou ofereça aulas',
      description: 'Navegue pelos conhecimentos disponíveis ou receba pedidos de aula.',
      icon: 'bi-search-heart',
    },
    {
      number: '04',
      title: 'Aprenda e ensine',
      description: 'Realize as aulas agendadas e construa sua reputação na plataforma.',
      icon: 'bi-mortarboard-fill',
    },
  ];

  return (
    <div className="landing-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="bi bi-stars"></i>
              <span>Plataforma de aprendizado colaborativo</span>
            </div>
            <h1 className="hero-title">
              Compartilhe o que <span className="hero-title-highlight">você sabe</span>,
              <br />
              aprenda o que <span className="hero-title-highlight">precisa</span>
            </h1>
            <p className="hero-subtitle">
              Conectamos pessoas que querem ensinar com pessoas que querem aprender.
              Cadastre seus conhecimentos, explore habilidades da comunidade e agende
              aulas personalizadas com especialistas reais.
            </p>
            <div className="hero-actions">
              {isAuthenticated() ? (
                <>
                  <Link to="/knowledge" className="btn-hero-primary">
                    <i className="bi bi-journal-plus"></i>
                    Cadastrar Conhecimento
                  </Link>
                  <Link to="/offers" className="btn-hero-secondary">
                    <i className="bi bi-search"></i>
                    Explorar Ofertas
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-hero-primary">
                    <i className="bi bi-rocket-takeoff"></i>
                    Começar Agora — Grátis
                  </Link>
                  <Link to="/login" className="btn-hero-secondary">
                    <i className="bi bi-box-arrow-in-right"></i>
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>

          </div>
          <div className="hero-visual">
            <div className="hero-card hero-card-main">
              <div className="hero-card-header">
                <i className="bi bi-lightbulb-fill"></i>
                <span>Conhecimento do Dia</span>
              </div>
              <h3>Desenvolvimento Web com React</h3>
              <p>Aprenda a criar interfaces modernas e responsivas</p>
              <div className="hero-card-tags">
                <span className="tag">Iniciante</span>
                <span className="tag">Online</span>
                <span className="tag">2h/aula</span>
              </div>
              <div className="hero-card-action">
                <span className="rating"><i className="bi bi-star-fill"></i> 4.9</span>
                <button className="btn-schedule-preview">Agendar Aula</button>
              </div>
            </div>
            <div className="hero-card hero-card-float hero-card-float-1">
              <i className="bi bi-check-circle-fill text-success"></i>
              <span>Aula agendada!</span>
            </div>
            <div className="hero-card hero-card-float hero-card-float-2">
              <i className="bi bi-people-fill"></i>
              <span>+12 inscritos hoje</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <i className="bi bi-grid-3x3-gap-fill"></i>
              <span>Funcionalidades</span>
            </div>
            <h2 className="section-title">Por que usar nossa plataforma?</h2>
            <p className="section-subtitle">
              Tudo que você precisa para ensinar, aprender e se conectar com a comunidade.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <i className="bi bi-map-fill"></i>
              <span>Passo a passo</span>
            </div>
            <h2 className="section-title">Como funciona?</h2>
            <p className="section-subtitle">
              Em apenas 4 passos simples você já pode começar a ensinar ou aprender.
            </p>
          </div>
          <div className="steps-container">
            {steps.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-number">{step.number}</div>
                <div className="step-icon-wrapper">
                  <i className={`bi ${step.icon}`}></i>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {i < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-bg-shapes">
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>
        </div>
        <div className="container">
          <div className="cta-content">
            <div className="cta-icon">
              <i className="bi bi-rocket-takeoff-fill"></i>
            </div>
            <h2 className="cta-title">Pronto para começar?</h2>
            <p className="cta-subtitle">
              Junte-se a centenas de pessoas que já estão compartilhando e aprendendo
              na nossa plataforma. É gratuito e leva menos de 2 minutos.
            </p>
            <div className="cta-actions">
              {isAuthenticated() ? (
                <Link to="/knowledge" className="btn-cta-primary">
                  <i className="bi bi-journal-plus"></i>
                  Cadastrar Conhecimento
                </Link>
              ) : (
                <Link to="/register" className="btn-cta-primary">
                  <i className="bi bi-person-plus-fill"></i>
                  Criar conta grátis
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
