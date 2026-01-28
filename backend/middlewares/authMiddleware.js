import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import DeliveryPartner from "../models/deliveryPartnerModel.js";
import Admin from "../models/adminModel.js";

// Generic protect middleware that works with any user type
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to find user in different collections based on token payload
      let user = null;
      let userType = null;

      // Check if token has userType field
      if (decoded.userType) {
        userType = decoded.userType;
        switch (userType) {
          case "user":
            user = await User.findById(decoded.id).select("-password");
            break;
          case "vendor":
            user = await Vendor.findById(decoded.id).select("-password");
            break;
          case "delivery":
            user = await DeliveryPartner.findById(decoded.id).select("-password");
            break;
          case "admin":
            user = await Admin.findById(decoded.id).select("-password");
            break;
        }
      } else {
        // Fallback: try User collection first (for backward compatibility)
        user = await User.findById(decoded.id).select("-password");
        if (user) userType = "user";
      }

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      req.user = user;
      req.userType = userType || decoded.userType || "user";
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, token missing" });
};

// Allow only specific roles/user types
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check userType for new structure
    if (req.userType && !roles.includes(req.userType)) {
      return res.status(403).json({
        message: `Access denied: Only ${roles.join(", ")} can perform this action`,
      });
    }

    // Fallback: check role field for backward compatibility
    if (req.user.role && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Only ${roles.join(", ")} can perform this action`,
      });
    }

    next();
  };
};

// Optional protect - sets req.user if token is provided, but doesn't fail if no token
export const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user = null;
      let userType = null;

      if (decoded.userType) {
        userType = decoded.userType;
        switch (userType) {
          case "user":
            user = await User.findById(decoded.id).select("-password");
            break;
          case "vendor":
            user = await Vendor.findById(decoded.id).select("-password");
            break;
          case "delivery":
            user = await DeliveryPartner.findById(decoded.id).select("-password");
            break;
          case "admin":
            user = await Admin.findById(decoded.id).select("-password");
            break;
        }
      } else {
        user = await User.findById(decoded.id).select("-password");
        if (user) userType = "user";
      }
      
      if (user) {
        req.user = user;
        req.userType = userType || decoded.userType || "user";
      } else {
        req.user = null;
        req.userType = null;
      }
    } catch (error) {
      // Invalid token, but we'll continue without setting req.user
      req.user = null;
      req.userType = null;
    }
  }
  
  next();
};

export const isDelivery = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (req.userType !== "delivery" && req.user.role !== "delivery") {
      return res.status(403).send({ message: "Access denied" });
    }

    next();
  } catch (error) {
    res.status(500).send({ message: "Auth error" });
  }
};
