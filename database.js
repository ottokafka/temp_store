// database.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to the products.json file
const productsPath = path.join(__dirname, 'public', 'data', 'products.json');

// Check if the database file exists
const dbPath = './database.db';
const dbExists = fs.existsSync(dbPath);

// Initialize the database
const db = new sqlite3.Database(dbPath);

// Only initialize the database if it doesn't already exist
if (!dbExists) {
    db.serialize(() => {
        // Create the products table
        db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price REAL,
            description TEXT,
            image TEXT,
            category TEXT
        )`);

        // Create the cart table
        db.run(`CREATE TABLE cart (
            id INTEGER PRIMARY KEY,
            product_id INTEGER,
            quantity INTEGER,
            selected BOOLEAN
        )`);

        // Read the products data from the JSON file
        const products = require(productsPath);

        // Insert the products into the database
        const stmt = db.prepare("INSERT INTO products (id, name, price, description, image, category) VALUES (?, ?, ?, ?, ?, ?)");
        for (const category in products) {
            products[category].forEach(product => {
                stmt.run(product.id, product.name, product.price, product.description, product.image, category);
            });
        }
        stmt.finalize();

        console.log('Database initialized and products inserted.');
    });
} else {
    console.log('Database already exists. Skipping initialization.');
}

module.exports = db;