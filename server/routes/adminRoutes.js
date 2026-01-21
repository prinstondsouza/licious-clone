import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { adminDashboard, getVendors, getDeliveryPartners } from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), adminDashboard);
router.get("/vendors", protect, authorizeRoles("admin"), getVendors);
router.get("/delivery", protect, authorizeRoles("admin"), getDeliveryPartners);

export default router;
