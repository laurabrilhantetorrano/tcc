import db from '../config/db.js';

export function list(req, res, next) {
  try {
    const { search, categoria } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND (nome LIKE ? OR desc LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (categoria && categoria.trim()) {
      query += ' AND categoria = ?';
      params.push(categoria.trim());
    }

    query += ' ORDER BY ordem ASC, id ASC';

    const stmt = db.prepare(query);
    const produtos = stmt.all(...params);

    return res.json({
      success: true,
      total: produtos.length,
      data: produtos
    });
  } catch (error) {
    next(error);
  }
}

export function getById(req, res, next) {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const produto = stmt.get(id);

    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado.'
      });
    }

    return res.json({
      success: true,
      data: produto
    });
  } catch (error) {
    next(error);
  }
}

export function create(req, res, next) {
  try {
    const { nome, preco, preco_antigo, desc, img, categoria, ordem } = req.body;

    if (!nome || !preco || !desc) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes (nome, preco, desc).'
      });
    }

    // Calcula preco numérico a partir da string caso não seja enviado
    let precoNumerico = 0;
    if (typeof preco === 'number') {
      precoNumerico = preco;
    } else {
      const precoLimpo = String(preco)
        .replace('R$', '')
        .replace('.', '')
        .replace(',', '.')
        .trim();
      precoNumerico = parseFloat(precoLimpo) || 0;
    }

    const precoFormatado = typeof preco === 'string' && preco.includes('R$')
      ? preco
      : `R$ ${precoNumerico.toFixed(2).replace('.', ',')}`;

    const stmt = db.prepare(`
      INSERT INTO products (nome, preco, preco_numerico, preco_antigo, desc, img, categoria, ordem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nome,
      precoFormatado,
      precoNumerico,
      preco_antigo || null,
      desc,
      img || '/uploads/produto1.png',
      categoria || 'geral',
      ordem || 0
    );

    const novoProduto = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso!',
      data: novoProduto
    });
  } catch (error) {
    next(error);
  }
}
