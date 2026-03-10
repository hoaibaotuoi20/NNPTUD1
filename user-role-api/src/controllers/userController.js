const User = require('../models/User');

// Yêu cầu 1: Hàm C R U D (xóa mềm)
// Kèm yêu cầu: getAll có query theo username (includes)
exports.getAllUsers = async (req, res) => {
    try {
        let query = { isDeleted: false };

        // Nếu có query parameter ?username=xxx -> tìm kiếm tương đối (includes)
        if (req.query.username) {
            query.username = { $regex: req.query.username, $options: 'i' };
        }

        const users = await User.find(query);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Yêu cầu 1: Xóa mềm
exports.softDeleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted (soft delete)', user: deletedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Yêu cầu 2: Hàm chạy POST /enable (truyền lên email, username -> status = true)
exports.enableUser = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).json({ error: 'Email and username are required' });
        }

        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Invalid email or username / User not found' });
        }

        res.status(200).json({ message: 'User enabled successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Yêu cầu 3: Hàm chạy POST /disable (truyền lên email, username -> status = false)
exports.disableUser = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).json({ error: 'Email and username are required' });
        }

        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'Invalid email or username / User not found' });
        }

        res.status(200).json({ message: 'User disabled successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
