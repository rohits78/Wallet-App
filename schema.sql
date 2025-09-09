CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance NUMERIC DEFAULT 0
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  kind TEXT CHECK (kind IN ('credit', 'debit')),
  amt NUMERIC NOT NULL,
  updated_bal NUMERIC NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
