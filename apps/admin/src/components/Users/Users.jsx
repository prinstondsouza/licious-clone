import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Users.module.css";

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const users = location.state?.users || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className={styles.title}>All Users</h2>
      </div>

      {users.length === 0 ? (
        <p className={styles.emptyText}>
          No users found (or page refreshed).
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.phone || "-"}</td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
