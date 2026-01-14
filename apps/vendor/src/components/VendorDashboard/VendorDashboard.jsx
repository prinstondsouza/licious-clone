import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../Product/ProductCard";
import styles from "./VendorDashboard.module.css";
import OrderCard from "../Orders/OrderCard";

const VendorDashboard = () => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState("");

  const fetchMyProducts = async () => {
    try {
      const res = await axios.get("/api/products/vendor/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(res.data.vendorProducts);
    } catch (error) {
      console.log(
        "Error fetchMyProducts:",
        error.response?.data || error.message
      );
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders);
      console.log(res.data.orders);
    } catch (error) {}
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading your experience...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeText}>
        Hi, {username ? username : "Guest Vendor"} 👋
      </h1>

      <h2 className={styles.sectionTitle}>My Products</h2>

      <div className={styles.productGrid}>
        {items.map((item) => (
          <div key={item._id} className={styles.cardWrapper}>
            <ProductCard product={item} />
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Orders</h2>

      <div style={{ marginTop: "20px" }}>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => <OrderCard key={order._id} order={order} />)
        )}
      </div>

      <hr
        style={{ border: "0", borderTop: "1px solid #eee", margin: "40px 0" }}
      />

      <hr
        style={{ border: "0", borderTop: "1px solid #eee", margin: "40px 0" }}
      />
    </div>
  );
};

export default VendorDashboard;
