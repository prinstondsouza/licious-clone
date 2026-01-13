import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  createVendor,
  updateVendorStatus,
  getVendorProfile,
  getAllVendors,
  vendorDashboard,
  getPublicApprovedVendors,
  getNearestApprovedVendors,
} from "../controllers/vendorController.js";
import { registerVendor, loginVendor } from "../controllers/authController.js";

const router = express.Router();

/**
 * Public Vendor Discovery
 */
router.get("/public/list", getPublicApprovedVendors);
router.get("/public/nearest", getNearestApprovedVendors);

/**
 * Admin routes
 */
router.post("/create-vendor", protect, authorizeRoles("admin"), createVendor);
router.get("/get-all-vendors", protect, authorizeRoles("admin"), getAllVendors);
router.get("/get-vendor-by-id/:id", protect, authorizeRoles("admin"), getAllVendors);
router.put("/update-status/:id", protect, authorizeRoles("admin"), updateVendorStatus);

/**
 * Vendor routes
 */
router.get("/me", protect, authorizeRoles("vendor"), getVendorProfile);
router.get("/dashboard", protect, authorizeRoles("vendor"), vendorDashboard);

export default router;
