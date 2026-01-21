import User from "../models/userModel.js";
import { uploadUserImage } from "../utils/upload.js";

// Get all users (Admin only - for management)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (Admin only - for management)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user location
export const updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    if (address) {
      user.address = address;
    }

    await user.save();

    res.json({
      message: "Location updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, gender, maritalStatus } = req.body;

    if (!firstName || !lastName || !phone || !gender || !maritalStatus) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      user.userImage = `/uploads/userImages/${req.file.filename}`;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.gender = gender;
    user.maritalStatus = maritalStatus;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
        userImage: user.userImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add user address
export const addUserAddresses = async (req, res) => {
  try {
    const { address, flatNo, landmark, city, label, latitude, longitude } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if label already exists
    const labelExists = user.addresses.some(
      (addr) => addr.label.toLowerCase() === label.toLowerCase()
    );

    if (labelExists) {
      return res.status(400).json({ message: "Address with this label already exists" });
    }

    const newAddress = {
      address,
      flatNo,
      landmark,
      city,
      label,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user address
export const updateUserAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, flatNo, landmark, city, label, latitude, longitude } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === id);

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If label is being updated, check if it already exists (excluding current address)
    if (label && label.toLowerCase() !== user.addresses[addressIndex].label.toLowerCase()) {
      const labelExists = user.addresses.some(
        (addr) => addr.label.toLowerCase() === label.toLowerCase() && addr._id.toString() !== id
      );
      if (labelExists) {
        return res.status(400).json({ message: "Address with this label already exists" });
      }
    }

    if (address) user.addresses[addressIndex].address = address;
    if (flatNo) user.addresses[addressIndex].flatNo = flatNo;
    if (landmark) user.addresses[addressIndex].landmark = landmark;
    if (city) user.addresses[addressIndex].city = city;
    if (label) user.addresses[addressIndex].label = label;
    if (latitude && longitude) {
      user.addresses[addressIndex].location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    await user.save();

    res.json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user address
export const deleteUserAddresses = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== id);

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ message: "Address not found" });
    }

    await user.save();

    res.json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export upload middleware
export { uploadUserImage };