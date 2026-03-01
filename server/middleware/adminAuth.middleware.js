const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies the admin JWT (signed with ADMIN_JWT_SECRET).
 * Completely separate from the regular user auth middleware.
 */
const adminProtect = (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Admin access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Forbidden. Not an admin token.' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired admin token.' });
    }
};

module.exports = { adminProtect };
