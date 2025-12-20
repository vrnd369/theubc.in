import React, { useState, useEffect, useRef } from "react";
import { getAboutSections } from "../admin/services/aboutService";
import { resolveImageUrl } from "../utils/imageUtils";
import { parseInlineFormatting } from "../admin/components/BrandPageEditor/InlineFontEditor";
import "../pages/About.css";

/**
 * Dynamic About component that fetches sections from Firebase
 * Can also accept sections as props for preview mode
 */
export default function DynamicAbout({
  sections: propSections,
  previewMode = false,
}) {
  // Try to load from cache immediately
  const getCachedSections = () => {
    try {
      const cached = localStorage.getItem('ubc_about_sections');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 1 hour old (increased from 5 minutes for better performance)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          return parsed.data || [];
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return [];
  };

  const [sections, setSections] = useState(getCachedSections());
  const [imageUrls, setImageUrls] = useState({});
  const imageRefsRef = useRef({}); // Track image references to detect changes
  const newsRowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    // If sections are provided as props (preview mode), use them directly
    if (propSections && propSections.length > 0) {
      // IMPORTANT: Only show the first hero section to prevent duplicates
      let heroSectionFound = false;
      const filteredSections = propSections.filter((s) => {
        if (s.type === "hero") {
          if (heroSectionFound) {
            return false;
          }
          heroSectionFound = true;
        }
        return true;
      });
      
      setSections(filteredSections);
      // Don't clear imageUrls - only update/add new ones to prevent flickering
      // This allows images to persist when section data updates
      const imagePromises = [];
      const newImageUrls = { ...imageUrls }; // Start with existing URLs
      for (const section of filteredSections) {
        if (section.content) {
          // Skip image resolution for vision section (no images in vision)
          if (section.type === "vision") {
            continue;
          }
          // Resolve hero image
          if (section.content.image) {
            const imageRef = section.content.image;
            if (
              imageRef.startsWith("http://") ||
              imageRef.startsWith("https://") ||
              imageRef.startsWith("data:")
            ) {
              // Direct URL - set immediately
              const imageKey = `${section.id}-image`;
              newImageUrls[imageKey] = imageRef;
              imageRefsRef.current[imageKey] = imageRef; // Track direct URLs too
            } else {
              // Check if we already have this image resolved and if the reference changed
              const imageKey = `${section.id}-image`;
              const lastImageRef = imageRefsRef.current[imageKey];
              // Only resolve if we don't have a URL yet OR if the image reference has changed
              if (!newImageUrls[imageKey] || lastImageRef !== imageRef) {
                imageRefsRef.current[imageKey] = imageRef; // Update tracked reference
                imagePromises.push(
                  resolveImageUrl(imageRef)
                    .then((url) => {
                      if (url) {
                        setImageUrls((prev) => ({
                          ...prev,
                          [`${section.id}-image`]: url,
                        }));
                      } else {
                        setImageUrls((prev) => ({
                          ...prev,
                          [`${section.id}-image`]: null,
                        }));
                      }
                    })
                    .catch((error) => {
                      setImageUrls((prev) => ({
                        ...prev,
                        [`${section.id}-image`]: null,
                      }));
                    })
                );
              }
            }
          }
          // Resolve leader images
          if (section.content.founders) {
            for (let i = 0; i < section.content.founders.length; i++) {
              if (section.content.founders[i].image) {
                const imageRef = section.content.founders[i].image;
                if (
                  imageRef.startsWith("http://") ||
                  imageRef.startsWith("https://") ||
                  imageRef.startsWith("data:")
                ) {
                  // Direct URL - set immediately
                  const imageKey = `${section.id}-founder-${i}`;
                  newImageUrls[imageKey] = imageRef;
                  imageRefsRef.current[imageKey] = imageRef; // Track direct URLs too
                } else {
                  // Check if we already have this image resolved and if the reference changed
                  const imageKey = `${section.id}-founder-${i}`;
                  const lastImageRef = imageRefsRef.current[imageKey];
                  // Only resolve if we don't have a URL yet OR if the image reference has changed
                  if (!newImageUrls[imageKey] || lastImageRef !== imageRef) {
                    imageRefsRef.current[imageKey] = imageRef; // Update tracked reference
                    imagePromises.push(
                      resolveImageUrl(imageRef)
                        .then((url) => {
                          if (url) {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-founder-${i}`]: url,
                            }));
                          } else {
                            // Set to null to indicate resolution failed
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-founder-${i}`]: null,
                            }));
                          }
                        })
                        .catch((error) => {
                          // Set to null to indicate resolution failed
                          setImageUrls((prev) => ({
                            ...prev,
                            [`${section.id}-founder-${i}`]: null,
                          }));
                        })
                    );
                  }
                }
              }
            }
          }
          if (section.content.leaders) {
            for (let i = 0; i < section.content.leaders.length; i++) {
              if (section.content.leaders[i].image) {
                const imageRef = section.content.leaders[i].image;
                if (
                  imageRef.startsWith("http://") ||
                  imageRef.startsWith("https://") ||
                  imageRef.startsWith("data:")
                ) {
                  // Direct URL - set immediately
                  const imageKey = `${section.id}-leader-${i}`;
                  newImageUrls[imageKey] = imageRef;
                  imageRefsRef.current[imageKey] = imageRef; // Track direct URLs too
                } else {
                  // Check if we already have this image resolved and if the reference changed
                  const imageKey = `${section.id}-leader-${i}`;
                  const lastImageRef = imageRefsRef.current[imageKey];
                  // Only resolve if we don't have a URL yet OR if the image reference has changed
                  if (!newImageUrls[imageKey] || lastImageRef !== imageRef) {
                    imageRefsRef.current[imageKey] = imageRef; // Update tracked reference
                    imagePromises.push(
                      resolveImageUrl(imageRef)
                        .then((url) => {
                          if (url) {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-leader-${i}`]: url,
                            }));
                          } else {
                            // Set to null to indicate resolution failed
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-leader-${i}`]: null,
                            }));
                          }
                        })
                        .catch((error) => {
                          // Set to null to indicate resolution failed
                          setImageUrls((prev) => ({
                            ...prev,
                            [`${section.id}-leader-${i}`]: null,
                          }));
                        })
                    );
                  }
                }
              }
            }
          }
          // Resolve certification logos
          if (section.content.certs) {
            for (let i = 0; i < section.content.certs.length; i++) {
              if (section.content.certs[i].logo) {
                const imageRef = section.content.certs[i].logo;
                if (
                  imageRef.startsWith("http://") ||
                  imageRef.startsWith("https://") ||
                  imageRef.startsWith("data:")
                ) {
                  // Direct URL - set immediately
                  const imageKey = `${section.id}-cert-${i}`;
                  newImageUrls[imageKey] = imageRef;
                  imageRefsRef.current[imageKey] = imageRef; // Track direct URLs too
                } else {
                  // Check if we already have this image resolved and if the reference changed
                  const imageKey = `${section.id}-cert-${i}`;
                  const lastImageRef = imageRefsRef.current[imageKey];
                  // Only resolve if we don't have a URL yet OR if the image reference has changed
                  if (!newImageUrls[imageKey] || lastImageRef !== imageRef) {
                    imageRefsRef.current[imageKey] = imageRef; // Update tracked reference
                    imagePromises.push(
                      resolveImageUrl(imageRef)
                        .then((url) => {
                          if (url) {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-cert-${i}`]: url,
                            }));
                          }
                        })
                        .catch(() => {})
                    );
                  }
                }
              }
            }
          }
          // Resolve news images
          if (section.content.news) {
            for (let i = 0; i < section.content.news.length; i++) {
              if (section.content.news[i].image) {
                const imageRef = section.content.news[i].image;
                if (
                  imageRef.startsWith("http://") ||
                  imageRef.startsWith("https://") ||
                  imageRef.startsWith("data:")
                ) {
                  // Direct URL - set immediately
                  const imageKey = `${section.id}-news-${i}`;
                  newImageUrls[imageKey] = imageRef;
                  imageRefsRef.current[imageKey] = imageRef; // Track direct URLs too
                } else {
                  // Check if we already have this image resolved and if the reference changed
                  const imageKey = `${section.id}-news-${i}`;
                  const lastImageRef = imageRefsRef.current[imageKey];
                  // Only resolve if we don't have a URL yet OR if the image reference has changed
                  if (!newImageUrls[imageKey] || lastImageRef !== imageRef) {
                    imageRefsRef.current[imageKey] = imageRef; // Update tracked reference
                    imagePromises.push(
                      resolveImageUrl(imageRef)
                        .then((url) => {
                          if (url) {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-news-${i}`]: url,
                            }));
                          } else {
                            // Set to null to indicate resolution failed
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-news-${i}`]: null,
                            }));
                          }
                        })
                        .catch((error) => {
                          // Set to null to indicate resolution failed
                          setImageUrls((prev) => ({
                            ...prev,
                            [`${section.id}-news-${i}`]: null,
                          }));
                        })
                    );
                  }
                }
              }
            }
          }
          // Resolve badge icon if it's an image (not SVG path)
          if (section.content.badgeIcon) {
            const icon = section.content.badgeIcon;
            const isImage =
              icon.startsWith("http://") ||
              icon.startsWith("https://") ||
              icon.startsWith("data:") ||
              (!icon.startsWith("M") && !icon.match(/^[MLHVCSQTAZ\s]/));
            if (isImage) {
              if (
                icon.startsWith("http://") ||
                icon.startsWith("https://") ||
                icon.startsWith("data:")
              ) {
                setImageUrls((prev) => ({
                  ...prev,
                  [`${section.id}-badge-icon`]: icon,
                }));
              } else {
                imagePromises.push(
                  resolveImageUrl(icon)
                    .then((url) => {
                      if (url) {
                        setImageUrls((prev) => ({
                          ...prev,
                          [`${section.id}-badge-icon`]: url,
                        }));
                      }
                    })
                    .catch(() => {})
                );
              }
            }
          }
        }
      }
      // Update imageUrls with direct URLs immediately (before async resolution)
      if (Object.keys(newImageUrls).length > 0) {
        setImageUrls((prev) => ({ ...prev, ...newImageUrls }));
      }
      
      // Wait for all images to resolve
      Promise.all(imagePromises).catch(() => {});
      return;
    }

    // Reset imageUrls when not in preview mode
    setImageUrls({});

    // Otherwise, fetch from Firebase
    const loadSections = async () => {
      try {
        const allSections = await getAboutSections();
        
        // Cache the sections
        try {
          localStorage.setItem('ubc_about_sections', JSON.stringify({
            data: allSections,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }
        if (allSections && allSections.length > 0) {
          // Filter enabled sections and sort by order
          // IMPORTANT: Only show the first hero section to prevent duplicates
          let heroSectionFound = false;
          const enabled = allSections
            .filter((s) => {
              if (s.enabled === false) return false;
              // Only allow one hero section
              if (s.type === "hero") {
                if (heroSectionFound) {
                  return false;
                }
                heroSectionFound = true;
              }
              return true;
            })
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          // Set sections IMMEDIATELY for instant rendering - don't wait for images
          setSections(enabled);
          
          // Clear old image URLs when sections change to prevent showing stale images
          setImageUrls({});

          // Resolve images in background and update progressively
          const imagePromises = [];

          for (const section of enabled) {
            if (section.content) {
              // Skip image resolution for vision section (no images in vision)
              if (section.type === "vision") {
                continue;
              }
              // Resolve hero image
              if (section.content.image) {
                const imageRef = section.content.image;
                // If it's already a URL, use it directly
                if (
                  imageRef.startsWith("http://") ||
                  imageRef.startsWith("https://") ||
                  imageRef.startsWith("data:")
                ) {
                  setImageUrls((prev) => ({
                    ...prev,
                    [`${section.id}-image`]: imageRef,
                  }));
                } else {
                  // Otherwise, resolve it
                  imagePromises.push(
                    resolveImageUrl(imageRef)
                      .then((url) => {
                        if (url) {
                          setImageUrls((prev) => ({
                            ...prev,
                            [`${section.id}-image`]: url,
                          }));
                        }
                      })
                      .catch(() => {})
                  );
                }
              }
              // Resolve leader images
              if (section.content.founders) {
                for (let i = 0; i < section.content.founders.length; i++) {
                  if (section.content.founders[i].image) {
                    const imageRef = section.content.founders[i].image;
                    // If it's already a URL, use it directly
                    if (
                      imageRef.startsWith("http://") ||
                      imageRef.startsWith("https://") ||
                      imageRef.startsWith("data:")
                    ) {
                      setImageUrls((prev) => ({
                        ...prev,
                        [`${section.id}-founder-${i}`]: imageRef,
                      }));
                    } else {
                      // Otherwise, resolve it
                      imagePromises.push(
                        resolveImageUrl(imageRef)
                          .then((url) => {
                            if (url) {
                              setImageUrls((prev) => ({
                                ...prev,
                                [`${section.id}-founder-${i}`]: url,
                              }));
                            } else {
                              setImageUrls((prev) => ({
                                ...prev,
                                [`${section.id}-founder-${i}`]: null,
                              }));
                            }
                          })
                          .catch(() => {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-founder-${i}`]: null,
                            }));
                          })
                      );
                    }
                  }
                }
              }
              if (section.content.leaders) {
                for (let i = 0; i < section.content.leaders.length; i++) {
                  if (section.content.leaders[i].image) {
                    const imageRef = section.content.leaders[i].image;
                    // If it's already a URL, use it directly
                    if (
                      imageRef.startsWith("http://") ||
                      imageRef.startsWith("https://") ||
                      imageRef.startsWith("data:")
                    ) {
                      setImageUrls((prev) => ({
                        ...prev,
                        [`${section.id}-leader-${i}`]: imageRef,
                      }));
                    } else {
                      // Otherwise, resolve it
                      imagePromises.push(
                        resolveImageUrl(imageRef)
                          .then((url) => {
                            if (url) {
                              setImageUrls((prev) => ({
                                ...prev,
                                [`${section.id}-leader-${i}`]: url,
                              }));
                            } else {
                              setImageUrls((prev) => ({
                                ...prev,
                                [`${section.id}-leader-${i}`]: null,
                              }));
                            }
                          })
                          .catch(() => {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-leader-${i}`]: null,
                            }));
                          })
                      );
                    }
                  }
                }
              }
              // Resolve certification logos
              if (section.content.certs) {
                for (let i = 0; i < section.content.certs.length; i++) {
                  if (section.content.certs[i].logo) {
                    imagePromises.push(
                      resolveImageUrl(section.content.certs[i].logo)
                        .then((url) => {
                          if (url) {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-cert-${i}`]: url,
                            }));
                          }
                        })
                        .catch(() => {})
                    );
                  }
                }
              }
              // Resolve news images
              if (section.content.news) {
                for (let i = 0; i < section.content.news.length; i++) {
                  if (section.content.news[i].image) {
                    imagePromises.push(
                      resolveImageUrl(section.content.news[i].image)
                        .then((url) => {
                          if (url) {
                            setImageUrls((prev) => ({
                              ...prev,
                              [`${section.id}-news-${i}`]: url,
                            }));
                          }
                        })
                        .catch(() => {})
                    );
                  }
                }
              }
              // Resolve badge icon if it's an image (not SVG path)
              if (section.content.badgeIcon) {
                const icon = section.content.badgeIcon;
                const isImage =
                  icon.startsWith("http://") ||
                  icon.startsWith("https://") ||
                  icon.startsWith("data:") ||
                  (!icon.startsWith("M") && !icon.match(/^[MLHVCSQTAZ\s]/));
                if (isImage) {
                  imagePromises.push(
                    resolveImageUrl(icon)
                      .then((url) => {
                        if (url) {
                          setImageUrls((prev) => ({
                            ...prev,
                            [`${section.id}-badge-icon`]: url,
                          }));
                        }
                      })
                      .catch(() => {})
                  );
                }
              }
            }
          }

          // Don't wait for images - let them load in background
          Promise.all(imagePromises).catch(() => {});
        }
      } catch (error) {
        // Error loading about sections from CMS
      }
    };

    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propSections, previewMode]);

  // Helper function to render badge icon (handles both SVG paths and image URLs)
  // Fixed size: 14x14px regardless of uploaded image size
  const renderBadgeIcon = (
    sectionId,
    badgeIcon,
    className,
    fillColor = "white"
  ) => {
    if (!badgeIcon) return null;

    // Check if it's an image URL (http, https, data:, or image ID)
    // SVG paths typically start with 'M' (moveTo) or contain SVG commands
    const isImageUrl =
      badgeIcon.startsWith("http://") ||
      badgeIcon.startsWith("https://") ||
      badgeIcon.startsWith("data:") ||
      !badgeIcon.match(/^[MLHVCSQTAZ\s]/);

    if (isImageUrl) {
      // It's an image - use resolved URL if available
      // Fixed size: 14x14px, object-fit: contain to maintain aspect ratio
      const iconUrl = imageUrls[`${sectionId}-badge-icon`] || badgeIcon;
      return (
        <img
          src={iconUrl}
          alt="Badge icon"
          className={className}
          style={{
            width: "14px",
            height: "14px",
            objectFit: "contain",
            flexShrink: 0,
            display: "block",
          }}
        />
      );
    } else {
      // It's an SVG path - fixed size
      return (
        <svg
          className={className}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, display: "block" }}
        >
          <path d={badgeIcon} fill={fillColor} />
        </svg>
      );
    }
  };

  // Update arrow states based on scroll position
  const updateArrowStates = () => {
    const row = newsRowRef.current;
    if (!row) return;

    const { scrollLeft, scrollWidth, clientWidth } = row;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // News section scroll handlers
  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const row = newsRowRef.current;
    if (!row) return;

    const prevent = (e) => {
      if (e.type === "wheel") {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    };

    row.addEventListener("wheel", prevent, { passive: false });
    row.addEventListener("touchmove", prevent, { passive: false });
    row.addEventListener("keydown", prevent, { passive: false });
    row.addEventListener("scroll", updateArrowStates);
    
    // Initial check
    updateArrowStates();

    return () => {
      row.removeEventListener("wheel", prevent);
      row.removeEventListener("touchmove", prevent);
      row.removeEventListener("keydown", prevent);
      row.removeEventListener("scroll", updateArrowStates);
    };
  }, [sections]);

  // Render immediately - no loading state, no blank page
  // Content will appear as it loads from CMS

  const getStep = () => {
    const row = newsRowRef.current;
    if (!row) return 0;
    const card = row.querySelector(".news-card");
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const w = (card?.offsetWidth || 0) + gap;
    return w || Math.round(row.clientWidth * 0.9);
  };

  const scrollByStep = (dir = 1) => {
    const row = newsRowRef.current;
    if (!row) return;
    const step = getStep();
    if (step === 0) return;

    if (row.scrollWidth <= row.clientWidth && dir > 0) return;
    if (row.scrollLeft <= 0 && dir < 0) return;

    row.scrollBy({ left: dir * step, behavior: "smooth" });
    
    // Update states after a short delay to allow scroll to complete
    setTimeout(updateArrowStates, 100);
  };

  // Render main element always - no opacity/visibility toggle to prevent flickering
  // Content will render progressively as it loads
  return (
    <main
      className="about-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        background: "transparent",
      }}
    >
      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <section
                key={section.id}
                className="about-hero"
                style={{
                  backgroundColor: "transparent",
                  background: "transparent",
                  backgroundImage: "none",
                }}
              >
                <div
                  className="about-hero-image"
                  style={{
                    backgroundColor: "transparent",
                    background: "transparent",
                    backgroundImage: "none",
                  }}
                >
                  {(() => {
                    const imageRef = section.content?.image;
                    if (!imageRef) return null;
                    
                    // Get resolved image URL
                    const resolvedUrl = imageUrls[`${section.id}-image`];
                    
                    // Check if it's already a direct URL (data: or http)
                    const isDirectUrl =
                      imageRef.startsWith("http://") ||
                      imageRef.startsWith("https://") ||
                      imageRef.startsWith("data:");
                    
                    // Only show image if we have a resolved URL or it's a direct URL
                    const imageSrc = resolvedUrl || (isDirectUrl ? imageRef : null);
                    
                    // Don't render if image is not resolved yet (unless it's a direct URL)
                    if (!imageSrc) {
                      return (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f3f4f6",
                            color: "#9ca3af",
                            fontSize: "14px",
                          }}
                        >
                          Loading image...
                        </div>
                      );
                    }
                    
                    return (
                      <img
                        src={imageSrc}
                        alt="Company building"
                        loading="eager"
                        fetchPriority="high"
                        style={{
                          backgroundColor: "transparent",
                          background: "transparent",
                          backgroundImage: "none",
                          opacity: 1,
                          filter: "none",
                          mixBlendMode: "normal",
                          zIndex: 10,
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          aspectRatio: "16 / 9",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        onLoad={(e) => {
                          e.target.style.opacity = "1";
                          e.target.style.filter = "none";
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.background = "transparent";
                        }}
                      />
                    );
                  })()}
                </div>
              </section>
            );

          case "leaders":
            return (
              <section
                key={section.id}
                className="about-leaders section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#fff",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  {section.content.tag && (
                    <SectionTag
                      label={section.content.tag}
                      styles={section.styles}
                    />
                  )}

                  <div className="leaders-container">
                    <div className="leaders-block">
                      <h2
                        className="about-leaders-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        {section.content.foundersHeading ||
                          "Who Were the Founders"}
                      </h2>
                      <p
                        className="about-leaders-subtitle"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {section.content.foundersSubtitle || ""}
                      </p>
                      <div className="leaders-grid">
                        {(section.content.founders || []).map(
                          (founder, idx) => {
                            const imageFilter =
                              section.styles?.imageFilter || "grayscale";
                            const hoverEffect =
                              section.styles?.imageHoverEffect !== false;
                            const filterStyle =
                              imageFilter === "grayscale"
                                ? "grayscale(100%)"
                                : "grayscale(0%)";
                            return (
                              <div key={idx} className="leader-card">
                                <div className="leader-image-wrapper">
                                  {(() => {
                                    const imageRef = founder.image;
                                    if (!imageRef) {
                                      return (
                                        <div
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#f3f4f6",
                                            color: "#9ca3af",
                                            fontSize: "12px",
                                          }}
                                        >
                                          No image
                                        </div>
                                      );
                                    }

                                    const resolvedUrl =
                                      imageUrls[`${section.id}-founder-${idx}`];

                                    // Check if it's already a URL
                                    const isDirectUrl =
                                      imageRef.startsWith("http://") ||
                                      imageRef.startsWith("https://") ||
                                      imageRef.startsWith("data:");

                                    // Use resolved URL, or direct URL, or try to resolve
                                    const imageSrc =
                                      resolvedUrl ||
                                      (isDirectUrl ? imageRef : null);

                                    // If we have an image source, show it
                                    if (imageSrc) {
                                      return (
                                        <img
                                          src={imageSrc}
                                          alt={founder.name}
                                          className="leader-image"
                                          style={{
                                            filter: filterStyle,
                                            transition: "filter .3s ease",
                                          }}
                                          onMouseEnter={(e) => {
                                            if (
                                              hoverEffect &&
                                              imageFilter === "grayscale"
                                            ) {
                                              e.target.style.filter =
                                                "grayscale(0%)";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (
                                              hoverEffect &&
                                              imageFilter === "grayscale"
                                            ) {
                                              e.target.style.filter =
                                                filterStyle;
                                            }
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                          }}
                                          onLoad={() => {
                                            // Founder image loaded
                                          }}
                                        />
                                      );
                                    }

                                    // If it's an ID and not resolved yet, show loading
                                    if (
                                      !isDirectUrl &&
                                      resolvedUrl === undefined
                                    ) {
                                      // Resolving founder image
                                    }

                                    // Show loading or error state
                                    return (
                                      <div
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#f3f4f6",
                                          color: "#9ca3af",
                                          fontSize: "11px",
                                          padding: "8px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {resolvedUrl === undefined
                                          ? "Loading image..."
                                          : resolvedUrl === null
                                          ? "Image not found"
                                          : "No image"}
                                        {!isDirectUrl && imageRef && (
                                          <div
                                            style={{
                                              fontSize: "9px",
                                              marginTop: "4px",
                                              opacity: 0.7,
                                            }}
                                          >
                                            ID: {imageRef.substring(0, 20)}...
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="leader-info">
                                  <h3 className="leader-name">
                                    {founder.name}
                                  </h3>
                                  <p className="leader-role">
                                    / {founder.role}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className="leaders-block">
                      <h2
                        className="about-leaders-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        {section.content.leadersHeading ||
                          "Who Are the Leaders"}
                      </h2>
                      <p
                        className="about-leaders-subtitle"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {section.content.leadersSubtitle || ""}
                      </p>
                      <div className="leaders-grid">
                        {(section.content.leaders || []).map((leader, idx) => {
                          const imageFilter =
                            section.styles?.imageFilter || "grayscale";
                          const hoverEffect =
                            section.styles?.imageHoverEffect !== false;
                          const filterStyle =
                            imageFilter === "grayscale"
                              ? "grayscale(100%)"
                              : "grayscale(0%)";
                          return (
                            <div key={idx} className="leader-card">
                              <div className="leader-image-wrapper">
                                {(() => {
                                  const imageRef = leader.image;
                                  if (!imageRef) {
                                    return (
                                      <div
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#f3f4f6",
                                          color: "#9ca3af",
                                          fontSize: "12px",
                                        }}
                                      >
                                        No image
                                      </div>
                                    );
                                  }

                                  const resolvedUrl =
                                    imageUrls[`${section.id}-leader-${idx}`];

                                  // Check if it's already a URL
                                  const isDirectUrl =
                                    imageRef.startsWith("http://") ||
                                    imageRef.startsWith("https://") ||
                                    imageRef.startsWith("data:");

                                  // Use resolved URL, or direct URL, or try to resolve
                                  const imageSrc =
                                    resolvedUrl ||
                                    (isDirectUrl ? imageRef : null);

                                  // If we have an image source, show it
                                  if (imageSrc) {
                                    return (
                                      <img
                                        src={imageSrc}
                                        alt={leader.name}
                                        className="leader-image"
                                        style={{
                                          filter: filterStyle,
                                          transition: "filter .3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                          if (
                                            hoverEffect &&
                                            imageFilter === "grayscale"
                                          ) {
                                            e.target.style.filter =
                                              "grayscale(0%)";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (
                                            hoverEffect &&
                                            imageFilter === "grayscale"
                                          ) {
                                            e.target.style.filter = filterStyle;
                                          }
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                        onLoad={() => {
                                          // Leader image loaded
                                        }}
                                      />
                                    );
                                  }

                                  // If it's an ID and not resolved yet, show loading
                                  if (
                                    !isDirectUrl &&
                                    resolvedUrl === undefined
                                  ) {
                                    // Resolving leader image
                                  }

                                  // Show loading or error state
                                  return (
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f3f4f6",
                                        color: "#9ca3af",
                                        fontSize: "11px",
                                        padding: "8px",
                                        textAlign: "center",
                                      }}
                                    >
                                      {resolvedUrl === undefined
                                        ? "Loading image..."
                                        : resolvedUrl === null
                                        ? "Image not found"
                                        : "No image"}
                                      {!isDirectUrl && imageRef && (
                                        <div
                                          style={{
                                            fontSize: "9px",
                                            marginTop: "4px",
                                            opacity: 0.7,
                                          }}
                                        >
                                          ID: {imageRef.substring(0, 20)}...
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="leader-info">
                                <h3 className="leader-name">{leader.name}</h3>
                                <p className="leader-role">/ {leader.role}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "story":
            return (
              <section
                key={section.id}
                className="about-story section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#f8f9fa",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  <div className="story-content-grid">
                    <div className="story-left">
                      <h2
                        className="story-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        <span className="story-heading-line1">
                          {parseInlineFormatting(
                            section.content.headingLine1 ||
                              "Our Founding Story:"
                          )}
                        </span>
                        <br />
                        <span className="story-heading-line2">
                          {parseInlineFormatting(
                            section.content.headingLine2 || "A Legacy of Values"
                          )}
                        </span>
                      </h2>
                    </div>
                    <div className="story-right">
                      <p
                        className="story-text"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {parseInlineFormatting(
                          section.content.paragraph1 || ""
                        )}
                      </p>
                      <p
                        className="story-text story-text-muted"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {parseInlineFormatting(
                          section.content.paragraph2 || ""
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "vision":
            return (
              <section
                key={section.id}
                className="about-vision section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#fff",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  {section.content.badgeText && (
                    <span
                      className="vision-badge"
                      style={{
                        backgroundColor:
                          section.styles?.badgeBackgroundColor || "#323790",
                      }}
                    >
                      {renderBadgeIcon(
                        section.id,
                        section.content.badgeIcon,
                        "vision-eye-icon",
                        "white"
                      )}
                      {section.content.badgeText}
                    </span>
                  )}

                  <div className="vision-grid">
                    <div className="vision-left">
                      <h2
                        className="vision-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        <span className="vision-heading-line1">
                          {parseInlineFormatting(
                            section.content.headingLine1 || "The Thought"
                          )}
                        </span>
                        <br />
                        <span className="vision-heading-line2">
                          {parseInlineFormatting(
                            section.content.headingLine2 ||
                              "Behind Starting UBC"
                          )}
                        </span>
                      </h2>
                    </div>
                    <div className="vision-right">
                      <p
                        className="vision-text lead"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {parseInlineFormatting(
                          section.content.leadParagraph || ""
                        )}
                      </p>
                      <p
                        className="vision-text muted"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {parseInlineFormatting(
                          section.content.mutedParagraph || ""
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "mission":
            return (
              <section
                key={section.id}
                className="about-mission section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#f3f4f6",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  {section.content.badgeText && (
                    <span
                      className="mission-badge"
                      style={{
                        backgroundColor:
                          section.styles?.badgeBackgroundColor || "#323790",
                      }}
                    >
                      {renderBadgeIcon(
                        section.id,
                        section.content.badgeIcon,
                        "mission-eye-icon",
                        "white"
                      )}
                      {section.content.badgeText}
                    </span>
                  )}

                  <div className="mission-grid">
                    <div className="mission-left">
                      <h2
                        className="mission-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        <span className="mission-heading-line1">
                          {parseInlineFormatting(
                            section.content.headingLine1 || "Our Goal for"
                          )}
                        </span>
                        <br />
                        <span className="mission-heading-line2">
                          {parseInlineFormatting(
                            section.content.headingLine2 || "the Coming Years"
                          )}
                        </span>
                      </h2>
                    </div>
                    <div className="mission-right">
                      <p
                        className="mission-text lead"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {parseInlineFormatting(
                          section.content.leadParagraph || ""
                        )}
                      </p>
                      <p
                        className="mission-text muted"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {parseInlineFormatting(
                          section.content.mutedParagraph || ""
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "infrastructure":
            return (
              <section
                key={section.id}
                className="about-infra section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#fff",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  {section.content.badgeText && (
                    <span
                      className="infra-badge"
                      style={{
                        backgroundColor:
                          section.styles?.badgeBackgroundColor ||
                          "rgba(50, 55, 144, 0.1)",
                      }}
                    >
                      {renderBadgeIcon(
                        section.id,
                        section.content.badgeIcon,
                        "leaders-star-icon",
                        "#2C36A6"
                      )}
                      {section.content.badgeText}
                    </span>
                  )}

                  <div className="infra-grid">
                    <div className="infra-left">
                      <h2
                        className="infra-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        <span className="infra-heading-line1">
                          {parseInlineFormatting(
                            section.content.headingLine1 || "Infrastructure"
                          )}
                        </span>
                        <br />
                        <span className="infra-heading-line2">
                          {parseInlineFormatting(
                            section.content.headingLine2 || "and Facilities"
                          )}
                        </span>
                      </h2>
                    </div>
                    <div className="infra-right">
                      {(section.content.items || []).map((item, idx) => (
                        <div key={idx} className="infra-item">
                          <div className="infra-idx">
                            {item.index || `(${idx + 1})`}
                          </div>
                          <h3 className="infra-title">
                            {parseInlineFormatting(item.title || "")}
                          </h3>
                          <p
                            className="infra-text"
                            style={{
                              textAlign:
                                section.content.textAlignment || "left",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {parseInlineFormatting(item.text || "")}
                            {item.mutedText && (
                              <span className="infra-text-muted">
                                {" "}
                                {parseInlineFormatting(item.mutedText)}
                              </span>
                            )}
                          </p>
                          {idx < (section.content.items || []).length - 1 && (
                            <div className="infra-divider" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "certification":
            return (
              <section
                key={section.id}
                className="about-cert section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#f3f4f6",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  <div className="cert-grid">
                    <div className="cert-left">
                      {section.content.badgeText && (
                        <span
                          className="cert-badge"
                          style={{
                            backgroundColor:
                              section.styles?.badgeBackgroundColor || "#323790",
                          }}
                        >
                          {renderBadgeIcon(
                            section.id,
                            section.content.badgeIcon,
                            "cert-badge-icon",
                            "white"
                          )}
                          {section.content.badgeText}
                        </span>
                      )}
                      <h2
                        className="cert-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        <span className="cert-heading-line1">
                          {parseInlineFormatting(
                            section.content.headingLine1 || "Our Commitment"
                          )}
                        </span>
                        <br />
                        <span className="cert-heading-line2">
                          {parseInlineFormatting(
                            section.content.headingLine2 || "to Quality"
                          )}
                        </span>
                      </h2>
                      {section.content.subtitle && (
                        <p
                          className="cert-subtitle"
                          style={{
                            textAlign: section.content.textAlignment || "left",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {parseInlineFormatting(section.content.subtitle)}
                        </p>
                      )}
                    </div>
                    <div className="cert-right">
                      {section.content.intro1 && (
                        <p
                          className="cert-intro"
                          style={{
                            textAlign: section.content.textAlignment || "left",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {section.content.intro1}
                        </p>
                      )}
                      {section.content.intro2 && (
                        <p
                          className="cert-intro muted"
                          style={{
                            textAlign: section.content.textAlignment || "left",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {section.content.intro2}
                        </p>
                      )}

                      <div className="cert-list">
                        {(section.content.certs || []).map((cert, idx) => (
                          <div key={idx} className="cert-item">
                            <div className="cert-logo">
                              {(imageUrls[`${section.id}-cert-${idx}`] ||
                                cert.logo) && (
                                <img
                                  src={
                                    imageUrls[`${section.id}-cert-${idx}`] ||
                                    cert.logo
                                  }
                                  alt={`${cert.title} logo`}
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <div className="cert-info">
                              <h3 className="cert-title">{cert.title}</h3>
                              <p
                                className="cert-desc"
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {cert.desc}
                              </p>
                            </div>
                            {idx < (section.content.certs || []).length - 1 && (
                              <div className="cert-divider" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "sustainability":
            return (
              <section
                key={section.id}
                className="about-sustain section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#fff",
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  {section.content.badgeText && (
                    <span
                      className="sustain-badge"
                      style={{
                        backgroundColor:
                          section.styles?.badgeBackgroundColor || "#F3F4F6",
                      }}
                    >
                      {renderBadgeIcon(
                        section.id,
                        section.content.badgeIcon,
                        "leaders-star-icon",
                        "#2C36A6"
                      )}
                      {section.content.badgeText}
                    </span>
                  )}

                  <div className="sustain-grid">
                    <div className="sustain-left">
                      <h2
                        className="sustain-heading"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        <span className="sustain-heading-line1">
                          {section.content.headingLine1 || "Sustainability"}
                        </span>
                        <br />
                        <span className="sustain-heading-line2">
                          {section.content.headingLine2 || "Initiatives"}
                        </span>
                      </h2>
                      {section.content.subtitle && (
                        <p
                          className="sustain-subtitle"
                          style={{
                            textAlign: section.content.textAlignment || "left",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {section.content.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="sustain-right">
                      {(section.content.items || []).map((item, idx) => (
                        <div key={idx} className="sustain-item">
                          <div className="sustain-idx">
                            {item.index || `(${idx + 1})`}
                          </div>
                          <h3 className="sustain-title">{item.title}</h3>
                          <p
                            className="sustain-text"
                            style={{
                              textAlign:
                                section.content.textAlignment || "left",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {item.text}
                          </p>
                          {idx < (section.content.items || []).length - 1 && (
                            <div className="sustain-divider" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "news":
            // Render news section
            return (
              <section
                key={section.id}
                className="about-news section"
                style={{
                  backgroundColor: section.styles?.backgroundColor || "#000000",
                  paddingTop: "88px",
                  paddingBottom: "88px",
                  minHeight: "400px", // Ensure section has minimum height
                }}
              >
                <div
                  className="container"
                  style={{
                    maxWidth: "1280px",
                  }}
                >
                  <div className="news-head">
                    <div className="news-left">
                      {section.content.badgeText && (
                        <span
                          className="news-badge"
                          style={{
                            backgroundColor:
                              section.styles?.badgeBackgroundColor || "#1E1E1E",
                          }}
                        >
                          {renderBadgeIcon(
                            section.id,
                            section.content.badgeIcon,
                            "news-badge-icon",
                            "white"
                          )}
                          {section.content.badgeText}
                        </span>
                      )}
                      <h2
                        className="news-title"
                        style={{
                          textAlign: section.content.textAlignment || "left",
                        }}
                      >
                        {section.content.heading || "Media & News"}
                      </h2>
                      {section.content.subtitle && (
                        <p
                          className="news-subtitle"
                          style={{
                            textAlign: section.content.textAlignment || "left",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {section.content.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="news-ctas">
                      {section.content.viewAllButtonText && (
                        section.content.viewAllButtonLink ? (
                          <a
                            href={section.content.viewAllButtonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-light"
                            style={{
                              backgroundColor:
                                section.styles?.viewAllButtonBackgroundColor ||
                                undefined,
                              color:
                                section.styles?.viewAllButtonTextColor ||
                                undefined,
                              textDecoration: "none",
                            }}
                          >
                            {section.content.viewAllButtonText}
                          </a>
                        ) : (
                          <button
                            className="btn btn-light"
                            style={{
                              backgroundColor:
                                section.styles?.viewAllButtonBackgroundColor ||
                                undefined,
                              color:
                                section.styles?.viewAllButtonTextColor ||
                                undefined,
                            }}
                          >
                            {section.content.viewAllButtonText}
                          </button>
                        )
                      )}
                      <div
                        className="news-arrows"
                        style={{
                          backgroundColor:
                            section.styles?.arrowButtonBackgroundColor ||
                            undefined,
                        }}
                      >
                        <button
                          className="btn icon-btn prev"
                          aria-label="Previous"
                          onClick={() => scrollByStep(-1)}
                          style={{
                            color:
                              section.styles?.arrowButtonColor || undefined,
                          }}
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
                          className="btn icon-btn next"
                          aria-label="Next"
                          onClick={() => scrollByStep(1)}
                          style={{
                            color:
                              section.styles?.arrowButtonColor || undefined,
                          }}
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
                    </div>
                  </div>

                  <div
                    className="news-row no-user-scroll"
                    ref={newsRowRef}
                    tabIndex={-1}
                  >
                    {!section.content.news ||
                    section.content.news.length === 0 ? (
                      <div
                        style={{
                          width: "100%",
                          padding: "40px",
                          textAlign: "center",
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "14px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                        }}
                      >
                        No news items to display. Add news items in the editor.
                      </div>
                    ) : (
                      section.content.news.map((item, idx) => {
                        const imageRef = item.image;
                        const resolvedUrl =
                          imageUrls[`${section.id}-news-${idx}`];

                        // Check if it's already a URL
                        const isDirectUrl =
                          imageRef &&
                          (imageRef.startsWith("http://") ||
                            imageRef.startsWith("https://") ||
                            imageRef.startsWith("data:"));

                        // Use resolved URL, or direct URL, or try to resolve
                        const imageSrc =
                          resolvedUrl || (isDirectUrl ? imageRef : null);


                        return (
                          <article key={idx} className="news-card">
                            <div className="news-media">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={item.title || "News item"}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    // Show placeholder
                                    const parent = e.target.parentElement;
                                    if (
                                      parent &&
                                      !parent.querySelector(
                                        ".news-image-placeholder"
                                      )
                                    ) {
                                      const placeholder =
                                        document.createElement("div");
                                      placeholder.className =
                                        "news-image-placeholder";
                                      placeholder.style.cssText = `
                                      width: 100%;
                                      height: 100%;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      background-color: #1a1a1a;
                                      color: #6b7280;
                                      font-size: 12px;
                                      text-align: center;
                                      padding: 16px;
                                    `;
                                      placeholder.textContent =
                                        "Image failed to load";
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                  onLoad={() => {
                                    // News image loaded
                                  }}
                                />
                              ) : imageRef && resolvedUrl === undefined ? (
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#1a1a1a",
                                    color: "#9ca3af",
                                    fontSize: "12px",
                                    padding: "16px",
                                    textAlign: "center",
                                  }}
                                >
                                  Loading image...
                                  {!isDirectUrl && imageRef && (
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        marginTop: "8px",
                                        opacity: 0.7,
                                      }}
                                    >
                                      ID: {imageRef.substring(0, 20)}...
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#1a1a1a",
                                    color: "#6b7280",
                                    fontSize: "12px",
                                    textAlign: "center",
                                    padding: "16px",
                                  }}
                                >
                                  {resolvedUrl === null
                                    ? "Image not found"
                                    : "No image"}
                                </div>
                              )}
                            </div>
                            <h3 className="news-card-title">{item.title}</h3>
                            <div className="news-tags">
                              {item.tag && (
                                <span className="pill">{item.tag}</span>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </main>
  );
}

// SectionTag component with badge dimensions support
function SectionTag({ label, styles }) {
  return (
    <div
      className="tag"
      style={{
        backgroundColor: styles?.badgeBackgroundColor || undefined,
      }}
    >
      {label}
    </div>
  );
}
