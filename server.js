// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const stripe = require('stripe')('sk_test_51QazeqE305zKX3iETaIS7zRly66Aop2DrDL6gkbtion725R0DUqhMGa0ADQwQcSSseamIdxclh0wk9QUA4W1fqcB00MqdR8Kbp'); // Secret key required
const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve homepage.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});



app.get('/products', (req, res) => {
    const category = req.query.category;
    if (!category) {
        return res.status(400).json({ error: 'Category is required' });
    }

    db.all("SELECT * FROM products WHERE category = ?", [category], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Route to get product details
app.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    db.get("SELECT * FROM products WHERE id = ?", [productId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Route to add product to cart
app.post('/cart/add', (req, res) => {
    const { productId } = req.body;
    db.run("INSERT INTO cart (product_id, quantity, selected) VALUES (?, 1, true)", [productId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Route to get cart items
app.get('/cart', (req, res) => {
    db.all("SELECT cart.id, products.*, cart.quantity, cart.selected FROM cart JOIN products ON cart.product_id = products.id", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Route to update cart item quantity
app.put('/cart/update/:id', (req, res) => {
    const { quantity } = req.body;
    db.run("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Route to remove item from cart
app.delete('/cart/remove/:id', (req, res) => {
    db.run("DELETE FROM cart WHERE id = ?", [req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});


// Route to serve success.html
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Route to create a checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, customerDetails } = req.body;

        // Calculate the total amount from the items
        const amount = items.reduce((total, item) => total + item.price * item.quantity, 0) * 100; // Convert to cents

        // Create a PaymentIntent with customer billing details
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Total amount in cents
            currency: 'myr', // Replace with your currency if different
            payment_method_types: ['card'],
            receipt_email: customerDetails.email || "natash@gmail.com",
            shipping: {
                name: customerDetails.name,
                phone: customerDetails.phone,
                address: {
                    line1: customerDetails.address.line1,
                    state: customerDetails.address.state,
                },
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});