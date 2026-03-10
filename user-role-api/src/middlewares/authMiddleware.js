const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

const authMiddleware = (req, res, next) => {
    // Tắt kiểm tra token theo yêu cầu
    req.user = { 
        id: 'mock-user-id', 
        username: 'mockUser', 
        role: 'Admin' // Mặc định là Admin để có thể pass các role middleware nếu gọi
    };
    next();
};

const roleMiddleware = (requiredRoleName) => {
    return (req, res, next) => {
        // Tắt kiểm tra role theo yêu cầu
        next();
    };
};

module.exports = { authMiddleware, roleMiddleware };
