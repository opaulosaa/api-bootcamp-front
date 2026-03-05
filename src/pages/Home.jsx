import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <h1 className="display-4 mb-4">Sistema de Compartilhamento de Conhecimentos</h1>
          <p className="lead mb-5">
            Conecte-se com pessoas dispostas a compartilhar e aprender juntas.
            Crie, gerencie e explore ofertas de conhecimento em diversas áreas.
          </p>
          
          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title">Cadastre-se</h5>
                  <p className="card-text">Crie seu perfil e faça parte da comunidade</p>
                  <Link to="/register" className="btn btn-primary">
                    Começar
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-plus-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title">Crie Ofertas</h5>
                  <p className="card-text">Compartilhe seus conhecimentos com outros</p>
                  <Link to="/create-offer" className="btn btn-success">
                    Criar Oferta
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className="bi bi-search text-info" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title">Explore</h5>
                  <p className="card-text">Descubra ofertas de conhecimento disponíveis</p>
                  <Link to="/offers" className="btn btn-info">
                    Ver Ofertas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
