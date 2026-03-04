import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Profile.module.css";

const Profile = () => {
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // GET Profile from localStorage (since we can't touch backend)
        const storedProfile = localStorage.getItem("deliveryPartner");
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        } else {
          // If no profile in local storage, maybe redirect to login or show limited info
          // For now, we'll just leave it null or maybe try to decode token if possible
          // But token usually only has ID.
          // We can't fetch /me as it doesn't exist for delivery partners in the original backend.
        }

        // Fetch Orders
        const ordersRes = await axios.get("/api/delivery/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "darkgreen";
      case "out-for-delivery":
        return "green";
      case "confirmed":
        return "blue";
      case "pending":
        return "orange";
      case "cancelled":
        return "#ff4d4f";
      default:
        return "#333";
    }
  };

  if (loading)
    return <div className={styles.loadingText}>Loading Profile...</div>;
  if (error) return <div className={styles.errorText}>{error}</div>;
  if (!profile)
    return (
      <div className={styles.errorText}>
        Profile information not found. Please logout and login again.
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <div className={styles.profileTop}>
          <div className={styles.avatar}>
            <div className={styles.avatarFallback}>🛵</div>
          </div>
          <div>
            <h2>
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p>{profile?.email}</p>
            <p>{profile?.phone}</p>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Vehicle Type</span>
            <span className={styles.infoValue}>{profile?.vehicleType}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Vehicle Number</span>
            <span className={styles.infoValue}>{profile?.vehicleNumber}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.infoValue}>{profile?.status}</span>
          </div>
        </div>
      </div>

      <h3 className={styles.historyTitle}>Assigned Orders</h3>
      {orders.length === 0 ? (
        <p className={styles.loadingText}>No assigned orders yet.</p>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order) => (
            <li key={order._id} className={styles.orderCard}>
              <div>
                <h4 className={styles.orderHeader}>
                  Order #{order._id.slice(-6)}
                </h4>
                <p className={styles.orderMeta}>
                  <strong>Date:</strong> {formatDate(order.createdAt)}
                </p>
                <p className={styles.orderMeta}>
                  <strong>Customer:</strong> {order.user?.name || "Unknown"}
                </p>
                <p className={styles.orderMeta}>
                  <strong>Status:</strong>{" "}
                  <span
                    className={styles.statusLabel}
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </p>
                {/* Products snippet */}
                {order.products && order.products.length > 0 && (
                  <ul className={styles.itemList}>
                    {order.products.slice(0, 2).map((item, idx) => (
                      <li key={idx}>
                        {item.vendorProduct?.name || "Product"} ×{" "}
                        {item.quantity}
                      </li>
                    ))}
                    {order.products.length > 2 && (
                      <li>+ {order.products.length - 2} more items</li>
                    )}
                  </ul>
                )}
              </div>
              <div className={styles.totalPrice}>
                ₹{(order.totalPrice || 0).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
