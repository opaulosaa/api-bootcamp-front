// Utilitários para verificação de papéis (roles)

/**
 * Verifica se o usuário é administrador
 * @param {Object} user - Objeto do usuário
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user && user.role === 'ADMIN';
};

/**
 * Verifica se o usuário é um usuário comum
 * @param {Object} user - Objeto do usuário
 * @returns {boolean}
 */
export const isUser = (user) => {
  return user && user.role === 'USER';
};

/**
 * Verifica se o usuário tem permissão para editar/deletar um recurso
 * @param {Object} user - Objeto do usuário
 * @param {string} resourceOwnerIdOrEmail - ID ou email do dono do recurso
 * @returns {boolean}
 */
export const canEditResource = (user, resourceOwnerIdOrEmail) => {
  if (!user) return false;
  
  // Admin pode editar qualquer coisa
  if (isAdmin(user)) return true;
  
  // Usuário pode editar apenas seus próprios recursos
  return user.id === resourceOwnerIdOrEmail || user.email === resourceOwnerIdOrEmail;
};

/**
 * Retorna label amigável do papel
 * @param {string} role - Role do usuário
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  const labels = {
    'ADMIN': 'Administrador',
    'USER': 'Usuário'
  };
  return labels[role] || 'Desconhecido';
};

/**
 * Retorna badge color do papel
 * @param {string} role - Role do usuário
 * @returns {string}
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    'ADMIN': 'danger',
    'USER': 'primary'
  };
  return colors[role] || 'secondary';
};
