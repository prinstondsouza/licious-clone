import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./SearchModal.module.css";

const SearchModal = ({ query, onClose }) => {
  const token = localStorage.getItem("token");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/products/base", {
          params: { search: query },
          headers: { Authorization: `Bearer ${token}` },
        });

        const baseProducts = res.data.baseProducts || [];

        const filtered = baseProducts.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        );

        setResults(filtered);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

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
