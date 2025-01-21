// Debug function
const debug = (message, data = null) => {
    console.log('\x1b[35m%s\x1b[0m', '[AUTH-MIDDLEWARE]', message);
    if (data) console.log(JSON.stringify(data, null, 2));
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    debug('Checking authentication for path:', req.path);
    debug('Session data:', req.session);
    
    if (req.session && req.session.user) {
        debug('Authentication successful:', {
            user: req.session.user,
            path: req.path
        });
        return next();
    }
    debug('Authentication failed, redirecting to login');
    res.redirect('/login');
};

// Middleware to check if user is a representative
const isRepresentative = (req, res, next) => {
    debug('Checking representative status for path:', req.path);
    debug('User data:', req.session.user);
    
    if (req.session && req.session.user && req.session.user.role === 'req') {
        debug('Representative check passed');
        return next();
    }
    debug('Representative check failed, access denied');
    res.status(403).send('Access denied. Representatives only.');
};

// Add user data to locals for use in templates
const addUserToLocals = (req, res, next) => {
    debug('Adding user data to locals');
    res.locals.user = req.session.user || null;
    debug('Locals user data:', res.locals.user);
    next();
};

module.exports = {
    isAuthenticated,
    isRepresentative,
    addUserToLocals
};
