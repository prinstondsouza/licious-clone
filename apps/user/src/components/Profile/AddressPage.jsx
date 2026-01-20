import { useState } from "react";
import axios from "axios";
import styles from "./AddressPage.module.css";
import AddressModal from "./AddressModal.jsx";
import { useUser } from "../../context/UserContext.jsx";

const AddressPage = () => {
  const token = localStorage.getItem("token");

  const {
    addresses,
    setAddresses,
    fetchUser,
    selectedAddressId,
    setSelectedAddressId,
  } = useUser();

  const [newAddressForm, setNewAddressForm] = useState({
    address: "",
    flatNo: "",
    landmark: "",
    city: "",
    label: "Home",
    customLabel: "",
    latitude: "",
    longitude: "",
  });

  const [editAddressForm, setEditAddressForm] = useState({
    address: "",
    flatNo: "",
    landmark: "",
    city: "",
    label: "Home",
    latitude: "",
    longitude: "",
  });

  const [addrLoading, setAddrLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addAddress, setAddAddress] = useState(false);

  const handleSelectAddress = async (addr) => {
    try {
      setAddrLoading(true);
      setSelectedAddressId(addr._id);

      const latitude = addr.location?.coordinates?.[1];
      const longitude = addr.location?.coordinates?.[0];

      if (latitude && longitude) {
        await axios.put(
          "/api/users/location",
          { latitude, longitude, address: addr.address },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (error) {
      console.log(
        "Select address error:",
        error.response?.data || error.message,
      );
    } finally {
      setAddrLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    try {
      setAddrLoading(true);

      const payload = {
        address: newAddressForm.address,
        flatNo: newAddressForm.flatNo,
        landmark: newAddressForm.landmark,
        city: newAddressForm.city,
        label:
          newAddressForm.label === "Other"
            ? newAddressForm.customLabel
            : newAddressForm.label,
        latitude: Number(newAddressForm.latitude),
        longitude: Number(newAddressForm.longitude),
      };

      const res = await axios.post("/api/users/addresses", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdAddress = res.data?.address;

      if (createdAddress) {
        setAddresses((prev) => [createdAddress, ...prev]);
      }

      setNewAddressForm({
        address: "",
        flatNo: "",
        landmark: "",
        city: "",
        label: "Home",
        customLabel: "",
        latitude: "",
        longitude: "",
      });

      await fetchUser();
      return true;
    } catch (error) {
      console.log("Add address error:", error.response?.data || error.message);
      return false;
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setAddrLoading(true);

      await axios.delete(`/api/users/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses((prev) => prev.filter((a) => a._id !== addressId));

      if (selectedAddressId === addressId) {
        setSelectedAddressId("");
      }

      await fetchUser();
    } catch (error) {
      console.log(
        "Delete address error:",
        error.response?.data || error.message,
      );
    } finally {
      setAddrLoading(false);
    }
  };

  const openEditModal = (addr) => {
    setEditingAddressId(addr._id);

    setEditAddressForm({
      address: addr.address || "",
      flatNo: addr.flatNo || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      label: addr.label || "Home",
      latitude: addr.location?.coordinates?.[1] || "",
      longitude: addr.location?.coordinates?.[0] || "",
    });

    setEditModalOpen(true);
  };

  const handleEditAddress = async (addressId) => {
    try {
      setAddrLoading(true);

      const payload = {
        address: editAddressForm.address,
        flatNo: editAddressForm.flatNo,
        landmark: editAddressForm.landmark,
        city: editAddressForm.city,
        label: editAddressForm.label,
        latitude: Number(editAddressForm.latitude),
        longitude: Number(editAddressForm.longitude),
      };

      await axios.put(`/api/users/addresses/${addressId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses((prev) =>
        prev.map((addr) =>
          addr._id === addressId
            ? {
                ...addr,
                address: payload.address,
                flatNo: payload.flatNo,
                landmark: payload.landmark,
                city: payload.city,
                label: payload.label,
                location: {
                  type: "Point",
                  coordinates: [payload.longitude, payload.latitude],
                },
              }
            : addr,
        ),
      );

      await fetchUser();

      setEditModalOpen(false);
      setEditingAddressId(null);

      return true;
    } catch (error) {
      console.log("Edit address error:", error.response?.data || error.message);
      return false;
    } finally {
      setAddrLoading(false);
    }
  };

  return (
    <div className={styles.addressBox}>
      {addrLoading ? (
        <h3 className={styles.sectionTitle}>Updating address...</h3>
      ) : (
        <h3 className={styles.sectionTitle}>My Addresses</h3>
      )}

      {addresses.length === 0 ? (
        <p className={styles.loadingText}>No addresses saved yet.</p>
      ) : (
        <div className={styles.addressGrid}>
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr._id;

            return (
              <div
                key={addr._id}
                className={`${styles.addressCard} ${
                  isSelected ? styles.addressSelected : ""
                }`}
                onClick={() => handleSelectAddress(addr)}
              >
                <div className={styles.addressTop}>
                  <span className={styles.addressLabel}>{addr.label}</span>

                  <div className={styles.addressActions}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(addr);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(addr._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className={styles.addressText}>
                  <strong>{addr.flatNo}</strong>, {addr.address}
                </p>

                <p className={styles.addressMeta}>
                  {addr.landmark}, {addr.city}
                </p>

                {isSelected && (
                  <span className={styles.selectedTag}>Selected</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button className={styles.editBtn} onClick={() => setAddAddress(true)}>
        Add New Address
      </button>

      <AddressModal
        isOpen={addAddress}
        title="Add New Address"
        mode="add"
        formData={newAddressForm}
        setFormData={setNewAddressForm}
        loading={addrLoading}
        onClose={() => setAddAddress(false)}
        onSubmit={async (e) => {
          const ok = await handleAddAddress(e);
          if (ok) setAddAddress(false);
        }}
      />

      <AddressModal
        isOpen={editModalOpen}
        title="Edit Address"
        mode="edit"
        formData={editAddressForm}
        setFormData={setEditAddressForm}
        loading={addrLoading}
        onClose={() => setEditModalOpen(false)}
        onSubmit={async () => {
          const ok = await handleEditAddress(editingAddressId);
          if (ok) setEditModalOpen(false);
        }}
      />
    </div>
  );
};

export default AddressPage;
