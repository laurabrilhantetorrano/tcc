const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// O Vercel usa filesystem somente leitura para o código do deployment.
// Por isso, em produção copiamos o banco-base para /tmp, que é gravável
// durante a execução da função. Para dados permanentes, o projeto deve
// migrar para um banco externo (Postgres/Neon, Supabase etc.).
const isVercel = Boolean(process.env.VERCEL);
const sourceDb = path.join(__dirname, 'database.sqlite');
const runtimeDb = isVercel ? path.join('/tmp', 'nana-mimi.sqlite') : sourceDb;

if (isVercel && !fs.existsSync(runtimeDb)) {
  fs.copyFileSync(sourceDb, runtimeDb);
}

const db = new Database(runtimeDb);
db.pragma('foreign_keys = ON');

// ─── Criação das tabelas ───────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    cargo TEXT NOT NULL DEFAULT 'funcionario',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    preco_antigo REAL,
    categoria TEXT,
    tamanhos TEXT,
    cor TEXT,
    imagem TEXT,
    estoque INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS carrinhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS carrinho_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carrinho_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE(carrinho_id, produto_id)
  );
`);

module.exports = db;
