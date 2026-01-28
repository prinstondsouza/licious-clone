import React from "react";
import styles from "./OrderDetailsModal.module.css";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3 className={styles.header}>Order Details</h3>
        <hr className={styles.divider} />

        <div className={styles.detailRow}>
          <strong>Order ID</strong>
          <span>#{order._id}</span>
        </div>

        <div className={styles.detailRow}>
          <strong>Status</strong>
          <div>
            <span className={styles.statusBadge}>{order.status}</span>
          </div>
        </div>

        <div className={styles.detailRow}>
          <strong>Total Price</strong>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#d92662" }}>
            ₹{order.totalPrice}
          </span>
        </div>

        <div className={styles.detailRow}>
          <strong>Delivery Address</strong>
          <span>{order.deliveryAddress || "No address provided"}</span>
        </div>

        <div className={styles.detailRow}>
          <strong>Placed On</strong>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;