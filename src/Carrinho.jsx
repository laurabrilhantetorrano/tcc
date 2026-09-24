import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { useCarrinho } from './CarrinhoContext';
import { useAuth } from './AuthContext';
import { pedidosService } from './services/api';
import './Carrinho.css';

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

export default function Carrinho() {
  const { carrinho, removerDoCarrinho, limparCarrinho } = useCarrinho();
  const { user } = useAuth();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedidoRealizado, setPedidoRealizado] = useState(null);

  // Função simples para somar os preços dos produtos
  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => {
      const precoLimpo = String(item.preco || '0')
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim();
      return acc + (parseFloat(precoLimpo) || 0) * item.quantidade;
    }, 0);
  };

  const total = calcularTotal();

  const handleFinalizarCompra = async () => {
    if (carrinho.length === 0) return;
    setErro("");
    setCarregando(true);

    try {
      const res = await pedidosService.create({
        itens: carrinho,
        total,
        nome_cliente: user ? user.username : 'Cliente da Loja',
        email_cliente: user ? user.email : 'cliente@nanaemimi.com.br'
      });

      if (res.success && res.data) {
        setPedidoRealizado(res.data);
        limparCarrinho();
      }
    } catch (err) {
      setErro(err.message || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="carrinho-container">
      <Link to="/" className="btn-voltar">
        <ArrowLeft size={16} /> Continuar comprando
      </Link>

      <div className="carrinho-header-pagina">
        <h1>Meu Carrinho</h1>
      </div>

      {pedidoRealizado ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f0fdf4',
          borderRadius: '12px',
          border: '1px solid #bbf7d0',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <CheckCircle2 size={56} color="#16a34a" style={{ marginBottom: '15px' }} />
          <h2 style={{ color: '#166534', margin: '0 0 10px 0' }}>Pedido #{pedidoRealizado.id} Confirmado!</h2>
          <p style={{ color: '#374151', fontSize: '1.05rem', marginBottom: '10px' }}>
            Obrigado pela sua compra{user ? `, ${user.username}` : ''}!
          </p>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '25px' }}>
            Valor Total: <strong>R$ {Number(pedidoRealizado.total).toFixed(2).replace('.', ',')}</strong> | Status: <strong>Recebido</strong>
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#1b4d3e',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Voltar para a Loja
          </Link>
        </div>
      ) : carrinho.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="carrinho-vazio">Seu carrinho está vazio.</p>
          <Link to="/" style={{ color: '#000', fontWeight: 'bold' }}>Comprar</Link>
        </div>
      ) : (
        <div className="carrinho-conteudo">
          <div className="carrinho-lista">
            {carrinho.map((item) => (
              <div key={`${item.id}-${item.tamanho || 'default'}`} className="carrinho-item-pagina">
                <img src={resolverImagem(item)} alt={item.nome} />
                <div className="info-item">
                  <h3>{item.nome}</h3>
                  <p className="preco-item">{item.preco}</p>
                  <span>Qtd: {item.quantidade} {item.tamanho ? `| Tam: ${item.tamanho}` : ''}</span>
                </div>
                <button
                  className="btn-remover"
                  type="button"
                  title="Remover produto"
                  onClick={() => removerDoCarrinho(item.id, item.tamanho)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="carrinho-resumo">
            <h2>Resumo do Pedido</h2>
            <div className="linha-resumo">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="linha-resumo">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="linha-resumo total">
              <strong>Total</strong>
              <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
            </div>

            {erro && (
              <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '10px' }}>
                {erro}
              </div>
            )}

            <button
              className="btn-finalizar"
              type="button"
              onClick={handleFinalizarCompra}
              disabled={carregando}
            >
              {carregando ? "Processando Pedido..." : "Finalizar Compra"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}