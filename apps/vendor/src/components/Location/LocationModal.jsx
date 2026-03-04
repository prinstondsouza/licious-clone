import React, { useState } from "react";
import axios from "axios";
import LocationSearchInput from "./LocationSearchInput";
import styles from "./LocationModal.module.css";

const LocationModal = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
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
          setLoading(true);

          const { latitude, longitude } = position.coords;

          const res = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1,
              },
              headers: {
                "User-Agent":"licious-clone-vendor"
              },
            },
          );

          const place = res.data;

          onSave({
            addr: place.display_name || "Current Location",
            lat: latitude,
            lon: longitude,
          });

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
    onSave({
      addr: address,
      lat: latitude,
      lon: longitude,
    });
    onClose();
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
