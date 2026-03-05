import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="custom-footer">
      <div className="footer-content">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="footer-title">
                <i className="bi bi-lightbulb me-2"></i>
                Sistema de Conhecimentos
              </h5>
              <p className="footer-description">
                Plataforma para compartilhamento e troca de conhecimentos.
                Aprenda, ensine e cresça com a comunidade.
              </p>
            </div>
            
            <div className="col-md-4 mb-4 mb-md-0">
              <h6 className="footer-subtitle">Links Rápidos</h6>
              <ul className="footer-links">
                <li>
                  <a href="/offers">
                    <i className="bi bi-chevron-right"></i>
                    Ofertas de Conhecimento
                  </a>
                </li>
                <li>
                  <a href="/create-offer">
                    <i className="bi bi-chevron-right"></i>
                    Criar Nova Oferta
                  </a>
                </li>
                <li>
                  <a href="/register">
                    <i className="bi bi-chevron-right"></i>
                    Cadastrar-se
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="col-md-4">
              <h6 className="footer-subtitle">Contato</h6>
              <ul className="footer-contact">
                <li>
                  <i className="bi bi-envelope"></i>
                  <a href="mailto:contato@conhecimentos.com">contato@conhecimentos.com</a>
                </li>
                <li>
                  <i className="bi bi-telephone"></i>
                  <span>(00) 0000-0000</span>
                </li>
                <li>
                  <i className="bi bi-geo-alt"></i>
                  <span>Brasil</span>
                </li>
              </ul>
              <div className="footer-social">
                <a href="#" className="social-link" title="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="social-link" title="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="social-link" title="LinkedIn">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="social-link" title="Twitter">
                  <i className="bi bi-twitter"></i>
                </a>
              </div>
            </div>
          </div>
          
          <hr className="footer-divider" />
          
          <div className="footer-bottom">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
                <p className="footer-copyright">
                  &copy; {currentYear} Sistema de Conhecimentos. Todos os direitos reservados.
                </p>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <a href="#" className="footer-policy-link">Termos de Uso</a>
                <span className="footer-separator">|</span>
                <a href="#" className="footer-policy-link">Política de Privacidade</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
          <path fill="#2c3e50" fillOpacity="0.3" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>
    </footer>
  );
}

export default Footer;
