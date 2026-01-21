import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LocationModal from "../Location/LocationModal";
import styles from "./Navbar.module.css";
import { Store, Layers, MapPin, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";

const Navbar = ({ onCartClick, onLoginClick }) => {
  const { cart, setCart, fetchCart } = useCart();
  const {
    user,
    fetchUser,
    addresses,
    selectedAddressId,
    currentAddress,
    logout,
  } = useUser();
  const isLoggedin = Boolean(localStorage.getItem("token"));
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const items = cart?.items ?? [];

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const addressLabel = currentAddress
    ? "Current Location"
    : selectedAddress
      ? `${selectedAddress.label}`
      : "";

  const addressText =
    currentAddress || selectedAddress?.address || "Set Location";

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + (item.vendorProduct?.price ?? 0) * (item.quantity ?? 0),
    0,
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0,
  );

  const profileImage = user?.userImage;

  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    setCart(null);
    logout();
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
            <MapPin size={40} />
            <div>
              <div className={styles.label}>{addressLabel}</div>
              <div className={styles.addressTxt}>{addressText}</div>
            </div>
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
                  <div className={styles.avatar}>
                    {profileImage ? (
                      <img
                        src={`http://localhost:5000${profileImage}`}
                        alt="pfp"
                        className={styles.avatarImg}
                      />
                    ) : (
                      <User />
                    )}{" "}
                  </div>
                  Profile
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
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}
    </>
  );
};

export default Navbar;
