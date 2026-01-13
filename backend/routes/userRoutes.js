import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
    getAllUsers,
    getCurrentUser,
    updateUserLocation,
    addUserAddresses,
    updateUserAddresses,
    deleteUserAddresses,
} from "../controllers/userController.js";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// User profile routes
router.get("/me", protect, authorizeRoles("user"), getCurrentUser);
router.put("/location", protect, authorizeRoles("user"), updateUserLocation);
router.post("/addresses", protect, authorizeRoles("user"), addUserAddresses);
router.put("/addresses/:id", protect, authorizeRoles("user"), updateUserAddresses);
router.delete("/addresses/:id", protect, authorizeRoles("user"), deleteUserAddresses);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllUsers);

export default router;
