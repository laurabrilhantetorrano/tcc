import React from 'react';
import { Link } from 'react-router-dom';
import { CircleUserRound, ShoppingCart, Search, MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import logo from "./assets/logo.jpg";
import { useCarrinho } from "./CarrinhoContext";
import { useAuth } from "./AuthContext";
import './Contato.css';

export default function Contato() {
  const { carrinho } = useCarrinho();
  const { user } = useAuth();

  const totalItens = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <div className="app">
      {/* Barra de Navegação */}
      <div className="navbar">
        <Link to="/">
          <img src={logo} alt="Logo Nana&Mimi" className="logo" />
        </Link>

        <div className="menu">
          <Link to="/sobre-nos" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>Sobre nós</span>
          </Link>
          <Link to="/contato" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>Contato</span>
          </Link>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>Roupas</span>
          </Link>
        </div>

        <div className="container-pesquisa">
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            className="input-pesquisa"
          />
          <Search size={18} className="icone-lupa" />
        </div>

        <div className="icons" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link
            to="/login"
            style={{
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
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
              color: 'inherit',
              position: 'relative'
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

      {/* Conteúdo de Contato Centralizado */}
      <main className="contato-container">

        <div className="contato-conteudo-central">
          <h1>Contato</h1>

          <div className="contato-texto">
            <p>
              Tem dúvidas sobre tamanhos, trocas, prazos de entrega ou quer saber mais sobre nossa coleção? Estamos sempre prontas para ajudar você com todo o carinho que a sua família merece!
            </p>
            <p>
              Adoramos conversar com quem compartilha do nosso amor pela moda infantil. Entre em contato conosco através dos canais abaixo:
            </p>
          </div>

          <div className="info-cards-central">
            <div className="card-item-central">
              <Phone size={22} />
              <div>
                <strong>WhatsApp</strong>
                <p>(19) 99572-9704</p>
              </div>
            </div>

            <div className="card-item-central">
              <Mail size={22} />
              <div>
                <strong>E-mail</strong>
                <p>nanaemimimodainfantil@gmail.com</p>
              </div>
            </div>

            <div className="card-item-central">
              <Instagram size={22} />
              <div>
                <strong>Instagram</strong>
                <p>@nanaemimimodainfantil</p>
              </div>
            </div>

            <div className="card-item-central">
              <Clock size={22} />
              <div>
                <strong>Horário de Atendimento</strong>
                <p>Segunda a Sábado, das 9h às 17h</p> 
              </div>
            </div>

            <div className="card-item-central">
              <MapPin size={22} />
              <div>
                <strong>Localização</strong>
                <p>Rua José Ramos Catarino 396 Pq Tropical - Campinas/SP</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}