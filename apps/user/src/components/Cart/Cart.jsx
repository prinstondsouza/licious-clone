import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch cart
  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(res.data.cart);
      console.log(res.data.cart);
    } catch (error) {
      console.error("Fetch cart error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
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
    } catch (error) {
      console.error("Remove error:", error.response?.data || error.message);
      alert("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (!token) {
      toast.info("Please log in to continue", {position:"top-center"});
      navigate("/login", { state: { from: "/cart"} });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.info("Your cart is empty.", {position:"top-center"});
      return;
    }

    navigate("/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <h2>Loading cart...</h2>;

  if (!cart || cart.items.length === 0) {
    return <h2>Your cart is empty 🛒</h2>;
  }

  // Calculate total
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.vendorProduct.price * item.quantity,
    0
  );

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto" }}>
      <h1>My Cart</h1>

      {cart.items.map((item) => (
        <div
          key={item.vendorProduct._id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <div>
            <h3>{item.vendorProduct.baseProduct?.name || item.vendorProduct.name}</h3>
            <p>Vendor: {item.vendorProduct.vendor?.storeName}</p>
            <p>Price: ₹{item.vendorProduct.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>

          <button
            onClick={() => removeFromCart(item.vendorProduct._id)}
            style={{
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <hr />

      <h2>Total: ₹{totalAmount}</h2>

      <button
        onClick={handleCheckout}
        style={{
          backgroundColor: "#d92662",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "15px",
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Cart;