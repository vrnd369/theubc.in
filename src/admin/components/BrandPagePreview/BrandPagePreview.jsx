import React, { useState, useEffect, useRef } from "react";
import { resolveImageUrl } from "../../../utils/imageUtils";
import "../../../pages/Brands.css";
import "./BrandPagePreview.css";

/**
 * Brand Page Preview Component
 * Renders a brand page preview in a modal for the CMS dashboard
 */
export default function BrandPagePreview({ pageData, onClose }) {
  const [imageUrls, setImageUrls] = useState({});
  const rowRef = useRef(null);

  useEffect(() => {
    if (!pageData) return;

    // Resolve all image URLs
    const resolveImages = async () => {
      const urls = {};

      // Hero images
      if (pageData.hero?.backgroundImage1) {
        const url = await resolveImageUrl(pageData.hero.backgroundImage1);
        if (url) urls["hero-bg1"] = url;
      }
      if (pageData.hero?.backgroundImage2) {
        const url = await resolveImageUrl(pageData.hero.backgroundImage2);
        if (url) urls["hero-bg2"] = url;
      }

      // Product images
      if (pageData.products?.items) {
        for (let i = 0; i < pageData.products.items.length; i++) {
          const item = pageData.products.items[i];
          if (item.image) {
            const key = `product-${i}`;
            urls[key] = await resolveImageUrl(item.image);
          }
        }
      }

      setImageUrls(urls);
    };

    resolveImages();
  }, [pageData]);

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
  }, [pageData]);

  if (!pageData) {
    return (
      <div className="preview-modal">
        <div className="preview-modal-content">
          <div className="preview-loading">Loading preview...</div>
        </div>
      </div>
    );
  }

  const slide = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector(".brand-prod-card");
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const stepWidth = (card?.offsetWidth || 0) + gap;
    row.scrollBy({ left: dir * stepWidth, behavior: "smooth" });
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-modal-header">
          <h2>Preview: {pageData.brandName || pageData.brandId}</h2>
          <button className="preview-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="preview-modal-body">
          <main className="brand-page">
            {/* Hero Section */}
            {pageData.hero && (
              <section
                className="brand-hero"
                style={{
                  minHeight: pageData.hero?.styles?.sectionMinHeight
                    ? `${pageData.hero.styles.sectionMinHeight}px`
                    : "1200px",
                  paddingTop: pageData.hero?.styles?.paddingTop
                    ? `${pageData.hero.styles.paddingTop}px`
                    : "240px",
                  paddingBottom: pageData.hero?.styles?.paddingBottom
                    ? `${pageData.hero.styles.paddingBottom}px`
                    : "80px",
                  backgroundColor:
                    pageData.hero?.styles?.backgroundColor || "#f5f6f8",
                }}
              >
                {imageUrls["hero-bg1"] && (
                  <div
                    className="brand-hero__bg-image"
                    style={{
                      backgroundImage: `url("${imageUrls["hero-bg1"]}")`,
                      backgroundSize:
                        pageData.hero?.styles?.bgImage1Size || "cover",
                      backgroundPosition:
                        pageData.hero?.styles?.bgImage1Position ||
                        "center center",
                      backgroundRepeat:
                        pageData.hero?.styles?.bgImage1Repeat || "no-repeat",
                      width: pageData.hero?.styles?.bgImage1Width
                        ? `${pageData.hero.styles.bgImage1Width}%`
                        : "100%",
                    }}
                  />
                )}
                {imageUrls["hero-bg2"] && (
                  <div
                    className="brand-hero__fg-image"
                    style={{
                      backgroundImage: `url("${imageUrls["hero-bg2"]}")`,
                      backgroundSize:
                        pageData.hero?.styles?.bgImage2Size || "cover",
                      backgroundPosition:
                        pageData.hero?.styles?.bgImage2Position ||
                        "center center",
                      backgroundRepeat:
                        pageData.hero?.styles?.bgImage2Repeat || "no-repeat",
                      width: pageData.hero?.styles?.bgImage2Width
                        ? `${pageData.hero.styles.bgImage2Width}%`
                        : "80%",
                      height: pageData.hero?.styles?.bgImage2Height
                        ? `${pageData.hero.styles.bgImage2Height}%`
                        : "120%",
                    }}
                  />
                )}
                <div className="brand-hero__overlay" />
                <div className="container brand-hero__inner">
                  <h1
                    className="brand-hero__title"
                    style={{
                      textAlign: pageData.hero?.styles?.titleAlign || "center",
                      fontSize: pageData.hero?.styles?.titleFontSize
                        ? `${pageData.hero.styles.titleFontSize}px`
                        : undefined,
                      width: pageData.hero?.styles?.titleWidth
                        ? `${pageData.hero.styles.titleWidth}px`
                        : undefined,
                      margin:
                        pageData.hero?.styles?.titleMargin || "0 0 16px 0",
                      color: pageData.hero?.styles?.titleColor || "#111827",
                      lineHeight:
                        pageData.hero?.styles?.titleLineHeight || "1.1",
                      letterSpacing:
                        pageData.hero?.styles?.titleLetterSpacing || "-0.06em",
                      textShadow:
                        pageData.hero?.styles?.titleTextShadow ||
                        "0 6px 28px rgba(0, 0, 0, 0.35)",
                    }}
                  >
                    {pageData.hero.title}
                    {pageData.hero.titleLine2 && (
                      <>
                        <br />
                        {pageData.hero.titleLine2}
                      </>
                    )}
                  </h1>
                  {pageData.hero.leadText && (
                    <p
                      className="brand-hero__lead"
                      style={{
                        textAlign:
                          pageData.hero?.styles?.leadTextAlign || "center",
                        fontSize: pageData.hero?.styles?.leadTextFontSize
                          ? `${pageData.hero.styles.leadTextFontSize}px`
                          : undefined,
                        maxWidth: pageData.hero?.styles?.leadTextMaxWidth
                          ? `${pageData.hero.styles.leadTextMaxWidth}px`
                          : "820px",
                        margin:
                          pageData.hero?.styles?.leadTextMargin ||
                          "0 auto 32px",
                        color:
                          pageData.hero?.styles?.leadTextColor || "#374151",
                        lineHeight:
                          pageData.hero?.styles?.leadTextLineHeight || "1.6",
                      }}
                    >
                      {pageData.hero.leadText}
                    </p>
                  )}
                  {pageData.hero.ctaText && (
                    <a
                      href={pageData.hero.ctaLink || "#"}
                      className="btn btn-primary"
                      style={{
                        padding:
                          pageData.hero?.styles?.ctaButtonPadding ||
                          "12px 24px",
                        fontSize:
                          pageData.hero?.styles?.ctaButtonFontSize || "16px",
                        backgroundColor:
                          pageData.hero?.styles?.ctaButtonBgColor || "#323790",
                        color:
                          pageData.hero?.styles?.ctaButtonTextColor ||
                          "#FFFFFF",
                        borderRadius:
                          pageData.hero?.styles?.ctaButtonBorderRadius || "4px",
                      }}
                    >
                      {pageData.hero.ctaText}
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* About Section */}
            {pageData.about && (
              <section
                className="brand-section brand-about"
                style={{
                  backgroundColor:
                    pageData.about?.styles?.backgroundColor || "#f5f6f8",
                  paddingTop: pageData.about?.styles?.paddingTop
                    ? `${pageData.about.styles.paddingTop}px`
                    : "140px",
                  paddingBottom: pageData.about?.styles?.paddingBottom
                    ? `${pageData.about.styles.paddingBottom}px`
                    : "140px",
                }}
              >
                <div className="container">
                  {pageData.about.eyebrow && (
                    <div
                      className="eyebrow"
                      style={{
                        fontSize:
                          pageData.about?.styles?.eyebrowFontSize || "10px",
                        height: pageData.about?.styles?.eyebrowHeight
                          ? `${pageData.about.styles.eyebrowHeight}px`
                          : "33px",
                        padding:
                          pageData.about?.styles?.eyebrowPadding || "0 18px",
                        marginBottom: pageData.about?.styles
                          ?.eyebrowMarginBottom
                          ? `${pageData.about.styles.eyebrowMarginBottom}px`
                          : "24px",
                      }}
                    >
                      {pageData.about.eyebrow}
                    </div>
                  )}
                  <div
                    className="brand-grid"
                    style={{
                      gap: pageData.about?.styles?.gridGap
                        ? `${pageData.about.styles.gridGap}px`
                        : "64px",
                    }}
                  >
                    {pageData.about.title && (
                      <h2
                        className="brand-title"
                        style={{
                          textAlign:
                            pageData.about?.styles?.titleAlign || "left",
                          fontSize: pageData.about?.styles?.titleFontSize
                            ? `${pageData.about.styles.titleFontSize}px`
                            : "44px",
                          color:
                            pageData.about?.styles?.titleColor || "#111827",
                        }}
                      >
                        {pageData.about.title}
                      </h2>
                    )}
                    {pageData.about.paragraphs &&
                      pageData.about.paragraphs.length > 0 && (
                        <div className="brand-copy">
                          {pageData.about.paragraphs.map((para, idx) => (
                            <p
                              key={idx}
                              style={{
                                textAlign:
                                  pageData.about?.styles?.paragraphAlign ||
                                  "left",
                                fontSize: pageData.about?.styles
                                  ?.paragraphFontSize
                                  ? `${pageData.about.styles.paragraphFontSize}px`
                                  : "22px",
                                lineHeight:
                                  pageData.about?.styles?.paragraphLineHeight ||
                                  "1.25",
                                marginBottom:
                                  idx < pageData.about.paragraphs.length - 1
                                    ? pageData.about?.styles?.paragraphGap
                                      ? `${pageData.about.styles.paragraphGap}px`
                                      : "16px"
                                    : "0",
                                color:
                                  pageData.about?.styles?.paragraphColor ||
                                  "#374151",
                              }}
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </section>
            )}

            {/* Stand For Section */}
            {pageData.standFor && (
              <section
                className="brand-section brand-standfor"
                style={{
                  backgroundColor:
                    pageData.standFor?.styles?.backgroundColor || "#ffffff",
                  paddingTop: pageData.standFor?.styles?.paddingTop
                    ? `${pageData.standFor.styles.paddingTop}px`
                    : "140px",
                  paddingBottom: pageData.standFor?.styles?.paddingBottom
                    ? `${pageData.standFor.styles.paddingBottom}px`
                    : "140px",
                }}
              >
                <div className="container">
                  {pageData.standFor.eyebrow && (
                    <div
                      className="eyebrow"
                      style={{
                        fontSize:
                          pageData.standFor?.styles?.eyebrowFontSize || "10px",
                        height: pageData.standFor?.styles?.eyebrowHeight
                          ? `${pageData.standFor.styles.eyebrowHeight}px`
                          : "33px",
                        padding:
                          pageData.standFor?.styles?.eyebrowPadding || "0 18px",
                        marginBottom: pageData.standFor?.styles
                          ?.eyebrowMarginBottom
                          ? `${pageData.standFor.styles.eyebrowMarginBottom}px`
                          : "24px",
                      }}
                    >
                      {pageData.standFor.eyebrow}
                    </div>
                  )}
                  <div
                    className="brand-grid"
                    style={{
                      gap: pageData.standFor?.styles?.gridGap
                        ? `${pageData.standFor.styles.gridGap}px`
                        : "64px",
                    }}
                  >
                    {pageData.standFor.title && (
                      <h2
                        className="brand-title"
                        style={{
                          textAlign:
                            pageData.standFor?.styles?.titleAlign || "left",
                          fontSize: pageData.standFor?.styles?.titleFontSize
                            ? `${pageData.standFor.styles.titleFontSize}px`
                            : "44px",
                          color:
                            pageData.standFor?.styles?.titleColor || "#111827",
                        }}
                      >
                        {pageData.standFor.title}
                      </h2>
                    )}
                    {pageData.standFor.paragraphs &&
                      pageData.standFor.paragraphs.length > 0 && (
                        <div className="brand-copy">
                          {pageData.standFor.paragraphs.map((para, idx) => (
                            <p
                              key={idx}
                              className={para.includes("muted") ? "muted" : ""}
                              style={{
                                textAlign:
                                  pageData.standFor?.styles?.paragraphAlign ||
                                  "left",
                                fontSize: pageData.standFor?.styles
                                  ?.paragraphFontSize
                                  ? `${pageData.standFor.styles.paragraphFontSize}px`
                                  : "22px",
                                lineHeight:
                                  pageData.standFor?.styles
                                    ?.paragraphLineHeight || "1.25",
                                marginBottom:
                                  idx < pageData.standFor.paragraphs.length - 1
                                    ? pageData.standFor?.styles?.paragraphGap
                                      ? `${pageData.standFor.styles.paragraphGap}px`
                                      : "16px"
                                    : "0",
                                color:
                                  pageData.standFor?.styles?.paragraphColor ||
                                  "#374151",
                              }}
                            >
                              {para.replace("muted", "").trim()}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </section>
            )}

            {/* Why Section */}
            {pageData.why && (
              <section
                className="brand-section brand-why"
                style={{
                  backgroundColor:
                    pageData.why?.styles?.backgroundColor || "#f5f6f8",
                  paddingTop: pageData.why?.styles?.paddingTop
                    ? `${pageData.why.styles.paddingTop}px`
                    : "140px",
                  paddingBottom: pageData.why?.styles?.paddingBottom
                    ? `${pageData.why.styles.paddingBottom}px`
                    : "140px",
                }}
              >
                <div className="container">
                  {pageData.why.eyebrow && (
                    <div
                      className="eyebrow"
                      style={{
                        fontSize:
                          pageData.why?.styles?.eyebrowFontSize || "10px",
                        height: pageData.why?.styles?.eyebrowHeight
                          ? `${pageData.why.styles.eyebrowHeight}px`
                          : "33px",
                        padding:
                          pageData.why?.styles?.eyebrowPadding || "0 18px",
                        marginBottom: pageData.why?.styles?.eyebrowMarginBottom
                          ? `${pageData.why.styles.eyebrowMarginBottom}px`
                          : "24px",
                      }}
                    >
                      {pageData.why.eyebrow}
                    </div>
                  )}
                  <div
                    className="brand-grid"
                    style={{
                      gap: pageData.why?.styles?.gridGap
                        ? `${pageData.why.styles.gridGap}px`
                        : "64px",
                    }}
                  >
                    {pageData.why.title && (
                      <h2
                        className="brand-title"
                        style={{
                          textAlign: pageData.why?.styles?.titleAlign || "left",
                          fontSize: pageData.why?.styles?.titleFontSize
                            ? `${pageData.why.styles.titleFontSize}px`
                            : "44px",
                          color: pageData.why?.styles?.titleColor || "#111827",
                        }}
                      >
                        {pageData.why.title}
                      </h2>
                    )}
                    {pageData.why.paragraphs &&
                      pageData.why.paragraphs.length > 0 && (
                        <div className="brand-copy">
                          {pageData.why.paragraphs.map((para, idx) => (
                            <p
                              key={idx}
                              style={{
                                textAlign:
                                  pageData.why?.styles?.paragraphAlign ||
                                  "left",
                                fontSize: pageData.why?.styles
                                  ?.paragraphFontSize
                                  ? `${pageData.why.styles.paragraphFontSize}px`
                                  : "22px",
                                lineHeight:
                                  pageData.why?.styles?.paragraphLineHeight ||
                                  "1.25",
                                marginBottom:
                                  idx < pageData.why.paragraphs.length - 1
                                    ? pageData.why?.styles?.paragraphGap
                                      ? `${pageData.why.styles.paragraphGap}px`
                                      : "16px"
                                    : "0",
                                color:
                                  pageData.why?.styles?.paragraphColor ||
                                  "#374151",
                              }}
                            >
                              {para}
                            </p>
                          ))}
                          {pageData.why.ctaText && (
                            <a
                              href={pageData.why.ctaLink || "#"}
                              className="btn btn-primary"
                              style={{
                                marginTop: "24px",
                                padding:
                                  pageData.why?.styles?.buttonPadding ||
                                  "12px 24px",
                                fontSize:
                                  pageData.why?.styles?.buttonFontSize ||
                                  "16px",
                                backgroundColor:
                                  pageData.why?.styles?.buttonBgColor ||
                                  "#323790",
                                color:
                                  pageData.why?.styles?.buttonTextColor ||
                                  "#FFFFFF",
                                borderRadius:
                                  pageData.why?.styles?.buttonBorderRadius ||
                                  "4px",
                              }}
                            >
                              {pageData.why.ctaText}
                            </a>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </section>
            )}

            {/* Products Section */}
            {pageData.products &&
              pageData.products.items &&
              pageData.products.items.length > 0 && (
                <section
                  id="products"
                  className="brand-section brand-products"
                  style={{
                    backgroundColor:
                      pageData.products?.styles?.backgroundColor || "#f5f6f8",
                    paddingTop: pageData.products?.styles?.paddingTop
                      ? `${pageData.products.styles.paddingTop}px`
                      : "140px",
                    paddingBottom: pageData.products?.styles?.paddingBottom
                      ? `${pageData.products.styles.paddingBottom}px`
                      : "140px",
                  }}
                >
                  <div className="container">
                    <div className="prod-head">
                      {pageData.products.title && (
                        <div>
                          <h2
                            className="prod-title"
                            style={{
                              textAlign:
                                pageData.products?.styles?.titleAlign || "left",
                              fontSize: pageData.products?.styles?.titleFontSize
                                ? `${pageData.products.styles.titleFontSize}px`
                                : "44px",
                            }}
                          >
                            {pageData.products.title}
                          </h2>
                        </div>
                      )}
                      <div className="prod-arrows">
                        <button
                          aria-label="Previous"
                          className="btn icon-btn prev"
                          onClick={() => slide(-1)}
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
                      style={{
                        gap: pageData.products?.styles?.cardGap
                          ? `${pageData.products.styles.cardGap}px`
                          : "24px",
                      }}
                    >
                      {pageData.products.items.map((item, index) => (
                        <article
                          key={item.id || index}
                          className="brand-prod-card"
                        >
                          <div className="brand-prod-media">
                            {imageUrls[`product-${index}`] && (
                              <img
                                src={imageUrls[`product-${index}`]}
                                alt={item.title || "UBC food product"}
                                style={{
                                  width:
                                    pageData.products?.styles?.imageWidth ||
                                    "100%",
                                  height:
                                    pageData.products?.styles?.imageHeight ||
                                    "auto",
                                  borderRadius: pageData.products?.styles
                                    ?.imageBorderRadius
                                    ? `${pageData.products.styles.imageBorderRadius}px`
                                    : "8px",
                                }}
                              />
                            )}
                          </div>
                          <div className="brand-prod-body">
                            <div className="brand-prod-header">
                              <div className="brand-prod-text-container">
                                <h3
                                  className="brand-prod-name"
                                  style={{
                                    fontSize: pageData.products?.styles
                                      ?.productTitleFontSize
                                      ? `${pageData.products.styles.productTitleFontSize}px`
                                      : "20px",
                                  }}
                                >
                                  {item.title}
                                </h3>
                                <p
                                  className="brand-prod-blurb"
                                  style={{
                                    fontSize: pageData.products?.styles
                                      ?.productBlurbFontSize
                                      ? `${pageData.products.styles.productBlurbFontSize}px`
                                      : "14px",
                                  }}
                                >
                                  {item.blurb}
                                </p>
                              </div>
                              {item.cta && (
                                <a
                                  href={item.href || "#"}
                                  className="chip-link"
                                  style={{
                                    fontSize: pageData.products?.styles
                                      ?.ctaFontSize
                                      ? `${pageData.products.styles.ctaFontSize}px`
                                      : "14px",
                                  }}
                                >
                                  {item.cta}
                                </a>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
