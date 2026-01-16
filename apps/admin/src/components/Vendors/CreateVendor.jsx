import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import styles from "./CreateVendor.module.css";

const CreateVendor = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    addressString: "",
    latitude: "",
    longitude: "",
    documents: "",
    city: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Convert documents string -> array
      const payload = {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        documents: formData.documents
          ? formData.documents.split(",").map((d) => d.trim())
          : [],
      };

      await axios.post("/api/vendors/create-vendor", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Vendor created successfully", { position: "top-center" });
      navigate("/admin/vendors");
    } catch (error) {
      console.error("Create Vendor Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Failed to create vendor";
      toast.error(errorMsg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className={styles.title}>Create Vendor</h2>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="Fresh Meat Store"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Alice Vendor"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vendor@example.com"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9988776655"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Address</label>
              <input
                type="text"
                name="addressString"
                value={formData.addressString}
                onChange={handleChange}
                placeholder="456 Market Road"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="12.9352"
                className={styles.inputField}
                required
              />
            </div>

            <div>
              <label className={styles.label}>Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="77.6245"
                className={styles.inputField}
                required
              />
            </div>
          </div>

          <div className={styles.full}>
            <label className={styles.label}>Documents (comma separated links)</label>
            <textarea
              name="documents"
              value={formData.documents}
              onChange={handleChange}
              placeholder="doc1_link, doc2_link"
              className={`${styles.inputField} ${styles.textArea}`}
            />
          </div>

          <div className={styles.full}>
            <label className={styles.label}>City</label>
            <textarea
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Koramangala"
              className={`${styles.inputField}`}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => navigate("/admin/vendors")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVendor;
