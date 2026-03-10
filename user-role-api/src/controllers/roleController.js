const Role = require('../models/Role');
const User = require('../models/User');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false });
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.status(200).json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const newRole = new Role(req.body);
        const savedRole = await newRole.save();
        res.status(201).json(savedRole);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const updatedRole = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRole) return res.status(404).json({ error: 'Role not found' });
        res.status(200).json(updatedRole);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Yêu cầu 1: Xóa mềm
exports.softDeleteRole = async (req, res) => {
    try {
        const deletedRole = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!deletedRole) return res.status(404).json({ error: 'Role not found' });
        res.status(200).json({ message: 'Role deleted (soft delete)', role: deletedRole });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Yêu cầu 4: Get tất cả users theo role id (/roles/:id/users)
exports.getUsersByRoleId = async (req, res) => {
    try {
        const roleId = req.params.id;
        // Kiểm tra xem role có tồn tại không
        const role = await Role.findOne({ _id: roleId, isDeleted: false });
        if (!role) return res.status(404).json({ error: 'Role not found' });

        const users = await User.find({ role: roleId, isDeleted: false }).populate('role');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
