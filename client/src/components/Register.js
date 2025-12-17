import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  const [formData, setFormData] = useState({
    // common
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",

    // vendor
    storeName: "",
    ownerName: "",
    documents: "",

    // delivery
    vehicleType: "",
    vehicleNumber: "",

    latitude: 12.9716,
    longitude: 77.5946,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = "";
      let payload = {};

      if (role === "user") {
        url = "/api/auth/user/register";
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        };
      }

      if (role === "vendor") {
        url = "/api/auth/vendor/register";
        payload = {
          storeName: formData.storeName,
          ownerName: formData.ownerName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          documents: formData.documents,
          latitude: formData.latitude,
          longitude: formData.longitude,
        };
      }

      if (role === "delivery") {
        url = "/api/auth/delivery/register";
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber,
          latitude: formData.latitude,
          longitude: formData.longitude,
        };
      }

      await axios.post(url, payload);

      alert(
        role === "user"
          ? "Registration successful. Please login."
          : "Registration submitted. Waiting for admin approval."
      );

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  };

  return (
    <div style={{ maxWidth: "420px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", color: "#d92662" }}>Register</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
        <option value="user">User</option>
        <option value="vendor">Vendor</option>
        <option value="delivery">Delivery Partner</option>
      </select>

      <form onSubmit={handleSubmit}>
        {(role === "user" || role === "delivery") && (
          <input name="name" placeholder="Full Name" onChange={handleChange} style={inputStyle} required />
        )}

        {role === "vendor" && (
          <>
            <input name="storeName" placeholder="Store Name" onChange={handleChange} style={inputStyle} required />
            <input name="ownerName" placeholder="Owner Name" onChange={handleChange} style={inputStyle} required />
          </>
        )}

        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} style={inputStyle} required />

        {role === "user" || role === "vendor" ? (
          <textarea name="address" placeholder="Address" onChange={handleChange} style={inputStyle} />
        ) : null}

        {role === "vendor" && (
          <input name="documents" placeholder="Documents URL / ID" onChange={handleChange} style={inputStyle} />
        )}

        {role === "delivery" && (
          <>
            <input name="vehicleType" placeholder="Vehicle Type" onChange={handleChange} style={inputStyle} required />
            <input name="vehicleNumber" placeholder="Vehicle Number" onChange={handleChange} style={inputStyle} />
          </>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#d92662",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;
