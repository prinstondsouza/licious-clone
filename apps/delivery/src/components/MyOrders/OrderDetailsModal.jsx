import React from "react";
import styles from "./OrderDetailsModal.module.css";

const OrderDetailsModal = ({
  order,
  onClose,
  statusMap,
  handleStatusChange,
  saveOrderStatus,
  savingStatusId,
  orderStatuses,
}) => {
  if (!order) return null;

  // Helper to get formatted date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  // Helper to safely get nested properties
  const getCustomerName = () =>
    order.user?.name || order.userName || order.customerName || "N/A";
  const getCustomerEmail = () => order.user?.email || "N/A";

  const getAddress = () => {
    if (typeof order.deliveryAddress === "object") {
      // If it has addressString or similar structure
      return (
        order.deliveryAddress.addressString ||
        JSON.stringify(order.deliveryAddress)
      );
    }
    return order.deliveryAddress || "N/A";
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
              <span className={styles.detailValue}>{getCustomerName()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{getCustomerEmail()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>{getAddress()}</span>
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
              // item.vendorProduct might be populated or an id
              const product = item.vendorProduct || {};
              const productName =
                product.name || item.name || "Unknown Product";
              const price = product.price || item.price || 0;

              // Handle Images
              const image =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : null;

              const imageUrl = image
                ? image.startsWith("http")
                  ? image
                  : `http://localhost:5000${image}`
                : null;

              // Vendor Info
              const vendor = item.vendor || product.vendor || {};
              const storeName = vendor.storeName || "Unknown Store";
              const ownerName = vendor.ownerName || "";

              return (
                <div key={idx} className={styles.productItem}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={productName}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={`${styles.productImage} flex-center`}>
                      🥩
                    </div>
                  )}

                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{productName}</span>
                    <div className={styles.productMeta}>
                      Qty: {item.quantity} | Price: ₹{price} |{" "}
                      <strong>Subtotal: ₹{price * item.quantity}</strong>
                    </div>
                    {(storeName || ownerName) && (
                      <div
                        className={styles.productMeta}
                        style={{ marginTop: "4px" }}
                      >
                        From: {storeName} {ownerName && `(${ownerName})`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: "15px",
              textAlign: "right",
              fontSize: "1.1rem",
            }}
          >
            <strong>
              Total Price: ₹
              {(order.totalAmount ?? order.totalPrice ?? 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className={styles.modalSection}>
          <h4 className={styles.sectionTitle}>Update Status</h4>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Current Status</span>
              <select
                className={styles.select}
                value={statusMap[order._id] || order.status || "pending"}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={styles.detailRow}
              style={{ justifyContent: "flex-end", alignItems: "flex-start" }}
            >
              <span className={styles.detailLabel}>&nbsp;</span>
              <button
                className={styles.saveBtn}
                onClick={() => saveOrderStatus(order._id)}
                disabled={savingStatusId === order._id}
              >
                {savingStatusId === order._id ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
