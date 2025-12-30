import React, { useState, useEffect } from "react";
import { resolveImageUrl } from "../../../utils/imageUtils";
import "./AboutSectionCard.css";

export default function AboutSectionCard({
  section,
  onEdit,
  onDelete,
  onToggleEnable,
  onUpdate,
  onCancel,
  isEditing = false,
}) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState(null);

  // Get the appropriate image reference based on section type
  const getImageReference = () => {
    // Hero section
    if (section.content?.image) {
      return section.content.image;
    }

    // Leaders section - show first founder or leader image
    if (section.type === "leaders") {
      if (section.content?.founders?.[0]?.image) {
        return section.content.founders[0].image;
      }
      if (section.content?.leaders?.[0]?.image) {
        return section.content.leaders[0].image;
      }
    }

    // Certification section - show first cert logo
    if (section.type === "certification" && section.content?.certs?.[0]?.logo) {
      return section.content.certs[0].logo;
    }

    // News section - show first news image
    if (section.type === "news" && section.content?.news?.[0]?.image) {
      return section.content.news[0].image;
    }

    return null;
  };

  // Resolve image URL if it's an image ID
  useEffect(() => {
    const imageRef = getImageReference();
    if (!imageRef) {
      setResolvedImageUrl(null);
      return;
    }

    // If it's already a URL, use it directly
    if (
      imageRef.startsWith("http://") ||
      imageRef.startsWith("https://") ||
      imageRef.startsWith("data:")
    ) {
      setResolvedImageUrl(imageRef);
      return;
    }

    // Otherwise, it's an image ID - resolve it
    const resolveImage = async () => {
      try {
        const url = await resolveImageUrl(imageRef);
        setResolvedImageUrl(url);
      } catch (error) {
        console.error("Error resolving image for preview:", error);
        setResolvedImageUrl(null);
      }
    };

    resolveImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    section.content?.image,
    section.content?.founders,
    section.content?.leaders,
    section.content?.certs,
    section.content?.news,
    section.type,
  ]);
  const getTypeBadge = (type) => {
    const badges = {
      hero: { label: "Hero", color: "blue", icon: "🖼️" },
      leaders: { label: "Leaders", color: "purple", icon: "👥" },
      story: { label: "Story", color: "green", icon: "📖" },
      vision: { label: "Vision", color: "orange", icon: "👁️" },
      mission: { label: "Mission", color: "teal", icon: "🎯" },
      infrastructure: { label: "Infrastructure", color: "indigo", icon: "🏗️" },
      certification: { label: "Certification", color: "pink", icon: "🏆" },
      sustainability: { label: "Sustainability", color: "green", icon: "🌱" },
      news: { label: "News", color: "red", icon: "📰" },
    };
    return badges[type] || { label: type, color: "gray", icon: "📋" };
  };

  const badge = getTypeBadge(section.type);

  const getPreviewText = () => {
    if (section.content?.heading) return section.content.heading;
    if (section.content?.title) return section.content.title;
    if (section.content?.tag) return section.content.tag;
    if (section.content?.headingLine1) return section.content.headingLine1;
    if (section.type === "hero" && section.content?.image) return "Hero Image";
    return "No preview available";
  };

  return (
    <div
      className={`about-section-card admin-card ${
        !section.enabled ? "disabled" : ""
      } ${isEditing ? "is-editing" : ""}`}
    >
      <div className="about-section-header">
        <div className="about-section-title-section">
          <div className="section-title-row">
            <h3 className="admin-heading-3">{section.name || section.type}</h3>
            <span className={`section-type-badge badge-${badge.color}`}>
              {badge.label}
            </span>
          </div>
          {!section.enabled && <span className="disabled-badge">Disabled</span>}
        </div>
        <div className="section-description">
          <p className="section-description-text">
            {section.type === "hero" &&
              "Hero section displays a large banner image at the top of the About page. Perfect for making a strong first impression."}
            {section.type === "leaders" &&
              "Leaders section showcases founders and current leadership team with photos, names, and roles. Supports both founders and leaders blocks."}
            {section.type === "story" &&
              "Founding Story section tells your company's origin story with formatted headings and paragraphs. Great for building connection with visitors."}
            {section.type === "vision" &&
              "Vision section displays your company's vision statement with a badge, formatted headings, and paragraphs. Highlights your forward-looking perspective."}
            {section.type === "mission" &&
              "Mission section presents your company's mission with a badge, formatted headings, and paragraphs. Communicates your purpose and goals."}
            {section.type === "infrastructure" &&
              "Infrastructure section lists your facilities and capabilities with numbered items. Showcases your operational capacity and resources."}
            {section.type === "certification" &&
              "Certification section displays your certifications and quality standards with logos and descriptions. Builds trust and credibility."}
            {section.type === "sustainability" &&
              "Sustainability section highlights your environmental and social initiatives. Demonstrates your commitment to responsible practices."}
            {section.type === "news" &&
              "News section displays recent company updates, announcements, and media coverage. Keeps visitors informed about your latest developments."}
            {![
              "hero",
              "leaders",
              "story",
              "vision",
              "mission",
              "infrastructure",
              "certification",
              "sustainability",
              "news",
            ].includes(section.type) &&
              "Custom section type. Edit to configure content and styling."}
          </p>
        </div>
        <div className="about-section-actions">
          {isEditing ? (
            <>
              <button
                onClick={onUpdate}
                className="admin-btn admin-btn-primary"
                title="Update Section"
              >
                ✅ Update
              </button>
              <button
                onClick={onCancel}
                className="admin-btn admin-btn-secondary"
                title="Cancel Editing"
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onToggleEnable(section.id, !section.enabled)}
                className={`admin-btn ${
                  section.enabled ? "admin-btn-secondary" : "admin-btn-success"
                }`}
                title={section.enabled ? "Disable" : "Enable"}
              >
                {section.enabled ? "👁️ Hide" : "👁️‍🗨️ Show"}
              </button>
              <button
                onClick={onEdit}
                className="admin-btn admin-btn-secondary"
                title="Edit"
              >
                ✏️ Edit
              </button>
              <button
                onClick={onDelete}
                className="admin-btn admin-btn-danger"
                title="Delete"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="about-section-preview">
        <p className="preview-text">{getPreviewText()}</p>
        <div className="preview-image">
          {getImageReference() ? (
            resolvedImageUrl ? (
              <img
                src={resolvedImageUrl}
                alt="About section preview"
                onError={(e) => {
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  if (parent && !parent.querySelector(".preview-error")) {
                    const errorDiv = document.createElement("div");
                    errorDiv.className = "preview-error";
                    errorDiv.textContent = "Image failed to load";
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            ) : (
              <div
                className="preview-error"
                style={{ color: "#6b7280", backgroundColor: "#f3f4f6" }}
              >
                Loading image...
              </div>
            )
          ) : (
            <div
              className="preview-error"
              style={{ color: "#9ca3af", backgroundColor: "#f3f4f6" }}
            >
              No image preview
            </div>
          )}
        </div>
      </div>

      <div className="about-section-details">
        <div className="detail-row">
          <span className="detail-label">Order:</span>
          <span className="detail-value">{section.order || 0}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span
            className={`detail-value ${
              section.enabled ? "enabled" : "disabled"
            }`}
          >
            {section.enabled ? "✓ Enabled" : "✗ Disabled"}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Text Alignment:</span>
          <span
            className="detail-value"
            style={{ textTransform: "capitalize" }}
          >
            {section.content?.textAlignment || "left"}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Background Color:</span>
          <span
            className="detail-value"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexDirection: "row",
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: section.styles?.backgroundColor || "#FFFFFF",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                display: "inline-block",
                flexShrink: 0,
              }}
              title={section.styles?.backgroundColor || "#FFFFFF"}
            />
            <span style={{ wordBreak: "break-all" }}>
              {section.styles?.backgroundColor || "#FFFFFF"}
            </span>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Dimensions:</span>
          <span
            className="detail-value"
            style={{
              fontSize: "12px",
              color: "#6b7280",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
            }}
          >
            <span>
              Max Width: 1280px (Fixed) |
              {section.type === "news"
                ? " Padding: 88px/88px (Fixed)"
                : " Padding: 80px/80px (Fixed)"}
            </span>
            <small style={{ fontSize: "11px", fontStyle: "italic" }}>
              Dimensions are fixed and cannot be changed
            </small>
          </span>
        </div>
        {section.content?.badgeText && (
          <div className="detail-row">
            <span className="detail-label">Badge Dimensions:</span>
            <span className="detail-value" style={{ fontSize: "12px" }}>
              {section.styles?.badgeWidth
                ? `W: ${section.styles.badgeWidth}px`
                : "W: auto"}
              {section.styles?.badgeHeight &&
                ` × H: ${section.styles.badgeHeight}px`}
              {section.styles?.badgeFontSize &&
                ` | Font: ${section.styles.badgeFontSize}px`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
