import React from "react";
import styles from "./OrderDetailsModal.module.css";

const OrderDetailsModal = ({
  order,
  onClose,
  partners,
  vendors,
  statusMap,
  partnerMap,
  handleStatusChange,
  handlePartnerChange,
  saveOrderStatus,
  assignPartner,
  savingStatusId,
  assigningId,
  orderStatuses,
}) => {
  if (!order) return null;

  // Helper to get formatted date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Order Details</h3>
          <p className={styles.subtitle}>
            ID: <span className={styles.orderId}>#{order._id}</span>
          </p>
        </div>

        <div className={styles.modalSection}>
          <h4 className={styles.sectionTitle}>Customer & Delivery</h4>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Customer Name</span>
              <span className={styles.detailValue}>
                {order.user?.name || "N/A"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>
                {order.user?.email || "N/A"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>
                {typeof order.deliveryAddress === "object"
                  ? JSON.stringify(order.deliveryAddress)
                  : order.deliveryAddress || "N/A"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ordered At</span>
              <span className={styles.detailValue}>
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.modalSection}>
          <h4 className={styles.sectionTitle}>Products</h4>
          <div className={styles.productsList}>
            {order.products?.map((item, idx) => {
              const product = item.vendorProduct || {};
              // Logic to find image: product.images[0]
              const image =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : null;

              // Construct image URL if it's relative
              const imageUrl = image
                ? image.startsWith("http")
                  ? image
                  : `http://localhost:5000${image}`
                : null;

              // Find Vendor
              // item.vendor logic:
              //   If item.vendor is an object, use ._id
              //   If item.vendor is string id, use it
              //   Fallback to product.vendor if item.vendor is missing
              const vendorId =
                typeof item.vendor === "object"
                  ? item.vendor._id
                  : item.vendor ||
                    (typeof product.vendor === "object"
                      ? product.vendor._id
                      : product.vendor);

              const vendorObj = vendors?.find((v) => v._id === vendorId);

              const storeName =
                vendorObj?.storeName || (vendorId ? "Unknown Store" : "-");

              // ownerName or just name
              const ownerName = vendorObj?.ownerName || vendorObj?.name || "-";

              return (
                <div key={idx} className={styles.productItem}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className={styles.productImage}
                    />
                  )}
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{product.name}</span>
                    <div className={styles.productMeta}>
                      Qty: {item.quantity} | Price: ₹{product.price} |{" "}
                      <strong>
                        Subtotal: ₹{product.price * item.quantity}
                      </strong>
                    </div>
                    {/* Vendor Info */}
                    {vendorId && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        Store:{" "}
                        <strong style={{ color: "#333" }}>{storeName}</strong>{" "}
                        {ownerName !== "-" && <span>({ownerName})</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "10px", textAlign: "right" }}>
            <strong>Total Price: ₹{order.totalPrice}</strong>
          </div>
        </div>

        <div className={styles.modalSection}>
          <h4 className={styles.sectionTitle}>Status & Assignment</h4>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Update Status</span>
              <select
                className={`${styles.select} ${styles.fullWidthSelect}`}
                value={statusMap[order._id] || "pending"}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Assign Partner</span>
              <select
                className={`${styles.select} ${styles.fullWidthSelect}`}
                value={partnerMap[order._id] || ""}
                onChange={(e) => handlePartnerChange(order._id, e.target.value)}
              >
                <option value="">Select Partner</option>
                {partners.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.vehicleType})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.saveBtn}
            onClick={() => saveOrderStatus(order._id)}
            disabled={savingStatusId === order._id}
          >
            {savingStatusId === order._id ? "Saving..." : "Save Status"}
          </button>

          <button
            className={styles.assignBtn}
            onClick={() => assignPartner(order._id)}
            disabled={assigningId === order._id}
          >
            {assigningId === order._id ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
