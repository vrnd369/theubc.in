import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../BrandsCarousel.css";
import { resolveImageUrl } from "../../utils/imageUtils";
import { parseInlineFormatting } from "../../admin/components/BrandPageEditor/InlineFontEditor";

// Helper function to convert \n to <br /> and apply inline formatting
const formatText = (text) => {
  if (!text) return "";
  // First apply inline formatting
  parseInlineFormatting(text);

  // Handle line breaks - parseInlineFormatting returns React elements or string
  // We need to process the text before formatting to handle \n
  const lines = text.split("\n");

  return lines.map((line, lineIndex, lineArray) => {
    const formattedLine = parseInlineFormatting(line);
    return (
      <React.Fragment key={lineIndex}>
        {formattedLine}
        {lineIndex < lineArray.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

// Helper to extract brand name from image URL or use a default
const getBrandName = (item, index) => {
  // First check if brandName is explicitly set
  if (item.brandName) {
    return item.brandName;
  }
  // Try to extract from image filename or use default
  if (item.image) {
    const filename = item.image.split("/").pop().split(".")[0];
    if (filename) {
      return filename.toUpperCase().replace(/[-_]/g, " ");
    }
  }
  return `BRAND ${index + 1}`;
};

const BrandCard = ({ item, index, totalItems }) => {
  const brandName = getBrandName(item, index);
  const isFirst = index === 0;
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const loadImage = async () => {
      if (item.image) {
        const url = await resolveImageUrl(item.image);
        setImageUrl(url || "");
      } else {
        setImageUrl("");
      }
    };
    loadImage();
  }, [item.image]);

  // Determine the link URL - prioritize brandSlug if available, otherwise use link
  // If link is /brands without a slug, keep it as /brands (listing page)
  // If link is /brands/:slug, use it as-is
  // If brandSlug is provided, construct /brands/:brandSlug
  const getBrandLink = () => {
    // If brandSlug is explicitly provided, use it
    if (item.brandSlug) {
      return `/brands/${item.brandSlug}`;
    }
    
    // If link is already a brand page URL, use it as-is
    if (item.link && item.link.startsWith('/brands/')) {
      return item.link;
    }
    
    // If link is /brands (listing page), use it as-is
    if (item.link === '/brands') {
      return item.link;
    }
    
    // If link is provided but not a brand page, use it (could be custom link)
    if (item.link) {
      return item.link;
    }
    
    // Default: no link
    return "#";
  };

  return (
    <div
      className={`brand-carousel-card ${isFirst ? "first-card" : ""}`}
      // Dimensions handled by CSS - no inline styles
    >
      <div className="brand-carousel-logo-area">
        <div className="brand-carousel-logo">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={brandName}
              className="brand-carousel-logo-img"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
                fontSize: "14px",
              }}
            >
              No Image
            </div>
          )}
        </div>
      </div>
      <div className="brand-carousel-content">
        <small className="brand-carousel-tag">
          <span className="brand-carousel-slash">/</span> {brandName}
        </small>
        {item.title && <h3>{formatText(item.title)}</h3>}
        {item.description && <p>{formatText(item.description)}</p>}
        {item.buttonText && (
          <Link
            to={getBrandLink()}
            className="brand-carousel-btn"
            style={{ backgroundColor: item.buttonColor || "#008562" }}
            data-button-color={item.buttonColor || "#008562"}
          >
            {item.buttonText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default function CarouselSection({
  content,
  styles = {},
  dimensions = {},
}) {
  const rowRef = useRef(null);
  const items = content?.items || [];
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Extract styles with defaults
  const backgroundColor = styles?.backgroundColor;

  // Get current device dimensions (will be set via CSS media queries)
  // We'll set CSS custom properties that can be overridden by media queries
  const desktopDims = dimensions?.desktop || {};
  const tabletDims = dimensions?.tablet || {};
  const mobileDims = dimensions?.mobile || {};

  // Build section style with CSS custom properties for dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }),
    // Set CSS custom properties for dimensions
    "--carousel-padding-top-desktop": desktopDims.paddingTop
      ? `${desktopDims.paddingTop}px`
      : "140px",
    "--carousel-padding-bottom-desktop": desktopDims.paddingBottom
      ? `${desktopDims.paddingBottom}px`
      : "140px",
    "--carousel-padding-top-tablet": tabletDims.paddingTop
      ? `${tabletDims.paddingTop}px`
      : "80px",
    "--carousel-padding-bottom-tablet": tabletDims.paddingBottom
      ? `${tabletDims.paddingBottom}px`
      : "80px",
    "--carousel-padding-top-mobile": mobileDims.paddingTop
      ? `${mobileDims.paddingTop}px`
      : "56px",
    "--carousel-padding-bottom-mobile": mobileDims.paddingBottom
      ? `${mobileDims.paddingBottom}px`
      : "56px",
    "--carousel-container-padding-desktop": desktopDims.containerPadding
      ? `${desktopDims.containerPadding}px`
      : "24px",
    "--carousel-container-padding-tablet": tabletDims.containerPadding
      ? `${tabletDims.containerPadding}px`
      : "32px",
    "--carousel-container-padding-mobile": mobileDims.containerPadding
      ? `${mobileDims.containerPadding}px`
      : "20px",
    "--carousel-card-width-desktop": desktopDims.cardWidth
      ? typeof desktopDims.cardWidth === "number"
        ? `${desktopDims.cardWidth}px`
        : desktopDims.cardWidth
      : "736px",
    "--carousel-card-height-desktop": desktopDims.cardHeight
      ? typeof desktopDims.cardHeight === "number"
        ? `${desktopDims.cardHeight}px`
        : desktopDims.cardHeight
      : "358px",
    "--carousel-card-gap-desktop": desktopDims.cardGap
      ? `${desktopDims.cardGap}px`
      : "24px",
    "--carousel-card-width-tablet": tabletDims.cardWidth
      ? typeof tabletDims.cardWidth === "number"
        ? `${tabletDims.cardWidth}px`
        : tabletDims.cardWidth
      : "680px",
    "--carousel-card-height-tablet": tabletDims.cardHeight
      ? typeof tabletDims.cardHeight === "number"
        ? `${tabletDims.cardHeight}px`
        : tabletDims.cardHeight
      : "330px",
    "--carousel-card-gap-tablet": tabletDims.cardGap
      ? `${tabletDims.cardGap}px`
      : "20px",
    "--carousel-card-width-mobile": mobileDims.cardWidth
      ? typeof mobileDims.cardWidth === "number"
        ? `${mobileDims.cardWidth}px`
        : mobileDims.cardWidth
      : "calc(100vw - 40px)",
    "--carousel-card-height-mobile": mobileDims.cardHeight
      ? typeof mobileDims.cardHeight === "number"
        ? `${mobileDims.cardHeight}px`
        : mobileDims.cardHeight
      : "180px",
    "--carousel-card-gap-mobile": mobileDims.cardGap
      ? `${mobileDims.cardGap}px`
      : "8px",
    "--carousel-logo-width-desktop": desktopDims.logoWidth
      ? `${desktopDims.logoWidth}px`
      : "252px",
    "--carousel-logo-height-desktop": desktopDims.logoHeight
      ? `${desktopDims.logoHeight}px`
      : "310px",
    "--carousel-logo-width-tablet": tabletDims.logoWidth
      ? `${tabletDims.logoWidth}px`
      : "220px",
    "--carousel-logo-height-tablet": tabletDims.logoHeight
      ? `${tabletDims.logoHeight}px`
      : "220px",
    "--carousel-logo-width-mobile": mobileDims.logoWidth
      ? `${mobileDims.logoWidth}px`
      : "140px",
    "--carousel-logo-height-mobile": mobileDims.logoHeight
      ? `${mobileDims.logoHeight}px`
      : "140px",
    "--carousel-heading-font-size-desktop": desktopDims.headingFontSize
      ? `${desktopDims.headingFontSize}px`
      : "44px",
    "--carousel-heading-font-size-tablet": tabletDims.headingFontSize
      ? `${tabletDims.headingFontSize}px`
      : "40px",
    "--carousel-heading-font-size-mobile": mobileDims.headingFontSize
      ? `${mobileDims.headingFontSize}px`
      : "32px",
    "--carousel-description-font-size-desktop": desktopDims.descriptionFontSize
      ? `${desktopDims.descriptionFontSize}px`
      : "18px",
    "--carousel-description-font-size-tablet": tabletDims.descriptionFontSize
      ? `${tabletDims.descriptionFontSize}px`
      : "17.5px",
    "--carousel-description-font-size-mobile": mobileDims.descriptionFontSize
      ? `${mobileDims.descriptionFontSize}px`
      : "16px",
    "--carousel-title-font-size-desktop": desktopDims.titleFontSize
      ? `${desktopDims.titleFontSize}px`
      : "28px",
    "--carousel-title-font-size-tablet": tabletDims.titleFontSize
      ? `${tabletDims.titleFontSize}px`
      : "26px",
    "--carousel-title-font-size-mobile": mobileDims.titleFontSize
      ? `${mobileDims.titleFontSize}px`
      : "20px",
    "--carousel-description-text-font-size-desktop":
      desktopDims.descriptionTextFontSize
        ? `${desktopDims.descriptionTextFontSize}px`
        : "14px",
    "--carousel-description-text-font-size-tablet":
      tabletDims.descriptionTextFontSize
        ? `${tabletDims.descriptionTextFontSize}px`
        : "13.5px",
    "--carousel-description-text-font-size-mobile":
      mobileDims.descriptionTextFontSize
        ? `${mobileDims.descriptionTextFontSize}px`
        : "12px",
  };

  // No containerStyle - dimensions handled by CSS
  const containerStyle = {};

  // Update arrow states based on scroll position
  const updateArrowStates = () => {
    const row = rowRef.current;
    if (!row) return;

    const { scrollLeft, scrollWidth, clientWidth } = row;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Block manual horizontal scroll (allow vertical scroll)
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    row.addEventListener("wheel", onWheel, { passive: false });
    row.addEventListener("scroll", updateArrowStates);
    
    // Initial check
    updateArrowStates();

    return () => {
      row.removeEventListener("wheel", onWheel);
      row.removeEventListener("scroll", updateArrowStates);
    };
  }, []);

  // How far to slide (exactly one card + the gap)
  const stepWidth = () => {
    const row = rowRef.current;
    if (!row) return 0;

    const card = row.querySelector(".brand-carousel-card");
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
    
    // Update states after a short delay to allow scroll to complete
    setTimeout(updateArrowStates, 100);
  };

  if (!content || items.length === 0) {
    return null;
  }

  const textAlignment = content.textAlignment || "left";

  return (
    <section className="brands-carousel-section" style={sectionStyle}>
      <div className="container" style={containerStyle}>
        <div className="brands-carousel-header">
          <div
            className="brands-carousel-text"
            style={{ textAlign: textAlignment }}
          >
            {content.tag && (
              <span className="brands-carousel-tag">{content.tag}</span>
            )}
            {content.heading && <h2>{formatText(content.heading)}</h2>}
            {content.description && (
              <div className="brands-carousel-description-wrapper">
                <p className="brands-carousel-description">
                  {content.description.split("\n").map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {parseInlineFormatting(line)}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            )}
          </div>

          {/* ARROW PILL */}
          {items.length > 1 && (
            <div className="brands-carousel-arrows">
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
                  style={{ stroke: canScrollLeft ? '#111827' : '#6B7280' }}
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
                  style={{ stroke: canScrollRight ? '#111827' : '#6B7280' }}
                >
                  <line x1="8" y1="20" x2="30" y2="20" />
                  <polyline points="22 12 30 20 22 28" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div
          className="brands-carousel-cards-wrapper no-user-scroll"
          ref={rowRef}
        >
          <div
            className="brands-carousel-cards"
            style={{
              // Let CSS handle dimensions responsively
              minWidth: "auto",
            }}
          >
            {items.map((item, index) => (
              <BrandCard
                key={index}
                item={item}
                index={index}
                totalItems={items.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
