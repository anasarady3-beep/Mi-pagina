const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const useMySql = process.env.USE_MYSQL === '1';

let db = null;
let queryDb = null;
let initDb = null;

if(useMySql){
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'pagina_web',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  queryDb = async (sql, params=[]) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  };

  initDb = async () => {
    await queryDb(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255),
        address TEXT,
        phone VARCHAR(64),
        notes TEXT,
        cardNumber VARCHAR(64),
        cardholder VARCHAR(255),
        expiry VARCHAR(8),
        cvv VARCHAR(16)
      )
    `);
    await queryDb(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        userId VARCHAR(64),
        items TEXT,
        total DECIMAL(10,2),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  };
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'data.db');
  const dbExists = fs.existsSync(dbPath);
  db = new sqlite3.Database(dbPath);

  queryDb = (sql, params=[]) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if(err) reject(err);
        else resolve(rows);
      });
    });
  };

  // Para operaciones INSERT/UPDATE/DELETE que necesitan lastID
  const runDb = (sql, params=[]) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if(err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  };

  initDb = () => {
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
}

(async () => {
  try {
    await initDb();
  } catch (err) {
    console.error('DB init error', err);
    process.exit(1);
  }
})();

app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await queryDb('SELECT * FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/user', async (req, res) => {
  const { id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });

  try {
    if(useMySql){
      await queryDb(
        `INSERT INTO users (id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name),
           address=VALUES(address),
           phone=VALUES(phone),
           notes=VALUES(notes),
           cardNumber=VALUES(cardNumber),
           cardholder=VALUES(cardholder),
           expiry=VALUES(expiry),
           cvv=VALUES(cvv)`,
        [id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv]
      );
    } else {
      await queryDb(
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
        [id, name, address, phone, notes, cardNumber, cardholder, expiry, cvv]
      );
    }
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/order', async (req, res) => {
  const { userId, items, total } = req.body;
  if (!userId || !items) return res.status(400).json({ error: 'Missing fields' });

  try {
    let orderId;

    if (useMySql) {
      const result = await queryDb(
        `INSERT INTO orders (userId, items, total) VALUES (?, ?, ?)`,
        [userId, JSON.stringify(items), total]
      );
      orderId = result.insertId;
    } else {
      const result = await runDb(
        `INSERT INTO orders (userId, items, total) VALUES (?, ?, ?)`,
        [userId, JSON.stringify(items), total]
      );
      orderId = result.lastID;
    }

    res.json({ orderId });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
