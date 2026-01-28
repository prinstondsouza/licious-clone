import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { User, Package, Calendar, ArrowRight } from "lucide-react";
import styles from "./OrderCard.module.css";

const OrderCard = ({ order }) => {
  const { _id, user, products, totalPrice, status, createdAt } = order;

  const normalizedStatus = useMemo(() => {
    const s = String(status || "pending")
      .toLowerCase()
      .trim();

    if (["delivered", "completed"].includes(s)) return "delivered";
    if (["cancelled", "canceled", "rejected"].includes(s)) return "cancelled";
    if (["out_for_delivery", "out for delivery", "picked"].includes(s))
      return "out_for_delivery";
    if (["processing", "accepted", "confirmed", "packed"].includes(s))
      return "processing";

    return "pending";
  }, [status]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Link to={`/orders/${_id}`} className={styles.link}>
      <div className={styles.card}>
        {/* top */}
        <div className={styles.topRow}>
          <div className={styles.leftTop}>
            <p className={styles.orderId}>Order #{String(_id).slice(-6)}</p>
            <p className={styles.smallText}>
              <User size={14} />
              {user?.name || "Unknown Customer"}
            </p>
          </div>

          <span
            className={`${styles.statusPill} ${styles[`status_${normalizedStatus}`]}`}
          >
            {normalizedStatus.replaceAll("_", " ").toUpperCase()}
          </span>
        </div>

        {/* mid */}
        <div className={styles.middleRow}>
          <div className={styles.metaChip}>
            <Package size={14} />
            <span>
              <b>{products?.length || 0}</b> items
            </span>
          </div>

          <div className={styles.metaChip}>
            <Calendar size={14} />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        {/* bottom */}
        <div className={styles.bottomRow}>
          <div className={styles.totalBox}>
            <p className={styles.totalLabel}>Total</p>
            <p className={styles.totalValue}>₹{totalPrice || 0}</p>
          </div>

          <span className={styles.viewBtn}>
            View <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
