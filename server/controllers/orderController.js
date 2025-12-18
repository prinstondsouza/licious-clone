import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";
// import Product from "../models/productModel.js";
// import Vendor from "../models/vendorModel.js";
import { clearCart } from "./cartController.js";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// ---------------------------------------------
// 1. PLACE ORDER (User)
// ---------------------------------------------
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { latitude, longitude, address } = req.body;

    // 1. Update User Location if provided
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (latitude && longitude) {
      user.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
      if (address) user.address = address;
      await user.save();
    }

    // 2. Validate User Location
    if (
      !user.location ||
      !user.location.coordinates ||
      user.location.coordinates.length < 2 ||
      !user.address
    ) {
      return res.status(400).json({
        message: "Delivery location and address are required. Please provide them or update your profile.",
      });
    }

    const userLat = user.location.coordinates[1];
    const userLng = user.location.coordinates[0];

    // 3. Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.vendorProduct",
      populate: { path: "vendor" } // Populate vendor to check location
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 4. Proximity Check
    // Group items by vendor to check distance once per vendor
    const vendorMap = new Map();
    for (const item of cart.items) {
      if (!item.vendorProduct || !item.vendorProduct.vendor) continue;
      const vendor = item.vendorProduct.vendor;
      if (!vendorMap.has(vendor._id.toString())) {
        vendorMap.set(vendor._id.toString(), vendor);
      }
    }

    for (const vendor of vendorMap.values()) {
      if (!vendor.location || !vendor.location.coordinates) {
        return res.status(400).json({ message: `Vendor ${vendor.storeName} has no location set.` });
      }
      const vendorLng = vendor.location.coordinates[0];
      const vendorLat = vendor.location.coordinates[1];

      const distance = calculateDistance(userLat, userLng, vendorLat, vendorLng);
      if (distance > 5 ) { // 5km radius
        return res.status(400).json({
          message: `You are too far from ${vendor.storeName}. Delivery is only available within 5km. Current distance: ${distance.toFixed(2)}km.`,
          isEligible: false,
          currentDistance: distance.toFixed(2)
        });
      }
    }

    // 5. Prepare order items
    const orderItems = cart.items.map((item) => ({
      vendorProduct: item.vendorProduct._id,
      quantity: item.quantity,
      vendor: item.vendorProduct.vendor._id,
    }));

    // Calculate total price
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.vendorProduct.price * item.quantity,
      0
    );

    // 6. Create the order
    const order = await Order.create({
      user: userId,
      products: orderItems,
      totalPrice,
      deliveryAddress: user.address,
      deliveryLocation: user.location,
    });

    // Clear cart after successful order
    await clearCart(userId);

    res.status(201).json({
      message: "Order placed successfully",
      order,
      isEligible: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------
// 2. GET USER ORDERS (User)
// ---------------------------------------------
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.vendorProduct")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------
// 3. GET ALL ORDERS (ADMIN)
// ---------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.vendorProduct")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------
// 4. GET VENDOR ORDERS (Vendor)
// ---------------------------------------------
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({
      "products.vendor": vendorId,
    })
      .populate("user", "name email")
      .populate("products.vendorProduct");

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------
// 5. UPDATE ORDER STATUS (Admin / Delivery)
// ---------------------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatus = [
      "pending",
      "confirmed",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
