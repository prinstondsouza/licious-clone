import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./VendorDetails.module.css";

const VendorDetails = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");

  const fetchVendor = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`/api/vendors/get-vendor-by-id/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // supports: res.data.vendor OR res.data
      const vendorData = res.data?.vendors || res.data;
      setVendor(vendorData);
    } catch (err) {
      console.error("Vendor Details Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load vendor details");
      toast.error("Failed to load vendor details", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (status) => {
    try {
      const toastId = toast.loading("Updating vendor status...", {
        position: "top-center",
      });

      await axios.put(
        `/api/update-status/${id}`,
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

      setVendor((prev) => ({ ...prev, status }));
    } catch (err) {
      console.error("Update Status Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update status", {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    fetchVendor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return styles.approved;
    if (s === "rejected") return styles.rejected;
    return styles.pending;
  };

  const documents = Array.isArray(vendor?.documents)
    ? vendor.documents
    : typeof vendor?.documents === "string" && vendor.documents.trim()
    ? vendor.documents.split(",").map((d) => d.trim())
    : [];

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading vendor details...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error || "Vendor not found"}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className={styles.headerRight}>
          <span
            className={`${styles.statusBadge} ${getStatusClass(vendor.status)}`}
          >
            {vendor.status || "pending"}
          </span>
        </div>
      </div>

      <h2 className={styles.title}>{vendor.storeName || "Vendor Details"}</h2>
      <p className={styles.subtitle}>
        Manage vendor profile and approval status
      </p>

      {/* Info Card */}
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Store Name</span>
          <span className={styles.value}>{vendor.storeName || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Owner Name</span>
          <span className={styles.value}>{vendor.ownerName || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{vendor.email || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Phone</span>
          <span className={styles.value}>{vendor.phone || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Address</span>
          <span className={styles.value}>{vendor.address || "-"}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Location</span>
          <span className={styles.value}>
            {vendor.latitude && vendor.longitude
              ? `${vendor.latitude}, ${vendor.longitude}`
              : "-"}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Created</span>
          <span className={styles.value}>
            {vendor.createdAt
              ? new Date(vendor.createdAt).toLocaleDateString()
              : "-"}
          </span>
        </div>
      </div>

      {/* Documents */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Documents</h3>

        {documents.length === 0 ? (
          <p className={styles.emptyText}>No documents uploaded.</p>
        ) : (
          <ul className={styles.docList}>
            {documents.map((doc, index) => (
              <li key={`${doc}-${index}`} className={styles.docItem}>
                <a
                  className={styles.docLink}
                  href={doc}
                  target="_blank"
                  rel="noreferrer"
                >
                  Document {index + 1}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.approveBtn}
          onClick={() => updateVendorStatus("approved")}
          disabled={(vendor.status || "").toLowerCase() === "approved"}
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
          onClick={() => updateVendorStatus("rejected")}
          disabled={(vendor.status || "").toLowerCase() === "rejected"}
          title={
            (vendor.status || "").toLowerCase() === "rejected"
              ? "Already rejected"
              : "Reject vendor"
          }
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default VendorDetails;
