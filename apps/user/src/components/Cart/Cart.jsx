import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Cart.module.css";

const Cart = ({ isSidebar = false }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(res.data.cart);
    } catch (error) {
      console.error("Fetch cart error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (vendorProductId) => {
    try {
      const res = await axios.post(
        "/api/cart/remove-product",
        { vendorProductId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart(res.data.cart);
      toast.success("Item removed");
    } catch (error) {
      console.error("Remove error:", error.response?.data || error.message);
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (!token) {
      toast.info("Please log in to continue", { position: "top-center" });
      navigate("/");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.info("Your cart is empty.", { position: "top-center" });
      return;
    }

    navigate("/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <h2 className={styles.container}>Loading cart...</h2>;

  if (!cart || cart.items.length === 0) {
    return <h2 className={styles.container}>Your cart is empty 🛒</h2>;
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.vendorProduct.price * item.quantity,
    0
  );

  return (
    <div className={isSidebar ? styles.sidebarContainer : styles.container}>
      <h1>My Cart</h1>

      {cart.items.map((item) => (
        <div key={item.vendorProduct._id} className={styles.cartItem}>
          <div className={styles.itemInfo}>
            <h3>
              {item.vendorProduct.baseProduct?.name || item.vendorProduct.name}
            </h3>
            <p>Vendor: {item.vendorProduct.vendor?.storeName}</p>
            <p>Price: ₹{item.vendorProduct.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>

          <button
            onClick={() => removeFromCart(item.vendorProduct._id)}
            className={styles.removeBtn}
          >
            Remove
          </button>
        </div>
      ))}

      <hr className={styles.divider} />

      <h2>Total: ₹{totalAmount}</h2>

      <button onClick={handleCheckout} className={styles.checkoutBtn}>
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;