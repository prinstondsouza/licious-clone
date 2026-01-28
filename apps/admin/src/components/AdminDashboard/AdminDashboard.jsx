import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  Store,
  Package,
  Bike,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);

  // ---- Fetchers ----
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/users/all-users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const usersData = res.data?.users || res.data || [];
        setUsers(usersData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard",
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
          headers: { Authorization: `Bearer ${token}` },
        });

        const vendorsData = res.data?.vendors || [];
        setVendors(vendorsData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard",
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
          headers: { Authorization: `Bearer ${token}` },
        });

        const deliverPartnersData = res.data?.deliveryPartners || [];
        setDeliveryPartners(deliverPartnersData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard",
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
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = res.data?.orders || [];
        setOrders(ordersData);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard",
        );
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/products/base", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const productsData =
          res.data?.products || res.data?.baseProducts || res.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.message || "Failed to load admin dashboard",
        );
        toast.error("Failed to load dashboard", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  // ---- Helpers ----
  const normalize = (v = "") => String(v).trim().toLowerCase();

  const calcStats = useMemo(() => {
    const totalUsers = users.length;
    const totalVendors = vendors.length;
    const totalDeliveryPartners = deliveryPartners.length;
    const totalOrders = orders.length;

    const pendingVendors = vendors.filter(
      (v) => normalize(v.status) === "pending",
    ).length;
    const approvedVendors = vendors.filter(
      (v) => normalize(v.status) === "approved",
    ).length;
    const rejectedVendors = vendors.filter(
      (v) =>
        normalize(v.status) === "rejected" ||
        normalize(v.status) === "declined",
    ).length;

    // orders breakdown (works even if your backend uses different naming)
    const pendingOrders = orders.filter((o) =>
      ["pending", "placed", "created"].includes(normalize(o.status)),
    ).length;

    const processingOrders = orders.filter((o) =>
      ["processing", "accepted", "confirmed", "packed"].includes(
        normalize(o.status),
      ),
    ).length;

    const outForDeliveryOrders = orders.filter((o) =>
      ["out_for_delivery", "out for delivery", "picked"].includes(
        normalize(o.status),
      ),
    ).length;

    const deliveredOrders = orders.filter((o) =>
      ["delivered", "completed"].includes(normalize(o.status)),
    ).length;

    const cancelledOrders = orders.filter((o) =>
      ["cancelled", "canceled", "rejected"].includes(normalize(o.status)),
    ).length;

    // last 7 days orders
    const now = Date.now();
    const last7DaysOrders = orders.filter((o) => {
      const d = o?.createdAt ? new Date(o.createdAt).getTime() : 0;
      return d && now - d <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    // delivery partner status (if exists)
    const activePartners = deliveryPartners.filter((p) =>
      ["active", "online", "available"].includes(normalize(p?.status)),
    ).length;

    const inactivePartners = deliveryPartners.filter((p) =>
      ["inactive", "offline", "blocked"].includes(normalize(p?.status)),
    ).length;

    // quick “health” metrics
    const vendorApprovalRate =
      totalVendors === 0
        ? 0
        : Math.round((approvedVendors / totalVendors) * 100);

    const deliveryCompletionRate =
      totalOrders === 0 ? 0 : Math.round((deliveredOrders / totalOrders) * 100);

    const totalProducts = products.length;

    return {
      totalUsers,
      totalVendors,
      totalDeliveryPartners,
      totalOrders,
      totalProducts,
      pendingVendors,
      approvedVendors,
      rejectedVendors,
      pendingOrders,
      processingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      last7DaysOrders,
      activePartners,
      inactivePartners,
      vendorApprovalRate,
      deliveryCompletionRate,
    };
  }, [users, vendors, deliveryPartners, orders, products]);

  const StatChip = ({ icon: Icon, label, value, tone = "neutral" }) => {
    return (
      <div className={`${styles.chip} ${styles[`chip_${tone}`]}`}>
        <span className={styles.chipIcon}>
          <Icon size={16} />
        </span>
        <span className={styles.chipText}>
          <span className={styles.chipLabel}>{label}</span>
          <span className={styles.chipValue}>{value}</span>
        </span>
      </div>
    );
  };

  // ---- UI states ----
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorBox}>
            <div className={styles.errorTop}>
              <XCircle size={20} />
              <p className={styles.errorTitle}>Something went wrong</p>
            </div>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Cards config ----
  const cards = [
    {
      title: "Users",
      icon: Users,
      value: calcStats.totalUsers,
      badge: `${calcStats.last7DaysOrders} orders (7d)`,
      onClick: () => navigate("/users"),
      accent: "pink",
      chips: [
        { icon: TrendingUp, label: "Platform", value: "Active", tone: "good" },
        {
          icon: Package,
          label: "Orders",
          value: calcStats.totalOrders,
          tone: "neutral",
        },
      ],
      rows: [
        { label: "Total Users", value: calcStats.totalUsers },
        { label: "Total Orders", value: calcStats.totalOrders },
        { label: "Delivered %", value: `${calcStats.deliveryCompletionRate}%` },
      ],
    },
    {
      title: "Vendors",
      icon: Store,
      value: calcStats.totalVendors,
      badge: `${calcStats.vendorApprovalRate}% approval`,
      onClick: () => navigate("/vendors"),
      accent: "blue",
      chips: [
        {
          icon: Clock,
          label: "Pending",
          value: calcStats.pendingVendors,
          tone: calcStats.pendingVendors > 0 ? "warn" : "neutral",
        },
        {
          icon: CheckCircle2,
          label: "Approved",
          value: calcStats.approvedVendors,
          tone: "good",
        },
      ],
      rows: [
        { label: "Pending Vendors", value: calcStats.pendingVendors },
        { label: "Approved Vendors", value: calcStats.approvedVendors },
        { label: "Rejected Vendors", value: calcStats.rejectedVendors },
      ],
    },
    {
      title: "Orders",
      icon: Package,
      value: calcStats.totalOrders,
      badge: `${calcStats.last7DaysOrders} in last 7 days`,
      onClick: () => navigate("/orders"),
      accent: "green",
      chips: [
        {
          icon: Clock,
          label: "Pending",
          value: calcStats.pendingOrders,
          tone: calcStats.pendingOrders > 0 ? "warn" : "neutral",
        },
        {
          icon: CheckCircle2,
          label: "Delivered",
          value: calcStats.deliveredOrders,
          tone: "good",
        },
      ],
      rows: [
        { label: "Processing", value: calcStats.processingOrders },
        { label: "Out for Delivery", value: calcStats.outForDeliveryOrders },
        { label: "Cancelled", value: calcStats.cancelledOrders },
      ],
    },
    {
      title: "Products",
      icon: ShoppingBag,
      value: calcStats.totalProducts,
      badge: "Base catalog",
      onClick: () => navigate("/products"),
      accent: "orange",
      chips: [
        {
          icon: TrendingUp,
          label: "Inventory",
          value: "Catalog",
          tone: "neutral",
        },
        {
          icon: CheckCircle2,
          label: "Total",
          value: calcStats.totalProducts,
          tone: "good",
        },
      ],
      rows: [
        { label: "Total Products", value: calcStats.totalProducts },
        { label: "Active Vendors", value: calcStats.approvedVendors },
        { label: "Orders (7d)", value: calcStats.last7DaysOrders },
      ],
    },
    {
      title: "Delivery",
      icon: Bike,
      value: calcStats.totalDeliveryPartners,
      badge: `${calcStats.activePartners} active`,
      onClick: () => navigate("/delivery"),
      accent: "purple",
      chips: [
        {
          icon: CheckCircle2,
          label: "Active",
          value: calcStats.activePartners,
          tone: "good",
        },
        {
          icon: XCircle,
          label: "Inactive",
          value: calcStats.inactivePartners,
          tone: calcStats.inactivePartners > 0 ? "warn" : "neutral",
        },
      ],
      rows: [
        { label: "Total Partners", value: calcStats.totalDeliveryPartners },
        { label: "Active Partners", value: calcStats.activePartners },
        { label: "Inactive Partners", value: calcStats.inactivePartners },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Admin Dashboard</h2>
            <p className={styles.subtitle}>
              Platform overview • quick stats • insights
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.kpiPill}>
              <span className={styles.kpiLabel}>Delivery completion</span>
              <span className={styles.kpiValue}>
                {calcStats.deliveryCompletionRate}%
              </span>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                className={`${styles.card} ${styles[`accent_${card.accent}`]}`}
                onClick={card.onClick}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    <Icon size={20} />
                  </div>

                  <div className={styles.cardTopRight}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    <span className={styles.cardBadge}>{card.badge}</span>
                  </div>
                </div>

                <div className={styles.cardMain}>
                  <div className={styles.cardValue}>{card.value}</div>
                  <div className={styles.cardSubText}>
                    Tap to view all {card.title.toLowerCase()}
                  </div>
                </div>

                <div className={styles.chipsRow}>
                  {card.chips.map((c, idx) => (
                    <StatChip
                      key={idx}
                      icon={c.icon}
                      label={c.label}
                      value={c.value}
                      tone={c.tone}
                    />
                  ))}
                </div>

                <div className={styles.divider} />

                <div className={styles.detailsGrid}>
                  {card.rows.map((r, idx) => (
                    <div key={idx} className={styles.detailItem}>
                      <p className={styles.detailLabel}>{r.label}</p>
                      <p className={styles.detailValue}>{r.value}</p>
                    </div>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.footerHint}>Open {card.title} →</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.miniCard}>
            <p className={styles.miniTitle}>Quick Insights</p>
            <div className={styles.miniList}>
              <div className={styles.miniLine}>
                <span className={styles.dot} />
                <span>
                  <b>{calcStats.pendingVendors}</b> vendors waiting for approval
                </span>
              </div>
              <div className={styles.miniLine}>
                <span className={styles.dot} />
                <span>
                  <b>{calcStats.pendingOrders}</b> pending orders need attention
                </span>
              </div>
              <div className={styles.miniLine}>
                <span className={styles.dot} />
                <span>
                  <b>{calcStats.last7DaysOrders}</b> orders placed in last 7
                  days
                </span>
              </div>
            </div>
          </div>

          <div className={styles.miniCard}>
            <p className={styles.miniTitle}>Health</p>
            <div className={styles.progressWrap}>
              <div className={styles.progressTop}>
                <span className={styles.progressLabel}>Vendor approvals</span>
                <span className={styles.progressValue}>
                  {calcStats.vendorApprovalRate}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calcStats.vendorApprovalRate}%` }}
                />
              </div>

              <div className={styles.progressTop} style={{ marginTop: 14 }}>
                <span className={styles.progressLabel}>
                  Delivery completion
                </span>
                <span className={styles.progressValue}>
                  {calcStats.deliveryCompletionRate}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${calcStats.deliveryCompletionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerSpace} />
      </div>
    </div>
  );
};

export default AdminDashboard;
