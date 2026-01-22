import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../Product/ProductCard";
import OrderCard from "../Orders/OrderCard";
import {
  ShoppingBag,
  ClipboardList,
  Wallet,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  Package,
} from "lucide-react";
import styles from "./VendorDashboard.module.css";

const VendorDashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState("");

  const fetchMyProducts = async () => {
    const res = await axios.get("/api/products/vendor/inventory", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems(res.data.vendorProducts || []);
  };

  const fetchOrders = async () => {
    const res = await axios.get("/api/orders/vendor", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrders(res.data.orders || []);
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMyProducts(), fetchOrders()]);
    } catch (error) {
      console.log(
        "VendorDashboard Error:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalProducts = items.length;
    const activeProducts = items.filter((p) => p.status === "active").length;
    const outOfStock = items.filter((p) => Number(p.stock) === 0).length;

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered",
    ).length;

    const pendingOrders = orders.filter((o) =>
      ["pending", "placed", "processing", "accepted", "confirmed"].includes(
        String(o.status || "").toLowerCase(),
      ),
    ).length;

    const revenue = orders
      .filter((o) => String(o.status).toLowerCase() === "delivered")
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
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonStats} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.welcomeText}>
              Hi, {username ? username : "Vendor"} 👋
            </h1>
            <p className={styles.subtitle}>
              Here’s your store overview and latest updates.
            </p>
          </div>

          <div className={styles.quickActions}>
            <Link className={styles.actionBtn} to="/add-from-catalog">
              <PlusCircle size={16} />
              Add from Catalog
            </Link>

            <Link className={styles.actionBtnOutline} to="/create-product">
              <Package size={16} />
              Create Product
            </Link>

            <button className={styles.refreshBtn} onClick={loadDashboard}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <button className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>
                <Wallet size={18} />
              </span>
              <span className={styles.statPill}>Delivered</span>
            </div>

            <p className={styles.statLabel}>Revenue</p>
            <h2 className={styles.statValue}>₹{stats.revenue}</h2>
            <p className={styles.statSub}>Total earned from delivered orders</p>
          </button>

          <button
            className={styles.statCard}
            onClick={() => navigate("/orders")}
          >
            <div className={styles.statTop}>
              <span className={styles.statIcon}>
                <ClipboardList size={18} />
              </span>
              <span className={`${styles.statPill} ${styles.pillWarn}`}>
                {stats.pendingOrders} pending
              </span>
            </div>

            <p className={styles.statLabel}>Orders</p>
            <h2 className={styles.statValue}>{stats.totalOrders}</h2>
            <p className={styles.statSub}>
              {stats.deliveredOrders} delivered • {stats.pendingOrders} pending
            </p>
          </button>

          <button
            className={styles.statCard}
            onClick={() => navigate("/inventory")}
          >
            <div className={styles.statTop}>
              <span className={styles.statIcon}>
                <ShoppingBag size={18} />
              </span>
              <span className={`${styles.statPill} ${styles.pillDanger}`}>
                {stats.outOfStock} out
              </span>
            </div>

            <p className={styles.statLabel}>Products</p>
            <h2 className={styles.statValue}>{stats.totalProducts}</h2>
            <p className={styles.statSub}>
              {stats.activeProducts} active • {stats.outOfStock} out of stock
            </p>
          </button>
        </div>

        {/* Products Preview */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>My Products</h2>
              <p className={styles.sectionSub}>
                Recently added to your inventory
              </p>
            </div>

            <Link className={styles.viewAllLink} to="/inventory">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {productsPreview.length === 0 ? (
            <div className={styles.emptyBox}>
              <p className={styles.emptyTitle}>No products found</p>
              <p className={styles.emptyText}>
                Add products from catalog or create new ones.
              </p>
            </div>
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
            <div>
              <h2 className={styles.sectionTitle}>Recent Orders</h2>
              <p className={styles.sectionSub}>
                Latest activity from customers
              </p>
            </div>

            <Link className={styles.viewAllLink} to="/orders">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {ordersPreview.length === 0 ? (
            <div className={styles.emptyBox}>
              <p className={styles.emptyTitle}>No recent orders</p>
              <p className={styles.emptyText}>
                Orders will show up here when customers purchase.
              </p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {ordersPreview.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.footerSpace} />
      </div>
    </div>
  );
};

export default VendorDashboard;
