import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Cart.module.css";
import QuantityButton from "../Product/QuantityButton";
import { X } from "lucide-react";

const Cart = ({ isSidebar = false }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  let navigate = useNavigate();

  const token = localStorage.getItem("token");

  const addToCart = async (vendorProductId) => {
    try {
      setUpdating(true);

      if (!token) {
        toast.info("Please login to add items to your Cart!", {
          position: "top-center",
        });
        navigate("/");
        return;
      }

      const res = await axios.post(
        "/api/cart/add",
        {
          vendorProductId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart(res.data.cart);

      toast.info("Item added to cart!", {
        position: "top-center",
        closeOnClick: true,
      });

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setUpdating(false);
    }
  };

  const removeOneFromCart = async (vendorProductId) => {
    try {
      setUpdating(true);

      if (!token) {
        toast.error("Please login to remove items from your Cart!", {
          position: "top-center",
        });
        navigate("/");
        return;
      }

      const res = await axios.post(
        "/api/cart/remove",
        {
          vendorProductId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart(res.data.cart);

      toast.info("Item removed from cart!", {
        position: "top-center",
        closeOnClick: true,
      });

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setUpdating(false);
    }
  };

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
      window.dispatchEvent(new Event("cartUpdated"));
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
              { item.vendorProduct.name}
            </h3>
            <p>Vendor: {item.vendorProduct.vendor?.storeName}</p>
            <p>Price: ₹{item.vendorProduct.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
          <div>
            <button
              onClick={() => removeFromCart(item.vendorProduct._id)}
              className={styles.removeBtn}
            >
              <X size={20} />
            </button>
            <div className={styles.buttons}>
            <QuantityButton
              qty={item.quantity}
              loading={updating}
              onAdd={(qty) => addToCart(item.vendorProduct._id)}
              onRemove={(qty) => removeOneFromCart(item.vendorProduct._id)}
            /></div>
          </div>
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
