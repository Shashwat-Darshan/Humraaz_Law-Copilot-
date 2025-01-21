const express = require('express');
const router = express.Router();
const { getCollections } = require('../config/database');

// Debug function
const debug = (message, data = null) => {
    console.log('\x1b[36m%s\x1b[0m', '[AUTH]', message);
    if (data) console.log(JSON.stringify(data, null, 2));
};

// Registration route for regular users
router.post('/register/user', async (req, res) => {
    debug('Attempting user registration:', req.body);
    try {
        const collections = getCollections();
        const userData = {
            role: "user",
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            religion: req.body.Religion,
            city: req.body.city,
            phone: req.body.Phone,
            password: req.body.password,
            createdAt: new Date()
        };

        debug('Checking for existing user with phone:', userData.phone);
        const existingUser = await collections.All_user.findOne({ phone: userData.phone });
        if (existingUser) {
            debug('Registration failed: Phone number already exists');
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        debug('Inserting new user into databases');
        await Promise.all([
            collections.All_user.insertOne(userData),
            collections.usersCollection.insertOne(userData)
        ]);

        debug('Creating session for new user');
        req.session.user = {
            role: userData.role,
            phone: userData.phone,
            firstName: userData.firstName,
            lastName: userData.lastName
        };

        debug('User registration successful, redirecting');
        res.redirect('/successfully-registered');
    } catch (error) {
        debug('Registration error:', error);
        res.status(500).json({ message: 'Error during registration', error: error.message });
    }
});

// Registration route for representatives
router.post('/register/representative', async (req, res) => {
    debug('Attempting representative registration:', req.body);
    try {
        const collections = getCollections();
        const userData = {
            role: "req",
            organisation_id: req.body.organisation_id,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            religion: req.body.Religion,
            city: req.body.city,
            phone: req.body.Phone,
            password: req.body.password,
            createdAt: new Date()
        };

        debug('Checking for existing representative with phone:', userData.phone);
        const existingUser = await collections.All_user.findOne({ phone: userData.phone });
        if (existingUser) {
            debug('Registration failed: Phone number already exists');
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        debug('Inserting new representative into databases');
        await Promise.all([
            collections.All_user.insertOne(userData),
            collections.representative.insertOne(userData)
        ]);

        debug('Creating session for new representative');
        req.session.user = {
            role: userData.role,
            phone: userData.phone,
            firstName: userData.firstName,
            lastName: userData.lastName,
            organisation_id: userData.organisation_id
        };

        debug('Representative registration successful, redirecting');
        res.redirect('/successfully-registered');
    } catch (error) {
        debug('Registration error:', error);
        res.status(500).json({ message: 'Error during registration', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    debug('Attempting login:', { phone: req.body.phone });
    try {
        const { phone, password } = req.body;
        const collections = getCollections();
        
        debug('Searching for user in database');
        const user = await collections.All_user.findOne({ phone, password });
        
        if (!user) {
            debug('Login failed: Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        debug('Creating session for user');
        req.session.user = {
            id: user._id,
            phone: user.phone,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        };

        debug('Login successful, redirecting');
        if (user.role === 'req') {
            res.redirect('/option-representatives');
        } else {
            res.redirect('/option-user');
        }
    } catch (error) {
        debug('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    debug('Attempting logout for user:', req.session.user);
    req.session.destroy((err) => {
        if (err) {
            debug('Logout error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        debug('Logout successful');
        res.redirect('/login');
    });
});

// Get current user
router.get('/current-user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
