const express = require('express');
const mongoose = require('mongoose');
const inventoryRoutes = require('./routes/inventory.route');
const Product = require('./models/product.model');

const app = express();
app.use(express.json());

// Kết nối MongoDB cục bộ của bạn
mongoose.connect('mongodb://127.0.0.1:27017/inventory_db')
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/inventory', inventoryRoutes);

// Helper Route: GET products để kiểm tra
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper Route: POST tạo thử Product để kích hoạt post('save') tạo Inventory
app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Bạn có thể bắt đầu gọi Postman từ địa chỉ này!');
});
