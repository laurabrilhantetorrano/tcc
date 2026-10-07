import React, { createContext, useState, useContext, useEffect } from 'react';
import apiFetch from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [carregando, setCarregando] = useState(true);

  // Ao montar ou quando o token mudar, busca os dados do usuário
  useEffect(() => {
    if (token) {
      apiFetch('/auth/me')
        .then((data) => {
          setUsuario(data);
        })
        .catch(() => {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          setToken(null);
          setUsuario(null);
        })
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, [token]);

  // Login de cliente
  const login = async (email, senha) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  };

  // Cadastro de cliente
  const cadastrar = async (nome, email, senha) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  };

  // Login de funcionário
  const loginFuncionario = async (email, senha) => {
    const data = await apiFetch('/employees/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  const isLogado = !!usuario;
  const isFuncionario = usuario?.tipo === 'funcionario';
  const isCliente = usuario?.tipo === 'cliente';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        login,
        cadastrar,
        loginFuncionario,
        logout,
        isLogado,
        isFuncionario,
        isCliente,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
