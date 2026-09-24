import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'prebanca_secret_dev_key_2026_jwt_token_auth';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const { username, email, senha } = req.body;

    if (!username || !email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios (usuário, email e senha).'
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'O nome de usuário deve ter pelo menos 3 caracteres.'
      });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça um endereço de email válido.'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A senha deve conter no mínimo 6 caracteres.'
      });
    }

    // Verificar se usuário ou email já existem
    const checkUser = db.prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?');
    const existing = checkUser.get(cleanUsername, cleanEmail);

    if (existing) {
      if (existing.email.toLowerCase() === cleanEmail) {
        return res.status(409).json({
          success: false,
          error: 'Este endereço de e-mail já está em uso.'
        });
      }
      return res.status(409).json({
        success: false,
        error: 'Este nome de usuário já está em uso.'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, 'customer')
    `);

    const result = insertUser.run(cleanUsername, cleanEmail, hashedPassword);
    const userId = Number(result.lastInsertRowid);

    const token = jwt.sign(
      { id: userId, username: cleanUsername, email: cleanEmail, role: 'customer' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: userId,
        username: cleanUsername,
        email: cleanEmail,
        role: 'customer'
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { username, senha } = req.body;

    if (!username || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, informe seu usuário/email e senha.'
      });
    }

    const identifier = username.trim();

    // Busca por username ou email
    const findStmt = db.prepare(`
      SELECT id, username, email, password, role
      FROM users
      WHERE username = ? OR email = ?
    `);

    const user = findStmt.get(identifier, identifier.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário ou senha incorretos.'
      });
    }

    const passwordMatch = await bcrypt.compare(senha, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Usuário ou senha incorretos.'
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

export function getMe(req, res, next) {
  try {
    const userStmt = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
    const user = userStmt.get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado.'
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}
