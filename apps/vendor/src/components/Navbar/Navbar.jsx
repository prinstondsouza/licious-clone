import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Navbar.module.css";
import { Store, Layers, MapPin, User } from "lucide-react";

const Navbar = ({ onLoginClick }) => {
  const [address, setAddress] = useState("");
  const isLoggedin = Boolean(localStorage.getItem("token"));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/vendors/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddress(res?.data?.vendor?.address.addressString || "");
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchUserProfile();

    const closeMenu = () => setShowProfileMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setShowProfileMenu(false);
    navigate("/register");
  };

  return (
    <>
      <nav className={styles.navContainer}>
        {/* Logo & Location */}
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logo}>
            Licious Clone
          </Link>
          <div className={styles.locationBtn}>
            <MapPin />
            {address ? `${address}` : "Set Location"}
          </div>
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
                      to="/inventory"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Products
                    </Link>
                    <Link
                      to="/orders"
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
        </div>
      </nav>
    </>
  );
};

export default Navbar;
