import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getCart,
  addToCart,
  removeFromCart,
  removeProductFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

// User routes
router.get("/", protect, authorizeRoles("user"), getCart);
router.post("/add", protect, authorizeRoles("user"), addToCart);
router.post("/remove", protect, authorizeRoles("user"), removeFromCart);
router.post("/remove-product", protect, authorizeRoles("user"), removeProductFromCart);

export default router;
