import { Router } from 'express';
import { create, listUserOrders, getById } from '../controllers/pedidos.controller.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', optionalAuthenticateToken, create);
router.get('/meus-pedidos', authenticateToken, listUserOrders);
router.get('/:id', optionalAuthenticateToken, getById);

export default router;
