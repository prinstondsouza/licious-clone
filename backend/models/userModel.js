import mongoose from "mongoose";



import bcrypt from "bcryptjs";



const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    addresses: [
      {
        address: {
          type: String,
          required: [true, "Address is required"],
        },
        flatNo: {
          type: String,
          required: [true, "Flat No is required"],
        },
        landmark: {
          type: String,
          required: [true, "Landmark is required"],
        },
        city: {
          type: String,
          required: [true, "City is required"],
        },
        label: {
          type: String,
          required: [true, "Label is required"],
        },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true,
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
            required: true,
          },
        },
      },
    ],
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married"],
    },
    userImage: {
      type: String,
    },

  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
userSchema.index({ location: "2dsphere" });





// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});





export default mongoose.model("User", userSchema);
