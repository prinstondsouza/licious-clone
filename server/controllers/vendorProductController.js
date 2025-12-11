import VendorProduct from "../models/vendorProductModel.js";
import BaseProduct from "../models/baseProductModel.js";
import Vendor from "../models/vendorModel.js";
import { uploadMultiple } from "../utils/upload.js";

// Vendor adds base product to their inventory
export const addToInventory = async (req, res) => {
  try {
    const { baseProductId, price, stock } = req.body;
    const vendorId = req.user._id;

    if (!baseProductId || !price) {
      return res.status(400).json({ message: "baseProductId and price are required" });
    }

    // Check if base product exists
    const baseProduct = await BaseProduct.findById(baseProductId);
    if (!baseProduct) {
      return res.status(404).json({ message: "Base product not found" });
    }

    // Check if vendor already has this product
    const existing = await VendorProduct.findOne({
      vendor: vendorId,
      baseProduct: baseProductId,
    });

    if (existing) {
      return res.status(400).json({ message: "Product already in your inventory" });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const vendorProduct = await VendorProduct.create({
      baseProduct: baseProductId,
      vendor: vendorId,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      images,
      addedBy: vendorId,
      lastUpdatedBy: vendorId,
    });

    const populated = await VendorProduct.findById(vendorProduct._id)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName");

    res.status(201).json({
      message: "Product added to inventory successfully",
      vendorProduct: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor updates their product
export const updateVendorProduct = async (req, res) => {
  try {
    const { price, stock, status } = req.body;
    const vendorId = req.user._id;
    const productId = req.params.id;

    const vendorProduct = await VendorProduct.findById(productId);

    if (!vendorProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify vendor owns this product
    if (vendorProduct.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    if (price !== undefined) vendorProduct.price = parseFloat(price);
    if (stock !== undefined) vendorProduct.stock = parseInt(stock);
    if (status) vendorProduct.status = status;
    vendorProduct.lastUpdatedBy = vendorId;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        vendorProduct.images.push(`/uploads/${file.filename}`);
      });
    }

    await vendorProduct.save();

    const populated = await VendorProduct.findById(vendorProduct._id)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName");

    res.json({
      message: "Product updated successfully",
      vendorProduct: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor's inventory
export const getVendorInventory = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const vendorProducts = await VendorProduct.find({ vendor: vendorId })
      .populate("baseProduct")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName")
      .sort({ createdAt: -1 });

    res.json({ vendorProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products from vendors within 5km radius (for users)
export const getProductsNearby = async (req, res) => {
  try {
    const { latitude, longitude, category, maxDistance = 5000 } = req.query; // maxDistance in meters (default 5km)

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const userLocation = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // Find vendors within radius
    const vendors = await Vendor.find({
      location: {
        $near: {
          $geometry: userLocation,
          $maxDistance: parseInt(maxDistance), // in meters
        },
      },
      status: "approved",
    });

    const vendorIds = vendors.map((v) => v._id);

    // Build query for vendor products
    const query = {
      vendor: { $in: vendorIds },
      status: "active",
      stock: { $gt: 0 }, // Only products in stock
    };

    // Filter by category if provided
    if (category) {
      const baseProducts = await BaseProduct.find({ category, status: "active" });
      const baseProductIds = baseProducts.map((bp) => bp._id);
      query.baseProduct = { $in: baseProductIds };
    }

    const vendorProducts = await VendorProduct.find(query)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName location address")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName");

    // Calculate distance for each vendor
    const productsWithDistance = vendorProducts.map((vp) => {
      const vendor = vp.vendor;
      if (vendor.location && vendor.location.coordinates) {
        const [lng, lat] = vendor.location.coordinates;
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          lat,
          lng
        );
        return {
          ...vp.toObject(),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places (km)
        };
      }
      return vp.toObject();
    });

    res.json({
      products: productsWithDistance,
      count: productsWithDistance.length,
      userLocation: { latitude, longitude },
      maxDistance: `${maxDistance / 1000}km`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Get all vendor products (public - for browsing)
export const getAllVendorProducts = async (req, res) => {
  try {
    const { vendorId, category, status } = req.query;
    const query = {};

    if (vendorId) query.vendor = vendorId;
    if (status) query.status = status;

    // Filter by category if provided
    if (category) {
      const baseProducts = await BaseProduct.find({ category, status: "active" });
      const baseProductIds = baseProducts.map((bp) => bp._id);
      query.baseProduct = { $in: baseProductIds };
    }

    const vendorProducts = await VendorProduct.find(query)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName")
      .sort({ createdAt: -1 });

    res.json({ vendorProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor creates their own product (BaseProduct + VendorProduct)
export const createVendorOwnProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock } = req.body;
    const vendorId = req.user._id;

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category, and price are required" });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // 1. Create Base Product
    const baseProduct = await BaseProduct.create({
      name,
      category,
      description,
      basePrice: parseFloat(price),
      images,
      createdBy: vendorId,
      creatorModel: "Vendor",
      status: "active",
    });

    // 2. Add to Vendor Inventory
    const vendorProduct = await VendorProduct.create({
      baseProduct: baseProduct._id,
      vendor: vendorId,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      images, // Vendor product can have same images initially
      addedBy: vendorId,
      lastUpdatedBy: vendorId,
    });

    const populated = await VendorProduct.findById(vendorProduct._id)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName");

    res.status(201).json({
      message: "Product created and added to inventory successfully",
      vendorProduct: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export upload middleware
export { uploadMultiple as uploadVendorProductImages };

