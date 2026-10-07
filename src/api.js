// URL da API: no Vercel usamos a mesma origem (/api); localmente usamos o
// servidor Express em http://localhost:3001.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };

  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { erro: text || 'Resposta inválida do servidor.' };
  }

  if (!response.ok) {
    throw { status: response.status, ...data };
  }

  return data;
}

export function formatarPreco(valor) {
  const num = Number(valor);
  if (isNaN(num)) return 'R$ 0,00';
  const parts = num.toFixed(2).split('.');
  const inteiro = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${inteiro},${parts[1]}`;
}

export { API_URL };
export default apiFetch;
