import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Cadastro.css";
import logo from "./assets/logo.jpg";

export default function Cadastro() {
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");

const [erroEmail, setErroEmail] = useState("");
const [erroCadastro, setErroCadastro] = useState("");
const [cadastrando, setCadastrando] = useState(false);

const lidarComCadastro = async (e) => {
e.preventDefault();

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação do e-mail
if (!emailValido.test(email)) {
setErroEmail(
"Por favor, insira um e-mail válido (ex: nome@email.com)."
);
return;
}

setErroEmail("");
setErroCadastro("");
setCadastrando(true);

try {
const resposta = await fetch(
"http://localhost:5000/api/auth/register",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
username: username,
email: email,
senha: senha,
}),
}
);

const dados = await resposta.json();

if (!resposta.ok) {
setErroCadastro(
dados.error || "Não foi possível realizar o cadastro."
);
return;
}

// Salva o token recebido pelo back-end
if (dados.token) {
localStorage.setItem("token", dados.token);
}

alert("Cadastro realizado com sucesso!");

// Limpa os campos
setUsername("");
setEmail("");
setSenha("");
} catch (erro) {
console.error("Erro ao realizar cadastro:", erro);

setErroCadastro(
"Falha na requisição. Verifique se o servidor está funcionando."
);
} finally {
setCadastrando(false);
}
};

return (
<div className="cadastro-page-container">
<Link to="/" className="btn-voltar-home-cad">
← Voltar para o Início
</Link>

<section className="cadastro-section">
<div className="boas-vindas-cad">
<img src={logo} alt="Logo" />

<h2>
Bem-vindo! Por favor, insira seus dados para criar sua conta.
</h2>
</div>

<form onSubmit={lidarComCadastro} className="grupo-input-cad">
<h1>Cadastre-se</h1>

<label htmlFor="username">Usuário:</label>

<input
type="text"
id="username"
name="username"
value={username}
onChange={(e) => setUsername(e.target.value)}
required
/>

<label htmlFor="email">E-mail:</label>

<input
type="text"
id="email"
name="email"
value={email}
onChange={(e) => {
setEmail(e.target.value);

if (erroEmail) {
setErroEmail("");
}

if (erroCadastro) {
setErroCadastro("");
}
}}
required
/>

{erroEmail && (
<span className="erro-mensagem">
{erroEmail}
</span>
)}

<label htmlFor="senha">Senha:</label>

<input
type="password"
id="senha"
name="senha"
value={senha}
onChange={(e) => {
setSenha(e.target.value);

if (erroCadastro) {
setErroCadastro("");
}
}}
required
/>

{erroCadastro && (
<span className="erro-mensagem">
{erroCadastro}
</span>
)}

<button
type="submit"
className="btn-enviar-cad"
disabled={cadastrando}
>
{cadastrando ? "Cadastrando..." : "Cadastrar"}
</button>

<p>
Já tem uma conta?{" "}
<Link to="/login">Faça login</Link>
</p>
</form>
</section>
</div>
);
}
