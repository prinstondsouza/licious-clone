import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Copy,
  RefreshCw,
} from "lucide-react";
import styles from "./UserProfile.module.css";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`/api/users/user-by-Id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res.data?.user || res.data || null;
      setUser(userData);
    } catch (err) {
      console.error("User Profile Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load user profile");
      toast.error("Failed to load user profile", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const createdAt = useMemo(() => {
    if (!user?.createdAt) return "-";
    return new Date(user.createdAt).toLocaleString();
  }, [user]);

  const updatedAt = useMemo(() => {
    if (!user?.updatedAt) return "-";
    return new Date(user.updatedAt).toLocaleString();
  }, [user]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("User ID copied!", {
        position: "top-center",
        autoClose: 900,
      });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Copy failed", { position: "top-center" });
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonMain} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Couldn’t load profile</p>
            <p className={styles.errorText}>{error}</p>

            <div className={styles.rowActions}>
              <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                Back
              </button>

              <button className={styles.primaryBtn} onClick={fetchUser}>
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyBox}>
            <p className={styles.emptyTitle}>User not found</p>
            <p className={styles.emptyText}>This user may have been deleted.</p>

            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || "U")
    .toUpperCase()
    .slice(0, 1);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.leftTop}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </button>

            <div>
              <h2 className={styles.title}>User Profile</h2>
              <p className={styles.subtitle}>Full details and account info</p>
            </div>
          </div>

          <div className={styles.topActions}>
            <button className={styles.secondaryBtn} onClick={copyId}>
              <Copy size={16} />
              {copied ? "Copied" : "Copy ID"}
            </button>

            <button className={styles.primaryBtn} onClick={fetchUser}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{avatarLetter}</div>

          <div className={styles.profileMeta}>
            <p className={styles.name}>{user?.name || "Unnamed User"}</p>
            <p className={styles.email}>{user?.email || "-"}</p>

            <div className={styles.pills}>
              <span className={styles.pill}>
                <Shield size={14} />
                Role: {user?.role || "user"}
              </span>

              <span className={styles.pillMuted}>
                ID: <span className={styles.mono}>{String(id).slice(-10)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Contact</p>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>
                <Mail size={16} />
              </span>
              <div className={styles.infoText}>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>{user?.email || "-"}</p>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>
                <Phone size={16} />
              </span>
              <div className={styles.infoText}>
                <p className={styles.infoLabel}>Phone</p>
                <p className={styles.infoValue}>{user?.phone || "-"}</p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Account</p>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>
                <Calendar size={16} />
              </span>
              <div className={styles.infoText}>
                <p className={styles.infoLabel}>Created At</p>
                <p className={styles.infoValue}>{createdAt}</p>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>
                <User size={16} />
              </span>
              <div className={styles.infoText}>
                <p className={styles.infoLabel}>Updated At</p>
                <p className={styles.infoValue}>{updatedAt}</p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.cardTitle}>More</p>

            <div className={styles.kpiBox}>
              <div className={styles.kpi}>
                <p className={styles.kpiLabel}>Role</p>
                <p className={styles.kpiValue}>{user?.role || "-"}</p>
              </div>

              <div className={styles.kpi}>
                <p className={styles.kpiLabel}>Status</p>
                <p className={styles.kpiValue}>
                  {user?.isBlocked ? "Blocked" : "Active"}
                </p>
              </div>
            </div>

            <div className={styles.note}>
              <p className={styles.noteTitle}>Tip</p>
              <p className={styles.noteText}>
                You can extend this page later with user orders, addresses,
                vendor activity, etc.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.bottomSpace} />
      </div>
    </div>
  );
};

export default UserProfile;
