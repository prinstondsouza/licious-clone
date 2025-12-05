import express from "express";
import {
  registerDeliveryPartner,
  createDeliveryPartner,
  assignDeliveryPartner,
  updateDeliveryStatus,
  getAssignedOrders,
  linkUserToPartner,
  updateDeliveryPartnerStatus,
  getAllDeliveryPartners
} from "../controllers/deliveryPartnerController.js";

import { protect, authorizeRoles, optionalProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Public self-registration for delivery partners
 */
router.post("/register", registerDeliveryPartner);

/**
 * Admin routes
 */
router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  createDeliveryPartner
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllDeliveryPartners
);

router.put(
  "/status/:id",
  protect,
  authorizeRoles("admin"),
  updateDeliveryPartnerStatus
);

/**
 * Admin assigns delivery partner to an order
 */
router.post(
  "/assign",
  protect,
  authorizeRoles("admin"),
  assignDeliveryPartner
);

/**
 * Delivery partner updates delivery status
 * Can be called by admin (with auth) or with deliveryPartnerId in body
 */
router.put(
  "/update-status",
  optionalProtect,
  updateDeliveryStatus
);

/**
 * Link User account to DeliveryPartner (for delivery users)
 */
router.post(
  "/link-user",
  protect,
  authorizeRoles("delivery"),
  linkUserToPartner
);

/**
 * Delivery partner views all assigned orders
 */
router.get(
  "/my-orders",
  protect,
  authorizeRoles("delivery"),
  getAssignedOrders
);

export default router;
