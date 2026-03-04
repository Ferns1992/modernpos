import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pos.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER,
    sku TEXT UNIQUE,
    stock INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT DEFAULT 'cash'
  );

  -- Migration: Add subtotal and tax if they don't exist
  -- We use a try-catch pattern in JS for this or check table info
`);

// Check if subtotal column exists
const tableInfo = db.prepare("PRAGMA table_info(sales)").all();
const hasSubtotal = tableInfo.some((col: any) => col.name === 'subtotal');
const hasTax = tableInfo.some((col: any) => col.name === 'tax');

if (!hasSubtotal) {
  try {
    db.prepare("ALTER TABLE sales ADD COLUMN subtotal REAL DEFAULT 0").run();
    db.prepare("UPDATE sales SET subtotal = total / 1.12").run(); // Estimate
  } catch (e) {
    console.error("Migration failed for subtotal:", e);
  }
}

if (!hasTax) {
  try {
    db.prepare("ALTER TABLE sales ADD COLUMN tax REAL DEFAULT 0").run();
    db.prepare("UPDATE sales SET tax = total - subtotal").run(); // Estimate
  } catch (e) {
    console.error("Migration failed for tax:", e);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    item_id INTEGER,
    quantity INTEGER NOT NULL,
    price_at_sale REAL NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (sale_id) REFERENCES sales(id)
  );

  -- Cleanup any invalid data
  UPDATE items SET price = 0 WHERE price IS NULL OR price != price; -- price != price is a trick to detect NaN in some SQL engines, but better-sqlite3 handles it
`);

// better-sqlite3 specific NaN check/cleanup
const invalidItems = db.prepare("SELECT id, price FROM items").all();
for (const item of invalidItems as any[]) {
  if (typeof item.price !== 'number' || isNaN(item.price)) {
    db.prepare("UPDATE items SET price = 0 WHERE id = ?").run(item.id);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Categories
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
      res.json({ id: Number(info.lastInsertRowid), name });
    } catch (err) {
      res.status(400).json({ error: "Category already exists" });
    }
  });

  // Items
  app.get("/api/items", (req, res) => {
    const items = db.prepare(`
      SELECT items.*, categories.name as category_name 
      FROM items 
      LEFT JOIN categories ON items.category_id = categories.id
    `).all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { name, price, category_id, sku, stock } = req.body;
    
    if (!name || typeof price !== 'number' || isNaN(price)) {
      return res.status(400).json({ error: "Invalid item data. Name and valid price are required." });
    }

    try {
      const info = db.prepare("INSERT INTO items (name, price, category_id, sku, stock) VALUES (?, ?, ?, ?, ?)")
        .run(name, price, category_id, sku, stock);
      res.json({ id: Number(info.lastInsertRowid), name, price, category_id, sku, stock });
    } catch (err) {
      console.error("Error adding item:", err);
      res.status(400).json({ error: "SKU must be unique or database error occurred" });
    }
  });

  app.put("/api/items/:id", (req, res) => {
    const { name, price, category_id, sku, stock } = req.body;
    const { id } = req.params;

    if (!name || typeof price !== 'number' || isNaN(price)) {
      return res.status(400).json({ error: "Invalid item data" });
    }

    try {
      db.prepare("UPDATE items SET name = ?, price = ?, category_id = ?, sku = ?, stock = ? WHERE id = ?")
        .run(name, price, category_id, sku, stock, id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating item:", err);
      res.status(400).json({ error: "Update failed" });
    }
  });

  // Sales
  app.post("/api/sales", (req, res) => {
    const { items: saleItems, subtotal, tax, total, payment_method } = req.body;
    
    if (!saleItems || !Array.isArray(saleItems) || saleItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (isNaN(subtotal) || isNaN(tax) || isNaN(total)) {
      return res.status(400).json({ error: "Invalid calculation values (NaN detected)" });
    }
    
    const transaction = db.transaction(() => {
      const saleInfo = db.prepare("INSERT INTO sales (subtotal, tax, total, payment_method) VALUES (?, ?, ?, ?)")
        .run(subtotal, tax, total, payment_method);
      const saleId = Number(saleInfo.lastInsertRowid);

      for (const item of saleItems) {
        if (!item.id || isNaN(item.quantity) || isNaN(item.price)) {
          throw new Error(`Invalid item data in cart for item: ${item.name || 'Unknown'}`);
        }
        
        db.prepare("INSERT INTO sale_items (sale_id, item_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)")
          .run(saleId, item.id, item.quantity, item.price);
        
        // Update stock
        db.prepare("UPDATE items SET stock = stock - ? WHERE id = ?")
          .run(item.quantity, item.id);
      }
      return saleId;
    });

    try {
      const saleId = transaction();
      res.json({ id: saleId, success: true });
    } catch (err) {
      console.error("Transaction failed error details:", err);
      res.status(500).json({ 
        error: "Transaction failed", 
        details: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  // Reports
  app.get("/api/reports/sales", (req, res) => {
    const { start, end } = req.query;
    const sales = db.prepare(`
      SELECT * FROM sales 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `).all(start || '1970-01-01', end || '9999-12-31');
    res.json(sales);
  });

  app.get("/api/reports/day-end", (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as transaction_count,
        SUM(total) as total_sales,
        payment_method
      FROM sales 
      WHERE date(timestamp) = date(?)
      GROUP BY payment_method
    `).all(date);
    
    const items = db.prepare(`
      SELECT 
        items.name,
        SUM(sale_items.quantity) as total_quantity,
        SUM(sale_items.quantity * sale_items.price_at_sale) as total_revenue
      FROM sale_items
      JOIN sales ON sale_items.sale_id = sales.id
      JOIN items ON sale_items.item_id = items.id
      WHERE date(sales.timestamp) = date(?)
      GROUP BY items.id
      ORDER BY total_revenue DESC
    `).all(date);

    res.json({ summary, items });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
