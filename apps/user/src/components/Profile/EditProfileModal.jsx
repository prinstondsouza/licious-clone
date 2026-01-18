import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EditProfileModal.module.css";

const EditProfileModal = ({ isOpen, onClose }) => {
  const token = localStorage.getItem("token");

  const [previewImage, setPreviewImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    maritalStatus: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const storedFirstName = localStorage.getItem("fname") || "";
    const storedLastName = localStorage.getItem("lname") || "";
    const storedPhone = localStorage.getItem("phone") || "";
    const storedGender = localStorage.getItem("gender") || "";
    const storedMaritalStatus = localStorage.getItem("maritalStatus") || "";

    setEditForm({
      firstName: storedFirstName,
      lastName: storedLastName,
      phone: storedPhone,
      gender: storedGender,
      maritalStatus: storedMaritalStatus,
    });

    const storedUserImage = localStorage.getItem("userImage");
    if (storedUserImage) {
      setPreviewImage(storedUserImage);
    } else {
      setPreviewImage(null);
    }

    setProfileImage(null);
  }, [isOpen]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", editForm.firstName);
      formData.append("lastName", editForm.lastName);
      formData.append("phone", editForm.phone);
      formData.append("gender", editForm.gender);
      formData.append("maritalStatus", editForm.maritalStatus);

      if (profileImage) {
        formData.append("userImage", profileImage);
      }

      const res = await axios.put("/api/users/update-user-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = res?.data?.user;

      if (updatedUser) {
        localStorage.setItem("fname", updatedUser.firstName || "");
        localStorage.setItem("lname", updatedUser.lastName || "");
        localStorage.setItem("phone", updatedUser.phone || "");
        localStorage.setItem("gender", updatedUser.gender || "");
        localStorage.setItem("maritalStatus", updatedUser.maritalStatus || "");

        if (updatedUser.userImage) {
          localStorage.setItem("userImage", updatedUser.userImage);
        }
      }

      onClose();
    } catch (error) {
      console.log(
        "Update Profile Error:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Edit Profile</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdateProfile} className={styles.modalForm}>
          {/* ✅ Profile Image */}
          <div className={styles.imageSection}>
            <div className={styles.imagePreview}>
              {previewImage ? (
                <img
                  src={
                    previewImage.startsWith("blob:")
                      ? previewImage
                      : `http://localhost:5000${previewImage}`
                  }
                  alt="Preview"
                />
              ) : (
                <div className={styles.placeholderImg}>No Image</div>
              )}
            </div>

            <label className={styles.uploadBtn}>
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setProfileImage(file);
                  setPreviewImage(URL.createObjectURL(file));
                }}
                hidden
              />
            </label>
          </div>

          <div className={styles.twoCol}>
            <div>
              <label className={styles.label}>First Name</label>
              <input
                type="text"
                className={styles.input}
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                className={styles.input}
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className={styles.label}>Phone</label>
            <input
              type="text"
              className={styles.input}
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.twoCol}>
            <div>
              <label className={styles.label}>Gender</label>
              <select
                className={styles.input}
                value={editForm.gender}
                onChange={(e) =>
                  setEditForm({ ...editForm, gender: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={styles.label}>Marital Status</label>
              <select
                className={styles.input}
                value={editForm.maritalStatus}
                onChange={(e) =>
                  setEditForm({ ...editForm, maritalStatus: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
