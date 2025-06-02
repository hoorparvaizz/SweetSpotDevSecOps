import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // Check for JWT token in Authorization header
    let token = req.headers.authorization?.split(" ")[1];

    // If not in header, check for session_token cookie
    if (!token && req.cookies?.session_token) {
      token = req.cookies.session_token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    // No valid authentication found
    return res.status(401).json({ message: "Unauthorized - Please log in" });
  } catch (err) {
    console.error("Auth error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Middleware to check if user is a vendor
export const isVendor = (req, res, next) => {
  if (req.user?.role === 'vendor') {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Vendor role required." });
};