import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
    getAllUsers,
    getCurrentUser,
    updateUserLocation,
    addUserAddresses,
    updateUserAddresses,
    deleteUserAddresses,
    updateUserProfile,
    uploadUserImage,
    getUserById,
} from "../controllers/userController.js";

// import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// User profile routes
router.get("/me", protect, authorizeRoles("user"), getCurrentUser);
router.put("/location", protect, authorizeRoles("user"), updateUserLocation);
router.put("/update-user-profile", protect, authorizeRoles("user"), uploadUserImage, updateUserProfile);
router.post("/addresses", protect, authorizeRoles("user"), addUserAddresses);
router.put("/addresses/:id", protect, authorizeRoles("user"), updateUserAddresses);
router.delete("/addresses/:id", protect, authorizeRoles("user"), deleteUserAddresses);

// Admin routes
router.get("/all-users", protect, authorizeRoles("admin"), getAllUsers);
router.get("/user-by-Id/:id", protect, authorizeRoles("admin"), getUserById);

export default router;
