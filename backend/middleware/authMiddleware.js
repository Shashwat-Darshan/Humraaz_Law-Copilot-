const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
};

const isGuest = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next();
    }
    return res.status(403).json({ message: 'Already authenticated' });
};

const handleAuthError = (err, req, res, next) => {
    console.error('Authentication Error:', err);
    res.status(401).json({
        message: 'Authentication failed',
        error: err.message
    });
};

module.exports = {
    isAuthenticated,
    isGuest,
    handleAuthError
};