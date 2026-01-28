import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Register.module.css";

const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/auth/admin/register", formData);

      toast.success("Admin Registered Successfully! Please Login.", {
        position: "top-center",
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Registration Failed";
      toast.error(errorMsg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.title}>Register as Admin</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
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
          placeholder="Phone Number (optional)"
          value={formData.phone}
          onChange={handleChange}
          className={styles.inputField}
        />

        <button
          type="submit"
          className={styles.registerButton}
          disabled={loading}
        >
          {loading ? "Creating Admin..." : "Create Admin Account"}
        </button>
      </form>

      <p className={styles.footerText}>
        Already have an account?{" "}
        <Link  onClick={onLoginClick}>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
