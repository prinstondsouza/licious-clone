import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    documents: {
      gst: String,
      pan: String,
      other: String,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who created/approved the vendor (optional)
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Will link later in Phase 4
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
