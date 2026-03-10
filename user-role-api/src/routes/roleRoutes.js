const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// PROTECTED ROUTES: Cần login mới được thao tác
router.use(authMiddleware);

// Chỉ Admin mới có quyền thao tác CRUD với Role
router.get('/', roleMiddleware('Admin'), roleController.getAllRoles);
router.post('/', roleMiddleware('Admin'), roleController.createRole);
router.get('/:id', roleMiddleware('Admin'), roleController.getRoleById);
router.put('/:id', roleMiddleware('Admin'), roleController.updateRole);
router.delete('/:id', roleMiddleware('Admin'), roleController.softDeleteRole);

// Yêu cầu 4: Get tất cả users theo role id (Bất kỳ user nào đăng nhập cũng xem được, hoặc tùy design của bạn)
// Ở đây mình set cho mọi User đã login đều có thể GET role
router.get('/:id/users', roleController.getUsersByRoleId);

module.exports = router;
