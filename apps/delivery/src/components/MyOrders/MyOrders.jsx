import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import OrderDetailsModal from "./OrderDetailsModal";
import styles from "./MyOrders.module.css";

const MyOrders = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [deliveryBy, setDeliveryBy] = useState(null);

  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [savingStatusId, setSavingStatusId] = useState(null);

  const [statusMap, setStatusMap] = useState({});

  const orderStatuses = [
    "pending",
    "out-for-delivery",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const ordersRes = await axios.get("/api/delivery/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = ordersRes?.data || [];
        setOrders(ordersData);

        const initialStatusMap = {};

        ordersData.forEach((o) => {
          initialStatusMap[o._id] = o.status || "undefined";
          setDeliveryBy(o.deliveryBy);
        });

        setStatusMap(initialStatusMap);
      } catch (err) {
        console.error("Admin Orders Error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load orders");
        toast.error("Failed to load orders", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleStatusChange = (orderId, value) => {
    setStatusMap((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const saveOrderStatus = async (orderId) => {
    try {
      setSavingStatusId(orderId);

      const payload = {
        status: statusMap[orderId],
        orderId: orderId,
        deliveryPartnerId: deliveryBy,
      };

      await axios.put(`/api/delivery/update-status`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order status updated ✅", { position: "top-center" });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: statusMap[orderId] } : o,
        ),
      );
    } catch (err) {
      console.error("Update Status Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update status", {
        position: "top-center",
      });
    } finally {
      setSavingStatusId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h2 className={styles.title}>Orders Management</h2>
        <p className={styles.subtitle}>
          Update order status and assign delivery partners
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No orders found.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Vendor</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => {
                const orderIdShort = o._id?.slice(-6) || "-";
                const userName =
                  o.user?.name || o.userName || o.customerName || "-";
                const vendorName =
                  o.vendor?.storeName ||
                  o.vendor?.ownerName ||
                  o.vendorName ||
                  "-";

                const total =
                  o.totalAmount ?? o.totalPrice ?? o.total ?? o.grandTotal ?? 0;

                const assignedPartnerName =
                  o.deliveryPartner?.name || "Not Assigned";

                return (
                  <tr
                    key={o._id}
                    onClick={() => handleOpenModal(o)}
                    className={styles.rowClickable}
                  >
                    <td className={styles.orderId}>#{orderIdShort}</td>
                    <td>{userName}</td>
                    <td>{vendorName}</td>
                    <td className={styles.total}>
                      ₹{Number(total).toFixed(0)}
                    </td>

                    <td>
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          className={styles.select}
                          value={statusMap[o._id] || "pending"}
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                        >
                          {orderStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <div
                        className={styles.actionBtns}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={styles.saveBtn}
                          onClick={() => saveOrderStatus(o._id)}
                          disabled={savingStatusId === o._id}
                        >
                          {savingStatusId === o._id
                            ? "Saving..."
                            : "Save Status"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModal}
          statusMap={statusMap}
          handleStatusChange={handleStatusChange}
          saveOrderStatus={saveOrderStatus}
          savingStatusId={savingStatusId}
          orderStatuses={orderStatuses}
        />
      )}
    </div>
  );
};

export default MyOrders;
