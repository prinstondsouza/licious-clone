import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Vendors.module.css";

const Vendors = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vendors, setVendors] = useState([]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/vendors/get-all-vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const vendorsData = res.data?.vendors || res.data || [];
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
    } catch (err) {
      console.error("Get Vendors Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load vendors");
      toast.error("Failed to load vendors", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId, status) => {
    try {
      const actionText =
        status === "approved"
          ? "approving"
          : status === "rejected"
          ? "rejecting"
          : "updating";

      const toastId = toast.loading(`Please wait, ${actionText} vendor...`, {
        position: "top-center",
      });

      await axios.put(
        `/api/vendors/update-status/${vendorId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.update(toastId, {
        render: `Vendor ${status} successfully`,
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      setVendors((prev) =>
        prev.map((v) => (v._id === vendorId ? { ...v, status } : v))
      );
    } catch (err) {
      console.error("Update Vendor Status Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to update status", {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return styles.statusApproved;
    if (s === "rejected") return styles.statusRejected;
    return styles.statusPending;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading vendors...</p>
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
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className={styles.title}>Vendors Management</h2>
      </div>

      {vendors.length === 0 ? (
        <p className={styles.emptyText}>No vendors found.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Owner Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Address</th>
                <th className={styles.actionsHead}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.storeName || "-"}</td>
                  <td>{vendor.ownerName || "-"}</td>
                  <td>{vendor.email || "-"}</td>
                  <td>{vendor.phone || "-"}</td>

                  <td>
                    <span
                      className={`${styles.statusPill} ${getStatusClass(
                        vendor.status
                      )}`}
                    >
                      {vendor.status || "pending"}
                    </span>
                  </td>

                  <td className={styles.addressCell}>
                    {vendor.address || "-"}
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => navigate(`/vendors/${vendor._id}`)}
                      >
                        View
                      </button>

                      <button
                        className={styles.approveBtn}
                        onClick={() =>
                          updateVendorStatus(vendor._id, "approved")
                        }
                        disabled={
                          (vendor.status || "").toLowerCase() === "approved"
                        }
                        title={
                          (vendor.status || "").toLowerCase() === "approved"
                            ? "Already approved"
                            : "Approve vendor"
                        }
                      >
                        Approve
                      </button>

                      <button
                        className={styles.rejectBtn}
                        onClick={() =>
                          updateVendorStatus(vendor._id, "rejected")
                        }
                        disabled={
                          (vendor.status || "").toLowerCase() === "rejected"
                        }
                        title={
                          (vendor.status || "").toLowerCase() === "rejected"
                            ? "Already rejected"
                            : "Reject vendor"
                        }
                      >
                        Reject
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

export default Vendors;
