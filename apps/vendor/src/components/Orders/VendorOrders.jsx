import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import OrderCard from "./OrderCard";
import styles from "./VendorOrders.module.css";

const VendorOrders = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // ✅ filter status state
  const [filterStatus, setFilterStatus] = useState("all");

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

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return orders;
    return orders.filter(
      (o) => (o.status || "").toLowerCase() === filterStatus,
    );
  }, [orders, filterStatus]);

  if (loading) return <p className={styles.loading}>Loading orders...</p>;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h2 className={styles.title}>Vendor Orders</h2>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className={styles.empty}>No orders found</p>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
