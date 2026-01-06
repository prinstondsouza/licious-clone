import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createBaseProduct,
  getAllBaseProducts,
  getBaseProductById,
  updateBaseProduct,
  deleteBaseProduct,
  uploadBaseProductImages,
} from "../controllers/baseProductController.js";
import {
  addToInventory,
  getVendorInventory,
  updateVendorProduct,
  getProductsNearby,
  getAllVendorProducts,
  getVendorProductById,
  uploadVendorProductImages,
  createVendorOwnProduct,
} from "../controllers/vendorProductController.js";

const router = express.Router();

// ========== BASE PRODUCTS (Catalog) ==========
// Public routes - RESTRICTED to Admin and Vendor only
router.get(
  "/base",
  protect,
  authorizeRoles("admin", "vendor"),
  getAllBaseProducts
);
router.get(
  "/base/:id",
  protect,
  authorizeRoles("admin", "vendor"),
  getBaseProductById
);

// Admin routes
router.post(
  "/base",
  protect,
  authorizeRoles("admin"),
  uploadBaseProductImages,
  createBaseProduct
);
router.put(
  "/base/:id",
  protect,
  authorizeRoles("admin"),
  uploadBaseProductImages,
  updateBaseProduct
);
router.delete(
  "/base/:id",
  protect,
  authorizeRoles("admin"),
  deleteBaseProduct
);

// ========== VENDOR PRODUCTS (Inventory) ==========
// Public routes
router.get("/nearby", getProductsNearby); // Requires latitude, longitude query params
router.get("/vendor", getAllVendorProducts);

router.get(
  "/vendor/inventory",
  protect,
  authorizeRoles("vendor"),
  getVendorInventory
);

router.get("/vendor/:id", getVendorProductById);

// Vendor routes
router.post(
  "/vendor/inventory",
  protect,
  authorizeRoles("vendor"),
  uploadVendorProductImages,
  addToInventory
);
router.post(
  "/vendor/create-new",
  protect,
  authorizeRoles("vendor"),
  uploadVendorProductImages,
  createVendorOwnProduct
);

router.put(
  "/vendor/:id",
  protect,
  authorizeRoles("vendor"),
  uploadVendorProductImages,
  updateVendorProduct
);

export default router;
