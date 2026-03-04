import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./SearchModal.module.css";

const SearchModal = ({ query, onClose, results: externalResults }) => {
  const token = localStorage.getItem("token");
  const [internalResults, setInternalResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use external results if provided, otherwise use internal state
  const results =
    externalResults !== undefined ? externalResults : internalResults;

  useEffect(() => {
    // If external results are provided, skip internal fetching
    if (externalResults !== undefined) return;

    if (!query.trim()) {
      setInternalResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/products/vendor/inventory", {
          params: { query: query },
          headers: { Authorization: `Bearer ${token}` },
        });
        setInternalResults(res.data.vendorProducts || []);
      } catch {
        setInternalResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query, externalResults]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {loading && <div className={styles.state}>Searching…</div>}

        {!loading && query && results.length === 0 && (
          <div className={styles.state}>No results found</div>
        )}

        {results.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            className={styles.resultItem}
            onClick={onClose}
          >
            <img src={p.images?.[0]} alt={p.name} />
            <div>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.price}>₹{p.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchModal;
