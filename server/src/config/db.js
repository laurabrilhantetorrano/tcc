import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDirectory = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDirectory, 'database.sqlite');
const db = new Database(dbPath);

// Configurações de performance e integridade referencial
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Criação das tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco TEXT NOT NULL,
      preco_numerico REAL NOT NULL,
      preco_antigo TEXT,
      desc TEXT NOT NULL,
      img TEXT NOT NULL,
      categoria TEXT NOT NULL,
      ordem INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      nome_cliente TEXT,
      email_cliente TEXT,
      total REAL NOT NULL,
      status TEXT DEFAULT 'recebido',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      nome TEXT NOT NULL,
      preco TEXT NOT NULL,
      preco_numerico REAL NOT NULL,
      tamanho TEXT DEFAULT 'M',
      quantidade INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_categoria ON products (categoria);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
  `);

  // Seed de produtos iniciais
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM products');
  const { total } = countStmt.get();

  if (total === 0) {
    console.log('[Database] Populando tabela de produtos com dados iniciais...');
    const insertProduct = db.prepare(`
      INSERT INTO products (nome, preco, preco_numerico, preco_antigo, desc, img, categoria, ordem)
      VALUES (@nome, @preco, @preco_numerico, @preco_antigo, @desc, @img, @categoria, @ordem)
    `);

    const produtosIniciais = [
      {
        nome: "Body + Corpete Bege",
        preco: "R$ 105,00",
        preco_numerico: 105.00,
        preco_antigo: null,
        desc: "Lindo body com corpete bege, perfeito para ocasiões especiais. Tecido confortável de alta durabilidade.",
        img: "/uploads/produto1.png",
        categoria: "nana_mimi",
        ordem: 1
      },
      {
        nome: "Camisa Social",
        preco: "R$ 59,90",
        preco_numerico: 59.90,
        preco_antigo: "R$ 119,90",
        desc: "Camisa social elegante de algodão. Ideal para o dia a dia no trabalho ou eventos formais.",
        img: "/uploads/produto2.png",
        categoria: "nana_mimi",
        ordem: 2
      },
      {
        nome: "Calça Jogger",
        preco: "R$ 89,90",
        preco_numerico: 89.90,
        preco_antigo: null,
        desc: "Calça jogger super estilosa com ajuste na cintura. Conforto e moda andam juntos aqui.",
        img: "/uploads/produto3.png",
        categoria: "nana_mimi",
        ordem: 3
      },
      {
        nome: "Moletom Cinza",
        preco: "R$ 85,00",
        preco_numerico: 85.00,
        preco_antigo: null,
        desc: "Moletom cinza flanelado perfeito para os dias mais frios. Caimento perfeito e muito quentinho.",
        img: "/uploads/produto4.png",
        categoria: "nana_mimi",
        ordem: 4
      },
      {
        nome: "Blusa feminina",
        preco: "R$ 42,00",
        preco_numerico: 42.00,
        preco_antigo: null,
        desc: "Blusa menta estilosa com saia para um visual casual.",
        img: "/uploads/produto5.jpeg",
        categoria: "conforto_estilo",
        ordem: 5
      },
      {
        nome: "Conjunto Verão",
        preco: "R$ 135,00",
        preco_numerico: 135.00,
        preco_antigo: null,
        desc: "Conjunto de camisa bata e shorts fresquinho para o verão.",
        img: "/uploads/produto6.jpeg",
        categoria: "conforto_estilo",
        ordem: 6
      },
      {
        nome: "Pijama Infantil Sereia",
        preco: "R$ 65,00",
        preco_numerico: 65.00,
        preco_antigo: null,
        desc: "Pijama de sereia divertido e super confortável.",
        img: "/uploads/produto7.jpeg",
        categoria: "conforto_estilo",
        ordem: 7
      },
      {
        nome: "Pijama Infantil Sweet Dreams",
        preco: "R$ 69,00",
        preco_numerico: 69.00,
        preco_antigo: null,
        desc: "Pijama verde-menta macio para noites tranquilas.",
        img: "/uploads/produto8.jpeg",
        categoria: "conforto_estilo",
        ordem: 8
      }
    ];

    const seedMany = db.transaction((items) => {
      for (const item of items) {
        insertProduct.run(item);
      }
    });

    seedMany(produtosIniciais);
    console.log('[Database] 8 produtos inseridos com sucesso!');
  }

  // Seed de usuários padrão
  const userCountStmt = db.prepare('SELECT COUNT(*) as total FROM users');
  const { total: totalUsers } = userCountStmt.get();

  if (totalUsers === 0) {
    console.log('[Database] Criando usuários de teste...');
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `);

    const salt = bcrypt.genSaltSync(10);
    const senhaCliente = bcrypt.hashSync('senha123', salt);
    const senhaAdmin = bcrypt.hashSync('admin123', salt);

    insertUser.run('cliente', 'cliente@exemplo.com', senhaCliente, 'customer');
    insertUser.run('admin', 'admin@nanaemimi.com.br', senhaAdmin, 'admin');
    console.log('[Database] Usuários de demonstração criados (cliente@exemplo.com / senha123)');
  }
}

export default db;
