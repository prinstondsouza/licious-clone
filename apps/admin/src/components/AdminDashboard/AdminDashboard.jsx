import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const usersData = res.data?.users || res.data || [];
        setUsers(usersData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard"
        );
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/vendors/get-all-vendors/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const vendorsData = res.data?.vendors || [];
        setVendors(vendorsData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard"
        );
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [token]);

  useEffect(() => {
    const fetchDeliveryPartners = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/delivery", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const deliverPartnersData = res.data?.deliveryPartners || [];
        setDeliveryPartners(deliverPartnersData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard"
        );
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPartners();
  }, [token]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/orders/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = res.data?.orders || [];
        setOrders(ordersData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard"
        );
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    setStats({
      totalUsers: users.length,
      totalVendors: vendors.length,
      totalDeliveryPartners: deliveryPartners.length,
      pendingVendors: vendors.filter((v) => v.status === "pending").length,
      approvedVendors: vendors.filter((v) => v.status === "approved").length,
      totalOrders: orders.length,
    });
  }, [users, vendors, deliveryPartners]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h2 className={styles.title}>Admin Dashboard</h2>
        <p className={styles.subtitle}>
          Overview of platform activity and stats
        </p>
      </div>

      <div className={styles.grid}>
        <div
          className={styles.card}
          onClick={() => {
            navigate("/users");
          }}
        >
          <p className={styles.cardLabel}>Total Users</p>
          <h3 className={styles.cardValue}>{stats?.totalUsers ?? 0}</h3>
        </div>

        <div
          className={styles.card}
          onClick={() => {
            navigate("/vendors");
          }}
        >
          <p className={styles.cardLabel}>Total Vendors</p>
          <h3 className={styles.cardValue}>{stats?.totalVendors ?? 0}</h3>
        </div>

        <div
          className={styles.card}
          onClick={() => {
            navigate("/vendors");
          }}
        >
          <p className={styles.cardLabel}>Approved Vendors</p>
          <h3 className={styles.cardValue}>{stats?.approvedVendors ?? 0}</h3>
        </div>

        <div
          className={styles.card}
          onClick={() => {
            navigate("/vendors");
          }}
        >
          <p className={styles.cardLabel}>Pending Vendors</p>
          <h3 className={styles.cardValue}>{stats?.pendingVendors ?? 0}</h3>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Total Orders</p>
          <h3 className={styles.cardValue}>{stats?.totalOrders ?? 0}</h3>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Delivery Partners</p>
          <h3 className={styles.cardValue}>
            {stats?.totalDeliveryPartners ?? 0}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
