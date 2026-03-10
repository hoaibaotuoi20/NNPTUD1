const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Thay the chuoi ket noi nay bang database cua ban
        // Ví dụ local: mongodb://localhost:27017/user-role-db
        const MONGO_URI = 'mongodb://127.0.0.1:27017/user_role_db';

        await mongoose.connect(MONGO_URI);
        console.log('MongoDB is connected gracefully.');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
