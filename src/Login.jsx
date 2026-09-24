import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "./assets/logo.jpg";
import { useAuth } from "./AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  const lidarComLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(username, senha);
      navigate("/");
    } catch (err) {
      setErro(err.message || "Erro ao realizar login.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Botão flutuante para voltar para a Home */}
      <Link to="/" className="btn-voltar-home">
        ← Voltar para o Início
      </Link>

      <section className="login-section">
        <div className="boas-vindas">
          <img src={logo} alt="Logo" />
          <h2>
            Bem-vindo de volta! Por favor, insira seus dados para acessar sua conta.
          </h2>
        </div>

        {user ? (
          <div className="grupo-input">
            <h1>Conta Conectada</h1>
            <p style={{ fontSize: "1.1em", color: "#1f2937", marginBottom: "15px" }}>
              Olá, <strong>{user.username}</strong>! Você já está autenticado.
            </p>
            <p style={{ color: "#4b5563", marginBottom: "25px" }}>
              Email: {user.email}
            </p>
            <button
              type="button"
              className="btn-enviar-login"
              style={{ backgroundColor: "#dc2626", marginBottom: "15px" }}
              onClick={logout}
            >
              Sair da Conta (Logout)
            </button>
            <Link
              to="/"
              style={{
                textAlign: "center",
                color: "#2563eb",
                fontWeight: "600",
                textDecoration: "none"
              }}
            >
              Ir para a Loja
            </Link>
          </div>
        ) : (
          <form onSubmit={lidarComLogin} className="grupo-input">
            <h1>Login</h1>

            <label htmlFor="username">Usuário ou Email:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (erro) setErro("");
              }}
              required
            />

            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (erro) setErro("");
              }}
              required
            />

            {erro && <span className="erro-mensagem">{erro}</span>}

            <button
              type="submit"
              className="btn-enviar-login"
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            <p>
              Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
            </p>
          </form>
        )}
      </section>
    </div>
  );
}