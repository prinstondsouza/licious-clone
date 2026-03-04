import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./DeliveryPartners.module.css";

const DeliveryPartners = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/delivery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.deliveryPartners || res.data || [];
      setPartners(data);
    } catch (err) {
      console.error(
        "Fetch Delivery Partners Error:",
        err.response?.data || err.message,
      );
      setError(
        err.response?.data?.message || "Failed to load delivery partners",
      );
      toast.error("Failed to load delivery partners", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (partnerId, status) => {
    try {
      setUpdatingId(partnerId);

      await axios.put(
        `/api/delivery/status/${partnerId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(`Partner ${status}`, { position: "top-center" });

      // Update UI instantly
      setPartners((prev) =>
        prev.map((p) => (p._id === partnerId ? { ...p, status } : p)),
      );
    } catch (err) {
      console.error("Update Status Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update status", {
        position: "top-center",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading delivery partners...</p>
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
        <h2 className={styles.title}>Delivery Partners</h2>
        <p className={styles.subtitle}>Approve or reject delivery partners</p>
      </div>

      {partners.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>No delivery partners found.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {partners.map((p) => (
                <tr key={p._id}>
                  <td>{p.name || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>{p.phone || "-"}</td>
                  <td>
                    <div className={styles.vehicleBox}>
                      <p className={styles.vehicleType}>
                        {p.vehicleType || "-"}
                      </p>
                      <p className={styles.vehicleNumber}>
                        {p.vehicleNumber || "-"}
                      </p>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        p.status === "approved"
                          ? styles.approved
                          : p.status === "rejected"
                            ? styles.rejected
                            : styles.pending
                      }`}
                    >
                      {p.status || "pending"}
                    </span>
                  </td>

                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.approveBtn}
                        disabled={updatingId === p._id}
                        onClick={() => updateStatus(p._id, "approved")}
                      >
                        {updatingId === p._id ? "Updating..." : "Approve"}
                      </button>

                      <button
                        className={styles.rejectBtn}
                        disabled={updatingId === p._id}
                        onClick={() => updateStatus(p._id, "rejected")}
                      >
                        {updatingId === p._id ? "Updating..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;
