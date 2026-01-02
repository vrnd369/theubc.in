import React, { useState, useEffect } from "react";
import ImageSelector from "../ImageSelector/ImageSelector";
import VideoSelector from "../VideoSelector/VideoSelector";
import InlineFontEditor from "../BrandPageEditor/InlineFontEditor";
import { usePermissions } from "../../auth/usePermissions";
import { ROLE } from "../../auth/roleConfig";
import "./HomeSectionEditor.css";

const SECTION_TYPES = [
  {
    value: "hero",
    label: "Hero Section",
    description:
      "The main banner section at the top of your homepage with video, heading, and call-to-action buttons",
  },
  {
    value: "text-image",
    label: "Text + Image",
    description:
      "A content section combining text paragraphs with an accompanying image",
  },
  {
    value: "feature-cards",
    label: "Feature Cards",
    description:
      "Display multiple feature cards with icons, titles, and descriptions in a grid layout",
  },
  {
    value: "carousel",
    label: "Carousel",
    description:
      "An interactive carousel showcasing multiple items (e.g., brands, products) with navigation",
  },
  {
    value: "categories",
    label: "Categories",
    description: "Display product or service categories in an organized layout",
  },
  {
    value: "testimonials",
    label: "Testimonials",
    description:
      "Showcase customer testimonials with profile images, names, and quotes",
  },
  {
    value: "overview",
    label: "Overview",
    description:
      "An overview section with company information, logo, and descriptive paragraphs",
  },
  {
    value: "tell-us",
    label: "Tell Us",
    description:
      "A contact form section where visitors can submit inquiries or requests",
  },
];

// Star symbols for tag dropdown
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

