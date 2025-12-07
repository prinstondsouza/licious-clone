// server.js


import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";








import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import deliveryPartnerRoutes from "./routes/deliveryPartnerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";






dotenv.config();

const app = express();

// middleware
app.use(express.json());

// connect to db
connectDB();

// sample route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// server
const PORT = process.env.PORT || 5000;





app.use("/api/users", userRoutes);






app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/deliver", deliveryRoutes);


app.use("/api/vendors", vendorRoutes);

    
app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/delivery", deliveryPartnerRoutes);

app.use("/api/payments", paymentRoutes);







app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

