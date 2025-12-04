// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema(
//   {
//     razorpayOrderId: {
//       type: String,
//       required: true,
//     },
//     razorpayPaymentId: {
//       type: String,
//     },
//     razorpaySignature: {
//       type: String,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     currency: {
//       type: String,
//       default: "INR",
//     },
//     status: {
//       type: String,
//       enum: ["created", "paid", "failed"],
//       default: "created",
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     order: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Order",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Payment", paymentSchema);
