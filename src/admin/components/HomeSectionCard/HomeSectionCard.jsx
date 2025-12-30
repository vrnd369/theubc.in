import React, { useState, useEffect } from "react";
import { resolveImageUrl } from "../../../utils/imageUtils";
import "./HomeSectionCard.css";

export default function HomeSectionCard({
  section,
  onEdit,
  onDelete,
  onToggleEnable,
}) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState(null);
  const getTypeBadge = (type) => {
    const badges = {
      hero: { label: "Hero", color: "blue" },
      "text-image": { label: "Text + Image", color: "green" },
      "feature-cards": { label: "Feature Cards", color: "purple" },
      carousel: { label: "Carousel", color: "orange" },
      categories: { label: "Categories", color: "pink" },
      testimonials: { label: "Testimonials", color: "teal" },
      overview: { label: "Overview", color: "indigo" },
      "tell-us": { label: "Tell Us", color: "red" },
    };
    return badges[type] || { label: type, color: "gray" };
  };

  const badge = getTypeBadge(section.type);

  const getPreviewText = () => {
    if (section.content?.heading) return section.content.heading;
    if (section.content?.title) return section.content.title;
    if (section.content?.tag) return section.content.tag;
    return "No preview available";
  };

  // Get preview image reference based on section type
  const getPreviewImageRef = () => {
    if (!section.content) return null;

    // Text+Image section doesn't have images anymore (removed from editor)
    if (section.type === "text-image") {
      return null;
    }

    // Overview section uses logo or image
    if (section.type === "overview") {
      return (
        section.content.logo ||
        section.content.image ||
        section.content.backgroundImage
      );
    }

    // Default: use image field
    return section.content.image;
  };

  // Resolve image URL (handles both IDs and direct URLs)
  useEffect(() => {
    const imageRef = getPreviewImageRef();

    if (!imageRef) {
      setResolvedImageUrl(null);
      return;
    }

    // If it's already a URL (base64 or http), use it directly
    if (
      imageRef.startsWith("data:") ||
      imageRef.startsWith("http://") ||
      imageRef.startsWith("https://")
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
    section.content?.logo,
    section.content?.backgroundImage,
    section.type,
  ]);

  return (
    <div
      className={`home-section-card admin-card ${
        !section.enabled ? "disabled" : ""
      }`}
    >
      <div className="home-section-header">
        <div className="home-section-title-section">
          <div className="section-title-row">
            <h3 className="admin-heading-3">{section.name || section.type}</h3>
            <span className={`section-type-badge badge-${badge.color}`}>
              {badge.label}
            </span>
          </div>
          {!section.enabled && <span className="disabled-badge">Disabled</span>}
        </div>
        <div className="home-section-actions">
          <button
            onClick={() => onToggleEnable(section.id, !section.enabled)}
            className={`admin-btn ${
              section.enabled ? "admin-btn-secondary" : "admin-btn-success"
            }`}
            title={section.enabled ? "Disable" : "Enable"}
          >
            {section.enabled ? "Hide" : "Show"}
          </button>
          <button
            onClick={onEdit}
            className="admin-btn admin-btn-secondary"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="admin-btn admin-btn-danger"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="home-section-preview">
        <p className="preview-text">{getPreviewText()}</p>
        {resolvedImageUrl && (
          <div className="preview-image">
            <img
              src={resolvedImageUrl}
              alt="Home section preview"
              onError={(e) => {
                console.error(
                  "Preview image failed to load:",
                  resolvedImageUrl
                );
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="home-section-details">
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
            {section.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        {section.content?.textAlignment && (
          <div className="detail-row">
            <span className="detail-label">Text Align:</span>
            <span className="detail-value">
              {section.content.textAlignment}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
