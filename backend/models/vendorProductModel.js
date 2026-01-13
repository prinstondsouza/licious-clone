import mongoose from "mongoose";

// Vendor's inventory items - based on BaseProduct OR standalone
const vendorProductSchema = new mongoose.Schema(
  {
    baseProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseProduct",
      required: false, // Optional for vendor-created standalone products
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    // Fields for standalone vendor products (when baseProduct is null)
    name: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    vendorBasePrice: {
      type: Number,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextAvailableBy: {
      type: String,
      default: "out-of-stock",
    },
    images: [
      {
        type: String, // Vendor-specific product images
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    status: {
      type: String,
      enum: ["active", "out-of-stock", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index to ensure vendor can't add same base product twice
// Only applies when baseProduct exists
vendorProductSchema.index(
  { vendor: 1, baseProduct: 1 },
  { unique: true, partialFilterExpression: { baseProduct: { $type: "objectId" } } }
);

export default mongoose.model("VendorProduct", vendorProductSchema);

