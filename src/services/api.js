const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('prebanca_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Erro ${response.status}: Falha na requisição`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
    }
    throw error;
  }
}

export const authService = {
  login: async (username, senha) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, senha }),
    });
  },

  register: async (username, email, senha) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, senha }),
    });
  },

  getMe: async () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },
};

export const produtosService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoria) query.append('categoria', params.categoria);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/produtos${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return request(`/produtos/${id}`, {
      method: 'GET',
    });
  },
};

export const pedidosService = {
  create: async (pedidoData) => {
    return request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    });
  },

  getMyOrders: async () => {
    return request('/pedidos/meus-pedidos', {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return request(`/pedidos/${id}`, {
      method: 'GET',
    });
  },
};
