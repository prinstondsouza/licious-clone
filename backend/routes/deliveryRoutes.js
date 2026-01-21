import express from "express";
import {
    createDeliveryPartner,
    assignDeliveryPartner,
    updateDeliveryStatus,
    getAssignedOrders,
    updateDeliveryPartnerStatus,
    getAllDeliveryPartners,
    getDeliveryPartnerById,
} from "../controllers/deliveryController.js";

import { protect, authorizeRoles, optionalProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

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

router.get(
    "/delivery-partner-by-id/:id",
    protect,
    authorizeRoles("admin"),
    getDeliveryPartnerById
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
 * Delivery partner views all assigned orders
 */
router.get(
    "/my-orders",
    protect,
    authorizeRoles("delivery"),
    getAssignedOrders
);

export default router;
