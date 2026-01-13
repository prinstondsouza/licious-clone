import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LocationModal from "../Location/LocationModal";
import styles from "./Navbar.module.css";
import { Store, Layers, MapPin, ShoppingCart, User } from "lucide-react";

const Navbar = ({ onCartClick, onLoginClick }) => {
  const [address, setAddress] = useState("");
  const isLoggedin = Boolean(localStorage.getItem("token"));
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const navigate = useNavigate();

  const items = cart?.items ?? [];

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + (item.vendorProduct?.price ?? 0) * (item.quantity ?? 0),
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddress(res.data.user.address || "");
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchUserProfile();

    const closeMenu = () => setShowProfileMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [isLoggedin]);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart({ items: [] });
      return;
    }
    try {
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data?.cart ?? { items: [] });
    } catch (error) {
      console.error("Cart fetch error:", error);
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, [isLoggedin]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all user data
    setShowProfileMenu(false);
    setCart({ items: [] });
    setAddress('');
    navigate("/");
  };

  return (
    <>
      <nav className={styles.navContainer}>
        {/* Logo & Location */}
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logo}>
            Licious Clone
          </Link>
          <button
            onClick={() => setShowLocationModal(true)}
            className={styles.locationBtn}
          >
            <MapPin />
            {address ? `${address}` : "Set Location"}
          </button>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search for meat, seafood..."
            className={styles.searchBar}
          />
        </div>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link to="/categories" className={styles.link}>
            <Layers /> Categories
          </Link>
          <Link to="/stores" className={styles.link}>
            <Store /> Stores
          </Link>

          <div className={styles.profileWrapper}>
            {isLoggedin ? (
              <>
                <Link
                  className={styles.link}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                >
                  <User /> Profile
                </Link>

                {showProfileMenu && (
                  <div
                    className={styles.dropdown}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Orders
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link onClick={onLoginClick} className={styles.link}>
                <User /> Login
              </Link>
            )}
          </div>

          <Link
            onClick={onCartClick}
            className={`${styles.link} ${styles.cartLink}`}
          >
            <ShoppingCart />
            {items.length > 0
              ? `${totalQuantity} Items ₹${totalAmount}`
              : "Cart"}
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
