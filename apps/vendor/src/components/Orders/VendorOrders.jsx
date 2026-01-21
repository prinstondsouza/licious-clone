import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "./OrderCard";
import styles from "./VendorOrders.module.css";

const VendorOrders = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/orders/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders || []);
    } catch (error) {
      console.log("Error fetchOrders:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className={styles.loading}>Loading orders...</p>;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        <h2 className={styles.title}>Vendor Orders</h2>

        {orders.length === 0 ? (
          <p className={styles.empty}>No orders found</p>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
