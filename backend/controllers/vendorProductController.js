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

    // Normalize response
    const normalizedProducts = vendorProducts.map((vp) => {
      const productObj = vp.toObject();
      const base = productObj.baseProduct;

      return {
        _id: productObj._id,
        vendor: productObj.vendor,
        // Prioritize vendor-specific fields, fallback to baseProduct fields
        name: productObj.name || (base ? base.name : undefined),
        category: productObj.category || (base ? base.category : undefined),
        description: productObj.description || (base ? base.description : ""),
        price: productObj.price,
        stock: productObj.stock,
        // Use vendor images if available, otherwise base images
        images: (productObj.images && productObj.images.length > 0)
          ? productObj.images
          : (base ? base.images : []),
        addedBy: productObj.addedBy,
        lastUpdatedBy: productObj.lastUpdatedBy,
        status: productObj.status,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
        __v: productObj.__v,
        // Keep baseProduct
        baseProduct: base ? base : {
          _id: productObj._id,
          name: productObj.name,
          category: productObj.category,
          description: productObj.description,
          images: productObj.images,
          basePrice: productObj.price
        }
      };
    });

    res.json({ vendorProducts: normalizedProducts });
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

      query.$or = [
        { baseProduct: { $in: baseProductIds } },
        { category: category, baseProduct: null }
      ];
    }

    const vendorProducts = await VendorProduct.find(query)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName location address")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName");

    // Calculate distance and normalize for each vendor
    const productsWithDistance = vendorProducts.map((vp) => {
      const vendor = vp.vendor;
      const productObj = vp.toObject();
      const base = productObj.baseProduct;

      const normalizedProduct = {
        _id: productObj._id,
        vendor: productObj.vendor,
        name: productObj.name || (base ? base.name : undefined),
        category: productObj.category || (base ? base.category : undefined),
        description: productObj.description || (base ? base.description : ""),
        price: productObj.price,
        stock: productObj.stock,
        images: (productObj.images && productObj.images.length > 0)
          ? productObj.images
          : (base ? base.images : []),
        addedBy: productObj.addedBy,
        lastUpdatedBy: productObj.lastUpdatedBy,
        status: productObj.status,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
        __v: productObj.__v,
        baseProduct: base ? base : {
          _id: productObj._id,
          name: productObj.name,
          category: productObj.category,
          description: productObj.description,
          images: productObj.images,
          basePrice: productObj.price
        }
      };

      if (vendor.location && vendor.location.coordinates) {
        const [lng, lat] = vendor.location.coordinates;
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          lat,
          lng
        );
        return {
          ...normalizedProduct,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places (km)
        };
      }
      return normalizedProduct;
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

    // Check ownership: Authenticated + Vendor + Matches vendorId
    const isOwner = req.user &&
      req.userType === 'vendor' &&
      vendorId &&
      req.user._id.toString() === vendorId;

    if (vendorId) query.vendor = vendorId;

    if (isOwner) {
      // Owner can filter explicitly, otherwise see all (no status filter)
      if (status) query.status = status;
    } else {
      // Public (or other users) ONLY see active
      query.status = "active";
    }

    // Filter by category if provided
    if (category) {
      const baseProducts = await BaseProduct.find({ category, status: "active" });
      const baseProductIds = baseProducts.map((bp) => bp._id);

      query.$or = [
        { baseProduct: { $in: baseProductIds } },
        { category: category, baseProduct: null }
      ];
    }

    const vendorProducts = await VendorProduct.find(query)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName")
      .sort({ createdAt: -1 });

    // Normalize response
    const normalizedProducts = vendorProducts.map(vp => {
      const productObj = vp.toObject();
      const base = productObj.baseProduct;

      return {
        _id: productObj._id,
        vendor: productObj.vendor,
        // Prioritize vendor-specific fields, fallback to baseProduct fields
        name: productObj.name || (base ? base.name : undefined),
        category: productObj.category || (base ? base.category : undefined),
        description: productObj.description || (base ? base.description : ""),
        price: productObj.price,
        stock: productObj.stock,
        // Use vendor images if available, otherwise base images
        images: (productObj.images && productObj.images.length > 0)
          ? productObj.images
          : (base ? base.images : []),
        addedBy: productObj.addedBy,
        lastUpdatedBy: productObj.lastUpdatedBy,
        status: productObj.status,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
        __v: productObj.__v,
        // Keep baseProduct if it exists, or create a virtual one to ensure consistency (matching the "wrong" but possibly desired structure from Step 0 if users rely on it, but user said "just like this" in step 82 which HAS it)
        baseProduct: base ? base : {
          _id: productObj._id,
          name: productObj.name,
          category: productObj.category,
          description: productObj.description,
          images: productObj.images,
          basePrice: productObj.price
        }
      };
    });

    res.json({ vendorProducts: normalizedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor creates their own product (Standalone VendorProduct)
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

    // Create Standalone Vendor Product (no baseProduct)
    const vendorProduct = await VendorProduct.create({
      // baseProduct: null, // Standalone - omitted so it's undefined

      vendor: vendorId,
      name,
      category,
      description,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      images,
      addedBy: vendorId,
      lastUpdatedBy: vendorId,
    });

    const populated = await VendorProduct.findById(vendorProduct._id)
      .populate("vendor", "storeName ownerName");

    res.status(201).json({
      message: "Product created successfully",
      vendorProduct: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single vendor product by ID
export const getVendorProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const vendorProduct = await VendorProduct.findById(productId)
      .populate("baseProduct")
      .populate("vendor", "storeName ownerName location address")
      .populate("addedBy", "storeName")
      .populate("lastUpdatedBy", "storeName");

    if (!vendorProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productObj = vendorProduct.toObject();
    const base = productObj.baseProduct;

    const normalizedProduct = {
      _id: productObj._id,
      vendor: productObj.vendor,
      // Prioritize vendor-specific fields, fallback to baseProduct fields
      name: productObj.name || (base ? base.name : undefined),
      category: productObj.category || (base ? base.category : undefined),
      description: productObj.description || (base ? base.description : ""),
      price: productObj.price,
      stock: productObj.stock,
      // Use vendor images if available, otherwise base images
      images: (productObj.images && productObj.images.length > 0)
        ? productObj.images
        : (base ? base.images : []),
      addedBy: productObj.addedBy,
      lastUpdatedBy: productObj.lastUpdatedBy,
      status: productObj.status,
      createdAt: productObj.createdAt,
      updatedAt: productObj.updatedAt,
      __v: productObj.__v,
      // Keep baseProduct
      baseProduct: base ? base : {
        _id: productObj._id,
        name: productObj.name,
        category: productObj.category,
        description: productObj.description,
        images: productObj.images,
        basePrice: productObj.price
      }
    };

    res.json({ vendorProduct: normalizedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export upload middleware
export { uploadMultiple as uploadVendorProductImages };