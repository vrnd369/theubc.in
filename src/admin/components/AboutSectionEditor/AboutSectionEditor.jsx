import React, {
  useState,
  useEffect,
  forwardRef,
} from "react";
import ImageSelector from "../ImageSelector/ImageSelector";
import InlineFontEditor from "../BrandPageEditor/InlineFontEditor";
import "./AboutSectionEditor.css";

const SECTION_TYPES = [
  { value: "hero", label: "Hero Section", icon: "🖼️" },
  { value: "leaders", label: "Leaders", icon: "👥" },
  { value: "story", label: "Founding Story", icon: "📖" },
  { value: "vision", label: "Vision", icon: "👁️" },
  { value: "mission", label: "Mission", icon: "🎯" },
  { value: "infrastructure", label: "Infrastructure", icon: "🏗️" },
  { value: "certification", label: "Certification", icon: "🏆" },
  { value: "sustainability", label: "Sustainability", icon: "🌱" },
  { value: "news", label: "Media & News", icon: "📰" },
];

const TEXT_ALIGNMENTS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

const AboutSectionEditor = forwardRef(function AboutSectionEditor(
  { section, onSave, onCancel, onLiveUpdate },
  ref
) {
  const [formData, setFormData] = useState({
    name: "",
    type: "hero",
    enabled: true,
    order: 0,
    content: {},
    styles: {},
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || "",
        type: section.type || "hero",
        enabled: section.enabled !== false,
        order: section.order || 0,
        content: section.content || {},
        styles: section.styles || {},
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        order: Date.now(),
      }));
    }
  }, [section]);

  // Send live updates to preview whenever formData changes
  useEffect(() => {
    if (onLiveUpdate && formData.type) {
      // Small delay to debounce rapid changes
      const timeoutId = setTimeout(() => {
        // Create a preview section object
        const previewSection = {
          id: section?.id || "preview-" + Date.now(),
          name: formData.name || "Preview Section",
          type: formData.type,
          enabled: formData.enabled !== false,
          order: formData.order || 0,
          content: formData.content || {},
          styles: formData.styles || {},
        };
        onLiveUpdate(previewSection);
      }, 150); // 150ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formData, onLiveUpdate, section]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
          ? parseInt(value) || 0
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleContentChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const handleStyleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [field]: value,
      },
    }));
  };

  const handleArrayItemChange = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const array = prev.content[arrayName] || [];
      const newArray = [...array];
      newArray[index] = { ...newArray[index], [field]: value };
      return {
        ...prev,
        content: {
          ...prev.content,
          [arrayName]: newArray,
        },
      };
    });
  };

  const handleAddArrayItem = (arrayName, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [arrayName]: [...(prev.content[arrayName] || []), defaultItem],
      },
    }));
  };

  const handleDeleteArrayItem = (arrayName, index) => {
    setFormData((prev) => {
      const array = prev.content[arrayName] || [];
      return {
        ...prev,
        content: {
          ...prev.content,
          [arrayName]: array.filter((_, i) => i !== index),
        },
      };
    });
  };

  // Badge start options
  const BADGE_START_OPTIONS = [
    { value: "", label: "None" },
    { value: "★", label: "★ Star" },
    { value: "•", label: "• Bullet" },
    { value: "→", label: "→ Arrow" },
    { value: "▶", label: "▶ Play" },
    { value: "◆", label: "◆ Diamond" },
    { value: "■", label: "■ Square" },
    { value: "●", label: "● Circle" },
    { value: "✓", label: "✓ Check" },
    { value: "☆", label: "☆ Star Outline" },
  ];

  // Star symbols for multi-select dropdown
  const STAR_SYMBOLS = [
    { value: "★", label: "★ Black Star" },
    { value: "☆", label: "☆ White Star" },
    { value: "✦", label: "✦ Four-Pointed Black" },
    { value: "✧", label: "✧ Four-Pointed White" },
    { value: "✩", label: "✩ Outlined Star" },
    { value: "✪", label: "✪ Circled Star" },
    { value: "✫", label: "✫ Open Center" },
    { value: "✬", label: "✬ Black Center" },
    { value: "✭", label: "✭ Outlined Black" },
    { value: "✮", label: "✮ Heavy Outlined" },
    { value: "✯", label: "✯ Pinwheel Star" },
    { value: "✰", label: "✰ Shadowed Star" },
  ];

  // Helper function to parse stars from tag string
  const parseStarsFromTag = (tagValue) => {
    if (!tagValue) return { stars: [], text: "" };

    // Extract all star symbols from the beginning
    const stars = [];
    let remainingText = tagValue;

    // Keep extracting stars from the start
    while (remainingText.length > 0) {
      let found = false;
      for (const star of STAR_SYMBOLS) {
        if (remainingText.startsWith(star.value)) {
          stars.push(star.value);
          // Remove star and only the first space separator if it exists, preserve other spaces
          remainingText = remainingText.substring(star.value.length);
          if (remainingText.startsWith(" ")) {
            remainingText = remainingText.substring(1);
          }
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    return { stars, text: remainingText };
  };

  // Helper function to combine stars and text
  const combineStarsAndText = (stars, text) => {
    const starsStr = stars.join("");
    // Preserve user input exactly as typed, including leading and trailing spaces
    return text ? `${starsStr} ${text}` : starsStr;
  };

  // Render multi-select star dropdown for Section Tag
  const renderSectionTagWithStars = () => {
    const tagValue = formData.content.tag || "";
    const { stars: currentStars, text: currentText } =
      parseStarsFromTag(tagValue);

    const handleStarToggle = (starValue) => {
      const newStars = currentStars.includes(starValue)
        ? currentStars.filter((s) => s !== starValue)
        : [...currentStars, starValue];
      const newTag = combineStarsAndText(newStars, currentText);
      handleContentChange("tag", newTag);
    };

    const handleTextChange = (newText) => {
      const newTag = combineStarsAndText(currentStars, newText);
      handleContentChange("tag", newTag);
    };

    return (
      <div className="form-group">
        <label className="admin-label">Section Tag</label>

        {/* Multi-select star dropdown */}
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              fontSize: "13px",
              color: "#6b7280",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Select Stars (multiple selection):
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              backgroundColor: "#f9fafb",
            }}
          >
            {STAR_SYMBOLS.map((star) => {
              const isSelected = currentStars.includes(star.value);
              return (
                <button
                  key={star.value}
                  type="button"
                  onClick={() => handleStarToggle(star.value)}
                  style={{
                    padding: "8px 12px",
                    border: `2px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
                    borderRadius: "6px",
                    backgroundColor: isSelected ? "#dbeafe" : "#ffffff",
                    color: isSelected ? "#1e40af" : "#374151",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: isSelected ? "600" : "400",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.backgroundColor = "#f0f9ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  <span>{star.value}</span>
                  {isSelected && <span style={{ fontSize: "12px" }}>✓</span>}
                </button>
              );
            })}
          </div>
          {currentStars.length > 0 && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                backgroundColor: "#eff6ff",
                borderRadius: "4px",
                fontSize: "13px",
                color: "#1e40af",
              }}
            >
              <strong>Selected:</strong> {currentStars.join(" ")} (
              {currentStars.length} star{currentStars.length !== 1 ? "s" : ""})
            </div>
          )}
        </div>

        {/* Text input */}
        <input
          type="text"
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="admin-input"
          placeholder="LEADERS"
        />
        <small className="form-hint">
          Selected stars will appear before the text. Click stars to
          select/deselect multiple.
        </small>
      </div>
    );
  };

  // Helper function to get badge start prefix and text
  const getBadgeStartAndText = (badgeText) => {
    if (!badgeText) return { start: "", text: "" };
    // Check if badge text starts with any of the badge start options
    for (const option of BADGE_START_OPTIONS) {
      if (option.value && badgeText.startsWith(option.value + " ")) {
        return {
          start: option.value,
          text: badgeText.substring(option.value.length + 1),
        };
      }
    }
    return { start: "", text: badgeText };
  };

  // Helper function to render badge text with start dropdown
  const renderBadgeTextWithStart = () => {
    const { start, text } = getBadgeStartAndText(
      formData.content.badgeText || ""
    );

    return (
      <div className="form-group">
        <label className="admin-label">Badge Text</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <select
            value={start}
            onChange={(e) => {
              const selectedStart = e.target.value;
              const currentText = text || "";
              const newBadgeText = selectedStart
                ? `${selectedStart} ${currentText}`.trim()
                : currentText;
              handleContentChange("badgeText", newBadgeText);
            }}
            className="admin-select"
            style={{ width: "150px", flexShrink: 0 }}
          >
            {BADGE_START_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={text}
            onChange={(e) => {
              const newText = e.target.value;
              const currentStart = start;
              const newBadgeText = currentStart
                ? `${currentStart} ${newText}`.trim()
                : newText;
              handleContentChange("badgeText", newBadgeText);
            }}
            className="admin-input"
            placeholder="CERTIFICATION"
            style={{ flex: 1 }}
          />
        </div>
        <small className="form-hint">
          Select a prefix symbol and enter the badge text
        </small>
      </div>
    );
  };

  // Common styling section

  const renderCommonStyling = () => (
    <div className="form-section">
      <h4 className="section-subtitle">Styling & Dimensions</h4>

      <div className="form-group">
        <label className="admin-label">Text Alignment</label>
        <small className="form-hint">
          Choose how text is aligned within this section. Left, center, right,
          or justify alignment.
        </small>
        <select
          value={formData.content.textAlignment || "left"}
          onChange={(e) => handleContentChange("textAlignment", e.target.value)}
          className="admin-select"
        >
          {TEXT_ALIGNMENTS.map((align) => (
            <option key={align.value} value={align.value}>
              {align.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="admin-label">Section Background Color</label>
        <div
          className="form-row"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <input
            type="color"
            value={
              formData.styles?.backgroundColor?.startsWith("#")
                ? formData.styles.backgroundColor
                : "#FFFFFF"
            }
            onChange={(e) =>
              handleStyleChange("backgroundColor", e.target.value)
            }
            style={{
              height: "40px",
              width: "60px",
              cursor: "pointer",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
          <input
            type="text"
            value={formData.styles?.backgroundColor || "#FFFFFF"}
            onChange={(e) =>
              handleStyleChange("backgroundColor", e.target.value)
            }
            className="admin-input"
            placeholder="#FFFFFF or rgba(255,255,255,1)"
            style={{ flex: 1 }}
          />
        </div>
        <small className="form-hint">
          Choose the background color for the entire section container. Use hex
          format (e.g., #FFFFFF) or rgba format (e.g., rgba(255,255,255,1)).
        </small>
      </div>

      <div
        className="form-group"
        style={{
          padding: "12px",
          backgroundColor: "#f3f4f6",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          <strong>Note:</strong> Section dimensions (padding, margins, container
          width, and image sizes) are fixed and cannot be changed. You can only
          edit content (text, images, colors) to maintain consistent page
          layout.
        </p>
      </div>

      <div className="section-save-button">
        <button
          type="button"
          onClick={handleSubmit}
          className="admin-btn admin-btn-primary"
        >
          💾 Save Styling & Dimensions
        </button>
      </div>
    </div>
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Section name is required";
    }
    if (!formData.type) {
      newErrors.type = "Section type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { addAboutSection, updateAboutSection } = await import(
        "../../services/aboutService"
      );
      if (section) {
        await updateAboutSection(section.id, formData);
      } else {
        await addAboutSection(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving about section:", error);
      alert("Error saving section. Please try again.");
    }
  };

  // Hero Section Editor
  const renderHeroEditor = () => (
    <>
      <div className="form-group">
        <ImageSelector
          value={formData.content.image || ""}
          onChange={(url) => handleContentChange("image", url)}
          label="Hero Image"
        />
        <small className="form-hint">
          Select the main hero image for this section. The image will
          automatically fit to hero section dimensions (responsive: 60vh
          desktop, 50vh tablet, 40vh mobile, 35vh small mobile).
        </small>
      </div>

      {renderCommonStyling()}

      <div className="section-save-button">
        <button
          type="button"
          onClick={handleSubmit}
          className="admin-btn admin-btn-primary"
        >
          💾 Save Hero Section
        </button>
      </div>
    </>
  );

  // Leaders Section Editor
  const renderLeadersEditor = () => {
    const founders = formData.content.founders || [];
    const leaders = formData.content.leaders || [];

    return (
      <>
        {renderSectionTagWithStars()}

        <div className="form-group">
          <label className="admin-label">Badge Background Color</label>
          <small className="form-hint">
            Set the background color for the section badge/tag. Use hex format
            (e.g., #323790) or rgba format.
          </small>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="color"
              value={
                formData.styles?.badgeBackgroundColor?.startsWith("#")
                  ? formData.styles.badgeBackgroundColor
                  : "#323790"
              }
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              style={{ width: "60px", height: "40px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={formData.styles?.badgeBackgroundColor || "#323790"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              className="admin-input"
              placeholder="#323790"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-subtitle">Image Styling</h4>

          <div className="form-group">
            <label className="admin-label">Image Filter</label>
            <small className="form-hint">
              Choose whether leader photos appear in color or black & white.
              Grayscale creates a classic, professional look.
            </small>
            <select
              value={formData.styles?.imageFilter || "grayscale"}
              onChange={(e) => handleStyleChange("imageFilter", e.target.value)}
              className="admin-select"
            >
              <option value="grayscale">Black & White (Grayscale)</option>
              <option value="color">Color</option>
            </select>
          </div>

          <div className="form-group">
            <label className="admin-label">
              <input
                type="checkbox"
                checked={formData.styles?.imageHoverEffect !== false}
                onChange={(e) =>
                  handleStyleChange("imageHoverEffect", e.target.checked)
                }
                className="admin-checkbox"
              />
              <span>Enable Hover Effect</span>
            </label>
            <small className="form-hint">
              When enabled, images will show color on hover (only works with
              grayscale filter)
            </small>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Founders Block</h4>
          </div>

          <div className="form-group">
            <InlineFontEditor
              label="Founders Heading"
              value={formData.content.foundersHeading || ""}
              onChange={(value) =>
                handleContentChange("foundersHeading", value)
              }
              placeholder="Who Were the Founders"
              helpText="Style any word or the whole heading for the Founders block."
            />
          </div>

          <div className="form-group">
            <InlineFontEditor
              label="Founders Subtitle"
              value={formData.content.foundersSubtitle || ""}
              onChange={(value) =>
                handleContentChange("foundersSubtitle", value)
              }
              placeholder="Shaping the legacy with passion, purpose, and pioneering vision."
              helpText="Use formatting to highlight key phrases in the Founders subtitle."
            />
          </div>

          <div className="section-header">
            <h4 className="section-subtitle">Founders</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("founders", {
                  id: Date.now(),
                  name: "",
                  role: "",
                  image: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Founder
            </button>
          </div>

          {founders.map((founder, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Founder {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("founders", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={founder.image || ""}
                  onChange={(url) =>
                    handleArrayItemChange("founders", index, "image", url)
                  }
                  label="Founder Image"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Name</label>
                  <small className="form-hint">
                    Enter the full name of the founder.
                  </small>
                  <input
                    type="text"
                    value={founder.name || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "founders",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Mr. Jameel Khan"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Role</label>
                  <small className="form-hint">
                    Enter the role or title of the founder (e.g., "The
                    Grandfather", "Co-Founder").
                  </small>
                  <input
                    type="text"
                    value={founder.role || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "founders",
                        index,
                        "role",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="The Grandfather"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Leaders Block</h4>
          </div>

          <div className="form-group">
            <InlineFontEditor
              label="Leaders Heading"
              value={formData.content.leadersHeading || ""}
              onChange={(value) => handleContentChange("leadersHeading", value)}
              placeholder="Who Are the Leaders"
              helpText="Style the Leaders heading line-by-line or word-by-word."
            />
          </div>

          <div className="form-group">
            <InlineFontEditor
              label="Leaders Subtitle"
              value={formData.content.leadersSubtitle || ""}
              onChange={(value) =>
                handleContentChange("leadersSubtitle", value)
              }
              placeholder="Steering the legacy with vision, integrity, and forward thinking."
              helpText="Perfect for emphasizing important parts of the Leaders subtitle."
            />
          </div>

          <div className="section-header">
            <h4 className="section-subtitle">Leaders</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("leaders", {
                  id: Date.now(),
                  name: "",
                  role: "",
                  image: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Leader
            </button>
          </div>

          {leaders.map((leader, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Leader {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("leaders", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={leader.image || ""}
                  onChange={(url) =>
                    handleArrayItemChange("leaders", index, "image", url)
                  }
                  label="Leader Image"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Name</label>
                  <input
                    type="text"
                    value={leader.name || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "leaders",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Mr. Bilal Khan"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Role</label>
                  <input
                    type="text"
                    value={leader.role || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "leaders",
                        index,
                        "role",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Managing Director"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {renderCommonStyling()}
      </>
    );
  };

  // Story Section Editor
  const renderStoryEditor = () => (
    <>
      <div className="form-group">
        <InlineFontEditor
          label="Heading Line 1"
          value={formData.content.headingLine1 || ""}
          onChange={(value) => handleContentChange("headingLine1", value)}
          placeholder="Our Founding Story:"
          helpText="Select text and use formatting options to style individual words or lines in this heading."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Heading Line 2"
          value={formData.content.headingLine2 || ""}
          onChange={(value) => handleContentChange("headingLine2", value)}
          placeholder="A Legacy of Values"
          helpText="You can change font, size, color, and style for any word in this line."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Paragraph 1"
          value={formData.content.paragraph1 || ""}
          onChange={(value) => handleContentChange("paragraph1", value)}
          placeholder="The United Brothers Company (UBC) carries forward..."
          helpText="Perfect for highlighting one sentence or one word in the first paragraph."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Paragraph 2"
          value={formData.content.paragraph2 || ""}
          onChange={(value) => handleContentChange("paragraph2", value)}
          placeholder="While it may have sounded unusual..."
          helpText="Use formatting tags to emphasize only specific words or lines."
        />
      </div>

      {renderCommonStyling()}

      <div className="section-save-button">
        <button
          type="button"
          onClick={handleSubmit}
          className="admin-btn admin-btn-primary"
        >
          💾 Save Story Section
        </button>
      </div>
    </>
  );

  // Vision Section Editor
  const renderVisionEditor = () => (
    <>
      {renderBadgeTextWithStart()}

      <div className="form-group">
        <label className="admin-label">Badge Background Color</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="color"
            value={formData.styles?.badgeBackgroundColor || "#323790"}
            onChange={(e) =>
              handleStyleChange("badgeBackgroundColor", e.target.value)
            }
            style={{ width: "60px", height: "40px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={formData.styles?.badgeBackgroundColor || "#323790"}
            onChange={(e) =>
              handleStyleChange("badgeBackgroundColor", e.target.value)
            }
            className="admin-input"
            placeholder="#323790"
            style={{ flex: 1 }}
          />
        </div>
        <small className="form-hint">
          Choose the background color for the badge
        </small>
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Heading Line 1"
          value={formData.content.headingLine1 || ""}
          onChange={(value) => handleContentChange("headingLine1", value)}
          placeholder="The Thought"
          helpText="Style any word or the whole first line of the Vision heading."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Heading Line 2"
          value={formData.content.headingLine2 || ""}
          onChange={(value) => handleContentChange("headingLine2", value)}
          placeholder="Behind Starting UBC"
          helpText="Highlight key words in the second Vision heading line."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Lead Paragraph"
          value={formData.content.leadParagraph || ""}
          onChange={(value) => handleContentChange("leadParagraph", value)}
          placeholder="United Brothers Company was founded post-COVID..."
          helpText="Use inline formatting to emphasize important sentences in the lead paragraph."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Muted Paragraph"
          value={formData.content.mutedParagraph || ""}
          onChange={(value) => handleContentChange("mutedParagraph", value)}
          placeholder="Observing how earlier generations were stronger..."
          helpText="Soft emphasis for muted text with full inline formatting support."
        />
      </div>

      {renderCommonStyling()}

      <div className="section-save-button">
        <button
          type="button"
          onClick={handleSubmit}
          className="admin-btn admin-btn-primary"
        >
          💾 Save Vision Section
        </button>
      </div>
    </>
  );

  // Mission Section Editor
  const renderMissionEditor = () => (
    <>
      {renderBadgeTextWithStart()}

      <div className="form-group">
        <label className="admin-label">Badge Background Color</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="color"
            value={formData.styles?.badgeBackgroundColor || "#323790"}
            onChange={(e) =>
              handleStyleChange("badgeBackgroundColor", e.target.value)
            }
            style={{ width: "60px", height: "40px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={formData.styles?.badgeBackgroundColor || "#323790"}
            onChange={(e) =>
              handleStyleChange("badgeBackgroundColor", e.target.value)
            }
            className="admin-input"
            placeholder="#323790"
            style={{ flex: 1 }}
          />
        </div>
        <small className="form-hint">
          Choose the background color for the badge
        </small>
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Heading Line 1"
          value={formData.content.headingLine1 || ""}
          onChange={(value) => handleContentChange("headingLine1", value)}
          placeholder="Our Goal for"
          helpText="Style any word or full line in the Mission heading line 1."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Heading Line 2"
          value={formData.content.headingLine2 || ""}
          onChange={(value) => handleContentChange("headingLine2", value)}
          placeholder="the Coming Years"
          helpText="Highlight key words in Mission heading line 2."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Lead Paragraph"
          value={formData.content.leadParagraph || ""}
          onChange={(value) => handleContentChange("leadParagraph", value)}
          placeholder="Looking ahead, our mission is to earn..."
          helpText="Use inline formatting for sentences or words in the lead paragraph."
        />
      </div>

      <div className="form-group">
        <InlineFontEditor
          label="Muted Paragraph"
          value={formData.content.mutedParagraph || ""}
          onChange={(value) => handleContentChange("mutedParagraph", value)}
          placeholder="While our products may cost slightly more..."
          helpText="Soft emphasis in the muted Mission paragraph, with full inline formatting."
        />
      </div>

      {renderCommonStyling()}

      <div className="section-save-button">
        <button
          type="button"
          onClick={handleSubmit}
          className="admin-btn admin-btn-primary"
        >
          💾 Save Mission Section
        </button>
      </div>
    </>
  );

  // Infrastructure Section Editor
  const renderInfrastructureEditor = () => {
    const items = formData.content.items || [];

    return (
      <>
        {renderBadgeTextWithStart()}

        <div className="form-group">
          <label className="admin-label">Badge Background Color</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="color"
              value={
                formData.styles?.badgeBackgroundColor?.startsWith("#")
                  ? formData.styles.badgeBackgroundColor
                  : "#E8E9F5"
              }
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              style={{ width: "60px", height: "40px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={
                formData.styles?.badgeBackgroundColor ||
                "rgba(50, 55, 144, 0.1)"
              }
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              className="admin-input"
              placeholder="rgba(50, 55, 144, 0.1) or #E8E9F5"
              style={{ flex: 1 }}
            />
          </div>
          <small className="form-hint">
            Choose the background color for the badge (hex or rgba format)
          </small>
        </div>

        <div className="form-group">
          <InlineFontEditor
            label="Heading Line 1"
            value={formData.content.headingLine1 || ""}
            onChange={(value) => handleContentChange("headingLine1", value)}
            placeholder="Infrastructure"
            helpText="Style any word or the full first line of the Infrastructure heading."
          />
        </div>

        <div className="form-group">
          <InlineFontEditor
            label="Heading Line 2"
            value={formData.content.headingLine2 || ""}
            onChange={(value) => handleContentChange("headingLine2", value)}
            placeholder="and Facilities"
            helpText="Highlight key words in the second Infrastructure heading line."
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Infrastructure Items</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("items", {
                  index: items.length + 1,
                  title: "",
                  text: "",
                  mutedText: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Item {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("items", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <label className="admin-label">Index Number</label>
                <small className="form-hint">
                  Enter the index number or label for this infrastructure item
                  (e.g., "(01)", "1.", "A)").
                </small>
                <input
                  type="text"
                  value={item.index || `(${index + 1})`}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "items",
                      index,
                      "index",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="(01)"
                />
              </div>

              <div className="form-group">
                <InlineFontEditor
                  label="Title"
                  value={item.title || ""}
                  onChange={(value) =>
                    handleArrayItemChange("items", index, "title", value)
                  }
                  placeholder="Manufacturing Facility"
                  helpText="Style each Infrastructure item title individually."
                />
              </div>

              <div className="form-group">
                <InlineFontEditor
                  label="Text"
                  value={item.text || ""}
                  onChange={(value) =>
                    handleArrayItemChange("items", index, "text", value)
                  }
                  placeholder="Over 50,000 sq. ft. of production space..."
                  helpText="Use inline formatting to emphasize parts of the item description."
                />
              </div>

              <div className="form-group">
                <InlineFontEditor
                  label="Muted Text (optional)"
                  value={item.mutedText || ""}
                  onChange={(value) =>
                    handleArrayItemChange("items", index, "mutedText", value)
                  }
                  placeholder="to meet global demand while maintaining..."
                  helpText="Optional muted line with inline formatting support."
                />
              </div>
            </div>
          ))}
        </div>

        {renderCommonStyling()}

        <div className="section-save-button">
          <button
            type="button"
            onClick={handleSubmit}
            className="admin-btn admin-btn-primary"
          >
            💾 Save Infrastructure Section
          </button>
        </div>
      </>
    );
  };

  // Certification Section Editor
  const renderCertificationEditor = () => {
    const certs = formData.content.certs || [];

    return (
      <>
        {renderBadgeTextWithStart()}

        <div className="form-group">
          <label className="admin-label">Badge Background Color</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="color"
              value={formData.styles?.badgeBackgroundColor || "#323790"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              style={{ width: "60px", height: "40px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={formData.styles?.badgeBackgroundColor || "#323790"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              className="admin-input"
              placeholder="#323790"
              style={{ flex: 1 }}
            />
          </div>
          <small className="form-hint">
            Choose the background color for the badge
          </small>
        </div>

        <div className="form-group">
          <label className="admin-label">Heading Line 1</label>
          <small className="form-hint">
            Enter the first line of the certification section heading.
          </small>
          <input
            type="text"
            value={formData.content.headingLine1 || ""}
            onChange={(e) =>
              handleContentChange("headingLine1", e.target.value)
            }
            className="admin-input"
            placeholder="Our Commitment"
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Heading Line 2</label>
          <small className="form-hint">
            Enter the second line of the certification section heading.
          </small>
          <input
            type="text"
            value={formData.content.headingLine2 || ""}
            onChange={(e) =>
              handleContentChange("headingLine2", e.target.value)
            }
            className="admin-input"
            placeholder="to Quality"
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Subtitle</label>
          <small className="form-hint">
            Enter a subtitle or tagline that appears below the heading.
          </small>
          <input
            type="text"
            value={formData.content.subtitle || ""}
            onChange={(e) => handleContentChange("subtitle", e.target.value)}
            className="admin-input"
            placeholder="A promise of purity, safety, and trust."
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Intro Paragraph 1</label>
          <textarea
            value={formData.content.intro1 || ""}
            onChange={(e) => handleContentChange("intro1", e.target.value)}
            className="admin-input"
            rows="3"
            placeholder="This page reflects United Brothers Company's..."
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Intro Paragraph 2 (Muted)</label>
          <textarea
            value={formData.content.intro2 || ""}
            onChange={(e) => handleContentChange("intro2", e.target.value)}
            className="admin-input"
            rows="3"
            placeholder="Every product is pure, safe, and of the highest standard..."
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Certifications</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("certs", {
                  id: `cert-${Date.now()}`,
                  logo: "",
                  title: "",
                  desc: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Certification
            </button>
          </div>

          {certs.map((cert, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Certification {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("certs", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={cert.logo || ""}
                  onChange={(url) =>
                    handleArrayItemChange("certs", index, "logo", url)
                  }
                  label="Certification Logo"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Title</label>
                <small className="form-hint">
                  Enter the certification name or title (e.g., "FSSC 22000",
                  "ISO 9001").
                </small>
                <input
                  type="text"
                  value={cert.title || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "certs",
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="FSSC 22000"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Description</label>
                <small className="form-hint">
                  Enter a brief description of what this certification
                  represents or its significance.
                </small>
                <textarea
                  value={cert.desc || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "certs",
                      index,
                      "desc",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  rows="2"
                  placeholder="The world's most respected food safety certification."
                />
              </div>
            </div>
          ))}
        </div>

        {renderCommonStyling()}

        <div className="section-save-button">
          <button
            type="button"
            onClick={handleSubmit}
            className="admin-btn admin-btn-primary"
          >
            💾 Save Certification Section
          </button>
        </div>
      </>
    );
  };

  // Sustainability Section Editor
  const renderSustainabilityEditor = () => {
    const items = formData.content.items || [];

    return (
      <>
        {renderBadgeTextWithStart()}

        <div className="form-group">
          <label className="admin-label">Badge Background Color</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="color"
              value={formData.styles?.badgeBackgroundColor || "#F3F4F6"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              style={{ width: "60px", height: "40px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={formData.styles?.badgeBackgroundColor || "#F3F4F6"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              className="admin-input"
              placeholder="#F3F4F6"
              style={{ flex: 1 }}
            />
          </div>
          <small className="form-hint">
            Choose the background color for the badge
          </small>
        </div>

        <div className="form-group">
          <label className="admin-label">Heading Line 1</label>
          <small className="form-hint">
            Enter the first line of the sustainability section heading.
          </small>
          <input
            type="text"
            value={formData.content.headingLine1 || ""}
            onChange={(e) =>
              handleContentChange("headingLine1", e.target.value)
            }
            className="admin-input"
            placeholder="Sustainability"
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Heading Line 2</label>
          <small className="form-hint">
            Enter the second line of the sustainability section heading.
          </small>
          <input
            type="text"
            value={formData.content.headingLine2 || ""}
            onChange={(e) =>
              handleContentChange("headingLine2", e.target.value)
            }
            className="admin-input"
            placeholder="Initiatives"
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Subtitle</label>
          <small className="form-hint">
            Enter a subtitle or tagline that describes your sustainability
            commitment.
          </small>
          <textarea
            value={formData.content.subtitle || ""}
            onChange={(e) => handleContentChange("subtitle", e.target.value)}
            className="admin-input"
            rows="2"
            placeholder="UBC is committed to serving not just its customers, but also the planet."
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Sustainability Items</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("items", {
                  index: items.length + 1,
                  title: "",
                  text: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Item {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("items", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <label className="admin-label">Index Number</label>
                <small className="form-hint">
                  Enter the index number or label for this sustainability item
                  (e.g., "(01)", "1.", "A)").
                </small>
                <input
                  type="text"
                  value={item.index || `(${index + 1})`}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "items",
                      index,
                      "index",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="(01)"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Title</label>
                <small className="form-hint">
                  Enter the title of this sustainability initiative (e.g.,
                  "Ethical Sourcing", "Renewable Energy").
                </small>
                <input
                  type="text"
                  value={item.title || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "items",
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="Ethical Sourcing"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Text</label>
                <textarea
                  value={item.text || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "items",
                      index,
                      "text",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  rows="3"
                  placeholder="Partnering with farmers and suppliers..."
                />
              </div>
            </div>
          ))}
        </div>

        {renderCommonStyling()}

        <div className="section-save-button">
          <button
            type="button"
            onClick={handleSubmit}
            className="admin-btn admin-btn-primary"
          >
            💾 Save Sustainability Section
          </button>
        </div>
      </>
    );
  };

  // News Section Editor
  const renderNewsEditor = () => {
    const news = formData.content.news || [];

    return (
      <>
        {renderBadgeTextWithStart()}

        <div className="form-group">
          <label className="admin-label">Badge Background Color</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="color"
              value={formData.styles?.badgeBackgroundColor || "#1E1E1E"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              style={{ width: "60px", height: "40px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={formData.styles?.badgeBackgroundColor || "#1E1E1E"}
              onChange={(e) =>
                handleStyleChange("badgeBackgroundColor", e.target.value)
              }
              className="admin-input"
              placeholder="#1E1E1E"
              style={{ flex: 1 }}
            />
          </div>
          <small className="form-hint">
            Choose the background color for the badge
          </small>
        </div>

        <div className="form-group">
          <label className="admin-label">Heading</label>
          <small className="form-hint">
            Enter the main heading for the news section (e.g., "Media & News",
            "Latest Updates").
          </small>
          <input
            type="text"
            value={formData.content.heading || ""}
            onChange={(e) => handleContentChange("heading", e.target.value)}
            className="admin-input"
            placeholder="Media & News"
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Subtitle</label>
          <small className="form-hint">
            Enter a subtitle that describes what visitors will find in this news
            section.
          </small>
          <textarea
            value={formData.content.subtitle || ""}
            onChange={(e) => handleContentChange("subtitle", e.target.value)}
            className="admin-input"
            rows="2"
            placeholder="From new launches to community initiatives..."
          />
        </div>

        <div className="form-group">
          <label className="admin-label">
            <input
              type="checkbox"
              checked={formData.content.showViewAllButton === true}
              onChange={(e) =>
                handleContentChange("showViewAllButton", e.target.checked)
              }
              style={{ marginRight: "8px" }}
            />
            Show View All Button
          </label>
          <small className="form-hint">
            Toggle to show or hide the "View All" button in the media section. By default, the button is hidden.
          </small>
        </div>

        {formData.content.showViewAllButton !== false && (
          <>
            <div className="form-group">
              <label className="admin-label">View All Button Text</label>
              <small className="form-hint">
                Enter the text for the "View All" button that links to all news
                items.
              </small>
              <input
                type="text"
                value={formData.content.viewAllButtonText || ""}
                onChange={(e) =>
                  handleContentChange("viewAllButtonText", e.target.value)
                }
                className="admin-input"
                placeholder="View all"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">View All Button Link</label>
              <small className="form-hint">
                Enter the URL where the "View All" button should redirect (e.g., social media link, news page, etc.). Leave empty if you don't want the button to be clickable.
              </small>
              <input
                type="url"
                value={formData.content.viewAllButtonLink || ""}
                onChange={(e) =>
                  handleContentChange("viewAllButtonLink", e.target.value)
                }
                className="admin-input"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </>
        )}

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">News Items</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("news", {
                  id: `news-${Date.now()}`,
                  image: "",
                  title: "",
                  tag: "",
                  instagramLink: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add News Item
            </button>
          </div>

          {news.map((item, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>News Item {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("news", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={item.image || ""}
                  onChange={(url) =>
                    handleArrayItemChange("news", index, "image", url)
                  }
                  label="News Image"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Title</label>
                <small className="form-hint">
                  Enter the news item title or headline. This will be displayed
                  prominently.
                </small>
                <textarea
                  value={item.title || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "news",
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  rows="2"
                  placeholder="Launch of Soil King Spices range now available pan-India"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Tag</label>
                <small className="form-hint">
                  Enter a category tag for this news item (e.g.,
                  "Announcements", "Product Launch", "Company News"). This will be displayed as a button.
                </small>
                <input
                  type="text"
                  value={item.tag || ""}
                  onChange={(e) =>
                    handleArrayItemChange("news", index, "tag", e.target.value)
                  }
                  className="admin-input"
                  placeholder="Announcements"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Instagram Link</label>
                <small className="form-hint">
                  Enter the Instagram URL for this tag button. The tag will be clickable and link to this Instagram URL.
                </small>
                <input
                  type="url"
                  value={item.instagramLink || ""}
                  onChange={(e) =>
                    handleArrayItemChange("news", index, "instagramLink", e.target.value)
                  }
                  className="admin-input"
                  placeholder="https://instagram.com/p/..."
                />
              </div>
            </div>
          ))}
        </div>

        {renderCommonStyling()}
      </>
    );
  };

  const renderTypeSpecificEditor = () => {
    switch (formData.type) {
      case "hero":
        return renderHeroEditor();
      case "leaders":
        return renderLeadersEditor();
      case "story":
        return renderStoryEditor();
      case "vision":
        return renderVisionEditor();
      case "mission":
        return renderMissionEditor();
      case "infrastructure":
        return renderInfrastructureEditor();
      case "certification":
        return renderCertificationEditor();
      case "sustainability":
        return renderSustainabilityEditor();
      case "news":
        return renderNewsEditor();
      default:
        return (
          <div className="form-group">
            <label className="admin-label">Content (JSON)</label>
            <textarea
              value={JSON.stringify(formData.content, null, 2)}
              onChange={(e) => {
                try {
                  handleContentChange("", JSON.parse(e.target.value));
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              className="admin-input"
              rows="10"
            />
          </div>
        );
    }
  };

  return (
    <div className="about-section-editor admin-card">
      <div className="editor-header">
        <h2 className="admin-heading-2">
          {section ? "Edit About Section" : "Add New About Section"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>

          <div className="form-group">
            <label className="admin-label">
              Section Name <span className="required">*</span>
            </label>
            <small className="form-hint">
              Enter a descriptive name for this section. This name is used for
              identification in the admin panel only.
            </small>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`admin-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g., Hero Section, Leaders Section"
              required
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="admin-label">
                Section Type <span className="required">*</span>
              </label>
              <small className="form-hint">
                Select the type of section. Each type has specific fields and
                layout options.
              </small>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="admin-select"
                required
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="admin-label">
                Order <span className="required">*</span>
              </label>
              <small className="form-hint">Lower numbers appear first</small>
              <div
                className="admin-alert admin-alert-warning"
                style={{
                  padding: "10px 14px",
                  marginTop: "12px",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "18px", lineHeight: "1.2" }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", marginBottom: "4px" }}>
                    Display Limit Notice
                  </strong>
                  <span className="admin-text-sm" style={{ display: "block" }}>
                    Only the first <strong>10 about sections</strong> are displayed in the
                    management list. Use filters or search to find specific sections
                    if you have more than 10.
                  </span>
                </div>
              </div>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="admin-input"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="admin-label">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="admin-checkbox"
              />
              <span>Enable this section</span>
            </label>
            <small className="form-hint">
              When enabled, this section will be displayed on the About Us page.
              Disabled sections are hidden from visitors.
            </small>
          </div>
          <div className="section-save-button">
            <button
              type="button"
              onClick={handleSubmit}
              className="admin-btn admin-btn-primary"
            >
              💾 Save Basic Information
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Content</h3>
          {renderTypeSpecificEditor()}
        </div>

        <div className="form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            {section ? "Update Section" : "Create Section"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

export default AboutSectionEditor;
