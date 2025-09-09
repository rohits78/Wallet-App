import basicAuth from 'basic-auth';
import { query } from './db.js';
import bcrypt from 'bcrypt';

export default async function auth(req, res, next) {
  const credentials = basicAuth(req);
  if (!credentials || !credentials.name || !credentials.pass) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [credentials.name]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(credentials.pass, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during auth' });
  }
}
