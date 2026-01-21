import mongoose from "mongoose";

// Base products created by admin - catalog items
const baseProductSchema = new mongoose.Schema(
  {
    // hubId: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // cityId: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    // longName: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      required: true, // Suggested price, vendors can set their own
    },
    images: [
      {
        type: String, // URLs to product images
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "creatorModel",
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ["Admin", "Vendor"],
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BaseProduct", baseProductSchema);

