import React, { useEffect, useState } from "react";
import axios from "axios";
import LocationSearchInput from "./LocationSearchInput";
import styles from "./LocationModal.module.css";
import { useUser } from "../../context/UserContext";

const LocationModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const { fetchUser, setCurrentAddress } = useUser();
  const token = localStorage.getItem("token");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const pos = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1,
              },
              headers: {
                "User-Agent": "licious-clone-user",
              },
            },
          );

          await axios.put(
            "/api/users/location",
            {
              latitude,
              longitude,
              address: pos.data.display_name || "Current Location",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          await fetchUser();
          onClose();
        } catch (err) {
          console.error(err);
          alert("Failed to save current location");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        alert("Location permission denied or unavailable");
        setLoading(false);
      },
    );
  };

  const handleManualSelect = async ({ address, latitude, longitude }) => {
    try {
      const res = await axios.put(
        "/api/users/location",
        { address, latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCurrentAddress(res?.data?.user?.address || "");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save selected location");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* stopPropagation prevents clicking inside the modal from closing it */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Select Delivery Location</h3>

        <button
          className={styles.gpsButton}
          onClick={useCurrentLocation}
          disabled={loading}
        >
          {loading ? "Finding you..." : "📍 Use current location"}
        </button>

        <hr className={styles.divider} />

        <LocationSearchInput onSelect={handleManualSelect} />

        <button className={styles.closeButton} onClick={onClose}>
          Cancel and Close
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
