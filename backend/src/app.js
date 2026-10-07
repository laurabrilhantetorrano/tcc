require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Inicializa o banco de dados.
require('./database/database');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

const frontendUrl = process.env.FRONTEND_URL;
app.use(cors({
  origin: frontendUrl || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// A pasta de uploads é mantida para desenvolvimento local.
// No Vercel, o filesystem não é persistente; imagens enviadas em produção
// devem ser migradas futuramente para Vercel Blob ou outro storage.
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'nana-mimi-uploads')
  : path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API Nana & Mimi está funcionando!' });
});

// Seed somente quando o banco estiver vazio.
const { seed } = require('./database/seed');
try {
  seed();
} catch (err) {
  console.error('Erro ao executar seed:', err);
}

app.use((err, req, res, next) => {
  console.error('Erro:', err.stack || err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// No Vercel a aplicação é exportada como função. Localmente ela continua
// podendo ser iniciada com "npm start" dentro da pasta backend.
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor Nana & Mimi rodando em http://localhost:${PORT}`);
    console.log(`📦 API disponível em http://localhost:${PORT}/health\n`);
  });
}

module.exports = app;
