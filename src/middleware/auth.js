// src/middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'غير مصرح - لا يوجد token'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'غير مصرح - token غير صالح'
    });
  }
};
