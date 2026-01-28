import express from "express";
import {
  registerUser,
  loginUser,
  registerVendor,
  loginVendor,
  registerDeliveryPartner,
  loginDeliveryPartner,
  registerAdmin,
  loginAdmin,
} from "../controllers/authController.js";

const router = express.Router();

// User authentication
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

// Vendor authentication
router.post("/vendor/register", registerVendor);
router.post("/vendor/login", loginVendor);

// Delivery partner authentication
router.post("/delivery/register", registerDeliveryPartner);
router.post("/delivery/login", loginDeliveryPartner);

// Admin authentication
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

export default router;


