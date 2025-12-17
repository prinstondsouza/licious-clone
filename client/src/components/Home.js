//Home.js

import React, { useEffect, useState } from "react";
import axios from "axios";

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
    console.error("Add to cart error:", error.response?.data || error.message);
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
            {/* If images exist and is an array, show the first one */}
            {item.images && item.images[0] && (
              <img
                src={item.images[0] || item.images}
                alt={item.name}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
            )}
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p style={{ fontWeight: "bold", color: "#d92662" }}>
              ₹{item.price}
            </p>
            <button
              onClick={() => addToCart(item._id)} 
              style={{
                backgroundColor: "#d92662",
                color: "white",
                border: "none",
                padding: "10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
