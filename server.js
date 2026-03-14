const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const dbPath = path.join(__dirname, 'data.db');
const dbExists = fs.existsSync(dbPath);
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      address TEXT,
      phone TEXT,
      notes TEXT,
      cardNumber TEXT,
      cardholder TEXT,
      expiry TEXT,
      cvv TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      items TEXT,
      total REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
};

initDb();

app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

app.post('/api/user', (req, res) => {
  const { id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });
  db.run(
    `INSERT INTO users (id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name,
       address=excluded.address,
       phone=excluded.phone,
       notes=excluded.notes,
       cardNumber=excluded.cardNumber,
       cardholder=excluded.cardholder,
       expiry=excluded.expiry,
       cvv=excluded.cvv`,
    [id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv],
    function(err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id });
    }
  );
});

app.post('/api/order', (req, res) => {
  const { userId, items, total } = req.body;
  if (!userId || !items) return res.status(400).json({ error: 'Missing fields' });
  db.run(
    `INSERT INTO orders (userId, items, total) VALUES (?, ?, ?)`,
    [userId, JSON.stringify(items), total],
    function(err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ orderId: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
