import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleLabel, getRoleBadgeColor } from '../utils/roleHelper';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={isAuthenticated() ? "/dashboard" : "/"}>
          Sistema de Conhecimentos
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated() && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bi bi-grid-3x3-gap"></i> Dashboard
                  </Link>
                </li>
                {user?.role === 'ADMIN' && (
                  <li className="nav-item">
                    <Link className="nav-link text-warning" to="/admin">
                      <i className="bi bi-shield-lock"></i> Admin
                    </Link>
                  </li>
                )}
              </>
            )}

            {isAuthenticated() ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user?.foto ? (
                    <img
                      src={user.foto}
                      alt={user.nome}
                      className="user-avatar"
                    />
                  ) : (
                    <i className="bi bi-person-circle" style={{ fontSize: '32px' }}></i>
                  )}
                  <span>{user?.nome}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">{user?.email}</small>
                      <br />
                      <span className={`badge bg-${getRoleBadgeColor(user?.role)} mt-1`}>
                        {getRoleLabel(user?.role)}
                      </span>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sair
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Entrar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="navbar-btn-register" to="/register">
                    <i className="bi bi-person-plus-fill me-1"></i>
                    Cadastrar-se
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
