import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { vendorDashboard, vendorInventory } from "../controllers/vendorController.js";
import {
  registerVendor,
  createVendor,
  updateVendorStatus,
  getVendorProfile,
  getAllVendors,
} from "../controllers/vendorController.js";

const router = express.Router();

/**
 * Public self-registration for vendors
 */
router.post("/register", registerVendor);

/**
 * Admin routes
 */
router.post("/", protect, authorizeRoles("admin"), createVendor);
router.get("/", protect, authorizeRoles("admin"), getAllVendors);
router.put("/status/:id", protect, authorizeRoles("admin"), updateVendorStatus);

/**
 * Vendor routes
 */
router.get("/me", protect, authorizeRoles("vendor"), getVendorProfile);
router.get("/dashboard", protect, authorizeRoles("vendor"), vendorDashboard);
router.get("/inventory", protect, authorizeRoles("vendor"), vendorInventory);

export default router;
