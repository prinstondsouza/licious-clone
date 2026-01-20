import { useEffect, useState } from "react";
import axios from "axios";
import OrderDetailsModal from "./OrderDetailsModal";
import styles from "./Profile.module.css";
import EditProfileModal from "./EditProfileModal";
import AddressPage from "./AddressPage";
import { useUser } from "../../context/UserContext";

const Profile = () => {
  const token = localStorage.getItem("token");
  const { user, loading } = useUser();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = response.data.orders || response.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again later.");
      }
    };

    if (token) fetchOrders();
  }, [token]);

  const formatDateAndTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const email = user?.email || "";
  const phone = user?.phone || "";
  const userImage = user?.userImage || "";

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <div className={styles.profileTop}>
          <div className={styles.avatar}>
            {userImage ? (
              <img
                src={`http://localhost:5000${userImage}`}
                alt="User"
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatarFallback}>👤</div>
            )}
          </div>

          <div>
            <h2>{fullName || "Guest User"}</h2>
            <p>
              {phone} {phone && email ? "|" : ""} {email}
            </p>
          </div>
        </div>

        <button
          className={styles.editLink}
          onClick={() => setEditProfileModalOpen(true)}
        >
          Edit Profile
        </button>
      </div>

      <AddressPage />

      <h3 className={styles.historyTitle}>Order History</h3>

      {loading ? (
        <p className={styles.loadingText}>Loading...</p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : orders.length === 0 ? (
        <p className={styles.loadingText}>
          No orders found yet. Time to go shopping! 🛒
        </p>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order, index) => {
            const orderId = order._id || `order-${index}`;
            const dateString = order.createdAt || order.date;

            return (
              <li
                key={orderId}
                className={styles.orderCard}
                onClick={() => setSelectedOrder(order)}
              >
                <div>
                  <h4 className={styles.orderHeader}>
                    Order #{orderId.slice(-6)}
                  </h4>

                  <p className={styles.orderMeta}>
                    <strong>Date:</strong> {formatDateAndTime(dateString)}
                  </p>

                  <p className={styles.orderMeta}>
                    <strong>Status:</strong>{" "}
                    <span
                      className={styles.statusLabel}
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {order.status || "Processing"}
                    </span>
                  </p>

                  {order.items && order.items.length > 0 && (
                    <ul className={styles.itemList}>
                      {order.items.slice(0, 2).map((item, idx) => (
                        <li key={idx}>
                          {item.name || item.productName} × {item.quantity}
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li>+ {order.items.length - 2} more items</li>
                      )}
                    </ul>
                  )}
                </div>

                <div className={styles.totalPrice}>
                  ₹{(order.totalPrice || 0).toFixed(2)}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {editProfileModalOpen && (
        <EditProfileModal
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
