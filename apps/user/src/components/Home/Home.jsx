//Home.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import Categories from "../Categories/Categories";
import ProductCard from "../Product/ProductCard";
import { getProductQuantity } from "../../utils/cartUtils";

const Home = () => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState("");
  const [cart, setCart] = useState([]);

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

  useEffect(() => {
    axios
      .get("/api/products/vendor")
      .then((response) => {
        setItems(response.data.vendorProducts || response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (!localStorage.token) return;
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Hi, {username ? username : "Guest"} 👋</h1>
      <h2>Fresh Cuts (Base Products)</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {items.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <ProductCard
              product={item}
              quantity={getProductQuantity(cart, item._id)}
            />
          </div>
        ))}
      </div>
      <Categories />
    </div>
  );
};

export default Home;
