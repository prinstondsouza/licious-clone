import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import DeliveryPartner from "../models/deliveryPartnerModel.js";
import Admin from "../models/adminModel.js";

// ========== USER AUTHENTICATION ==========

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // // Set location if provided
    // const location = (latitude && longitude) ? {
    //   type: "Point",
    //   coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
    // } : undefined;

    const user = await User.create({
      firstName: "New",
      lastName: "User",
      email,
      password,
    });

    const token = jwt.sign(
      { id: user._id, userType: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, userType: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== VENDOR AUTHENTICATION ==========

export const registerVendor = async (req, res) => {
  try {
    const {
      storeName,
      ownerName,
      email,
      password,
      phone,
      address,
      latitude,
      longitude,
      documents,
    } = req.body;

    if (!storeName || !ownerName || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor already registered with this email" });
    }

    // Set location if provided
    const location = (latitude && longitude) ? {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    } : undefined;

    const vendor = await Vendor.create({
      storeName,
      ownerName,
      email,
      password,
      phone,
      address,
      location,
      documents,
      status: "pending",
    });

    res.status(201).json({
      message: "Vendor registration submitted. Waiting for admin approval.",
      vendor: {
        id: vendor._id,
        storeName: vendor.storeName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (vendor.status !== "approved") {
      return res.status(403).json({
        message: "Vendor account is pending approval",
        status: vendor.status,
      });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: vendor._id, userType: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    res.json({
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        storeName: vendor.storeName,
        ownerName: vendor.ownerName,
        email: vendor.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== DELIVERY PARTNER AUTHENTICATION ==========

export const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      latitude,
      longitude,
    } = req.body;

    if (!name || !email || !password || !phone || !vehicleType) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingPartner = await DeliveryPartner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: "Delivery partner already registered with this email" });
    }

    // Set location if provided
    const location = (latitude && longitude) ? {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    } : undefined;

    const deliveryPartner = await DeliveryPartner.create({
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      location,
      status: "pending",
      assignedOrders: [],
    });

    res.status(201).json({
      message: "Delivery partner registration submitted. Waiting for admin approval.",
      deliveryPartner: {
        id: deliveryPartner._id,
        name: deliveryPartner.name,
        phone: deliveryPartner.phone,
        vehicleType: deliveryPartner.vehicleType,
        status: deliveryPartner.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const deliveryPartner = await DeliveryPartner.findOne({ email });
    if (!deliveryPartner) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (deliveryPartner.status !== "approved") {
      return res.status(403).json({
        message: "Delivery partner account is pending approval",
        status: deliveryPartner.status,
      });
    }

    const isMatch = await bcrypt.compare(password, deliveryPartner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: deliveryPartner._id, userType: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    res.json({
      message: "Login successful",
      token,
      deliveryPartner: {
        id: deliveryPartner._id,
        name: deliveryPartner.name,
        phone: deliveryPartner.phone,
        vehicleType: deliveryPartner.vehicleType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ADMIN AUTHENTICATION ==========

export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "First Name, email, and password are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    const token = jwt.sign(
      { id: admin._id, userType: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, userType: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

