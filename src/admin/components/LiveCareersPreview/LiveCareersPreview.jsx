import React, { useMemo, useState, useEffect } from "react";
import "../../../pages/Careers.css";
import heroImage from "../../../assets/career.png";
import starImage from "../../../assets/star.png";
import { parseInlineFormatting } from "../BrandPageEditor/InlineFontEditor";
import { resolveImageUrl } from "../../../utils/imageUtils";

/**
 * Live preview component for Careers page
 * Renders the Careers page with temporary config data for real-time preview
 */
export default function LiveCareersPreview({ previewConfig }) {
  const [resolvedIcons, setResolvedIcons] = useState({});

  // Use preview config if provided, otherwise show empty state
  const config = previewConfig || null;

  const jobs = useMemo(() => {
    if (
      config?.openingsSection?.jobs &&
      config.openingsSection.jobs.length > 0
    ) {
      return config.openingsSection.jobs
        .filter((job) => job.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [];
  }, [config]);

  const heroBadgeText = config?.hero?.badgeText || "★ Opportunity";
  const heroTitle = useMemo(() => {
    const text = config?.hero?.title || "Life at\nUnited Brothers";
    const parts = String(text).split("\\n");
    return parts.map((line, idx) => (
      <React.Fragment key={idx}>
        {parseInlineFormatting(line)}
        {idx < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  }, [config]);

  const heroSubtitle = useMemo(() => {
    const text =
      config?.hero?.subtitle ||
      "At the United Brothers Company, we are more than just a team; we are a family of innovators, creators, and professionals.";
    return parseInlineFormatting(text);
  }, [config]);

  const whyBadgeText = config?.whySection?.badgeText || "★ Why";
  const whyTitle = config?.whySection?.title || "Why Join Us?";
  const whyCards = useMemo(() => {
    return config?.whySection?.cards && config.whySection.cards.length > 0
      ? config.whySection.cards
      : [];
  }, [config?.whySection?.cards]);

  useEffect(() => {
    const resolveIcons = async () => {
      const resolved = {};
      for (const card of whyCards) {
        if (
          card.icon &&
          !card.icon.startsWith("data:") &&
          !card.icon.startsWith("http")
        ) {
          try {
            resolved[card.id || card.title] = await resolveImageUrl(card.icon);
          } catch (err) {
            console.error("Error resolving icon:", err);
            resolved[card.id || card.title] = starImage;
          }
        } else {
          resolved[card.id || card.title] = card.icon || starImage;
        }
      }
      setResolvedIcons(resolved);
    };
    resolveIcons();
  }, [whyCards]);

  const openingsBadgeText = config?.openingsSection?.badgeText || "★ Join Us";
  const openingsTitle = config?.openingsSection?.title || "Our Openings";

  // Resolve hero background image
  const [heroBgImage, setHeroBgImage] = useState(heroImage);
  useEffect(() => {
    const resolveHeroImage = async () => {
      if (config?.hero?.backgroundImage) {
        try {
          const resolved = await resolveImageUrl(config.hero.backgroundImage);
          setHeroBgImage(resolved || heroImage);
        } catch (error) {
          console.error("Error resolving hero image:", error);
          setHeroBgImage(heroImage);
        }
      } else {
        setHeroBgImage(heroImage);
      }
    };
    resolveHeroImage();
  }, [config?.hero?.backgroundImage]);

  if (!config) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.875rem",
        }}
      >
        Start editing to see live preview
      </div>
    );
  }

  return (
    <div className="live-careers-preview">
      <main
        className="careers"
        style={{
          margin: 0,
          padding: 0,
          minHeight: "auto",
          width: "max-content",
          minWidth: "100%",
          maxWidth: "none",
          overflowX: "visible",
        }}
      >
        <section
          className="careers-hero"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${heroBgImage})`,
          }}
          aria-label="Careers hero"
        >
          <div className="site-container">
            <span className="pill pill-outline">{heroBadgeText}</span>
            <h1 className="hero-title">{heroTitle}</h1>
            <p className="hero-sub">{heroSubtitle}</p>
          </div>
        </section>

        {whyCards.length > 0 && (
          <section className="why">
            <div className="site-container">
              <span className="pill pill-soft">{whyBadgeText}</span>
              <h2 className="section-title">{whyTitle}</h2>

              <div className="why-grid">
                {whyCards.map((card, index) => {
                  const titleLines = String(card.title || "").split("\\n");
                  const cardIcon =
                    resolvedIcons[card.id || card.title] ||
                    card.icon ||
                    starImage;
                  return (
                    <div className="why-card" key={card.id || index}>
                      <div className="why-icon">
                        <img src={cardIcon} alt={`${card.title || 'Career'} feature icon`} />
                      </div>
                      <h3 className="why-head">
                        {titleLines.map((line, i) => (
                          <React.Fragment key={i}>
                            {parseInlineFormatting(line)}
                            {i < titleLines.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </h3>
                      <p className="why-text">
                        {parseInlineFormatting(card.text || "")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section className="openings" aria-label="Current openings">
            <div className="site-container">
              <span className="pill pill-outline inverted">
                {openingsBadgeText}
              </span>
              <h2 className="section-title inverted">{openingsTitle}</h2>

              <ul className="job-list">
                {jobs.map((job) => (
                  <li key={job.title} className="job-row">
                    <div className="job-left">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-date">
                        <span>Posted Date</span> / {job.date}
                      </p>
                    </div>

                    <div className="job-right">
                      <p className="job-blurb">
                        {parseInlineFormatting(job.blurb || "")}
                      </p>
                      <button
                        className="btn-apply"
                        type="button"
                        aria-label={`Apply for ${job.title}`}
                        disabled
                        style={{ opacity: 0.6, cursor: "not-allowed" }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
