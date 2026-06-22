const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'jd.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ============================================================
// CREATE TABLES
// ============================================================
function createTables() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Products table
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            category TEXT,
            brand TEXT,
            unit TEXT,
            buyPrice REAL DEFAULT 0,
            sellPrice REAL DEFAULT 0,
            wholesale REAL DEFAULT 0,
            reorder INTEGER DEFAULT 10,
            stock INTEGER DEFAULT 0,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Stock table
    db.exec(`
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER NOT NULL,
            productName TEXT NOT NULL,
            batch TEXT,
            expiry TEXT,
            qty INTEGER DEFAULT 0,
            status TEXT DEFAULT 'In Stock',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    // Customers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT,
            balance REAL DEFAULT 0,
            creditLimit REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Suppliers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT,
            phone TEXT NOT NULL,
            balance REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Purchases table
    db.exec(`
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice TEXT UNIQUE NOT NULL,
            supplier TEXT NOT NULL,
            date TEXT NOT NULL,
            total REAL DEFAULT 0,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sales table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice TEXT UNIQUE NOT NULL,
            customer TEXT NOT NULL,
            date TEXT NOT NULL,
            total REAL DEFAULT 0,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Distributions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS distributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deliveryNo TEXT UNIQUE NOT NULL,
            driver TEXT,
            vehicle TEXT,
            route TEXT,
            status TEXT DEFAULT 'Pending',
            latitude REAL,
            longitude REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Accounts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Employees table
    db.exec(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            phone TEXT,
            salary REAL DEFAULT 0,
            joinDate TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Attendance table
    db.exec(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId INTEGER NOT NULL,
            date TEXT NOT NULL,
            checkIn TEXT,
            checkOut TEXT,
            status TEXT DEFAULT 'Present',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
        )
    `);

    // Leaves table
    db.exec(`
        CREATE TABLE IF NOT EXISTS leaves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId INTEGER NOT NULL,
            date TEXT NOT NULL,
            type TEXT DEFAULT 'Annual',
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
        )
    `);

    // Vouchers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            ref TEXT UNIQUE NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default admin user
    const bcrypt = require('bcryptjs');
    const adminCheck = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (!adminCheck) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        const stmt = db.prepare(`
            INSERT INTO users (username, password, role, name) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run('admin', hashedPassword, 'admin', 'Admin');
        stmt.run('manager', bcrypt.hashSync('manager123', 10), 'manager', 'Manager');
        stmt.run('cashier', bcrypt.hashSync('cashier123', 10), 'cashier', 'Cashier');
        stmt.run('delivery', bcrypt.hashSync('delivery123', 10), 'delivery', 'Delivery Staff');
    }

    console.log('✅ Database tables created and seeded');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getAll(table, where = '1=1') {
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE ${where}`);
    return stmt.all();
}

function getById(table, id) {
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
    return stmt.get(id);
}

function insert(table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`);
    const result = stmt.run(...Object.values(data));
    return result.lastInsertRowid;
}

function update(table, id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k} = ?`).join(',');
    const stmt = db.prepare(`UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const result = stmt.run(...Object.values(data), id);
    return result.changes;
}

function deleteById(table, id) {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes;
}

function query(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(params);
}

function run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(params);
}

// ============================================================
// INIT
// ============================================================
createTables();

module.exports = {
    db,
    getAll,
    getById,
    insert,
    update,
    deleteById,
    query,
    run
};
