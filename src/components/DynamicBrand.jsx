import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBrandPageByBrandId } from "../admin/services/brandPageService";
import { getBrands } from "../admin/services/productService";
import { getCategories } from "../admin/services/productService";
import { resolveImageUrl } from "../utils/imageUtils";
import { parseInlineFormatting } from "../admin/components/BrandPageEditor/InlineFontEditor";
import {
  getDimensions,
} from "../admin/components/BrandPageEditor/dimensionUtils";
import { detectDevice } from "../admin/components/BrandPageEditor/deviceBreakpoints";
import "../pages/Brands.css";

/**
 * Dynamic Brand component that fetches brand page data from Firebase
 * Optimized for fast rendering - loads content immediately, images in background
 */
export default function DynamicBrand() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // Store actual categories from database
  const [device, setDevice] = useState("desktop"); // Current device breakpoint
  const rowRef = useRef(null);

  // Detect device breakpoint - Hardcoded to match Brands.css breakpoints
  // Desktop: >= 1024px, Tablet: 768px - 1023px, Mobile: <= 767px
  // Automatically applies correct dimensions based on screen size
  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      // Use hardcoded breakpoint detection
      setDevice(detectDevice(width));
    };

    // Set initial device
    updateDevice();

    // Update on resize
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  useEffect(() => {
    if (!brandSlug) {
      setError("Brand slug is required");
      setLoading(false);
      return;
    }

    loadBrandPage();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug]);

  useEffect(() => {
    // Block manual horizontal scroll (allow vertical scroll)
    const row = rowRef.current;
    if (!row) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    row.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      row.removeEventListener("wheel", onWheel);
    };
  }, [categories]); // Update when categories change

  const loadBrandPage = async () => {
    try {
      setLoading(true);
      setError(null);

      // brandSlug from URL is the brand identifier (e.g., "soil-king")
      const page = await getBrandPageByBrandId(brandSlug);

      if (!page) {
        setError(`Brand page not found for "${brandSlug}"`);
        setLoading(false);
        return;
      }

      if (page.enabled === false) {
        setError("This brand page is currently disabled.");
        setLoading(false);
        return;
      }

      // Set page data immediately for fast rendering
      setPageData(page);
      setLoading(false);

      // Load images in background
      loadImages(page);
    } catch (err) {
      console.error("Error loading brand page:", err);
      setError("Failed to load brand page. Please try again.");
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Fetch brands first to find the correct brand identifier format
      // brandSlug from URL is the brand identifier (e.g., "soil-king")
      const brandsData = await getBrands();
      const brand = brandsData.find((b) => (b.brandId || b.id) === brandSlug);

      let categoriesData = [];

      if (brand) {
        // Try with brand identifier first (most common case)
        categoriesData = await getCategories(brand.brandId || brandSlug);

        // If no categories found with brand identifier, try with document ID (fallback)
        if (categoriesData.length === 0 && brand.id !== (brand.brandId || brandSlug)) {
          categoriesData = await getCategories(brand.id);
        }
      } else {
        // Fallback: try with brandSlug directly
        categoriesData = await getCategories(brandSlug);
      }

      // Filter enabled categories only
      const enabledCategories = categoriesData.filter(
        (cat) => cat.enabled !== false
      );

      setCategories(enabledCategories);

      // Load category images
      enabledCategories.forEach((category, index) => {
        if (category.image) {
          resolveImageUrl(category.image)
            .then((url) => {
              if (url)
                setImageUrls((prev) => ({
                  ...prev,
                  [`category-${index}`]: url,
                }));
            })
            .catch(() => {});
        }
      });
    } catch (err) {
      console.error("Error loading categories:", err);
      // Don't set error, just use empty array - products section will be hidden
      setCategories([]);
    }
  };

  const loadImages = async (page) => {
    const imagePromises = [];

    // Hero images
    if (page.hero?.backgroundImage1) {
      imagePromises.push(
        resolveImageUrl(page.hero.backgroundImage1)
          .then((url) => {
            if (url) setImageUrls((prev) => ({ ...prev, "hero-bg1": url }));
          })
          .catch(() => {})
      );
    }
    if (page.hero?.backgroundImage2) {
      imagePromises.push(
        resolveImageUrl(page.hero.backgroundImage2)
          .then((url) => {
            if (url) setImageUrls((prev) => ({ ...prev, "hero-bg2": url }));
          })
          .catch(() => {})
      );
    }

    // Product images
    if (page.products?.items) {
      page.products.items.forEach((item, index) => {
        if (item.image) {
          imagePromises.push(
            resolveImageUrl(item.image)
              .then((url) => {
                if (url)
                  setImageUrls((prev) => ({
                    ...prev,
                    [`product-${index}`]: url,
                  }));
              })
              .catch(() => {})
          );
        }
      });
    }

    // Don't wait - let images load progressively
    Promise.all(imagePromises).catch(() => {});
  };

  const stepWidth = () => {
    const row = rowRef.current;
    if (!row) return 0;

    const card = row.querySelector(".brand-prod-card");
    if (!card) return 0;

    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;

    return card.offsetWidth + gap;
  };

  const slide = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;

    row.scrollBy({
      left: dir * stepWidth(),
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <main className="brand-page">
        <div style={{ padding: "4rem", textAlign: "center" }}>
          <div className="admin-spinner" style={{ margin: "0 auto" }}></div>
          <p style={{ marginTop: "1rem", color: "#64748b" }}>
            Loading brand page...
          </p>
        </div>
      </main>
    );
  }

  if (error || !pageData) {
    return (
      <main className="brand-page">
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 2rem",
            backgroundColor: "#f5f6f8",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "600px",
              width: "100%",
            }}
          >
            {/* Professional SVG Illustration */}
            <div
              style={{
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg
                width="280"
                height="240"
                viewBox="0 0 280 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ maxWidth: "100%", height: "auto" }}
              >
                {/* Background Circle */}
                <circle
                  cx="140"
                  cy="120"
                  r="100"
                  fill="#E8EAF6"
                  opacity="0.5"
                />
                {/* Main Illustration - Search/Magnifying Glass */}
                <g transform="translate(140, 120)">
                  {/* Magnifying Glass */}
                  <circle
                    cx="0"
                    cy="0"
                    r="45"
                    fill="none"
                    stroke="#323790"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <line
                    x1="32"
                    y1="32"
                    x2="55"
                    y2="55"
                    stroke="#323790"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Question Mark */}
                  <text
                    x="0"
                    y="8"
                    fontSize="60"
                    fill="#323790"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Arial, sans-serif"
                  >
                    ?
                  </text>
                </g>
                {/* Decorative Elements */}
                <circle
                  cx="80"
                  cy="60"
                  r="8"
                  fill="#FFC107"
                  opacity="0.6"
                />
                <circle
                  cx="200"
                  cy="180"
                  r="6"
                  fill="#4CAF50"
                  opacity="0.6"
                />
                <circle
                  cx="220"
                  cy="50"
                  r="5"
                  fill="#F44336"
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#1a1a1a",
                marginBottom: "1rem",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Brand Page Not Found
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#64748b",
                marginBottom: "2.5rem",
                lineHeight: "1.6",
              }}
            >
              {error ||
                `We couldn't find a brand page for "${brandSlug}". The page may not exist or has been removed.`}
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/brands")}
                className="btn btn-primary"
                style={{
                  padding: "0.875rem 2rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Browse All Brands
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn"
                style={{
                  padding: "0.875rem 2rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "2px solid #323790",
                  backgroundColor: "transparent",
                  color: "#323790",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#323790";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#323790";
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const heroBg1 =
    imageUrls["hero-bg1"] || pageData.hero?.backgroundImage1 || "";
  const heroBg2 =
    imageUrls["hero-bg2"] || pageData.hero?.backgroundImage2 || "";
  const styles = pageData.styles || {};
  const dimensions = pageData.dimensions || {};

  // Dimensions are now hardcoded in CSS - only get font sizes for content styling
  const heroDims = getDimensions(dimensions, "hero", device);

  return (
    <main className="brand-page">
      {/* Hero Section */}
      {pageData.hero && (
        <section
          className="brand-hero"
          aria-label={pageData.hero.title || "Brand Hero"}
          style={{
            backgroundColor: styles.hero?.backgroundColor || "#f5f6f8",
            // Dimensions (padding, margins, height, etc.) are hardcoded in CSS
          }}
        >
          {heroBg1 && (
            <div
              className="brand-hero__bg-image"
              style={{
                backgroundImage: `url("${heroBg1}")`,
                width: styles.hero?.bgImage1Width
                  ? `${styles.hero.bgImage1Width}%`
                  : undefined,
              }}
            />
          )}

          {heroBg2 && (
            <div
              className="brand-hero__fg-image"
              style={{
                backgroundImage: `url("${heroBg2}")`,
                width: styles.hero?.bgImage2Width
                  ? `${styles.hero.bgImage2Width}%`
                  : undefined,
                height: styles.hero?.bgImage2Height
                  ? `${styles.hero.bgImage2Height}%`
                  : undefined,
              }}
            />
          )}

          <div className="brand-hero__overlay" />
          <div className="container brand-hero__inner">
            {pageData.hero.title && (
              <h1
                className="brand-hero__title"
                style={{
                  textAlign: styles.hero?.titleAlign || "center",
                  fontSize:
                    heroDims.titleFontSize || undefined,
                  maxWidth: styles.hero?.titleMaxWidth
                    ? `${styles.hero.titleMaxWidth}px`
                    : undefined,
                }}
              >
                {pageData.hero.title.split("\n").map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {parseInlineFormatting(line)}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
                {pageData.hero.titleLine2 && (
                  <>
                    <br />
                    {parseInlineFormatting(pageData.hero.titleLine2)}
                  </>
                )}
              </h1>
            )}
            {pageData.hero.leadText && (
              <p
                className="brand-hero__lead"
                style={{
                  textAlign: styles.hero?.leadTextAlign || "center",
                  fontSize:
                    heroDims.leadFontSize || undefined,
                  maxWidth: styles.hero?.leadTextMaxWidth
                    ? `${styles.hero.leadTextMaxWidth}px`
                    : undefined,
                }}
              >
                {pageData.hero.leadText.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < pageData.hero.leadText.split("\n").length - 1 && (
                      <br />
                    )}
                  </React.Fragment>
                ))}
              </p>
            )}
            {pageData.hero.ctaText && pageData.hero.ctaLink && (
              <div
                className="hero-cta-wrapper"
                data-align={
                  styles.hero?.ctaButtonAlign || "center"
                }
              >
                <a
                  href={pageData.hero.ctaLink}
                  className="btn btn-primary"
                  style={{
                    padding: styles.hero?.buttonPadding || undefined,
                    fontSize: styles.hero?.buttonFontSize
                      ? `${styles.hero.buttonFontSize}px`
                      : undefined,
                    backgroundColor: styles.hero?.ctaButtonBgColor || undefined,
                    color: styles.hero?.ctaButtonTextColor || undefined,
                  }}
                >
                  {pageData.hero.ctaText}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      {pageData.about && (
        <section
          className="brand-section brand-about"
          style={{
            backgroundColor: styles.about?.backgroundColor || "#f5f6f8",
            // Dimensions (padding, margins, gaps, etc.) are hardcoded in CSS
          }}
        >
          <div className="container">
            {pageData.about.eyebrow && (
              <div
                className="eyebrow"
                style={{
                  fontSize: styles.about?.eyebrowFontSize
                    ? `${styles.about.eyebrowFontSize}px`
                    : undefined,
                  height: styles.about?.eyebrowHeight
                    ? `${styles.about.eyebrowHeight}px`
                    : undefined,
                  padding: styles.about?.eyebrowPadding || undefined,
                  marginBottom: styles.about?.eyebrowMarginBottom
                    ? `${styles.about.eyebrowMarginBottom}px`
                    : undefined,
                }}
              >
                {pageData.about.eyebrow}
              </div>
            )}
            <div className="brand-grid">
              {pageData.about.title && (
                <h2
                  className="brand-title"
                  style={{
                    textAlign: styles.about?.titleAlign || "left",
                    fontSize: styles.about?.titleFontSize
                      ? `${styles.about.titleFontSize}px`
                      : undefined,
                    width: styles.about?.titleWidth
                      ? `${styles.about.titleWidth}px`
                      : undefined,
                  }}
                >
                  {parseInlineFormatting(pageData.about.title)}
                </h2>
              )}
              <div
                className="brand-copy"
                style={{
                  textAlign: styles.about?.paragraphAlign || "left",
                }}
              >
                {pageData.about.paragraphs?.map((para, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: styles.about?.paragraphFontSize
                        ? `${styles.about.paragraphFontSize}px`
                        : undefined,
                      lineHeight:
                        styles.about?.paragraphLineHeight || undefined,
                      width: styles.about?.paragraphWidth
                        ? `${styles.about.paragraphWidth}px`
                        : undefined,
                      marginBottom:
                        index < pageData.about.paragraphs.length - 1 &&
                        styles.about?.paragraphGap
                          ? `${styles.about.paragraphGap}px`
                          : undefined,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What We Stand For Section */}
      {pageData.standFor && (
        <section
          className="brand-section brand-standfor"
          style={{
            backgroundColor: styles.standFor?.backgroundColor || "#ffffff",
            // Dimensions (padding, margins, gaps, etc.) are hardcoded in CSS
          }}
        >
          <div className="container">
            {pageData.standFor.eyebrow && (
              <div
                className="eyebrow"
                style={{
                  fontSize: styles.standFor?.eyebrowFontSize
                    ? `${styles.standFor.eyebrowFontSize}px`
                    : undefined,
                  height: styles.standFor?.eyebrowHeight
                    ? `${styles.standFor.eyebrowHeight}px`
                    : undefined,
                  padding: styles.standFor?.eyebrowPadding || undefined,
                  marginBottom: styles.standFor?.eyebrowMarginBottom
                    ? `${styles.standFor.eyebrowMarginBottom}px`
                    : undefined,
                }}
              >
                {pageData.standFor.eyebrow}
              </div>
            )}
            <div className="brand-grid">
              {pageData.standFor.title && (
                <h2
                  className="brand-title"
                  style={{
                    textAlign: styles.standFor?.titleAlign || "left",
                    fontSize: styles.standFor?.titleFontSize
                      ? `${styles.standFor.titleFontSize}px`
                      : undefined,
                    width: styles.standFor?.titleWidth
                      ? `${styles.standFor.titleWidth}px`
                      : undefined,
                  }}
                >
                  {parseInlineFormatting(pageData.standFor.title)}
                </h2>
              )}
              <div
                className="brand-copy"
                style={{
                  textAlign: styles.standFor?.paragraphAlign || "left",
                }}
              >
                {pageData.standFor.paragraphs?.map((para, index) => (
                  <p
                    key={index}
                    className={index > 0 ? "muted" : ""}
                    style={{
                      fontSize: styles.standFor?.paragraphFontSize
                        ? `${styles.standFor.paragraphFontSize}px`
                        : undefined,
                      lineHeight:
                        styles.standFor?.paragraphLineHeight || undefined,
                      width: styles.standFor?.paragraphWidth
                        ? `${styles.standFor.paragraphWidth}px`
                        : undefined,
                      marginBottom:
                        index < pageData.standFor.paragraphs.length - 1 &&
                        styles.standFor?.paragraphGap
                          ? `${styles.standFor.paragraphGap}px`
                          : undefined,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Section */}
      {pageData.why && (
        <section
          className="brand-section brand-why"
          style={{
            backgroundColor: styles.why?.backgroundColor || "#f5f6f8",
            // Dimensions (padding, margins, gaps, etc.) are hardcoded in CSS
          }}
        >
          <div
            className="container"
          >
            {pageData.why.eyebrow && (
              <div
                className="eyebrow"
                style={{
                  fontSize: styles.why?.eyebrowFontSize
                    ? `${styles.why.eyebrowFontSize}px`
                    : undefined,
                  height: styles.why?.eyebrowHeight
                    ? `${styles.why.eyebrowHeight}px`
                    : undefined,
                  padding: styles.why?.eyebrowPadding || undefined,
                  marginBottom: styles.why?.eyebrowMarginBottom
                    ? `${styles.why.eyebrowMarginBottom}px`
                    : undefined,
                }}
              >
                {pageData.why.eyebrow}
              </div>
            )}
            <div className="brand-grid">
              {pageData.why.title && (
                <h2
                  className="brand-title"
                  style={{
                    textAlign: styles.why?.titleAlign || "left",
                    fontSize: styles.why?.titleFontSize
                      ? `${styles.why.titleFontSize}px`
                      : undefined,
                    width: styles.why?.titleWidth
                      ? `${styles.why.titleWidth}px`
                      : undefined,
                  }}
                >
                  {parseInlineFormatting(pageData.why.title)}
                </h2>
              )}
              <div
                className="brand-copy"
                style={{
                  textAlign: styles.why?.paragraphAlign || "left",
                }}
              >
                {pageData.why.paragraphs?.map((para, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: styles.why?.paragraphFontSize
                        ? `${styles.why.paragraphFontSize}px`
                        : undefined,
                      lineHeight: styles.why?.paragraphLineHeight || undefined,
                      width: styles.why?.paragraphWidth
                        ? `${styles.why.paragraphWidth}px`
                        : undefined,
                      marginBottom:
                        index < pageData.why.paragraphs.length - 1 &&
                        styles.why?.paragraphGap
                          ? `${styles.why.paragraphGap}px`
                          : undefined,
                    }}
                  >
                    {para}
                  </p>
                ))}
                {pageData.why.ctaText && pageData.why.ctaLink && (
                  <a
                    href={pageData.why.ctaLink}
                    className="btn btn-primary"
                    style={{
                      padding: styles.why?.buttonPadding || undefined,
                      fontSize: styles.why?.buttonFontSize
                        ? `${styles.why.buttonFontSize}px`
                        : undefined,
                      backgroundColor: styles.why?.buttonBgColor || "#323790",
                      color: styles.why?.buttonTextColor || "#FFFFFF",
                    }}
                  >
                    {pageData.why.ctaText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section - Using actual categories and products from database */}
      {pageData && (
        <section
          id="brand-products"
          className="brand-section brand-products"
          style={{
            backgroundColor: styles.products?.backgroundColor || "#f5f6f8",
            // Dimensions (padding, margins, gaps, etc.) are hardcoded in CSS
          }}
        >
          <div className="container">
            <div className="prod-head">
              <div>
                <h2
                  className="prod-title"
                  style={{
                    textAlign: styles.products?.titleAlign || "left",
                    fontSize: styles.products?.titleFontSize
                      ? `${styles.products.titleFontSize}px`
                      : undefined,
                    width: styles.products?.titleWidth
                      ? `${styles.products.titleWidth}px`
                      : undefined,
                  }}
                >
                  {(
                    pageData.products?.title ||
                    (pageData.brandName
                      ? `Explore ${pageData.brandName} Products`
                      : "Explore Products")
                  )
                    .split("\n")
                    .map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                </h2>
              </div>

              <div className="prod-arrows">
                <button
                  aria-label="Previous"
                  className="btn icon-btn prev"
                  onClick={() => slide(-1)}
                  type="button"
                >
                  <svg
                    className="arrow-icon"
                    viewBox="0 0 40 40"
                    aria-hidden="true"
                  >
                    <line x1="32" y1="20" x2="10" y2="20" />
                    <polyline points="18 12 10 20 18 28" />
                  </svg>
                </button>
                <button
                  aria-label="Next"
                  className="btn icon-btn next"
                  onClick={() => slide(1)}
                  type="button"
                >
                  <svg
                    className="arrow-icon"
                    viewBox="0 0 40 40"
                    aria-hidden="true"
                  >
                    <line x1="8" y1="20" x2="30" y2="20" />
                    <polyline points="22 12 30 20 22 28" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className="brand-prod-row no-user-scroll"
              ref={rowRef}
            >
              {/* Show only categories */}
              {categories &&
                categories.length > 0 &&
                categories.map((category, index) => {
                  const categoryImage =
                    imageUrls[`category-${index}`] || category.image || "";
                  const categoryHref =
                    category.href ||
                    `/products?brand=${brandSlug}${
                      category.categoryId
                        ? `&category=${category.categoryId}`
                        : ""
                    }`;
                  return (
                    <article
                      className="brand-prod-card"
                      key={category.id || category.categoryId || index}
                    >
                      <div className="brand-prod-media">
                        {categoryImage && (
                          <img
                            src={categoryImage}
                            alt={category.title || "Product Category"}
                          />
                        )}
                      </div>

                      <div className="brand-prod-body">
                        <div className="brand-prod-header">
                          <div className="brand-prod-text-container">
                            {category.title && (
                              <h3 className="brand-prod-name">
                                {category.title}
                              </h3>
                            )}
                            {category.subtitle && (
                              <p className="brand-prod-blurb">
                                {category.subtitle}
                              </p>
                            )}
                          </div>
                          <a href={categoryHref} className="chip-link">
                            {pageData.products?.cta || "Know More"}
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
