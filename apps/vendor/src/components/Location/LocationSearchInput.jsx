import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./LocationSearchInput.module.css";

const LocationSearchInput = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Only search if query is 3 characters or more
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

    // Debounce to prevent API spamming
    const debounce = setTimeout(fetchLocations, 400);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleItemClick = (place) => {
    onSelect({
      address: place.display_name,
      latitude: place.lat,
      longitude: place.lon,
    });
    setQuery(""); // Clear query after selection
    setResults([]); // Hide results
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search for area, street, city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.inputField}
      />

      {results.length > 0 && (
        <ul className={styles.resultsList}>
          {results.map((place) => (
            <li
              key={place.place_id}
              className={styles.resultItem}
              onClick={() => handleItemClick(place)}
            >
              <span>📍</span>
              <span>{place.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchInput;