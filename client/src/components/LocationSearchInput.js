import React, { useEffect, useState } from "react";
import axios from "axios";

const LocationSearchInput = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 5,
            },
          }
        );

        setResults(res.data);
      } catch (error) {
        console.error("Location search error", error);
      }
    };

    const debounce = setTimeout(fetchLocations, 400);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search for area, street, city"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      />

      {results.length > 0 && (
        <ul style={listStyle}>
          {results.map((place) => (
            <li
              key={place.place_id}
              style={itemStyle}
              onClick={() =>
                onSelect({
                  address: place.display_name,
                  latitude: place.lat,
                  longitude: place.lon,
                })
              }
            >
              📍 {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const listStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "4px",
  listStyle: "none",
  padding: 0,
  margin: 0,
  zIndex: 10,
};

const itemStyle = {
  padding: "8px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
};

export default LocationSearchInput;