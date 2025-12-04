import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      },
    ],

    totalPrice: { type: Number, required: true },

    // FINAL ENUM (Merged & Standardized)
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "out-for-delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // UPDATED DELIVERY PARTNER FIELD
    deliveryBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner", // UPDATED (was "User")
      default: null,
    },

    paymentInfo: {
      id: { type: String },          // Razorpay payment ID
      orderId: { type: String },     // Razorpay order ID
      signature: { type: String },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cod"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "cod",
    },

  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

