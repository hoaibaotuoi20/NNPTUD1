const express = require('express');
const connectDB = require('./src/config/db');

// Import Routes
const roleRoutes = require('./src/routes/roleRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Khởi tạo app Express
const app = express();

// Phục vụ file tĩnh tĩnh tại frontend (thư mục public)
app.use(express.static('public'));

// Midlewares parsing JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối cơ sở dữ liệu
connectDB();

// Đăng ký Routes
app.use('/auth', authRoutes); // Thêm route đăng nhập, đăng ký
app.use('/roles', roleRoutes);
app.use('/users', userRoutes);
// Do yeu cau de bai là /enable và /disable chung thay vì /users/enable,
// Tuy nhiên để chuẩn theo mô hình ta sẽ hỗ trợ đăng ký trực tiếp app.use root cho 2 hàm này nếu cần
// Cách 1: dùng /users/enable (khuyên dùng trong REST)
// Cách 2: dùng ở root /enable
app.use('/', userRoutes); // Sắp xếp sao cho các routes root như /enable và /disable có thể chạy được trực tiếp trên root domain

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
