import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getRoleLabel, getRoleBadgeColor } from '../utils/roleHelper';

function AdminPanel() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsuarios(response.data.pessoas || response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setMessage('Erro ao carregar usuários');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setMessage('Usuário excluído com sucesso');
      setMessageType('success');
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setMessage('Erro ao excluir usuário: ' + (error.response?.data?.error || error.message));
      setMessageType('danger');
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    
    if (!window.confirm(`Tem certeza que deseja alterar o papel para ${getRoleLabel(newRole)}?`)) {
      return;
    }

    try {
      await api.patch(`/users/${id}`, { role: newRole });
      setMessage(`Papel alterado para ${getRoleLabel(newRole)} com sucesso`);
      setMessageType('success');
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao alterar papel:', error);
      setMessage('Erro ao alterar papel: ' + (error.response?.data?.error || error.message));
      setMessageType('danger');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-shield-lock me-2"></i>
              Painel Administrativo
            </h2>
            <span className="badge bg-danger fs-6">
              <i className="bi bi-person-badge me-1"></i>
              {user?.nome}
            </span>
          </div>

          {message && (
            <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage('')}
              ></button>
            </div>
          )}

          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Gerenciar Usuários ({usuarios.length})
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Papel</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {usuario.foto ? (
                              <img
                                src={usuario.foto}
                                alt={usuario.nome}
                                className="rounded-circle me-2"
                                width="40"
                                height="40"
                              />
                            ) : (
                              <i className="bi bi-person-circle fs-2 me-2"></i>
                            )}
                            {usuario.nome}
                          </div>
                        </td>
                        <td>{usuario.email}</td>
                        <td>{usuario.telefone}</td>
                        <td>
                          <span className={`badge bg-${getRoleBadgeColor(usuario.role)}`}>
                            {getRoleLabel(usuario.role)}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleToggleRole(usuario.id, usuario.role)}
                            title={`Alterar para ${usuario.role === 'ADMIN' ? 'Usuário' : 'Admin'}`}
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(usuario.id, usuario.nome)}
                            disabled={usuario.id === user?.id}
                            title={usuario.id === user?.id ? 'Você não pode excluir a si mesmo' : 'Excluir usuário'}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-people-fill fs-1 text-primary"></i>
                  <h3 className="mt-2">{usuarios.length}</h3>
                  <p className="text-muted">Total de Usuários</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-shield-fill-check fs-1 text-danger"></i>
                  <h3 className="mt-2">
                    {usuarios.filter(u => u.role === 'ADMIN').length}
                  </h3>
                  <p className="text-muted">Administradores</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-person-fill fs-1 text-success"></i>
                  <h3 className="mt-2">
                    {usuarios.filter(u => u.role === 'USER').length}
                  </h3>
                  <p className="text-muted">Usuários Comuns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
