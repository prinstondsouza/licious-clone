import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Register.module.css";
import LocationModal from "../Location/LocationModal";

const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
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
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/vendor/register", formData);
      toast.success("Registration Successful! Please Login.", {
        position: "top-center",
      });
      navigate("/login");
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message,
      );
      const errorMsg = error.response?.data?.message || "Registration Failed";
      toast.error(errorMsg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = ({ addr, lat, lon }) => {
    setFormData({
      ...formData,
      addressString: addr,
      latitude: lat,
      longitude: lon,
    });
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.title}>Register as Vendor</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="storeName"
          placeholder="Store Name"
          value={formData.storeName}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        <input
          type="text"
          name="ownerName"
          placeholder="Owner Name"
          value={formData.ownerName}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        <textarea
          name="address"
          placeholder="Store Address"
          value={formData.address}
          onChange={handleChange}
          className={`${styles.inputField} ${styles.textArea}`}
          required
        />

        <button
          type="button"
          className={styles.registerButton}
          onClick={() => setLocationModalOpen(true)}
        >
          Location
        </button>

        {locationModalOpen && (
          <LocationModal
            onClose={() => setLocationModalOpen(false)}
            onSave={handleLocation}
          />
        )}

        <input
          type="text"
          name="documents"
          placeholder="Documents (comma separated URLs)"
          value={formData.documents}
          onChange={handleChange}
          className={styles.inputField}
        />

        <button
          type="submit"
          className={styles.registerButton}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Vendor Account"}
        </button>
      </form>

      <p className={styles.footerText}>
        Already have an account? <Link onClick={onLoginClick}>Login here</Link>
      </p>
    </div>
  );
};

export default Register;
