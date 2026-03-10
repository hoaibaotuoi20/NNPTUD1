const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// PROTECTED ROUTES: Cần login mới được thao tác
router.use(authMiddleware);

// RESTful CRUD Routes cho User (Chỉ Admin mới có quyền thao tác quản lý users)
router.get('/', roleMiddleware('Admin'), userController.getAllUsers);
router.post('/', roleMiddleware('Admin'), userController.createUser);
router.get('/:id', roleMiddleware('Admin'), userController.getUserById);
router.put('/:id', roleMiddleware('Admin'), userController.updateUser);
router.delete('/:id', roleMiddleware('Admin'), userController.softDeleteUser);

// Yêu cầu 2: enable user (Chỉ Admin mới có quyền)
router.post('/enable', roleMiddleware('Admin'), userController.enableUser);

// Yêu cầu 3: disable user (Chỉ Admin mới có quyền)
router.post('/disable', roleMiddleware('Admin'), userController.disableUser);

module.exports = router;
