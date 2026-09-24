import db from '../config/db.js';

export function create(req, res, next) {
  try {
    const { itens, total, nome_cliente, email_cliente } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'O carrinho está vazio. Adicione pelo menos um produto para finalizar a compra.'
      });
    }

    // Calcula total se não enviado ou valida
    let totalCalculado = 0;
    for (const item of itens) {
      const precoLimpo = String(item.preco || '0')
        .replace('R$', '')
        .replace('.', '')
        .replace(',', '.')
        .trim();
      const unit = parseFloat(precoLimpo) || 0;
      const qtd = Number(item.quantidade) || 1;
      totalCalculado += unit * qtd;
    }

    const valorFinal = typeof total === 'number' && total > 0 ? total : totalCalculado;

    // Transação de criação do pedido e seus itens
    const criarPedidoTx = db.transaction(() => {
      const insertOrder = db.prepare(`
        INSERT INTO orders (user_id, nome_cliente, email_cliente, total, status)
        VALUES (?, ?, ?, ?, 'recebido')
      `);

      const clienteNome = nome_cliente || (req.user ? req.user.username : 'Cliente Convidado');
      const clienteEmail = email_cliente || (req.user ? req.user.email : 'cliente@nanaemimi.com.br');

      const orderResult = insertOrder.run(userId, clienteNome, clienteEmail, valorFinal);
      const orderId = Number(orderResult.lastInsertRowid);

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, nome, preco, preco_numerico, tamanho, quantidade)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of itens) {
        const precoLimpo = String(item.preco || '0')
          .replace('R$', '')
          .replace('.', '')
          .replace(',', '.')
          .trim();
        const precoNumerico = parseFloat(precoLimpo) || 0;

        insertItem.run(
          orderId,
          item.id || null,
          item.nome || 'Produto sem nome',
          item.preco || `R$ ${precoNumerico.toFixed(2).replace('.', ',')}`,
          precoNumerico,
          item.tamanho || 'M',
          Number(item.quantidade) || 1
        );
      }

      return orderId;
    });

    const novoOrderId = criarPedidoTx();

    const pedidoCriado = db.prepare('SELECT * FROM orders WHERE id = ?').get(novoOrderId);
    const itensCriados = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(novoOrderId);

    return res.status(201).json({
      success: true,
      message: 'Pedido realizado com sucesso!',
      data: {
        ...pedidoCriado,
        itens: itensCriados
      }
    });
  } catch (error) {
    next(error);
  }
}

export function listUserOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const result = orders.map(ord => ({
      ...ord,
      itens: getItems.all(ord.id)
    }));

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export function getById(req, res, next) {
  try {
    const { id } = req.params;
    const pedido = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado.'
      });
    }

    const itens = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    return res.json({
      success: true,
      data: {
        ...pedido,
        itens
      }
    });
  } catch (error) {
    next(error);
  }
}
