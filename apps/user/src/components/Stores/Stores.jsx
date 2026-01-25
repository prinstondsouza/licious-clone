import React, { useEffect, useMemo, useState } from "react";
import styles from "./Stores.module.css";

// ✅ dummy city list (you can replace with backend later)
const CITIES = [
  { id: 1, name: "Bengaluru" },
  { id: 2, name: "Mumbai" },
  { id: 3, name: "Delhi" },
  { id: 4, name: "Hyderabad" },
];

// ✅ sample stores (replace with your API response)
const SAMPLE_STORES = [
  {
    hubId: 2396,
    hubDisplayName: "Licious AECS Store",
    address1: "K No.571, AECS Layout, Bengaluru, Karnataka 560037",
    address2: "AECS Layout , Bengaluru-560037",
    rating: 4.9,
    userTotalRating: 1020,
    openStatus: "Open Now",
    storeTiming: "7am - 10pm",
    lat: 12.9640922,
    lng: 77.7124347,
  },
  {
    hubId: 2157,
    hubDisplayName: "Licious Gunjur Store",
    address1: "214/6, Ground floor, Gunjur, Bengaluru, Karnataka 560087",
    address2: "Varthur Hobli - Bengaluru, Karnataka 560087",
    rating: 4.9,
    userTotalRating: 1020,
    openStatus: "Open Now",
    storeTiming: "7am - 10pm",
    lat: 12.928667848551678,
    lng: 77.73794463247545,
  },
  {
    hubId: 2460,
    hubDisplayName: "JP Nagar 8th Phase Store",
    address1: "JP Nagar 8th Phase, Bangalore 560076",
    address2: "Next to Deepasri Hospital",
    rating: 4.9,
    userTotalRating: 1010,
    openStatus: "Open Now",
    storeTiming: "7am - 10pm",
    lat: 12.869486,
    lng: 77.58209,
  },
];

const Stores = () => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);

  useEffect(() => {
    // ✅ later: call API like /stores?city_id=
    setStores(SAMPLE_STORES);
    setActiveStoreId(SAMPLE_STORES?.[0]?.hubId || null);
  }, [selectedCity]);

  const activeStore = useMemo(
    () => stores.find((s) => s.hubId === activeStoreId) || stores?.[0],
    [stores, activeStoreId],
  );

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => {
      const name = s.hubDisplayName?.toLowerCase() || "";
      const a1 = s.address1?.toLowerCase() || "";
      const a2 = s.address2?.toLowerCase() || "";
      return name.includes(q) || a1.includes(q) || a2.includes(q);
    });
  }, [stores, search]);

  const mapSrc = useMemo(() => {
    if (!activeStore) return "";
    const { lat, lng, hubDisplayName } = activeStore;
    const q = encodeURIComponent(`${hubDisplayName} (${lat},${lng})`);
    // ✅ no API key needed for simple embed
    return `https://www.google.com/maps?q=${q}&z=13&output=embed`;
  }, [activeStore]);

  const openDirections = (store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, "_blank");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // ✅ later: send lat/lng to backend to fetch nearest stores
        alert(`Got location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      () => alert("Unable to fetch your location. Please allow permission."),
    );
  };

  return (
    <div className={styles.page}>
      {/* ✅ HERO */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroMiniTitle}>Find your nearest</p>
          <h1 className={styles.heroTitle}>
            <span className={styles.brand}>Store</span> Locator
          </h1>
          <p className={styles.heroDesc}>
            Fresh cuts, quick pickup, and in-store offers — choose a city and
            find your closest store.
          </p>
        </div>
      </div>

      {/* ✅ MAIN LAYOUT */}
      <div className={styles.main}>
        {/* LEFT SIDE */}
        <div className={styles.left}>
          <div className={styles.cityRow}>
            <div>
              <p className={styles.smallLabel}>Select your city</p>
              <div className={styles.citySelectWrap}>
                <select
                  className={styles.citySelect}
                  value={selectedCity.id}
                  onChange={(e) => {
                    const city = CITIES.find(
                      (c) => c.id === Number(e.target.value),
                    );
                    setSelectedCity(city || CITIES[0]);
                  }}
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className={styles.currentLocationBtn}
              onClick={useCurrentLocation}
            >
              <span className={styles.crosshair}>⌖</span>
              Use current location
            </button>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                className={styles.searchInput}
                placeholder="Search store name or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.totalStores}>
              {filteredStores.length} Stores in this city
            </div>
          </div>

          <div className={styles.list}>
            {filteredStores.map((store) => {
              const isActive = store.hubId === activeStoreId;
              return (
                <div
                  key={store.hubId}
                  className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
                  onClick={() => setActiveStoreId(store.hubId)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardTitleWrap}>
                      <div className={styles.pinIcon}>📍</div>
                      <p className={styles.cardTitle}>{store.hubDisplayName}</p>
                    </div>

                    <div className={styles.ratingWrap}>
                      <span className={styles.star}>★</span>
                      <span className={styles.rating}>{store.rating}</span>
                      <span className={styles.ratingCount}>
                        ({store.userTotalRating}+)
                      </span>
                    </div>
                  </div>

                  <p className={styles.address}>
                    {store.address1}{" "}
                    <span className={styles.addressLight}>
                      {" "}
                      • {store.address2}
                    </span>
                  </p>

                  <div className={styles.cardBottom}>
                    <div className={styles.statusWrap}>
                      <span
                        className={`${styles.statusDot} ${
                          store.openStatus === "Open Now"
                            ? styles.dotGreen
                            : styles.dotRed
                        }`}
                      />
                      <span className={styles.statusText}>
                        {store.openStatus}
                      </span>
                      <span className={styles.timing}>
                        • {store.storeTiming}
                      </span>
                    </div>

                    <button
                      className={styles.directionsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(store);
                      }}
                    >
                      Directions →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE MAP */}
        <div className={styles.map}>
          <div className={styles.mapHeader}>
            <div className={styles.mapHeaderText}>
              <p className={styles.mapTitle}>Map View</p>
              <p className={styles.mapSub}>
                Showing:{" "}
                <span className={styles.mapStoreName}>
                  {activeStore?.hubDisplayName || "—"}
                </span>
              </p>
            </div>

            <button
              className={styles.mapDirectionsBtn}
              onClick={() => activeStore && openDirections(activeStore)}
              disabled={!activeStore}
            >
              Open in Maps
            </button>
          </div>

          <div className={styles.mapFrameWrap}>
            {activeStore ? (
              <iframe
                title="store-map"
                className={styles.mapFrame}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className={styles.mapEmpty}>No store selected.</div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ BOTTOM SECTION (like their page) */}
      <div className={styles.bottomInfo}>
        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <div className={styles.trustLine} />
            <p className={styles.trustTitle}>
              We sell only what we would eat ourselves.
            </p>
            <p className={styles.trustText}>
              Every item is picked and handled with care. No random quality
              drops.
            </p>
          </div>
          <div className={styles.trustCard}>
            <div className={styles.trustLine} />
            <p className={styles.trustTitle}>
              If it’s not fresh, we won’t sell it.
            </p>
            <p className={styles.trustText}>
              Stored and delivered at safe temperatures so freshness stays
              locked in.
            </p>
          </div>
          <div className={styles.trustCard}>
            <div className={styles.trustLine} />
            <p className={styles.trustTitle}>Pay only for what you buy.</p>
            <p className={styles.trustText}>
              Transparent cutting & packing — no hidden weight tricks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stores;
