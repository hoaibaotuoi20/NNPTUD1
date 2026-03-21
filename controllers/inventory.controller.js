const Inventory = require('../models/inventory.model');

const inventoryController = {
    // 1. Get all
    getAll: async (req, res) => {
        try {
            const inventories = await Inventory.find().populate('product');
            res.status(200).json({ success: true, data: inventories });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Get inventory by ID (có join với product)
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const inventory = await Inventory.findById(id).populate('product');
            if (!inventory) {
                return res.status(404).json({ success: false, message: 'Inventory not found' });
            }
            res.status(200).json({ success: true, data: inventory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. Add_stock (POST: tăng stock)
    addStock: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
            }

            const inventory = await Inventory.findOneAndUpdate(
                { product },
                { $inc: { stock: quantity } },
                { new: true, runValidators: true }
            );

            if (!inventory) {
                return res.status(404).json({ success: false, message: 'Inventory not found' });
            }
            res.status(200).json({ success: true, data: inventory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. Remove_stock (POST: giảm stock)
    removeStock: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
            }

            // Dùng $gte để đảm bảo trong kho còn đủ stock trước khi trừ
            const inventory = await Inventory.findOneAndUpdate(
                { product, stock: { $gte: quantity } }, 
                { $inc: { stock: -quantity } },
                { new: true, runValidators: true }
            );

            if (!inventory) {
                return res.status(400).json({ success: false, message: 'Inventory not found or insufficient stock' });
            }
            res.status(200).json({ success: true, data: inventory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 5. Reservation (POST: giảm stock và tăng reserved)
    reservation: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
            }

            // Dùng $gte để đảm bảo có đủ stock
            const inventory = await Inventory.findOneAndUpdate(
                { product, stock: { $gte: quantity } }, 
                { $inc: { stock: -quantity, reserved: quantity } },
                { new: true, runValidators: true }
            );

            if (!inventory) {
                return res.status(400).json({ success: false, message: 'Inventory not found or insufficient stock for reservation' });
            }
            res.status(200).json({ success: true, data: inventory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 6. Sold (POST: giảm reservation và tăng soldCount)
    sold: async (req, res) => {
        try {
            const { product, quantity } = req.body;
            if (!product || !quantity || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
            }

            // Dùng $gte để đảm bảo lượng reserved đủ để bán ra
            const inventory = await Inventory.findOneAndUpdate(
                { product, reserved: { $gte: quantity } }, 
                { $inc: { reserved: -quantity, soldCount: quantity } },
                { new: true, runValidators: true }
            );

            if (!inventory) {
                return res.status(400).json({ success: false, message: 'Inventory not found or insufficient reserved quantity' });
            }
            res.status(200).json({ success: true, data: inventory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = inventoryController;
