import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import styles from "./OrderDetails.module.css";

const OrderDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products/vendor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res.data.order);
    } catch (error) {
      console.log("Error fetchOrder:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <p className={styles.loading}>Loading order...</p>;
  if (!order) return <p className={styles.empty}>Order not found</p>;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        <Link to="/orders" className={styles.backBtn}>
          ← Back to Orders
        </Link>

        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Order #{order._id.slice(-6)}</h2>
            <span className={`${styles.status} ${styles[order.status]}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>

          <p className={styles.meta}>
            <b>Customer:</b> {order.user?.name} ({order.user?.email})
          </p>

          <p className={styles.meta}>
            <b>Delivery Address:</b> {order.deliveryAddress}
          </p>

          <p className={styles.meta}>
            <b>Date:</b> {new Date(order.createdAt).toLocaleString()}
          </p>

          <div className={styles.itemsSection}>
            <h3 className={styles.itemsTitle}>Items</h3>

            {order.products.map((p) => (
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

          <div className={styles.totalRow}>
            <h3 className={styles.total}>Total: ₹{order.totalPrice}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
