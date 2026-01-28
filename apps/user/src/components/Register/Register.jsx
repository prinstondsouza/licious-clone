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
    address: "",
    latitude: 12.9716, // Default to Bangalore
    longitude: 77.5946,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/user/register", formData);
      toast.success("Registration Successful!", {
        position: "top-center",
      });
      const res = await axios.post('/api/auth/user/login', formData);

      const token = res.data.token;
      const user = res.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('fname', user.firstName);
      localStorage.setItem('lname', user.lastName);
      localStorage.setItem('email', user.email);
      localStorage.setItem('phone', user.phone);
      navigate('/');
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message
      );
      const errorMsg = error.response?.data?.message || "Registration Failed";
      toast.error(errorMsg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.title}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          className={styles.inputField}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        <button
          type="submit"
          className={styles.registerButton}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className={styles.footerText}>
        Already have an account? <Link onClick={onLoginClick}>Login here</Link>
      </p>
    </div>
  );
};

export default Register;
