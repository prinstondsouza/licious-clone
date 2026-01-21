import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
} from "lucide-react";
import styles from "./Users.module.css";

const Users = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  // UI states
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | name
  const [copiedId, setCopiedId] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/users/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // your API might return: { users: [...] } OR [...]
      const usersData = res.data?.users || res.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Users Page Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load users");
      toast.error("Failed to load users", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...users];

    if (q) {
      list = list.filter((u) => {
        const name = (u?.name || "").toLowerCase();
        const email = (u?.email || "").toLowerCase();
        const phone = String(u?.phone || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    if (sortBy === "newest") {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }
    if (sortBy === "oldest") {
      list.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      );
    }
    if (sortBy === "name") {
      list.sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || "")),
      );
    }

    return list;
  }, [users, query, sortBy]);

  const totalUsers = users.length;
  const shownUsers = filteredUsers.length;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(""), 1200);
      toast.success("Copied!", { position: "top-center", autoClose: 900 });
    } catch (e) {
      toast.error("Copy failed", { position: "top-center" });
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonTable} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Couldn’t load users</p>
            <p className={styles.errorText}>{error}</p>

            <div className={styles.errorActions}>
              <button className={styles.backBtn} onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button className={styles.primaryBtn} onClick={fetchUsers}>
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.topBar}>
          <div className={styles.leftTop}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              ← Back
            </button>

            <div className={styles.titleWrap}>
              <h2 className={styles.title}>Users</h2>
              <p className={styles.subTitle}>
                Manage and view all registered users
              </p>
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={fetchUsers}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <UsersIcon size={18} />
            </div>
            <div className={styles.statText}>
              <p className={styles.statLabel}>Total Users</p>
              <p className={styles.statValue}>{totalUsers}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Search size={18} />
            </div>
            <div className={styles.statText}>
              <p className={styles.statLabel}>Showing</p>
              <p className={styles.statValue}>{shownUsers}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={18} />
            </div>
            <div className={styles.statText}>
              <p className={styles.statLabel}>Sort</p>
              <p className={styles.statValue}>
                {sortBy === "newest"
                  ? "Newest"
                  : sortBy === "oldest"
                    ? "Oldest"
                    : "Name"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              className={styles.searchInput}
              placeholder="Search by name, email, phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyBox}>
            <p className={styles.emptyTitle}>No users found</p>
            <p className={styles.emptyText}>
              Try a different search or refresh the list.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Created</th>
                  <th style={{ width: 110 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const created = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-";

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {(user?.name?.[0] || user?.email?.[0] || "U")
                              .toUpperCase()
                              .slice(0, 1)}
                          </div>

                          <div className={styles.userInfo}>
                            <p className={styles.userName}>
                              {user.name || "Unnamed User"}
                            </p>
                            <p className={styles.userMeta}>
                              ID:{" "}
                              <span className={styles.mono}>
                                {String(user._id).slice(-8)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.contactStack}>
                          <div className={styles.contactLine}>
                            <Mail size={14} />
                            <span className={styles.contactText}>
                              {user.email || "-"}
                            </span>
                          </div>
                          <div className={styles.contactLine}>
                            <Phone size={14} />
                            <span className={styles.contactText}>
                              {user.phone || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={styles.createdPill}>{created}</span>
                      </td>

                      <td>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate(`/users/${user._id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.bottomSpace} />
      </div>
    </div>
  );
};

export default Users;
