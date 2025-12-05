import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    phone: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true, // Allows multiple null values
    },
    assignedOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryPartner", deliveryPartnerSchema);
