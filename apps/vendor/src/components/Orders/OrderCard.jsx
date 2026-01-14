import React from "react";
import styles from "./OrderCard.module.css";

const OrderCard = ({ order }) => {
  const {
    _id,
    user,
    products,
    totalPrice,
    status,
    deliveryAddress,
    createdAt,
  } = order;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <h3 className={styles.orderId}>Order #{_id.slice(-6)}</h3>

        <span className={`${styles.status} ${styles[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <p className={styles.meta}>
        <b>Customer:</b> {user?.name} ({user?.email})
      </p>

      <p className={styles.meta}>
        <b>Address:</b> {deliveryAddress}
      </p>

      <p className={styles.meta}>
        <b>Date:</b> {formatDate(createdAt)}
      </p>

      <div className={styles.itemsSection}>
        <h4 className={styles.itemsTitle}>Items</h4>

        {products.map((p) => (
          <div key={p._id} className={styles.itemRow}>
            <span className={styles.itemName}>
              {p.vendorProduct?.name || "Unnamed Product"}
            </span>
            <span className={styles.itemQty}>x {p.quantity}</span>
            <span className={styles.itemPrice}>
              ₹{p.vendorProduct?.price || 0}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.bottomRow}>
        <h3 className={styles.total}>Total: ₹{totalPrice}</h3>
      </div>
    </div>
  );
};

export default OrderCard;
