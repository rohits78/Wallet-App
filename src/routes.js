import express from 'express';
import auth from './auth.js';
import {
  register,
  fund,
  pay,
  getBalance,
  getStatement,
  addProduct,
  listProducts,
  buyProduct
} from './controllers.js';

const router = express.Router();

router.post('/register', register);
router.post('/fund', auth, fund);
router.post('/pay', auth, pay);
router.get('/bal', auth, getBalance);
router.get('/stmt', auth, getStatement);
router.post('/product', auth, addProduct);
router.get('/product', listProducts);
router.post('/buy', auth, buyProduct);

export default router; 