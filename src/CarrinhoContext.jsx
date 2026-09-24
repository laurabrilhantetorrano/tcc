import React, { createContext, useState, useEffect, useContext } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState(() => {
    try {
      const salvo = localStorage.getItem('prebanca_carrinho');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('prebanca_carrinho', JSON.stringify(carrinho));
    } catch {
      // Ignora erro de gravação
    }
  }, [carrinho]);

  // Adiciona produto ou aumenta a quantidade se já existir
  const adicionarAoCarrinho = (produto, tamanho = 'M') => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.id === produto.id && item.tamanho === tamanho);
      if (existe) {
        return prev.map((item) =>
          item.id === produto.id && item.tamanho === tamanho
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { ...produto, tamanho, quantidade: 1 }];
    });
  };

  // Remove o produto do carrinho
  const removerDoCarrinho = (id, tamanho) => {
    setCarrinho((prev) =>
      prev.filter((item) => !(item.id === id && (tamanho ? item.tamanho === tamanho : true)))
    );
  };

  // Limpa o carrinho
  const limparCarrinho = () => {
    setCarrinho([]);
  };

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarAoCarrinho,
        removerDoCarrinho,
        limparCarrinho
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrinho() {
  return useContext(CarrinhoContext);
}