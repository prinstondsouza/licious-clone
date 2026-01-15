import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../Product/ProductCard";
import OrderCard from "../Orders/OrderCard";
import styles from "./VendorDashboard.module.css";

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

      setItems(res.data.vendorProducts || []);
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

      setOrders(res.data.orders || []);
    } catch (error) {
      console.log("Error fetchOrders:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchMyProducts(), fetchOrders()]);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = items.length;
    const activeProducts = items.filter((p) => p.status === "active").length;
    const outOfStock = items.filter((p) => Number(p.stock) === 0).length;

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const pendingOrders = totalOrders - deliveredOrders;

    const revenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      revenue,
    };
  }, [items, orders]);

  const productsPreview = items.slice(0, 3);
  const ordersPreview = orders.slice(0, 3);

  if (loading) {
    return <div className={styles.loading}>Loading your dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcomeText}>
            Hi, {username ? username : "Guest Vendor"} 👋
          </h1>
          <p className={styles.subtitle}>
            Here’s your store overview and latest updates.
          </p>
        </div>

        <div className={styles.quickActions}>
          <Link className={styles.actionBtn} to="/add-from-catalog">
            + Add from Catalog
          </Link>
          <Link className={styles.actionBtnOutline} to="/create-product">
            + Create Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Revenue (Delivered)</p>
          <h2 className={styles.statValue}>₹{stats.revenue}</h2>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Orders</p>
          <h2 className={styles.statValue}>{stats.totalOrders}</h2>
          <p className={styles.statSub}>
            {stats.deliveredOrders} delivered • {stats.pendingOrders} pending
          </p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Products</p>
          <h2 className={styles.statValue}>{stats.totalProducts}</h2>
          <p className={styles.statSub}>
            {stats.activeProducts} active • {stats.outOfStock} out of stock
          </p>
        </div>
      </div>

      {/* Products Preview */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Products</h2>
          <Link className={styles.viewAllLink} to="/inventory">
            View All →
          </Link>
        </div>

        {productsPreview.length === 0 ? (
          <p className={styles.emptyText}>No products found.</p>
        ) : (
          <div className={styles.productGrid}>
            {productsPreview.map((item) => (
              <div key={item._id} className={styles.cardWrapper}>
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders Preview */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link className={styles.viewAllLink} to="/orders">
            View All →
          </Link>
        </div>

        {ordersPreview.length === 0 ? (
          <p className={styles.emptyText}>No orders found.</p>
        ) : (
          <div className={styles.ordersList}>
            {ordersPreview.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
