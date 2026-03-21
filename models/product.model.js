const mongoose = require('mongoose');
const Inventory = require('./inventory.model');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: String
}, { timestamps: true });

// Middleware chạy sau khi một Product mới được lưu (đáp ứng yêu cầu: Mỗi khi tạo product thì sẽ tạo 1 inventory tương ứng)
productSchema.post('save', async function(doc, next) {
    try {
        // Kiểm tra xem inventory cho product này đã tồn tại chưa (tránh lỗi duplicate)
        const existingInventory = await Inventory.findOne({ product: doc._id });
        if (!existingInventory) {
            await Inventory.create({
                product: doc._id,
                stock: 0,
                reserved: 0,
                soldCount: 0
            });
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Product', productSchema);
