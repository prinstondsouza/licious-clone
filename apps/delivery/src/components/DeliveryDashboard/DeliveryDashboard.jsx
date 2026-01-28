import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./DeliveryDashboard.module.css";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/delivery/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = res?.data || [];
        setOrders(ordersData);
      } catch (err) {
        console.error(
          "Delivery Partner Dashboard Error:",
          err.response?.data || err.message,
        );
        setError(err.response?.data?.message || "Failed to load dashboard");
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    setStats({
      totalOrders: orders.length,
      totalDelivered: orders.filter((o) => o.status === "delivered").length,
      totalPending: orders.filter((o) => o.status === "out-for-delivery")
        .length,
    });
  }, [orders]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h2 className={styles.title}>Delivery Partner Dashboard</h2>
        <p className={styles.subtitle}>
          Overview of stats
        </p>
      </div>

      <div
        className={styles.card}
        onClick={() => {
          navigate("/orders");
        }}
      >
        <p className={styles.cardLabel}>Total Orders</p>
        <h3 className={styles.cardValue}>{stats?.totalOrders ?? 0}</h3>
      </div>

      <div
        className={styles.card}
        onClick={() => {
          navigate("/orders");
        }}
      >
        <p className={styles.cardLabel}>Total Pending Orders</p>
        <h3 className={styles.cardValue}>{stats?.totalPending ?? 0}</h3>
      </div>

      <div
        className={styles.card}
        onClick={() => {
          navigate("/orders");
        }}
      >
        <p className={styles.cardLabel}>Total Delivered Orders</p>
        <h3 className={styles.cardValue}>{stats?.totalDelivered ?? 0}</h3>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
