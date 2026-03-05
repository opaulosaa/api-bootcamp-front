import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EditOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    nivel: 'basico',
    pessoa_id: '',
    prerequisitos: '',
    duracao: '',
    modalidade: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const loadData = async () => {
    try {
      // Carregar pessoas
      const pessoasResponse = await api.get('/users');
      setPessoas(pessoasResponse.data.pessoas || pessoasResponse.data);

      // Carregar dados da oferta
      const ofertasResponse = await api.get('/conhecimentos');
      const oferta = ofertasResponse.data.find((o) => o.id === parseInt(id));
      
      if (oferta) {
        setFormData({
          titulo: oferta.titulo || '',
          descricao: oferta.descricao || '',
          categoria: oferta.categoria || '',
          nivel: oferta.nivel || 'basico',
          pessoa_id: oferta.pessoa_id || '',
          prerequisitos: oferta.prerequisitos || '',
          duracao: oferta.duracao || '',
          modalidade: oferta.modalidade || ''
        });
      } else {
        setMessage('Oferta não encontrada');
        setMessageType('danger');
      }
    } catch (error) {
      setMessage('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.titulo || !formData.categoria || !formData.pessoa_id) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setMessageType('danger');
      return;
    }

    try {
      await api.put(`/conhecimentos/${id}`, formData);
      setMessage('Oferta atualizada com sucesso!');
      setMessageType('success');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/offers');
      }, 2000);
    } catch (error) {
      setMessage('Erro ao atualizar oferta: ' + (error.response?.data?.message || error.message));
      setMessageType('danger');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Editar Oferta</h2>
              
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

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="titulo" className="form-label">
                    Título <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="descricao" className="form-label">
                    Descrição
                  </label>
                  <textarea
                    className="form-control"
                    id="descricao"
                    name="descricao"
                    rows="3"
                    value={formData.descricao}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="categoria" className="form-label">
                      Categoria <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Negócios">Negócios</option>
                      <option value="Idiomas">Idiomas</option>
                      <option value="Arte">Arte</option>
                      <option value="Música">Música</option>
                      <option value="Esportes">Esportes</option>
                      <option value="Culinária">Culinária</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="nivel" className="form-label">
                      Nível <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="nivel"
                      name="nivel"
                      value={formData.nivel}
                      onChange={handleChange}
                      required
                    >
                      <option value="basico">Básico</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="duracao" className="form-label">
                      ⏱️ Duração
                    </label>
                    <select
                      className="form-select"
                      id="duracao"
                      name="duracao"
                      value={formData.duracao}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      <option value="1-2 horas">1-2 horas</option>
                      <option value="1 semana">1 semana</option>
                      <option value="2-4 semanas">2-4 semanas</option>
                      <option value="1-2 meses">1-2 meses</option>
                      <option value="3-6 meses">3-6 meses</option>
                      <option value="6+ meses">6+ meses</option>
                      <option value="Contínuo">Contínuo</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="modalidade" className="form-label">
                      📍 Modalidade
                    </label>
                    <select
                      className="form-select"
                      id="modalidade"
                      name="modalidade"
                      value={formData.modalidade}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      <option value="Presencial">🏢 Presencial</option>
                      <option value="Online">💻 Online</option>
                      <option value="Híbrido">🔄 Híbrido</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="pessoa_id" className="form-label">
                      👨‍🏫 Instrutor <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="pessoa_id"
                      name="pessoa_id"
                      value={formData.pessoa_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione...</option>
                      {pessoas.map((pessoa) => (
                        <option key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="prerequisitos" className="form-label">
                    📋 Pré-requisitos
                  </label>
                  <textarea
                    className="form-control"
                    id="prerequisitos"
                    name="prerequisitos"
                    rows="3"
                    value={formData.prerequisitos}
                    onChange={handleChange}
                    placeholder="Liste os conhecimentos ou habilidades necessários para participar desta oferta..."
                  ></textarea>
                  <small className="text-muted">opcional</small>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/offers')}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Atualizar Oferta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditOffer;
