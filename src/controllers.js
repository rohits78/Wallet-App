import bcrypt from 'bcrypt';
import { query } from './db.js';
import { convertCurrency } from './currency.js';

export async function register(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function fund(req, res) {
  const { amt } = req.body;
  const user = req.user;

  if (typeof amt !== 'number' || amt <= 0)
    return res.status(400).json({ error: 'Invalid amount' });

  const newBal = Number(user.balance) + amt;

  try {
    await query('UPDATE users SET balance = $1 WHERE id = $2', [newBal, user.id]);
    await query(
      'INSERT INTO transactions (user_id, kind, amt, updated_bal) VALUES ($1, $2, $3, $4)',
      [user.id, 'credit', amt, newBal]
    );
    res.json({ balance: newBal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function pay(req, res) {
  const { to, amt } = req.body;
  const sender = req.user;

  if (!to || typeof amt !== 'number' || amt <= 0)
    return res.status(400).json({ error: 'Invalid input' });

  if (to === sender.username) {
    return res.status(400).json({ error: 'Cannot pay yourself' });
  }

  try {
    const recipientRes = await query('SELECT * FROM users WHERE username = $1', [to]);
    const recipient = recipientRes.rows[0];
    if (!recipient) return res.status(400).json({ error: 'Recipient does not exist' });

    if (Number(sender.balance) < amt) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const newSenderBal = Number(sender.balance) - amt;
    const newRecipientBal = Number(recipient.balance) + amt;

    await query('BEGIN');
    await query('UPDATE users SET balance = $1 WHERE id = $2', [newSenderBal, sender.id]);
    await query('UPDATE users SET balance = $1 WHERE id = $2', [newRecipientBal, recipient.id]);

    await query(
      'INSERT INTO transactions (user_id, kind, amt, updated_bal) VALUES ($1, $2, $3, $4)',
      [sender.id, 'debit', amt, newSenderBal]
    );

    await query(
      'INSERT INTO transactions (user_id, kind, amt, updated_bal) VALUES ($1, $2, $3, $4)',
      [recipient.id, 'credit', amt, newRecipientBal]
    );

    await query('COMMIT');
    res.json({ balance: newSenderBal });
  } catch (err) {
    await query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getBalance(req, res) {
  const user = req.user;
  const currency = req.query.currency?.toUpperCase();

  try {
    if (!currency || currency === 'INR') {
      return res.json({ balance: Number(user.balance), currency: 'INR' });
    }

    const converted = await convertCurrency(Number(user.balance), 'INR', currency);
    res.json({ balance: converted, currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Currency conversion failed' });
  }
}

export async function getStatement(req, res) {
  const user = req.user;
  try {
    const result = await query(
      'SELECT kind, amt, updated_bal, timestamp FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC',
      [user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch statement' });
  }
}

export async function addProduct(req, res) {
  const { name, price, description } = req.body;
  if (!name || typeof price !== 'number' || price <= 0)
    return res.status(400).json({ error: 'Invalid product data' });

  try {
    const result = await query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING id',
      [name, price, description]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Product added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while adding product' });
  }
}

export async function listProducts(_, res) {
  try {
    const result = await query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve products' });
  }
}

export async function buyProduct(req, res) {
  const { product_id } = req.body;
  const user = req.user;

  if (!product_id || typeof product_id !== 'number')
    return res.status(400).json({ error: 'Invalid product ID' });

  try {
    const prodRes = await query('SELECT * FROM products WHERE id = $1', [product_id]);
    const product = prodRes.rows[0];

    if (!product)
      return res.status(400).json({ error: 'Invalid product' });

    if (Number(user.balance) < Number(product.price))
      return res.status(400).json({ error: 'Insufficient balance' });

    const newBalance = Number(user.balance) - Number(product.price);

    await query('BEGIN');
    await query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, user.id]);
    await query(
      'INSERT INTO transactions (user_id, kind, amt, updated_bal) VALUES ($1, $2, $3, $4)',
      [user.id, 'debit', product.price, newBalance]
    );
    await query(
      'INSERT INTO purchases (user_id, product_id) VALUES ($1, $2)',
      [user.id, product_id]
    );
    await query('COMMIT');

    res.json({ message: 'Product purchased', balance: newBalance });
  } catch (err) {
    await query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error processing purchase' });
  }
}
