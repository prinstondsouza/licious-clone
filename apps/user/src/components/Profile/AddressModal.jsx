import React, { useEffect, useState } from "react";
import styles from "./AddressModal.module.css";
import { useUser } from "../../context/UserContext";
import LocationModal from "../Location/LocationModal";

const AddressModal = ({
  isOpen,
  title = "Address",
  mode = "add",
  formData,
  setFormData,
  loading,
  onClose,
  onSubmit,
}) => {
  const { addresses, user, currentAddress } = useUser();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const homeExists = addresses?.some((a) => a.label === "Home");
  const workExists = addresses?.some((a) => a.label === "Work");

  const handleSubmit = () => {
    setFormData({
      ...formData,
      longitude: user.location.coordinates[0],
      latitude: user.location.coordinates[1],
    });
  };

  useEffect(() => {
    setFormData({
      ...formData,
      address: currentAddress,
    });
  }, [showLocationModal]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== "add") return;

    if (homeExists && workExists && formData.label !== "Other") {
      setFormData((prev) => ({
        ...prev,
        label: "Other",
        customLabel: prev.customLabel || "",
      }));
    }
  }, [isOpen, mode, homeExists, workExists, formData.label]);

  if (!isOpen) return null;

  const showCustomLabel = mode === "add" && formData.label === "Other";

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form
          className={styles.addressForm}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          <div className={styles.twoCol}>
            <input
              className={styles.input}
              placeholder="Flat No"
              value={formData.flatNo}
              onChange={(e) =>
                setFormData({ ...formData, flatNo: e.target.value })
              }
              required
            />

            <input
              className={styles.input}
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
            />
          </div>

          <input
            className={styles.input}
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />

          <input
            className={styles.input}
            placeholder="Landmark"
            value={formData.landmark}
            onChange={(e) =>
              setFormData({ ...formData, landmark: e.target.value })
            }
            required
          />

          <div className={styles.twoCol}>
            {mode === "edit" ? (
              <input
                className={styles.input}
                value={formData.label}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    label: value,
                    customLabel: value === "Other" ? "" : prev.customLabel,
                  }));
                }}
              />
            ) : (
              <select
                className={styles.input}
                value={formData.label}
                onChange={(e) => {
                  const value = e.target.value;

                  if (mode === "add") {
                    setFormData((prev) => ({
                      ...prev,
                      label: value,
                      customLabel: value === "Other" ? "" : prev.customLabel,
                    }));
                  } else {
                    setFormData({ ...formData, label: value });
                  }
                }}
                required
              >
                <option value="Home" disabled={homeExists}>
                  Home
                </option>
                <option value="Work" disabled={workExists}>
                  Work
                </option>
                <option value="Other">Other</option>
              </select>
            )}

            {showCustomLabel ? (
              <input
                className={styles.input}
                placeholder="Custom label"
                value={formData.customLabel || ""}
                onChange={(e) =>
                  setFormData({ ...formData, customLabel: e.target.value })
                }
                required
              />
            ) : (
              <button
                className={styles.addBtn}
                type="button"
                onClick={() => setShowLocationModal(true)}
              >
                Location
              </button>
            )}
          </div>

          {showCustomLabel && (
            <button
              className={styles.addBtnFull}
              type="button"
              onClick={() => setShowLocationModal(true)}
            >
              Location
            </button>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className={styles.saveBtn}
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : mode === "add"
                  ? "Save Address"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}
    </div>
  );
};

export default AddressModal;
