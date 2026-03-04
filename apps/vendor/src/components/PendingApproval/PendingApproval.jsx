import { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./PendingApproval.module.css";

const PendingApproval = ({ onLoginClick }) => {
  useEffect(() => {
    //fetch approved status? how to?
    // backend doesn't send any kind of token on registering 
    // only way would be to redirect here when login doesnt happen
  }, []);
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Waiting for approval</h2>

      <p className={styles.infoText}>
        Your account has been created successfully and is currently under
        review. You will be able to log in once it is approved.
      </p>

      <p className={styles.footerText}>
        <Link onClick={onLoginClick}>Login here</Link>
      </p>
    </div>
  );
};

export default PendingApproval;
