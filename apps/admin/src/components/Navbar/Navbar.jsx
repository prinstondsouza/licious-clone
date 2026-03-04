import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { User } from "lucide-react";
import SearchModal from "../Search/SearchModal";

const Navbar = ({ onLoginClick }) => {
  const isLoggedin = Boolean(localStorage.getItem("token"));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

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
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search for meat, seafood..."
            className={styles.searchBar}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchModalOpen(true);
            }}
            onFocus={() => setIsSearchModalOpen(true)}
          />
        </div>

        {isSearchModalOpen && (
          <SearchModal
            query={searchQuery}
            onClose={() => setIsSearchModalOpen(false)}
          />
        )}

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
                      to="/products"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Base Products
                    </Link>
                    <Link
                      to="/orders"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileMenu(false)}
                    >
                      All Orders
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