// Helper function to render tag input with star dropdown
const renderTagInput = (value, onChange, placeholder, hint) => {
  // Extract star symbol and text from current value
  const getStarAndText = (tagValue) => {
    if (!tagValue) return { star: "★", text: "" };

    // Check if tag starts with any star symbol
    for (const starOption of STAR_SYMBOLS) {
      if (tagValue.startsWith(starOption.value)) {
        // Extract text after star, preserving leading spaces but trimming trailing ones
        const textAfterStar = tagValue.substring(starOption.value.length);
        // Remove only the first space if it exists (the separator), but preserve any subsequent spaces
        const text = textAfterStar.startsWith(" ") 
          ? textAfterStar.substring(1) 
          : textAfterStar;
        return {
          star: starOption.value,
          text: text,
        };
      }
    }

    // Default to regular star if no star found
    const text = tagValue.replace(/^★\s*/, "");
    return { star: "★", text: text };
  };

  const { star: currentStar, text: currentText } = getStarAndText(value || "");

  const handleStarChange = (newStar) => {
    // Preserve user input exactly as typed, including leading and trailing spaces
    // Combine star and text with a space separator
    const newValue = currentText
      ? `${newStar} ${currentText}`
      : newStar;
    onChange(newValue);
  };

  const handleTextChange = (newText) => {
    // Preserve user input exactly as typed, including leading and trailing spaces
    // Combine star and text with a space separator
    const newValue = newText
      ? `${currentStar} ${newText}`
      : currentStar;
    onChange(newValue);
  };

  return (
    <div className="form-group">
      <label className="admin-label">Tag</label>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <select
          value={currentStar}
          onChange={(e) => handleStarChange(e.target.value)}
          className="admin-select"
          style={{ width: "120px", flexShrink: 0 }}
          title="Select star symbol"
        >
          {STAR_SYMBOLS.map((star) => (
            <option key={star.value} value={star.value}>
              {star.label}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="admin-input"
            placeholder={placeholder ? placeholder.replace(/^★\s*/, "") : "WHY"}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      {hint && <small className="form-hint">{hint}</small>}
    </div>
  );
};

export default function HomeSectionEditor({
  section,
  onSave,
  onCancel,
  onLiveUpdate,
}) {
  const { role } = usePermissions();
  const isSuperAdmin = role === ROLE.SUPER_ADMIN;
  
  const [formData, setFormData] = useState({
    name: "",
    type: "hero",
    enabled: true,
    order: 0,
    content: {},
    styles: {},
    dimensions: {
      desktop: {},
      tablet: {},
      mobile: {},
    },
  });

  const [errors, setErrors] = useState({});

  // Helper function to render font styling controls (only font family and color)
  const renderFontStyling = (prefix, label, styles, handleStyleChange) => {
    const commonFonts = [
      {
        value: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        label: "Inter (Default)",
      },
      { value: "'Playfair Display', serif", label: "Playfair Display" },
      { value: "Arial, sans-serif", label: "Arial" },
      { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
      { value: "Georgia, serif", label: "Georgia" },
      { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
      { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
      { value: "'Courier New', Courier, monospace", label: "Courier New" },
      { value: "Roboto, sans-serif", label: "Roboto" },
      { value: "'Open Sans', sans-serif", label: "Open Sans" },
      { value: "Lato, sans-serif", label: "Lato" },
      { value: "'Montserrat', sans-serif", label: "Montserrat" },
      { value: "'Poppins', sans-serif", label: "Poppins" },
      { value: "'Raleway', sans-serif", label: "Raleway" },
      { value: "'Merriweather', serif", label: "Merriweather" },
    ];

    return (
      <div
        className="form-section"
        style={{
          marginTop: "16px",
          padding: "16px",
          background: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h5
          className="section-subtitle"
          style={{
            fontSize: "14px",
            marginBottom: "12px",
            fontWeight: "600",
            color: "#475569",
          }}
        >
          {label} Font Styling
        </h5>
        <small
          className="form-hint"
          style={{ marginBottom: "16px", display: "block" }}
        >
          Customize the appearance of the {label.toLowerCase()} text. Choose a
          font family that matches your brand and set the text color for optimal
          readability.
        </small>

        {/* Font Family */}
        <div className="form-group" style={{ marginBottom: "12px" }}>
          <label className="admin-label">Font Family</label>
          <select
            value={styles?.[`${prefix}FontFamily`] || ""}
            onChange={(e) =>
              handleStyleChange(`${prefix}FontFamily`, e.target.value)
            }
            className="admin-select"
            disabled={!isSuperAdmin}
            style={{
              opacity: isSuperAdmin ? 1 : 0.6,
              cursor: isSuperAdmin ? "pointer" : "not-allowed",
            }}
          >
            <option value="">Default (Inherit)</option>
            {isSuperAdmin && commonFonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
            {!isSuperAdmin && (
              <option value="Inter, ui-sans-serif, system-ui, -apple-system, sans-serif">
                Inter (Default)
              </option>
            )}
          </select>
          {!isSuperAdmin ? (
            <small className="form-hint" style={{ fontStyle: "italic", color: "#64748b" }}>
              Font selection is restricted to Super Admin. Using default font.
            </small>
          ) : (
            <small className="form-hint">
              Select a font family that best represents your brand. Serif fonts
              (like Playfair Display) convey elegance, while sans-serif fonts (like
              Inter) are modern and clean. Leave as "Default" to use the site's
              default font.
            </small>
          )}
        </div>

        {/* Font Color */}
        <div className="form-group" style={{ marginBottom: "12px" }}>
          <label className="admin-label">Text Color</label>
          <div className="form-row">
            <input
              type="color"
              value={styles?.[`${prefix}Color`] || "#111827"}
              onChange={(e) =>
                handleStyleChange(`${prefix}Color`, e.target.value)
              }
              style={{ height: "40px", width: "100px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={styles?.[`${prefix}Color`] || ""}
              onChange={(e) =>
                handleStyleChange(`${prefix}Color`, e.target.value)
              }
              className="admin-input"
              placeholder="#111827"
              style={{ flex: 1, marginLeft: "10px" }}
            />
          </div>
          <small className="form-hint">
            Set the text color using the color picker or enter a hex code (e.g.,
            #111827 for dark gray, #FFFFFF for white). Ensure sufficient contrast
            with the background for readability.
          </small>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || "",
        type: section.type || "hero",
        enabled: section.enabled !== false,
        order: section.order || 0,
        content: section.content || {},
        styles: section.styles || {},
        dimensions: section.dimensions || {
          desktop: {},
          tablet: {},
          mobile: {},
        },
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
          dimensions: formData.dimensions || {
            desktop: {},
            tablet: {},
            mobile: {},
          },
        };
        onLiveUpdate(previewSection);
      }, 100); // 100ms debounce

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

  // Common styling section - REMOVED: All dimension/spacing controls are now fixed
  // Users can only change font style and color, and content (text/images/icons)
  const renderCommonStyling = () => null;

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
      const { addHomeSection, updateHomeSection } = await import(
        "../../services/homeService"
      );
      if (section) {
        await updateHomeSection(section.id, formData);
      } else {
        await addHomeSection(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving home section:", error);
      alert("Error saving section. Please try again.");
    }
  };

  const renderHeroEditor = () => (
    <>
      <div className="form-group">
        <VideoSelector
          value={formData.content.videoUrl || ""}
          onChange={(url) => handleContentChange("videoUrl", url)}
          label="Background Video"
        />
        <small className="form-hint">
          Upload a video file (will be automatically compressed to under 750KB)
          or paste a YouTube/Vimeo URL. This video will play as the background
          of your hero section, creating an engaging first impression for
          visitors.
        </small>
      </div>

      <div className="form-group">
        <InlineFontEditor
          value={formData.content.heading || ""}
          onChange={(value) => handleContentChange("heading", value)}
          placeholder="Main heading text"
          label="Heading"
          helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
        />
        <small className="form-hint">
          The main headline text displayed prominently in the hero section. This
          is typically the first thing visitors see, so make it compelling and
          clear about your value proposition. You can format text using special tags for fonts, colors, sizes, weights, and styles.
        </small>
      </div>

      {/* Heading Font Styling */}
      {renderFontStyling(
        "heading",
        "Heading",
        formData.styles,
        handleStyleChange
      )}

      <div className="form-group">
        <InlineFontEditor
          value={formData.content.description || ""}
          onChange={(value) => handleContentChange("description", value)}
          placeholder="Description text"
          label="Description"
          helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
        />
        <small className="form-hint">
          Supporting text that appears below the heading. Use this to provide
          more context, explain benefits, or guide visitors. You can format text
          using special tags for fonts, colors, sizes, weights, and styles.
        </small>
      </div>

      {/* Description Font Styling */}
      {renderFontStyling(
        "description",
        "Description",
        formData.styles,
        handleStyleChange
      )}

      <div className="form-section">
        <h4 className="section-subtitle">Primary Button</h4>
        <small
          className="form-hint"
          style={{ marginBottom: "16px", display: "block" }}
        >
          The primary call-to-action button that stands out most prominently.
          Use this for your main conversion goal (e.g., "Shop Now", "Get
          Started").
        </small>
        <div className="form-row">
          <div className="form-group">
            <label className="admin-label">Button Text</label>
            <input
              type="text"
              value={formData.content.primaryButton?.text || ""}
              onChange={(e) =>
                handleContentChange("primaryButton", {
                  ...formData.content.primaryButton,
                  text: e.target.value,
                })
              }
              className="admin-input"
              placeholder="Explore Products"
            />
            <small className="form-hint">
              The text displayed on the button. Keep it short, action-oriented,
              and clear (e.g., "Shop Now", "Learn More", "Get Started").
            </small>
          </div>
          <div className="form-group">
            <label className="admin-label">Button Link</label>
            <input
              type="text"
              value={formData.content.primaryButton?.link || ""}
              onChange={(e) =>
                handleContentChange("primaryButton", {
                  ...formData.content.primaryButton,
                  link: e.target.value,
                })
              }
              className="admin-input"
              placeholder="/products"
            />
            <small className="form-hint">
              The URL where the button will navigate when clicked. Use relative
              paths (e.g., "/products") for internal pages or full URLs (e.g.,
              "https://example.com") for external links.
            </small>
          </div>
        </div>

        {/* Primary Button Colors */}
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h5
            className="section-subtitle"
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              fontWeight: "600",
              color: "#475569",
            }}
          >
            Primary Button Colors
          </h5>
          <small
            className="form-hint"
            style={{ marginBottom: "16px", display: "block" }}
          >
            Customize the colors of your primary button to match your brand.
            Choose colors that provide good contrast and are accessible to all
            users.
          </small>
          <div className="form-row">
            <div className="form-group">
              <label className="admin-label">Button Background Color</label>
              <div className="form-row">
                <input
                  type="color"
                  value={
                    formData.styles?.primaryButtonBackgroundColor || "#008562"
                  }
                  onChange={(e) =>
                    handleStyleChange(
                      "primaryButtonBackgroundColor",
                      e.target.value
                    )
                  }
                  style={{ height: "40px", width: "100px", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={formData.styles?.primaryButtonBackgroundColor || ""}
                  onChange={(e) =>
                    handleStyleChange(
                      "primaryButtonBackgroundColor",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="#008562"
                  style={{ flex: 1, marginLeft: "10px" }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="admin-label">Button Text Color</label>
              <div className="form-row">
                <input
                  type="color"
                  value={formData.styles?.primaryButtonTextColor || "#FFFFFF"}
                  onChange={(e) =>
                    handleStyleChange("primaryButtonTextColor", e.target.value)
                  }
                  style={{ height: "40px", width: "100px", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={formData.styles?.primaryButtonTextColor || ""}
                  onChange={(e) =>
                    handleStyleChange("primaryButtonTextColor", e.target.value)
                  }
                  className="admin-input"
                  placeholder="#FFFFFF"
                  style={{ flex: 1, marginLeft: "10px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-subtitle">Secondary Button</h4>
        <small
          className="form-hint"
          style={{ marginBottom: "16px", display: "block" }}
        >
          An optional secondary call-to-action button with a different style.
          Use this for alternative actions (e.g., "Contact Us", "Learn More").
        </small>
        <div className="form-row">
          <div className="form-group">
            <label className="admin-label">Button Text</label>
            <input
              type="text"
              value={formData.content.secondaryButton?.text || ""}
              onChange={(e) =>
                handleContentChange("secondaryButton", {
                  ...formData.content.secondaryButton,
                  text: e.target.value,
                })
              }
              className="admin-input"
              placeholder="Get in contact"
            />
            <small className="form-hint">
              The text displayed on the secondary button. This button typically
              has a different visual style (outlined or lighter) compared to the
              primary button.
            </small>
          </div>
          <div className="form-group">
            <label className="admin-label">Button Link</label>
            <input
              type="text"
              value={formData.content.secondaryButton?.link || ""}
              onChange={(e) =>
                handleContentChange("secondaryButton", {
                  ...formData.content.secondaryButton,
                  link: e.target.value,
                })
              }
              className="admin-input"
              placeholder="/contact"
            />
            <small className="form-hint">
              The URL where the secondary button will navigate. Leave empty if
              you don't want a secondary button.
            </small>
          </div>
        </div>

        {/* Secondary Button Colors */}
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h5
            className="section-subtitle"
            style={{
              fontSize: "14px",
              marginBottom: "12px",
              fontWeight: "600",
              color: "#475569",
            }}
          >
            Secondary Button Colors
          </h5>
          <small
            className="form-hint"
            style={{ marginBottom: "16px", display: "block" }}
          >
            Customize the colors of your secondary button. Typically, this
            button has a lighter or outlined style to differentiate it from the
            primary button.
          </small>
          <div className="form-row">
            <div className="form-group">
              <label className="admin-label">Button Background Color</label>
              <div className="form-row">
                <input
                  type="color"
                  value={
                    formData.styles?.secondaryButtonBackgroundColor || "#FFFFFF"
                  }
                  onChange={(e) =>
                    handleStyleChange(
                      "secondaryButtonBackgroundColor",
                      e.target.value
                    )
                  }
                  style={{ height: "40px", width: "100px", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={formData.styles?.secondaryButtonBackgroundColor || ""}
                  onChange={(e) =>
                    handleStyleChange(
                      "secondaryButtonBackgroundColor",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="#FFFFFF"
                  style={{ flex: 1, marginLeft: "10px" }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="admin-label">Button Text Color</label>
              <div className="form-row">
                <input
                  type="color"
                  value={formData.styles?.secondaryButtonTextColor || "#000000"}
                  onChange={(e) =>
                    handleStyleChange(
                      "secondaryButtonTextColor",
                      e.target.value
                    )
                  }
                  style={{ height: "40px", width: "100px", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={formData.styles?.secondaryButtonTextColor || ""}
                  onChange={(e) =>
                    handleStyleChange(
                      "secondaryButtonTextColor",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="#000000"
                  style={{ flex: 1, marginLeft: "10px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderCommonStyling()}
    </>
  );

  const renderTextImageEditor = () => (
    <>
      {renderTagInput(
        formData.content.tag || "",
        (value) => handleContentChange("tag", value),
        "ABOUT US",
        'A small label or tag that appears above the main heading. Often used to categorize or introduce the section (e.g., "ABOUT US", "OUR STORY"). Select a star symbol from the dropdown and enter the tag text.'
      )}

      <div className="form-group">
        <InlineFontEditor
          value={formData.content.heading || ""}
          onChange={(value) => handleContentChange("heading", value)}
          placeholder="Main heading"
          label="Heading"
          helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
        />
        <small className="form-hint">
          The main heading for this section. This should be clear, descriptive,
          and capture the essence of the content below. You can format text using special tags for fonts, colors, sizes, weights, and styles.
        </small>
      </div>

      {/* Heading Font Styling */}
      {renderFontStyling(
        "heading",
        "Heading",
        formData.styles,
        handleStyleChange
      )}

      <div className="form-group">
        <InlineFontEditor
          value={formData.content.paragraph1 || ""}
          onChange={(value) => handleContentChange("paragraph1", value)}
          placeholder="First paragraph text"
          label="Paragraph 1"
          helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
        />
      </div>

      {/* Paragraph 1 Font Styling */}
      {renderFontStyling(
        "paragraph1",
        "Paragraph 1",
        formData.styles,
        handleStyleChange
      )}

      <div className="form-group">
        <InlineFontEditor
          value={formData.content.paragraph2 || ""}
          onChange={(value) => handleContentChange("paragraph2", value)}
          placeholder="Second paragraph text"
          label="Paragraph 2"
          helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
        />
      </div>

      {/* Paragraph 2 Font Styling */}
      {renderFontStyling(
        "paragraph2",
        "Paragraph 2",
        formData.styles,
        handleStyleChange
      )}

      {/* Button Section */}
      <div className="form-section">
        <h4 className="section-subtitle">Button Settings</h4>
        
        <div className="form-group">
          <label className="admin-label">Button Text</label>
          <input
            type="text"
            value={formData.content.button?.text || ""}
            onChange={(e) =>
              handleContentChange("button", {
                ...formData.content.button,
                text: e.target.value,
              })
            }
            className="admin-input"
            placeholder="Know More"
          />
          <small className="form-hint">
            The text displayed on the button (e.g., "Know More", "Learn More", "Read More").
          </small>
        </div>

        <div className="form-group">
          <label className="admin-label">Button Link</label>
          <input
            type="text"
            value={formData.content.button?.link || ""}
            onChange={(e) =>
              handleContentChange("button", {
                ...formData.content.button,
                link: e.target.value,
              })
            }
            className="admin-input"
            placeholder="/about"
          />
          <small className="form-hint">
            The URL or path the button links to (e.g., "/about" for About Us page, "/contact" for Contact page, or external URLs like "https://example.com").
          </small>
        </div>

        {/* Button Styling */}
        <div className="form-group">
          <label className="admin-label">Button Background Color</label>
          <div className="form-row">
            <input
              type="color"
              value={
                formData.styles?.buttonBackgroundColor || "#323790"
              }
              onChange={(e) =>
                handleStyleChange("buttonBackgroundColor", e.target.value)
              }
              style={{ height: "40px", width: "100px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={formData.styles?.buttonBackgroundColor || ""}
              onChange={(e) =>
                handleStyleChange("buttonBackgroundColor", e.target.value)
              }
              className="admin-input"
              placeholder="#323790"
              style={{ flex: 1, marginLeft: "10px" }}
            />
          </div>
          <small className="form-hint">
            Set the background color of the button using the color picker or enter a hex code.
          </small>
        </div>

        <div className="form-group">
          <label className="admin-label">Button Text Color</label>
          <div className="form-row">
            <input
              type="color"
              value={formData.styles?.buttonTextColor || "#FFFFFF"}
              onChange={(e) =>
                handleStyleChange("buttonTextColor", e.target.value)
              }
              style={{ height: "40px", width: "100px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={formData.styles?.buttonTextColor || ""}
              onChange={(e) =>
                handleStyleChange("buttonTextColor", e.target.value)
              }
              className="admin-input"
              placeholder="#FFFFFF"
              style={{ flex: 1, marginLeft: "10px" }}
            />
          </div>
          <small className="form-hint">
            Set the text color of the button. Ensure good contrast with the background color for readability.
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="admin-label">Button Font Size (px)</label>
            <input
              type="number"
              value={formData.styles?.buttonFontSize || ""}
              onChange={(e) =>
                handleStyleChange(
                  "buttonFontSize",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="admin-input"
              placeholder="16"
              min="10"
              max="24"
            />
          </div>

          <div className="form-group">
            <label className="admin-label">Button Font Weight</label>
            <select
              value={formData.styles?.buttonFontWeight || ""}
              onChange={(e) =>
                handleStyleChange("buttonFontWeight", e.target.value || null)
              }
              className="admin-select"
            >
              <option value="">Default</option>
              <option value="400">400 (Normal)</option>
              <option value="500">500 (Medium)</option>
              <option value="600">600 (Semi Bold)</option>
              <option value="700">700 (Bold)</option>
            </select>
          </div>
        </div>
      </div>

      {renderCommonStyling()}
    </>
  );

  const renderFeatureCardsEditor = () => {
    const cards = formData.content.cards || [];
    return (
      <>
        {renderTagInput(
          formData.content.tag || "",
          (value) => handleContentChange("tag", value),
          "WHY",
          "A small label displayed above the main heading to introduce or categorize this feature section. Select a star symbol from the dropdown and enter the tag text."
        )}

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.heading || ""}
            onChange={(value) => handleContentChange("heading", value)}
            placeholder="Why United Brothers Company?"
            label="Heading"
            helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
          <small className="form-hint">
            The main heading that introduces your feature cards section. This
            should clearly communicate what benefits or features you're
            highlighting. You can format text using special tags for fonts, colors, sizes, weights, and styles.
          </small>
        </div>

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.subtitle || ""}
            onChange={(value) => handleContentChange("subtitle", value)}
            placeholder="Subtitle text"
            label="Subtitle"
            helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Feature Cards</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("cards", {
                  icon: "",
                  title: "",
                  description: "",
                  link: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Card
            </button>
          </div>

          {cards.map((card, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Card {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("cards", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={card.icon || ""}
                  onChange={(url) =>
                    handleArrayItemChange("cards", index, "icon", url)
                  }
                  label="Icon"
                  isIcon={true}
                />
                <small className="form-hint">
                  Upload an icon image for this feature card. The icon will be
                  automatically displayed in a circular frame. Use simple,
                  recognizable icons that represent the feature.
                </small>
              </div>

              <div className="form-group">
                <label className="admin-label">Title</label>
                <input
                  type="text"
                  value={card.title || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "cards",
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="Card title"
                />
                <small className="form-hint">
                  A short, descriptive title for this feature card. Keep it
                  concise (3-5 words) to maintain visual balance.
                </small>
              </div>

              <div className="form-group">
                <InlineFontEditor
                  value={card.description || ""}
                  onChange={(value) =>
                    handleArrayItemChange("cards", index, "description", value)
                  }
                  placeholder="Card description"
                  label="Description"
                  helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
                />
              </div>

              <div className="form-group">
                <label className="admin-label">Link (optional)</label>
                <input
                  type="text"
                  value={card.link || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "cards",
                      index,
                      "link",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="/path"
                />
                <small className="form-hint">
                  Optional URL where clicking this card will navigate. Leave
                  empty if the card is not clickable. Use relative paths (e.g.,
                  "/products") for internal pages.
                </small>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderCarouselEditor = () => {
    const items = formData.content.items || [];
    return (
      <>
        {renderTagInput(
          formData.content.tag || "",
          (value) => handleContentChange("tag", value),
          "OUR BRANDS",
          'A small label displayed above the main heading to introduce the carousel section (e.g., "OUR BRANDS", "FEATURED PRODUCTS"). Select a star symbol from the dropdown and enter the tag text.'
        )}

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.heading || ""}
            onChange={(value) => handleContentChange("heading", value)}
            placeholder="Brands that Carry\nour Promise"
            label="Heading"
            helpText="Use \n for line breaks. Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
          <small className="form-hint">
            The main heading for the carousel section. Use \n to create line
            breaks for multi-line headings. This heading appears above the
            carousel items. You can format text using special tags for fonts, colors, sizes, weights, and styles.
          </small>
        </div>

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.description || ""}
            onChange={(value) => handleContentChange("description", value)}
            placeholder="Rooted in authenticity, our brands deliver\ntaste, tradition, and trust to millions"
            label="Description"
            helpText="Use \n for line breaks. Use inline formatting: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Carousel Items</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("items", {
                  image: "",
                  brandName: "",
                  title: "",
                  description: "",
                  link: "",
                  buttonColor: "#008562",
                  buttonText: "Learn more",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Carousel Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Carousel Item {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("items", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={item.image || ""}
                  onChange={(url) =>
                    handleArrayItemChange("items", index, "image", url)
                  }
                  label="Brand Image/Logo"
                />
                <small className="form-hint">
                  Upload the brand logo or image that will be displayed
                  prominently in this carousel item. This image represents the
                  brand being featured.
                </small>
              </div>

              <div className="form-group">
                <label className="admin-label">Brand Name</label>
                <input
                  type="text"
                  value={item.brandName || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "items",
                      index,
                      "brandName",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="9K=, SOIL KING, SUN DROP, etc."
                />
                <small className="form-hint">
                  The brand name that appears as a tag at the top of the
                  carousel card (e.g., "/ 9K="). This helps identify which brand
                  is being featured in this item.
                </small>
              </div>

              <div className="form-group">
                <label className="admin-label">Title</label>
                <textarea
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
                  rows="2"
                  placeholder="Our Legacy\nin Every Brand"
                />
                <small className="form-hint">
                  The main title for this carousel item. Use \n to create line
                  breaks for multi-line titles. This title appears prominently
                  on the carousel card.
                </small>
              </div>

              <div className="form-group">
                <InlineFontEditor
                  value={item.description || ""}
                  onChange={(value) =>
                    handleArrayItemChange("items", index, "description", value)
                  }
                  placeholder="With Soil King, we celebrate tradition and taste\n— delivering carefully crafted products that\nfamilies trust every day."
                  label="Description"
                  helpText="Use \n for line breaks. Use inline formatting: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Button Text</label>
                  <input
                    type="text"
                    value={item.buttonText || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "items",
                        index,
                        "buttonText",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Learn more"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Button Color</label>
                  <input
                    type="color"
                    value={item.buttonColor || "#008562"}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "items",
                        index,
                        "buttonColor",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    style={{ height: "40px" }}
                  />
                  <input
                    type="text"
                    value={item.buttonColor || "#008562"}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "items",
                        index,
                        "buttonColor",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="#008562"
                    style={{ marginTop: "8px" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="admin-label">Link (optional)</label>
                <input
                  type="text"
                  value={item.link || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "items",
                      index,
                      "link",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="/brands"
                />
              </div>
            </div>
          ))}
        </div>

        {renderCommonStyling()}
      </>
    );
  };

  const renderOverviewEditor = () => {
    return (
      <>
        {renderTagInput(
          formData.content.tag || "",
          (value) => handleContentChange("tag", value),
          "OVERVIEW",
          'A small label displayed above the main heading (e.g., "OVERVIEW", "ABOUT US"). Select a star symbol from the dropdown and enter the tag text.'
        )}

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.heading || ""}
            onChange={(value) => handleContentChange("heading", value)}
            placeholder="Where Tradition Meets Modern Taste"
            label="Heading"
            helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
          <small className="form-hint">
            The main heading for the overview section. This should summarize
            your company's mission, values, or unique selling proposition in a
            compelling way. You can format text using special tags for fonts, colors, sizes, weights, and styles.
          </small>
        </div>

        <div className="form-group">
          <ImageSelector
            value={formData.content.image || formData.content.logo || ""}
            onChange={(url) => {
              handleContentChange("image", url);
              handleContentChange("logo", url);
            }}
            label="Logo Image"
          />
          <small className="form-hint">
            Upload your company logo that will be displayed in the overview
            section. This helps reinforce your brand identity and creates visual
            consistency.
          </small>
        </div>

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.paragraph1 || ""}
            onChange={(value) => handleContentChange("paragraph1", value)}
            placeholder="At UBC, we believe food should be both&#10;authentic and effortless. Our products are&#10;sourced with care, processed with precision,&#10;and packed to preserve freshness."
            label="Paragraph 1"
            helpText="Use line breaks (Enter) for new lines. Use inline formatting: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
        </div>

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.paragraph2 || ""}
            onChange={(value) => handleContentChange("paragraph2", value)}
            placeholder="From aromatic Basmati rice to vibrant spices&#10;and ready mixes, Soil King is your trusted&#10;partner in creating meals that feel homemade,&#10;every single time."
            label="Paragraph 2"
            helpText="Use line breaks (Enter) for new lines. Use inline formatting: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
        </div>

        <div className="form-section">
          <h4 className="section-subtitle">Button</h4>
          <div className="form-row">
            <div className="form-group">
              <label className="admin-label">Button Text</label>
              <input
                type="text"
                value={formData.content.buttonText || ""}
                onChange={(e) =>
                  handleContentChange("buttonText", e.target.value)
                }
                className="admin-input"
                placeholder="Get in touch"
              />
            </div>
            <div className="form-group">
              <label className="admin-label">Button Link</label>
              <input
                type="text"
                value={
                  formData.content.buttonLink ||
                  formData.content.button?.link ||
                  ""
                }
                onChange={(e) => {
                  handleContentChange("buttonLink", e.target.value);
                  handleContentChange("button", {
                    ...formData.content.button,
                    link: e.target.value,
                  });
                }}
                className="admin-input"
                placeholder="/contact"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 className="section-subtitle">Background Image</h4>
          <div className="form-group">
            <ImageSelector
              value={formData.content.backgroundImage || ""}
              onChange={(url) => handleContentChange("backgroundImage", url)}
              label="Background Image"
            />
            <small className="form-hint">
              Upload a background image that will be displayed behind the
              overview content. This creates visual depth and enhances the
              section's appeal. Use high-quality images that complement your
              brand.
            </small>
          </div>
        </div>
      </>
    );
  };

  const renderTestimonialsEditor = () => {
    const testimonials = formData.content.testimonials || [];
    return (
      <>
        {renderTagInput(
          formData.content.tag || "",
          (value) => handleContentChange("tag", value),
          "TESTIMONIALS",
          'A small label displayed above the main heading (e.g., "TESTIMONIALS", "WHAT OUR CUSTOMERS SAY"). Select a star symbol from the dropdown and enter the tag text.'
        )}

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.heading || ""}
            onChange={(value) => handleContentChange("heading", value)}
            placeholder="Because Quality Speaks for Itself"
            label="Heading"
            helpText="Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
          <small className="form-hint">
            The main heading that introduces your testimonials section. This
            should capture the essence of customer satisfaction and build trust
            with visitors. You can format text using special tags for fonts, colors, sizes, weights, and styles.
          </small>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Testimonials</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("testimonials", {
                  name: "",
                  role: "",
                  company: "",
                  text: "",
                  image: "",
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Testimonial
            </button>
          </div>

          {testimonials.map((testimonial, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>
                  Testimonial {index + 1}{" "}
                  {index === 0 && (
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>
                      (First card - larger size)
                    </span>
                  )}
                </h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("testimonials", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-group">
                <ImageSelector
                  value={testimonial.image || ""}
                  onChange={(url) =>
                    handleArrayItemChange("testimonials", index, "image", url)
                  }
                  label="Profile Image"
                />
                <small className="form-hint">
                  Upload a profile photo of the person giving the testimonial.
                  This adds authenticity and helps visitors connect with the
                  testimonial. Use a professional headshot or clear photo of the
                  person.
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={testimonial.name || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "testimonials",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Anita Reddy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Role</label>
                  <input
                    type="text"
                    value={testimonial.role || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "testimonials",
                        index,
                        "role",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Chef"
                  />
                  <small className="form-hint">
                    e.g., Chef, Home Cook, etc.
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="admin-label">Company</label>
                <input
                  type="text"
                  value={testimonial.company || ""}
                  onChange={(e) =>
                    handleArrayItemChange(
                      "testimonials",
                      index,
                      "company",
                      e.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="Moove"
                />
                <small className="form-hint">
                  Company or organization name (optional)
                </small>
              </div>

              <div className="form-group">
                <InlineFontEditor
                  value={testimonial.text || ""}
                  onChange={(value) =>
                    handleArrayItemChange("testimonials", index, "text", value)
                  }
                  placeholder="The Basmati rice from Soil King has&lt;br/&gt;become a staple in my home. The aroma&lt;br/&gt;and texture are unmatched."
                  label="Testimonial Text *"
                  helpText="Use &lt;br/&gt; for line breaks. Use inline formatting: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
                />
              </div>
            </div>
          ))}

          {testimonials.length === 0 && (
            <div
              className="form-hint"
              style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}
            >
              No testimonials added yet. Click "+ Add Testimonial" to get
              started.
            </div>
          )}
        </div>
      </>
    );
  };

  const renderTellUsEditor = () => {
    const formFields = formData.content.formFields || [];

    return (
      <>
        {renderTagInput(
          formData.content.tag || "",
          (value) => handleContentChange("tag", value),
          "TELL US",
          "Tag text displayed above the main heading. Select a star symbol from the dropdown and enter the tag text."
        )}

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.heading || ""}
            onChange={(value) => handleContentChange("heading", value)}
            placeholder="Tell Us\nWhat You Need"
            label="Heading"
            helpText="Use \n for line breaks. Use inline formatting tags: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
          <small className="form-hint">Use \n for line breaks. You can format text using special tags for fonts, colors, sizes, weights, and styles.</small>
        </div>

        <div className="form-group">
          <InlineFontEditor
            value={formData.content.description || ""}
            onChange={(value) => handleContentChange("description", value)}
            placeholder="Whether it's bulk orders, private\nlabeling, or partnerships —\nwe're here to help."
            label="Description"
            helpText="Use \n for line breaks. Use inline formatting: [font:FontName]text[/font], [color:#ff0000]text[/color], [size:24px]text[/size], [weight:700]text[/weight], [style:italic]text[/style]"
          />
        </div>

        <div className="form-group">
          <label className="admin-label">Submit Button Text</label>
          <input
            type="text"
            value={formData.content.submitButtonText || ""}
            onChange={(e) =>
              handleContentChange("submitButtonText", e.target.value)
            }
            className="admin-input"
            placeholder="Submit Form"
          />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h4 className="section-subtitle">Form Fields</h4>
            <button
              type="button"
              onClick={() =>
                handleAddArrayItem("formFields", {
                  name: "",
                  label: "",
                  type: "text",
                  placeholder: "",
                  required: true,
                })
              }
              className="admin-btn admin-btn-secondary"
            >
              + Add Field
            </button>
          </div>

          {formFields.map((field, index) => (
            <div key={index} className="array-item-editor">
              <div className="array-item-header">
                <h5>Field {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteArrayItem("formFields", index)}
                  className="admin-btn admin-btn-danger"
                >
                  Delete
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">
                    Field Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={field.name || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="firstName"
                    required
                  />
                  <small className="form-hint">
                    Unique identifier (e.g., firstName, email)
                  </small>
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Label <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={field.label || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="First Name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">
                    Field Type <span className="required">*</span>
                  </label>
                  <select
                    value={field.type || "text"}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "type",
                        e.target.value
                      )
                    }
                    className="admin-select"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="admin-label">Placeholder</label>
                  <input
                    type="text"
                    value={field.placeholder || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "placeholder",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="Enter text..."
                  />
                </div>
              </div>

              {field.type === "select" && (
                <div className="form-group options-container">
                  <label className="admin-label">
                    Options (one per line) <span className="required">*</span>
                  </label>
                  <div className="options-container-wrapper">
                    <textarea
                      value={field.optionsRawText !== undefined ? field.optionsRawText : (field.options?.join("\n") || "")}
                      onChange={(e) => {
                        const rawText = e.target.value;
                        // Store raw text for editing
                        handleArrayItemChange(
                          "formFields",
                          index,
                          "optionsRawText",
                          rawText
                        );
                        // Process options (filter empty lines) for storage
                        const options = rawText
                          .split("\n")
                          .map((opt) => opt.trim())
                          .filter(Boolean);
                        handleArrayItemChange(
                          "formFields",
                          index,
                          "options",
                          options
                        );
                      }}
                      onKeyDown={(e) => {
                        // Allow Enter key to work normally
                        if (e.key === "Enter") {
                          // Let the default behavior happen
                          return;
                        }
                      }}
                      className="admin-input options-textarea"
                      rows="10"
                      placeholder="Traders and Distributors
Partnership
General Enquiry
Add as many options as you need..."
                    />
                    {(field.options || []).length > 0 && (
                      <div className="options-preview">
                        <div className="options-preview-header">
                          <span className="options-preview-icon">👁️</span>
                          <span className="options-preview-title">Preview ({field.options.length} option{field.options.length !== 1 ? 's' : ''})</span>
                        </div>
                        <div className="options-preview-list">
                          {field.options.map((opt, optIndex) => (
                            <div key={optIndex} className="options-preview-item">
                              <span className="options-preview-number">{optIndex + 1}</span>
                              <span className="options-preview-text">{opt || '(empty)'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <small className="form-hint">
                    <strong>Instructions:</strong> Enter each dropdown option on a separate line. 
                    Each line will become a selectable option in the dropdown menu. 
                    Empty lines will be ignored. <strong>There is no limit</strong> - you can add as many options as needed. 
                    The textarea is resizable (drag the bottom-right corner) and scrollable. 
                    The preview above shows how your options will appear.
                  </small>
                </div>
              )}

              {field.type === "select" && (
                <div className="form-group">
                  <label className="admin-label">Default Value</label>
                  <input
                    type="text"
                    value={field.defaultValue || ""}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "defaultValue",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="First option"
                  />
                  <small className="form-hint">Default selected option</small>
                </div>
              )}

              {field.type === "textarea" && (
                <div className="form-group">
                  <label className="admin-label">Rows</label>
                  <input
                    type="number"
                    value={field.rows || 5}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "rows",
                        parseInt(e.target.value) || 5
                      )
                    }
                    className="admin-input"
                    placeholder="5"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="admin-label">
                  <input
                    type="checkbox"
                    checked={field.required !== false}
                    onChange={(e) =>
                      handleArrayItemChange(
                        "formFields",
                        index,
                        "required",
                        e.target.checked
                      )
                    }
                    className="admin-checkbox"
                  />
                  <span>Required field</span>
                </label>
              </div>
            </div>
          ))}

          {formFields.length === 0 && (
            <div
              className="form-hint"
              style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}
            >
              No form fields added yet. Click "+ Add Field" to get started.
            </div>
          )}
        </div>

        <div className="form-section">
          <h5
            className="section-subtitle"
            style={{ fontSize: "14px", marginTop: "20px" }}
          >
            Submit Button Colors
          </h5>

          <div className="form-group">
            <label className="admin-label">Button Background Color</label>
            <div className="form-row">
              <input
                type="color"
                value={formData.styles?.buttonBackgroundColor || "#323790"}
                onChange={(e) =>
                  handleStyleChange("buttonBackgroundColor", e.target.value)
                }
                className="admin-input"
                style={{ height: "40px", width: "100px" }}
              />
              <input
                type="text"
                value={formData.styles?.buttonBackgroundColor || "#323790"}
                onChange={(e) =>
                  handleStyleChange("buttonBackgroundColor", e.target.value)
                }
                className="admin-input"
                placeholder="#323790"
                style={{ flex: 1, marginLeft: "10px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="admin-label">Button Text Color</label>
            <div className="form-row">
              <input
                type="color"
                value={formData.styles?.buttonTextColor || "#FFFFFF"}
                onChange={(e) =>
                  handleStyleChange("buttonTextColor", e.target.value)
                }
                className="admin-input"
                style={{ height: "40px", width: "100px" }}
              />
              <input
                type="text"
                value={formData.styles?.buttonTextColor || "#FFFFFF"}
                onChange={(e) =>
                  handleStyleChange("buttonTextColor", e.target.value)
                }
                className="admin-input"
                placeholder="#FFFFFF"
                style={{ flex: 1, marginLeft: "10px" }}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTypeSpecificEditor = () => {
    switch (formData.type) {
      case "hero":
        return renderHeroEditor();
      case "text-image":
        return renderTextImageEditor();
      case "feature-cards":
        return renderFeatureCardsEditor();
      case "carousel":
        return renderCarouselEditor();
      case "overview":
        return renderOverviewEditor();
      case "testimonials":
        return renderTestimonialsEditor();
      case "tell-us":
        return renderTellUsEditor();
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
    <div className="home-section-editor admin-card">
      <div className="editor-header">
        <h2 className="admin-heading-2">
          {section ? "Edit Home Section" : "Add New Home Section"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-section">
          <div className="section-header-with-actions">
            <h5 className="section-title">Basic Information</h5>
            <div className="section-actions">
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
          </div>

          <div className="form-group">
            <label className="admin-label">
              Section Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`admin-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g., Hero Section, About Us"
              required
            />
            <small className="form-hint">
              A descriptive name to identify this section in the management
              dashboard. This name is not displayed on the website.
            </small>
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="admin-label">
                Section Type <span className="required">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="admin-select"
                required
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                {SECTION_TYPES.find((t) => t.value === formData.type)
                  ?.description ||
                  "Select the type of section you want to create"}
              </small>
            </div>

            <div className="form-group">
              <label className="admin-label">
                Order <span className="required">*</span>
              </label>
              <small className="form-hint">
                Controls the display order of sections on your homepage.
                Sections with lower numbers appear first. Use increments of 10
                (0, 10, 20, 30...) to easily reorder sections later.
              </small>
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
                    Only the first <strong>10 home sections</strong> are displayed in the
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
              When enabled, this section will be visible on your homepage.
              Uncheck to hide it without deleting the content.
            </small>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header-with-actions">
            <h3 className="section-title">Content</h3>
            <div className="section-actions">
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
          </div>
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
}
