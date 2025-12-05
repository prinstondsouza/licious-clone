import Vendor from "../models/vendorModel.js";
import User from "../models/userModel.js";

// Self-registration for vendors (public endpoint)
export const registerVendor = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, password, documents } = req.body;

    // Check required fields
    if (!storeName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if vendor email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor already registered with this email" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create user account with vendor role
    const user = await User.create({
      name: ownerName,
      email,
      password,
      role: "vendor",
      phone,
    });

    // Create vendor profile with pending status
    const vendor = await Vendor.create({
      storeName,
      ownerName,
      email,
      phone,
      documents,
      userId: user._id,
      status: "pending", // Will be approved by admin
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

// Admin creates a new vendor (alternative method)
export const createVendor = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, documents } = req.body;

    // Check required fields
    if (!storeName || !ownerName || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if vendor email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const vendor = await Vendor.create({
      storeName,
      ownerName,
      email,
      phone,
      documents,
      createdBy: req.user._id, // Admin ID
      status: "approved", // Admin-created vendors are auto-approved
    });

    res.status(201).json({
      message: "Vendor created successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin updates vendor status (approve/reject)
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status = approved/rejected

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.status = status;
    // Set createdBy to admin who approved (if not already set)
    if (!vendor.createdBy) {
      vendor.createdBy = req.user._id;
    }
    await vendor.save();

    res.json({ 
      message: `Vendor ${status} successfully`, 
      vendor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor gets own profile
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

    // Check if vendor is approved
    if (vendor.status !== "approved") {
      return res.status(403).json({ 
        message: "Your vendor account is pending approval",
        status: vendor.status 
      });
    }

    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all vendors (Admin) - can filter by status
export const getAllVendors = async (req, res) => {
  try {
    const { status } = req.query; // Optional filter: ?status=pending
    const query = status ? { status } : {};
    const vendors = await Vendor.find(query).populate("userId", "name email");
    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






export const vendorDashboard = (req, res) => {
  res.json({
    message: "Welcome Vendor",
    user: req.user
  });
};

export const vendorInventory = (req, res) => {
  res.json({ message: "Vendor inventory will appear here" });
};
