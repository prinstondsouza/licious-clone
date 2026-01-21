import React from "react";
import { Link } from "react-router-dom";
import styles from "./OrderCard.module.css";

const OrderCard = ({ order }) => {
  const { _id, user, products, totalPrice, status, createdAt } = order;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Link to={`/orders/${_id}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.topRow}>
          <h3 className={styles.orderId}>Order #{_id.slice(-6)}</h3>

          <span className={`${styles.status} ${styles[status]}`}>
            {status?.toUpperCase() || "PENDING"}
          </span>
        </div>

        <div className={styles.middleRow}>
          <p className={styles.meta}>
            <b>Customer:</b> {user?.name || "Unknown"}
          </p>

          <p className={styles.meta}>
            <b>Items:</b> {products?.length || 0}
          </p>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.date}>{formatDate(createdAt)}</p>
          <h3 className={styles.total}>₹{totalPrice}</h3>
          <p className={styles.viewText}>View →</p>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
