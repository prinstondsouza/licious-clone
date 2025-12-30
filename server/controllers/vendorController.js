import Vendor from "../models/vendorModel.js";

// Admin creates a new vendor (alternative method)
export const createVendor = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, password, address, latitude, longitude, documents } = req.body;

    if (!storeName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor already exists" });
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
      createdBy: req.user._id,
      status: "approved", // Admin-created vendors are auto-approved
    });

    res.status(201).json({
      message: "Vendor created successfully",
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

// Admin updates vendor status (approve/reject)
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.status = status;
    if (!vendor.createdBy) {
      vendor.createdBy = req.user._id;
    }
    await vendor.save();

    res.json({
      message: `Vendor ${status} successfully`,
      vendor: {
        id: vendor._id,
        storeName: vendor.storeName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        status: vendor.status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor gets own profile
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user._id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

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
    const { status } = req.query;
    const query = status ? { status } : {};
    const vendors = await Vendor.find(query).select("-password");
    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor dashboard
export const vendorDashboard = (req, res) => {
  res.json({
    message: "Welcome Vendor",
    vendor: {
      id: req.user._id,
      storeName: req.user.storeName,
      ownerName: req.user.ownerName,
    }
  });
};

/**
 * Get all approved vendors (Public)
 */
export const getPublicApprovedVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: "approved" }).select("-password -documents -createdBy -email -phone");
    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get nearest approved vendors within 5km (Public)
 */
export const getNearestApprovedVendors = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "latitude and longitude are required" });
    }

    const vendors = await Vendor.find({
      status: "approved",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 5000, // 5km in meters
        },
      },
    }).select("-password -documents -createdBy -email -phone");

    res.json({ vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};