import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./AdminOrders.module.css";

const AdminOrders = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState("");

  const [savingStatusId, setSavingStatusId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  // Local UI state
  const [statusMap, setStatusMap] = useState({});
  const [partnerMap, setPartnerMap] = useState({});

  const orderStatuses = [
    "pending",
    "confirmed",
    "processing",
    "out-for-delivery",
    "delivered",
    "cancelled",
  ];

  // ✅ Fetch Orders + Delivery Partners
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersRes, partnersRes] = await Promise.all([
          axios.get("/api/orders/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/delivery/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const ordersData = ordersRes.data?.orders || ordersRes.data || [];
        const partnersData =
          partnersRes.data?.deliveryPartners || partnersRes.data || [];

        setOrders(ordersData);
        setPartners(partnersData);

        // Pre-fill dropdown maps
        const initialStatusMap = {};
        const initialPartnerMap = {};

        ordersData.forEach((o) => {
          initialStatusMap[o._id] = o.status || "pending";
          initialPartnerMap[o._id] = o.deliveryPartner?._id || "";
        });

        setStatusMap(initialStatusMap);
        setPartnerMap(initialPartnerMap);
      } catch (err) {
        console.error("Admin Orders Error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load orders");
        toast.error("Failed to load orders", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const handleStatusChange = (orderId, value) => {
    setStatusMap((prev) => ({ ...prev, [orderId]: value }));
  };

  const handlePartnerChange = (orderId, value) => {
    setPartnerMap((prev) => ({ ...prev, [orderId]: value }));
  };

  // ✅ Update Order Status
  const saveOrderStatus = async (orderId) => {
    try {
      setSavingStatusId(orderId);

      await axios.put(
        `/api/orders/status/${orderId}`,
        { status: statusMap[orderId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order status updated ✅", { position: "top-center" });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: statusMap[orderId] } : o
        )
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

  // ✅ Assign Delivery Partner
  const assignPartner = async (orderId) => {
    try {
      setAssigningId(orderId);

      const partnerId = partnerMap[orderId];
      if (!partnerId) {
        toast.error("Please select a delivery partner first", {
          position: "top-center",
        });
        return;
      }

      await axios.post(
        `/api/delivery/assign`,
        { orderId, partnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Delivery partner assigned ✅", { position: "top-center" });

      const assignedPartner = partners.find((p) => p._id === partnerId);

      // Update UI instantly
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, deliveryPartner: assignedPartner } : o
        )
      );
    } catch (err) {
      console.error("Assign Partner Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to assign partner", {
        position: "top-center",
      });
    } finally {
      setAssigningId(null);
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
                <th>Delivery Partner</th>
                <th>Actions</th>
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
                  o.totalAmount ??
                  o.totalPrice ??
                  o.total ??
                  o.grandTotal ??
                  0;

                const assignedPartnerName =
                  o.deliveryPartner?.name || "Not Assigned";

                return (
                  <tr key={o._id}>
                    <td className={styles.orderId}>#{orderIdShort}</td>
                    <td>{userName}</td>
                    <td>{vendorName}</td>
                    <td className={styles.total}>₹{Number(total).toFixed(0)}</td>

                    {/* ✅ Status Dropdown */}
                    <td>
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
                    </td>

                    {/* ✅ Assign Partner */}
                    <td>
                      <div className={styles.partnerBox}>
                        <p className={styles.partnerName}>
                          {assignedPartnerName}
                        </p>

                        <select
                          className={styles.select}
                          value={partnerMap[o._id] || ""}
                          onChange={(e) =>
                            handlePartnerChange(o._id, e.target.value)
                          }
                        >
                          <option value="">Select Partner</option>
                          {partners.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.vehicleType})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* ✅ Actions */}
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.saveBtn}
                          onClick={() => saveOrderStatus(o._id)}
                          disabled={savingStatusId === o._id}
                        >
                          {savingStatusId === o._id ? "Saving..." : "Save Status"}
                        </button>

                        <button
                          className={styles.assignBtn}
                          onClick={() => assignPartner(o._id)}
                          disabled={assigningId === o._id}
                        >
                          {assigningId === o._id ? "Assigning..." : "Assign"}
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
    </div>
  );
};

export default AdminOrders;
