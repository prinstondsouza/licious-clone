import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./ItemPage.module.css";
import QuantityButton from "../Product/QuantityButton";
import { getProductQuantity } from "../../utils/cartUtils";
import { useCart } from "../../context/CartContext";

const ItemPage = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, removeFromCart } = useCart();

  // UI State
  const [activeImage, setActiveImage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const qty = useMemo(() => {
    if (!cart || !productDetails) return 0;
    return getProductQuantity(cart, productDetails._id);
  }, [cart, productDetails]);

  const images = useMemo(() => {
    const list = productDetails?.images?.length ? productDetails.images : [];
    return list.length
      ? list
      : ["https://via.placeholder.com/600x600?text=Product+Image"];
  }, [productDetails]);

  const pricing = useMemo(() => {
    const discountedPrice = Number(productDetails?.price || 0);
    const basePrice = Number(
      productDetails?.mrp || productDetails?.basePrice || discountedPrice,
    );

    const discountPercent =
      basePrice > 0 && discountedPrice < basePrice
        ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
        : 0;

    return { discountedPrice, basePrice, discountPercent };
  }, [productDetails]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/vendor/${productId}`);
        setProductDetails(response.data.vendorProduct || response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const nextImage = () => {
    if (!images?.length) return;
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (!productDetails) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h2 className={styles.notFound}>Product not found.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Nav (like theirs) */}
      <nav className={styles.topNav}>
        <button className={styles.navIconBtn} onClick={() => navigate(-1)}>
          <span className={styles.arrow}>←</span>
        </button>

        <div className={styles.navTitle}></div>
      </nav>

      {/* Page Body */}
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.bcrumbLink}>
            Home
          </Link>
          <span className={styles.bcrumbSep}>/</span>
          <span className={styles.bcrumbLink}>
            <Link
              to={`/categories?category=${encodeURIComponent(productDetails?.category)}`}
              className={styles.bcrumbLink}
            >
              {productDetails?.category}
            </Link>
          </span>
          <span className={styles.bcrumbSep}>/</span>
          <span className={styles.bcrumbCurrent}>{productDetails?.name}</span>
        </div>

        {/* PDP Top Container */}
        <div className={styles.pdpTop}>
          {/* Left: Carousel */}
          <div className={styles.leftCol}>
            <div className={styles.carouselContainer}>
              <div className={styles.carouselInner}>
                <img
                  src={images[activeImage]}
                  alt={productDetails?.name}
                  className={styles.carouselImage}
                />
              </div>

              {images.length > 1 && (
                <button className={styles.carouselArrow} onClick={nextImage}>
                  ›
                </button>
              )}

              {images.length > 1 && (
                <div className={styles.dots}>
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`${styles.dot} ${idx === activeImage ? styles.dotActive : ""}`}
                      onClick={() => setActiveImage(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className={styles.rightCol}>
            <h1 className={styles.productName}>
              {productDetails?.name || "Product Name"}
            </h1>

            <div className={styles.subTitleRow}>
              <div className={styles.headerTag}>
                {productDetails?.tag || "Boneless | Fillet"}
              </div>

              <button
                className={styles.youtubeLink}
                onClick={() => setVideoOpen(true)}
              >
                <span className={styles.playCircle}>▶</span>
                <span>Only the Safest Chicken!</span>
              </button>
            </div>

            {/* Weight / Pieces / Serves block */}
            <div className={styles.qtyBlock}>
              <div className={styles.qtySection}>
                <span className={styles.qtyIcon}>⚖</span>
                <span className={styles.qtyText}>
                  {productDetails?.weight || "450 g"}
                </span>
              </div>

              <div className={styles.qtyDivider}></div>

              <div className={styles.qtySection}>
                <span className={styles.qtyIcon}>🍗</span>
                <span className={styles.qtyText}>
                  {productDetails?.pieces || "2-4 Pieces"}
                </span>
              </div>

              <div className={styles.qtyDivider}></div>

              <div className={styles.qtySection}>
                <span className={styles.qtyIcon}>👥</span>
                <span className={styles.qtyText}>
                  Serves {productDetails?.serves || 4}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className={styles.descBlock}>
              <div
                className={`${styles.descText} ${expanded ? styles.descExpanded : ""}`}
              >
                {productDetails?.description ||
                  "No description provided for this product."}
              </div>

              <button
                className={styles.readMore}
                onClick={() => setExpanded((s) => !s)}
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            </div>

            {/* Pricing + CTA */}
            <div className={styles.pricingBlock}>
              <div className={styles.pricingTop}>
                <div className={styles.priceLeft}>
                  <div className={styles.priceRow}>
                    <span className={styles.finalPrice}>
                      ₹{pricing.discountedPrice}
                    </span>

                    {pricing.discountPercent > 0 && (
                      <span className={styles.discountPill}>
                        {pricing.discountPercent}% off
                      </span>
                    )}
                  </div>

                  <div className={styles.mrpRow}>
                    <span className={styles.mrpLabel}>MRP:</span>
                    <span className={styles.mrpPrice}>
                      ₹{pricing.basePrice}
                    </span>
                    <span className={styles.taxText}>(incl. of all taxes)</span>
                  </div>
                </div>

                <div className={styles.ctaRight}>
                  <QuantityButton
                    qty={qty}
                    onAdd={() => addToCart(productDetails._id)}
                    onRemove={() => removeFromCart(productDetails._id)}
                  />
                </div>
              </div>

              <div className={styles.pricingBottom}>
                <button
                  className={styles.youtubeLinkSmall}
                  onClick={() => setVideoOpen(true)}
                >
                  <span className={styles.playSmall}>▶</span>
                  <span>Only the Safest Chicken!</span>
                </button>

                <div className={styles.deliveryRow}>
                  <span className={styles.deliveryIcon}>🚚</span>
                  <span className={styles.deliveryText}>
                    {productDetails?.deliveryText || "Delivery in 30 mins"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div
          className={styles.videoOverlay}
          onClick={() => setVideoOpen(false)}
        >
          <div
            className={styles.videoModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.videoClose}
              onClick={() => setVideoOpen(false)}
            >
              ✕
            </button>
            <div className={styles.videoFrame}>
              <iframe
                title="Product Video"
                src={
                  productDetails?.videoUrl ||
                  "https://www.youtube.com/embed/qtLF2_Th0u8"
                }
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;
