import DeliveryPartner from "../models/deliveryPartnerModel.js";
import Order from "../models/orderModel.js";

/**
 * Admin creates a new delivery partner (alternative method)
 */
export const createDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber, email, password, latitude, longitude } = req.body;

    if (!name || !phone || !vehicleType || !email || !password || !vehicleNumber) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const exists = await DeliveryPartner.findOne({ email });
    if (exists) return res.status(400).json({ message: "Partner already exists" });

    // Set location if provided
    const location = (latitude && longitude) ? {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    } : undefined;

    const deliveryPartner = await DeliveryPartner.create({
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleNumber,
      location,
      status: "approved", // Admin-created partners are auto-approved
      assignedOrders: [],
    });

    res.status(201).json({
      message: "Delivery partner created successfully",
      deliveryPartner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Assign delivery partner to an order
 */
export const assignDeliveryPartner = async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;

    if (!orderId || !partnerId) {
      return res.status(400).json({ message: "orderId and partnerId required" });
    }

    const order = await Order.findById(orderId);
    const partner = await DeliveryPartner.findById(partnerId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    if (partner.status !== "approved") {
      return res.status(400).json({ message: "Delivery partner is not approved" });
    }

    // Update order
    order.deliveryBy = partnerId;
    order.status = "out-for-delivery";
    await order.save();

    // Add order to partner assigned list
    partner.assignedOrders.push(orderId);
    await partner.save();

    res.json({
      message: "Delivery partner assigned successfully",
      order,
      partner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delivery Partner Updates Order Status
 * Can be called by admin (with auth token) or by providing deliveryPartnerId in body
 */
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId, status, deliveryPartnerId } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: "orderId and status are required" });
    }

    const validStatuses = ["out-for-delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if user is admin (optional auth)
    const isAdmin = req.user && req.userType === "admin";

    // If not admin, verify deliveryPartnerId matches the order's deliveryBy
    if (!isAdmin) {
      if (!deliveryPartnerId) {
        return res.status(400).json({ message: "deliveryPartnerId is required when not authenticated as admin" });
      }

      if (!order.deliveryBy) {
        return res.status(403).json({ message: "No delivery partner assigned to this order" });
      }

      if (order.deliveryBy.toString() !== deliveryPartnerId.toString()) {
        return res.status(403).json({ message: "Not authorized for this order" });
      }
    }

    // Update status
    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin approves/rejects delivery partner
 */
export const updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const deliveryPartner = await DeliveryPartner.findById(id);
    if (!deliveryPartner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    deliveryPartner.status = status;
    await deliveryPartner.save();

    res.json({ 
      message: `Delivery partner ${status} successfully`, 
      deliveryPartner 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all delivery partners (Admin) - can filter by status
 */
export const getAllDeliveryPartners = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const deliveryPartners = await DeliveryPartner.find(query).select("-password");
    res.json({ deliveryPartners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * View all orders assigned to a delivery partner
 */
export const getAssignedOrders = async (req, res) => {
  try {
    const deliveryPartner = await DeliveryPartner.findById(req.user._id);
    
    if (!deliveryPartner) {
      return res.status(404).json({ message: "Delivery partner profile not found" });
    }

    if (deliveryPartner.status !== "approved") {
      return res.status(403).json({ 
        message: "Your delivery partner account is pending approval",
        status: deliveryPartner.status 
      });
    }

    const orders = await Order.find({ deliveryBy: deliveryPartner._id })
      .populate("user", "name email phone")
      .populate("products.vendorProduct")
      .populate("products.vendor", "storeName ownerName");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
