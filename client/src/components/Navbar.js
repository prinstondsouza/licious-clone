import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LocationModal from "./LocationModal";

const Navbar = () => {
  const [address, setAddress] = useState("");
  const isLoggedin = Boolean(localStorage.getItem("token"));
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAddress(res.data.user.address || "");
      } catch (error) {
        console.error(
          "Profile fetch error:",
          error.response?.data || error.message
        );
      }
    };

    fetchUserProfile();
  }, []);

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    alignItems: "center",
  };

  return (
    <>
      <nav style={navStyle}>
        {/* Logo + Location */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#d92662",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            Licious Clone
          </Link>
        </div>
        <div>
          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: "0.85rem",
              color: "#555",
              textAlign: "left",
            }}
          >
            {address ? `📍 ${address}` : "📍 Location not set"}
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search for products, categories..."
            style={{
              padding: "8px",
              width: "300px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: "20px" }}>
          {/* <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
            Home
          </Link> */}
          <Link to="/categories" style={{ textDecoration: "none", color: "#333" }}>
            Categories
          </Link>
          <Link to="/stores" style={{ textDecoration: "none", color: "#333" }}>
            Stores
          </Link>
          <Link to={isLoggedin ? "/profile" : "/login"} style={{ textDecoration: "none", color: "#333" }}>
            {isLoggedin ? "Profile" : "Login"}
          </Link>
          {/* <Link to="/register" style={{ textDecoration: "none", color: "#333" }}>
            Register
          </Link> */}
          <Link to="/cart" style={{ textDecoration: "none", color: "#333" }}>
            Cart
          </Link>
        </div>
      </nav>

      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSave={(newAddress) => setAddress(newAddress)}
        />
      )}
    </>
  );
};

export default Navbar;