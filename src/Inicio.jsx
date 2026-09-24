import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { CircleUserRound, ShoppingCart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import "swiper/css";
import React, { useState, useEffect } from "react";
import "./Inicio.css";
import { useCarrinho } from "./CarrinhoContext";
import { useAuth } from "./AuthContext";
import { produtosService } from "./services/api";

import slider1 from "./assets/slider1.png";
import slider2 from "./assets/slider2.png";
import produto1 from "./assets/produto1.png";
import produto2 from "./assets/produto2.png";
import produto3 from "./assets/produto3.png";
import produto4 from "./assets/produto4.png";
import produto5 from "./assets/produto5.jpeg";
import produto6 from "./assets/produto6.jpeg";
import produto7 from "./assets/produto7.jpeg";
import produto8 from "./assets/produto8.jpeg";
import logo from "./assets/logo.jpg";

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
  if (imagensFallback[item.id]) {
    return imagensFallback[item.id];
  }
  if (item.img && (item.img.startsWith("http") || item.img.startsWith("/uploads"))) {
    return item.img;
  }
  return produto1;
}

export default function Inicio() {
  const { carrinho } = useCarrinho();
  const { user } = useAuth();

  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const totalItens = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setCarregando(true);
        const res = await produtosService.getAll();
        if (res.success && Array.isArray(res.data)) {
          setProdutos(res.data);
        }
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((p) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(termo) ||
      (p.desc && p.desc.toLowerCase().includes(termo))
    );
  });

  const produtosNanaMimi = produtosFiltrados.filter(
    (p) => p.categoria === "nana_mimi" || p.id <= 4
  );
  const produtosConforto = produtosFiltrados.filter(
    (p) => p.categoria === "conforto_estilo" || (p.id > 4 && p.id <= 8)
  );

  return (
    <div className="app">
      {/* BARRA DE NAVEGAÇÃO */}
      <div className="navbar">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" />
        </Link>

        <div className="menu">
          <Link
            to="/sobre-nos"
            style={{
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <span>Sobre nós</span>
          </Link>

          <Link
            to="/contato"
            style={{
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <span>Contato</span>
          </Link>

          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <span>Roupas</span>
          </Link>
        </div>

        {/* PESQUISA */}
        <div className="container-pesquisa">
          <input
            type="text"
            placeholder="Buscar produto..."
            className="input-pesquisa"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Search size={18} className="icone-lupa" />
        </div>

        {/* ÍCONES */}
        <div className="icons" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Link
            to="/login"
            style={{
              color: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none"
            }}
            title={user ? `Conectado como ${user.username}` : "Fazer Login"}
          >
            <CircleUserRound size={30} />
            {user && (
              <span
                style={{
                  fontSize: "13px",
                  color: "white",
                  fontWeight: "bold",
                  maxWidth: "90px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {user.username}
              </span>
            )}
          </Link>

          <Link
            to="/carrinho"
            style={{
              color: "inherit",
              position: "relative"
            }}
          >
            <ShoppingCart size={30} />
            {totalItens > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-8px",
                  background: "#ff3b30",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontWeight: "bold"
                }}
              >
                {totalItens}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* BANNER */}
      <div className="banner">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          autoplay={{ delay: 3000 }}
          loop={true}
        >
          <SwiperSlide>
            <img src={slider1} alt="slider1" />
          </SwiperSlide>

          <SwiperSlide>
            <img src={slider2} alt="slider2" />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* BARRA DE FRETE */}
      <div className="info-barra">
        <div>💳 Parcele em até 12x</div>
        <div>🚛 Frete grátis acima de R$199</div>
        <div>🛡️ Site seguro</div>
        <div>🎯 Produto de qualidade</div>
      </div>

      {/* FEEDBACK DE CARREGAMENTO / ERRO */}
      {carregando && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#666", fontSize: "1.1rem" }}>
          Carregando produtos do catálogo...
        </div>
      )}

      {erro && (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "#dc2626" }}>
          <p>Não foi possível carregar os produtos do banco de dados.</p>
          <small>{erro}</small>
        </div>
      )}

      {/* RESULTADOS DA BUSCA OU SEÇÕES NORMAIS */}
      {!carregando && !erro && (
        <>
          {busca.trim() !== "" ? (
            <>
              <h2 className="titulo-fileira">
                Resultados para &quot;{busca}&quot; ({produtosFiltrados.length})
              </h2>
              {produtosFiltrados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
                  Nenhum produto encontrado com este termo.
                </div>
              ) : (
                <div className="produtos">
                  {produtosFiltrados.map((item) => (
                    <div
                      key={item.id}
                      className="card-wrapper"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                    >
                      <Link
                        to={`/produto/${item.id}`}
                        className="card-link"
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          width: "100%"
                        }}
                      >
                        <div className="card">
                          <img src={resolverImagem(item)} alt={item.nome} />
                          <p className="nome">{item.nome}</p>
                          <p className="preco-antigo">
                            {item.preco_antigo && <del>{item.preco_antigo}</del>}
                          </p>
                          <p className="preco">{item.preco}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* PRIMEIRA FILEIRA */}
              <h2 className="titulo-fileira">Coleção Nana & Mimi</h2>
              <div className="produtos">
                {produtosNanaMimi.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="card-wrapper"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    <Link
                      to={`/produto/${item.id}`}
                      className="card-link"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        width: "100%"
                      }}
                    >
                      <div className="card">
                        <img src={resolverImagem(item)} alt={item.nome} />
                        <p className="nome">{item.nome}</p>
                        <p className="preco-antigo">
                          {item.preco_antigo && <del>{item.preco_antigo}</del>}
                        </p>
                        <p className="preco">{item.preco}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* SEGUNDA FILEIRA */}
              <h2 className="titulo-fileira">Conforto & Estilo</h2>
              <div className="produtos">
                {produtosConforto.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="card-wrapper"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    <Link
                      to={`/produto/${item.id}`}
                      className="card-link"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        width: "100%"
                      }}
                    >
                      <div className="card">
                        <img src={resolverImagem(item)} alt={item.nome} />
                        <p className="nome">{item.nome}</p>
                        <p className="preco-antigo">
                          {item.preco_antigo && <del>{item.preco_antigo}</del>}
                        </p>
                        <p className="preco">{item.preco}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}