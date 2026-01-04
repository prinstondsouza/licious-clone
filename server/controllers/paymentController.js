import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const options = {
      amount: order.totalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create Payment record
    await Payment.create({
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      user: req.user._id,
      order: orderId,
    });

    res.json({
      message: "Razorpay order created",
      orderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       orderId,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     const isValid = expectedSignature === razorpay_signature;

//     if (!isValid) {
//       return res.status(400).json({ message: "Payment verification failed" });
//     }

//     // Update payment
//     await Payment.findOneAndUpdate(
//       { razorpayOrderId: razorpay_order_id },
//       {
//         razorpayPaymentId: razorpay_payment_id,
//         razorpaySignature: razorpay_signature,
//         status: "paid",
//       }
//     );

//     // Update original order
//     const order = await Order.findById(orderId);
//     order.paymentStatus = "paid";
//     order.paymentMethod = "razorpay";
//     order.paymentInfo = {
//       id: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       signature: razorpay_signature,
//     };
//     order.status = "paid";
//     await order.save();

//     res.json({ message: "Payment verified successfully", order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };




