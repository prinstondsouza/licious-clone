import BaseProduct from "../models/baseProductModel.js";
import { uploadBaseProductImages } from "../utils/upload.js";

// Admin creates base product (catalog item)
export const createBaseProduct = async (req, res) => {
  try {
    const { name, category, description, basePrice } = req.body;

    if (!name || !category || !basePrice) {
      return res.status(400).json({ message: "Name, category, and basePrice are required" });
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/baseProducts/${file.filename}`);
      });
    }

    const baseProduct = await BaseProduct.create({
      name,
      category,
      description,
      basePrice: parseFloat(basePrice),
      images,
      createdBy: req.user._id, // Admin ID
    });

    res.status(201).json({
      message: "Base product created successfully",
      baseProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all base products (Only for Admin and Vendors)
export const getAllBaseProducts = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    const baseProducts = await BaseProduct.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ baseProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get base product by ID
export const getBaseProductById = async (req, res) => {
  try {
    const baseProduct = await BaseProduct.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!baseProduct) {
      return res.status(404).json({ message: "Base product not found" });
    }

    res.json({ baseProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin updates base product
export const updateBaseProduct = async (req, res) => {
  try {
    const { name, category, description, basePrice, status } = req.body;
    const baseProduct = await BaseProduct.findById(req.params.id);

    if (!baseProduct) {
      return res.status(404).json({ message: "Base product not found" });
    }

    // Handle image updates
    let updatedImages = [...baseProduct.images];

    // 1. Remove deleted images
    if (req.body.deletedImages) {
      let deletedImages = req.body.deletedImages;
      if (typeof deletedImages === 'string') {
        try {
          deletedImages = JSON.parse(deletedImages);
        } catch (e) {
          // If parse fails or it's just a single string URL, treat as single item array
          deletedImages = [deletedImages];
        }
      }
      if (Array.isArray(deletedImages)) {
        updatedImages = updatedImages.filter(img => !deletedImages.includes(img));
      }
    }

    // 2. Append new images
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        updatedImages.push(`/uploads/baseProducts/${file.filename}`);
      });
    }

    baseProduct.images = updatedImages;

    if (name) baseProduct.name = name;
    if (category) baseProduct.category = category;
    if (description !== undefined) baseProduct.description = description;
    if (basePrice) baseProduct.basePrice = parseFloat(basePrice);
    if (status) baseProduct.status = status;

    await baseProduct.save();

    res.json({
      message: "Base product updated successfully",
      baseProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin deletes base product
export const deleteBaseProduct = async (req, res) => {
  try {
    const baseProduct = await BaseProduct.findById(req.params.id);

    if (!baseProduct) {
      return res.status(404).json({ message: "Base product not found" });
    }

    await baseProduct.deleteOne();

    res.json({ message: "Base product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export upload middleware
export { uploadBaseProductImages };

