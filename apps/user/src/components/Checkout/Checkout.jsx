import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Checkout.module.css";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";

const Checkout = () => {
  const { cart, fetchCart, loading } = useCart();
  const { address } = useUser();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.warning("Please login again", { position: "top-center" });
      navigate("/");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.warning("Your Cart is Empty", { position: "top-center" });
      navigate("/cart");
      return;
    }

    fetchCart();
  }, [navigate, token]);

  const placeOrder = async () => {
    if (!address) {
      toast.error("Please add a delivery address in your profile first.");
      return;
    }

    try {
      await axios.post(
        "/api/orders/place",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Order placed successfully!", { position: "top-center" });
      navigate("/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed", {
        position: "top-center",
      });
    }
  };

  if (loading)
    return <h2 className={styles.container}>Loading checkout details...</h2>;

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.vendorProduct.price * item.quantity,
    0,
  );

  return (
    <div className={styles.container}>
      <h1>Checkout</h1>

      <div className={styles.summarySection}>
        <h2>Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.vendorProduct._id} className={styles.itemRow}>
            <div>
              <h4 className={styles.itemTitle}>{item.vendorProduct.name}</h4>
              <p className={styles.vendorName}>
                {item.vendorProduct.vendor?.storeName}
              </p>
              <p>Qty: {item.quantity}</p>
            </div>
            <div className={styles.itemPrice}>
              ₹{item.vendorProduct.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <hr className={styles.divider} />

      <h2 className={styles.totalText}>Total: ₹{totalAmount}</h2>

      <div className={styles.addressBox}>
        <h3>Delivery Details</h3>
        <p>{address ? `📍 ${address}` : "📍 No delivery address found."}</p>
        <button
          onClick={() => navigate("/profile")}
          style={{
            background: "none",
            border: "none",
            color: "#d92662",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          {address ? "Change Address" : "Add Address in Profile"}
        </button>
      </div>

      <p>
        <strong>Payment Method:</strong> Cash on Delivery (COD)
      </p>

      <button
        onClick={placeOrder}
        className={styles.placeOrderBtn}
        disabled={!address}
      >
        Confirm & Place Order
      </button>
    </div>
  );
};

export default Checkout;
