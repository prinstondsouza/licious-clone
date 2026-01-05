import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LocationModal from "../Location/LocationModal";

const Navbar = () => {
  const [address, setAddress] = useState("");
  const isLoggedin = Boolean(localStorage.getItem("token"));
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cart, setCart] = useState({ items: [] });

  const totalAmount =
    cart && cart.items
      ? cart.items.reduce(
          (sum, item) => sum + (item.vendorProduct?.price || 0) * item.quantity,
          0
        )
      : 0;

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

    const closeMenu = () => setShowProfileMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart({ items: [] });
        return;
      }

      try {
        const res = await axios.get("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCart(res.data.cart);
      } catch (error) {
        console.error(
          "Fetch cart error:",
          error.response?.data || error.message
        );
      }
    };
    fetchCart();
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
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
          <Link
            to="/categories"
            style={{ textDecoration: "none", color: "#333" }}
          >
            Categories
          </Link>
          <Link to="/stores" style={{ textDecoration: "none", color: "#333" }}>
            Stores
          </Link>

          <div style={{ position: "relative" }}>
            {isLoggedin ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu((prev) => !prev);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#333",
                    fontSize: "1rem",
                  }}
                >
                  Profile
                </button>

                {showProfileMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      top: "120%",
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      width: "160px",
                      zIndex: 1000,
                    }}
                  >
                    <Link
                      to="/profile"
                      style={{
                        display: "block",
                        padding: "10px",
                        textDecoration: "none",
                        color: "#333",
                      }}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Account
                    </Link>

                    <Link
                      to="/profile"
                      style={{
                        display: "block",
                        padding: "10px",
                        textDecoration: "none",
                        color: "#333",
                      }}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Orders
                    </Link>

                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        setShowProfileMenu(false);
                        window.location.href = "/login";
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        color: "#d92662",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "#333" }}
              >
                Login
              </Link>
            )}
          </div>

          <Link to="/cart" style={{ textDecoration: "none", color: "#333" }}>
            {cart.items.length !== 0 ? `${cart.items.length} items ₹${totalAmount}` : "Cart"}
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
