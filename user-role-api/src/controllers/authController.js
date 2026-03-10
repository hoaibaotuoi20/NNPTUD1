const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'your_super_secret_jwt_key_12345'; // Trong thực tế nên để ở file .env

exports.register = async (req, res) => {
    try {
        const { username, password, email, fullName, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const newUser = new User({
            username,
            password,
            email,
            fullName,
            role,
        });

        const savedUser = await newUser.save();

        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find user (populate Role để lấy name phân quyền)
        const user = await User.findOne({ username, isDeleted: false }).populate('role');
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 2. Check if user is disabled
        if (!user.status) {
            return res.status(403).json({ error: 'Account is disabled. Please contact administrator.' });
        }

        // 3. Compare password using the method we added to User model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 4. Update login count
        user.loginCount += 1;
        await user.save();

        // 5. Generate JWT Token
        const payload = {
            id: user._id,
            username: user.username,
            role: user.role ? user.role.name : null, // Lưu name của role vào token
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                loginCount: user.loginCount
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.JWT_SECRET = JWT_SECRET;
