import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./Produto.css";
import { ArrowLeft } from "lucide-react";
import { useCarrinho } from "./CarrinhoContext";
import { produtosService } from "./services/api";

import produto1 from "./assets/produto1.png";
import produto2 from "./assets/produto2.png";
import produto3 from "./assets/produto3.png";
import produto4 from "./assets/produto4.png";
import produto5 from "./assets/produto5.jpeg";
import produto6 from "./assets/produto6.jpeg";
import produto7 from "./assets/produto7.jpeg";
import produto8 from "./assets/produto8.jpeg";

const imagensFallback = {
  1: produto1,
  2: produto2,
  3: produto3,
  4: produto4,
  5: produto5,
  6: produto6,
  7: produto7,
  8: produto8,
};

function resolverImagem(item) {
  if (!item) return produto1;
  if (imagensFallback[item.id]) {
    return imagensFallback[item.id];
  }
  if (item.img && (item.img.startsWith("http") || item.img.startsWith("/uploads"))) {
    return item.img;
  }
  return produto1;
}

export default function Produto() {
  const { adicionarAoCarrinho } = useCarrinho();
  const { id } = useParams();

  const [produto, setProduto] = useState(null);
  const [tamanho, setTamanho] = useState("M");
  const [carregando, setCarregando] = useState(true);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    async function carregarProduto() {
      try {
        setCarregando(true);
        const res = await produtosService.getById(id);
        if (res.success && res.data) {
          setProduto(res.data);
        } else {
          setProduto(null);
        }
      } catch {
        setProduto(null);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [id]);

  const handleComprar = () => {
    if (!produto) return;
    adicionarAoCarrinho(produto, tamanho);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  if (carregando) {
    return (
      <div className="produto-detalhes-container">
        <p style={{ textAlign: "center", padding: "60px 0" }}>Carregando produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="produto-detalhes-container">
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#000",
            marginBottom: "20px",
            fontWeight: "bold"
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <h2 style={{ textAlign: "center", padding: "40px 0" }}>Produto não encontrado!</h2>
      </div>
    );
  }

  return (
    <div className="produto-detalhes-container">
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          color: "#000",
          marginBottom: "20px",
          fontWeight: "bold"
        }}
      >
        <ArrowLeft size={20} />
        Voltar
      </Link>

      <div className="produto-wrapper">
        <div className="produto-imagem">
          <img
            src={resolverImagem(produto)}
            alt={produto.nome}
          />
        </div>

        <div className="produto-info">
          <h1>{produto.nome}</h1>

          <p className="produto-preco">
            {produto.preco}
          </p>

          <p className="produto-descricao">
            {produto.desc}
          </p>

          <div className="opcoes-compra">
            <label htmlFor="tamanho">
              Tamanho:
            </label>

            <select
              id="tamanho"
              value={tamanho}
              onChange={(e) => setTamanho(e.target.value)}
            >
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleComprar}
          >
            {adicionado ? "Adicionado ao Carrinho!" : "Comprar"}
          </button>
        </div>
      </div>
    </div>
  );
}