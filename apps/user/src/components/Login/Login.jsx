import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Use Link for SPA navigation
import { toast } from "react-toastify";
import { getUserTypeFromToken } from "../../utils/auth.js";
import styles from "./Login.module.css";

const Login = ({ isSidebar = false, onSuccess}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/user/login', formData);

      const token = res.data.token || res.data.accessToken;
      const user = res.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('email', user.email);
      localStorage.setItem('phone', user.phone);
      localStorage.setItem('fname', user.firstName);
      localStorage.setItem('lname', user.lastName);

      const userType = getUserTypeFromToken();

      toast.success('Login Successful!', { position: "top-center" });

      switch (userType) {
        case "admin":
          navigate("/admin");
          break;
        case "vendor":
          navigate("/vendor");
          break;
        case "delivery":
          navigate("/deliveryPerson");
          break;
        default:
          navigate("/");
      }

      onSuccess();

    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Invalid Credentials', { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isSidebar ? styles.sidebarContainer : styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
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
          className={styles.loginButton}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className={styles.footerText}>
        Not Registered? <Link to="/register">Register Here</Link>
      </p>
    </div>
  );
};

export default Login;