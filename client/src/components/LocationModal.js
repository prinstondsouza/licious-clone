import React, { useState } from "react";
import axios from "axios";
import LocationSearchInput from "./LocationSearchInput";

const LocationModal = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Use GPS
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await axios.put(
            "/api/users/location",
            {
              latitude,
              longitude,
              address: "Current Location",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          onSave(res.data.user.address);
          onClose();
        } catch (err) {
          alert("Failed to save location");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Location permission denied");
        setLoading(false);
      }
    );
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Select Delivery Location</h3>

        <button onClick={useCurrentLocation} disabled={loading}>
          📍 Use current location
        </button>

        <hr />

        <LocationSearchInput
          onSelect={async ({ address, latitude, longitude }) => {
            try {
              const token = localStorage.getItem("token");

              const res = await axios.put(
                "/api/users/location",
                {
                  address,
                  latitude,
                  longitude,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              onSave(res.data.user.address);
              onClose();
            } catch (error) {
              alert("Failed to save location");
            }
          }}
        />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "300px",
};

export default LocationModal;
