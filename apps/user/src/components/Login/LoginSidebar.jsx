import Login from "./Login";
import styles from "./LoginSidebar.module.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LoginSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>Login</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <Login isSidebar onSuccess={onClose} />
      </div>
    </>
  );
};

export default LoginSidebar;
