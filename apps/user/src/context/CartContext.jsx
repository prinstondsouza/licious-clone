import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(res.data.cart);
    } catch (err) {
      console.log("Fetch cart error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (vendorProductId) => {
    if (!token) {
      toast.info("Please login to add items to your Cart!", {
        position: "top-center",
      });
      return;
    }

    try {
      await axios.post(
        "/api/cart/add",
        { vendorProductId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.info("Item added to cart!", {
        position: "top-center",
        closeOnClick: true,
      });

      fetchCart();
    } catch (err) {
      console.log("Add to cart error:", err.response?.data || err.message);
    }
  };

  const removeFromCart = async (vendorProductId) => {
    if (!token) {
      toast.error("Please login to remove items from your Cart!", {
        position: "top-center",
      });
      return;
    }

    try {
      await axios.post(
        "/api/cart/remove",
        { vendorProductId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.info("Item removed from cart!", {
        position: "top-center",
        closeOnClick: true,
      });

      fetchCart();
    } catch (err) {
      console.log("Remove from cart error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
