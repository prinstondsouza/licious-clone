//Home.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import Categories from "./Categories";
import ProductCard from "./ProductCard";

const Home = () => {
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState("");

  const addToCart = async (vendorProductId) => {
    try {
      const token = localStorage.getItem("token");

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
      alert("Item added to cart!");
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to add item");
    }
  };

  useEffect(() => {
    axios
      .get("/api/products/vendor")
      .then((response) => {
        // console.log("API Response:", response.data);
        setItems(response.data.vendorProducts || response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, []);

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
            <ProductCard product={item} addToCart={() => addToCart(item._id)} />
          </div>
        ))}
      </div>
      <Categories />
    </div>
  );
};

export default Home;
