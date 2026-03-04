import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Profile.module.css";
const Profile = () => {
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("api/vendors/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const vendor = res.data.vendor;

      setAddress(vendor.address);
      setEmail(vendor.email);
      setPhone(vendor.phone);
      setStatus(vendor.status);
      setUsername(vendor.ownerName);
      setStoreName(vendor.storeName);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    setLoading(false);
  }, []);

  if (loading) {
    return <div className={styles.loadingText}>Loading your experience...</div>;
  }

  return (
    <div className={styles.container}>
      {loading ? (
        <p className={styles.loading}>Loading vendor details...</p>
      ) : (
        <>
          <div className={styles.header}>
            <h2 className={styles.username}>{username || "Vendor"}</h2>
            <span
              className={`${styles.status} ${
                status === "approved"
                  ? styles.approved
                  : status === "pending"
                    ? styles.pending
                    : styles.rejected
              }`}
            >
              {status || "pending"}
            </span>
          </div>

          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>Store Name</span>
              <span className={styles.value}>{storeName || "-"}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{email || "-"}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{phone || "-"}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Address</span>
              <span className={styles.value}>{address || "-"}</span>
            </div>
          </div>

          {status !== "approved" && (
            <div className={styles.notice}>
              <p>
                Your store is currently under review. You will be able to add
                products once approved by admin.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
