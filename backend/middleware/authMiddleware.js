const jwt = require("jsonwebtoken");

function getBearerToken(req) {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return null;
    return header.slice(7).trim();
}

function verifyToken(token) {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!payload?.id) throw new Error("Token has no subject");
    return { id: String(payload.id) };
}

function authenticate(req, res, next) {
    const token = getBearerToken(req);

    if (!token) {
        return res.status(401).json({ error: "Authentication required." });
    }

    try {
        req.user = verifyToken(token);
        next();
    } catch (err) {
        return res.status(401).json({ error: "Session expired or invalid. Sign in again." });
    }
}

function optionalAuth(req, res, next) {
    const token = getBearerToken(req);

    if (token) {
        try {
            req.user = verifyToken(token);
        } catch (err) {
            // Public reads remain available when a stale token is present.
        }
    }

    next();
}

function requireSelf(paramName = "id") {
    return (req, res, next) => {
        if (!req.user || req.user.id !== String(req.params[paramName])) {
            return res.status(403).json({ error: "You can only access your own account." });
        }
        next();
    };
}

module.exports = { authenticate, optionalAuth, requireSelf };
