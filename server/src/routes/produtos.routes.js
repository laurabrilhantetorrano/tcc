import { Router } from 'express';
import { list, getById, create } from '../controllers/produtos.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', authenticateToken, create);

export default router;
