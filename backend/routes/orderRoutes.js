import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getVendorOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// USER ROUTES
router.post("/place", protect, authorizeRoles("user"), placeOrder);
router.get("/my-orders", protect, authorizeRoles("user"), getMyOrders);

// ADMIN ROUTES
router.get("/all", protect, authorizeRoles("admin"), getAllOrders);
router.put("/status/:id", protect, authorizeRoles("admin", "delivery"), updateOrderStatus);

// VENDOR ROUTES
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorOrders);

export default router;
