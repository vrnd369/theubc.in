import React, { useState, useEffect } from "react";
import { usePermissions } from "../../auth/usePermissions";
import { ROLE } from "../../auth/roleConfig";

/**
 * Shared font list for all admin dashboard sections
 * Export this so other components can use the same font list
 */
export const commonFonts = [
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

/**
 * Utility functions to manage custom fonts in localStorage
 */
const CUSTOM_FONTS_KEY = "admin_custom_fonts";

export const getCustomFonts = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_FONTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading custom fonts:", error);
    return [];
  }
};

export const saveCustomFont = (font) => {
  try {
    const customFonts = getCustomFonts();
    // Check if font already exists
    if (!customFonts.find((f) => f.value === font.value)) {
      customFonts.push(font);
      localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(customFonts));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving custom font:", error);
    return false;
  }
};

export const removeCustomFont = (fontValue) => {
  try {
    const customFonts = getCustomFonts();
    const filtered = customFonts.filter((f) => f.value !== fontValue);
    localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing custom font:", error);
    return false;
  }
};

/**
 * Get all fonts (common + custom)
 */
export const getAllFonts = () => {
  const customFonts = getCustomFonts();
  return [...commonFonts, ...customFonts];
};

/**
 * Reusable React component to render comprehensive font styling controls
 */
export const FontStyling = ({ prefix, label, styles, handleStyleChange }) => {
  const { role } = usePermissions();
  const isSuperAdmin = role === ROLE.SUPER_ADMIN;
  const [showAddFont, setShowAddFont] = useState(false);
  const [customFontName, setCustomFontName] = useState("");
  const [customFontValue, setCustomFontValue] = useState("");
  const [allFonts, setAllFonts] = useState(getAllFonts());
  const [showCustomWeight, setShowCustomWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState("");

  // Refresh fonts when component mounts or when custom fonts change
  useEffect(() => {
    setAllFonts(getAllFonts());
  }, [showAddFont]);

  // Check if current weight is custom and show input if needed
  useEffect(() => {
    const currentWeight = styles?.[`${prefix}FontWeight`];
    if (currentWeight && !["100", "200", "300", "400", "500", "600", "700", "800", "900"].includes(String(currentWeight))) {
      setShowCustomWeight(true);
      setCustomWeight(String(currentWeight));
    }
  }, [styles, prefix]);

  const handleAddCustomFont = () => {
    if (!customFontName.trim() || !customFontValue.trim()) {
      alert("Please enter both font name and font value");
      return;
    }

    const newFont = {
      value: customFontValue.trim(),
      label: customFontName.trim(),
      isCustom: true,
    };

    if (saveCustomFont(newFont)) {
      setAllFonts(getAllFonts());
      setCustomFontName("");
      setCustomFontValue("");
      setShowAddFont(false);
      alert(`Font "${customFontName}" added successfully!`);
    } else {
      alert("This font already exists in the list");
    }
  };

  const handleRemoveCustomFont = (fontValue) => {
    if (window.confirm("Are you sure you want to remove this custom font?")) {
      removeCustomFont(fontValue);
      setAllFonts(getAllFonts());
      // If the removed font was selected, reset to default
      if (styles?.[`${prefix}FontFamily`] === fontValue) {
        handleStyleChange(`${prefix}FontFamily`, "");
      }
    }
  };

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        background: "#ffffff",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h6
        style={{
          fontSize: "13px",
          marginBottom: "12px",
          fontWeight: "600",
          color: "#475569",
        }}
      >
        {label} Font Styling
      </h6>

      {/* Font Family */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <label className="admin-label">Font Family</label>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setShowAddFont(!showAddFont)}
              className="admin-btn admin-btn-secondary"
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                height: "auto",
              }}
            >
              {showAddFont ? "✕ Cancel" : "+ Add Custom Font"}
            </button>
          )}
        </div>

        {showAddFont && isSuperAdmin && (
          <div
            style={{
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              marginBottom: "12px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#475569",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Font Display Name:
              </label>
              <input
                type="text"
                value={customFontName}
                onChange={(e) => setCustomFontName(e.target.value)}
                className="admin-input"
                placeholder="e.g., Nunito, Oswald, Custom Font"
                style={{ fontSize: "12px", padding: "6px 8px" }}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#475569",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Font CSS Value:
              </label>
              <input
                type="text"
                value={customFontValue}
                onChange={(e) => setCustomFontValue(e.target.value)}
                className="admin-input"
                placeholder="e.g., 'Nunito', sans-serif or 'Oswald', Arial, sans-serif"
                style={{ fontSize: "12px", padding: "6px 8px" }}
              />
              <small
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#64748b",
                  fontSize: "11px",
                }}
              >
                Format: Use quotes for font names with spaces. Include
                fallbacks: "'Font Name', fallback1, fallback2, sans-serif"
              </small>
            </div>
            <button
              type="button"
              onClick={handleAddCustomFont}
              className="admin-btn admin-btn-primary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Add Font
            </button>
          </div>
        )}

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
          {isSuperAdmin && allFonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label} {font.isCustom ? "⭐" : ""}
            </option>
          ))}
          {!isSuperAdmin && (
            <option value="Inter, ui-sans-serif, system-ui, -apple-system, sans-serif">
              Inter (Default)
            </option>
          )}
        </select>

        {!isSuperAdmin && (
          <small
            style={{
              display: "block",
              marginTop: "4px",
              color: "#64748b",
              fontSize: "11px",
              fontStyle: "italic",
            }}
          >
            Font selection is restricted to Super Admin. Using default font.
          </small>
        )}

        {/* Show custom fonts with remove option - only for Super Admin */}
        {isSuperAdmin && allFonts
          .filter((font) => font.isCustom)
          .map((font) => (
            <div
              key={font.value}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "6px",
                padding: "6px 8px",
                background: "#f1f5f9",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            >
              <span style={{ color: "#475569" }}>⭐ {font.label} (Custom)</span>
              <button
                type="button"
                onClick={() => handleRemoveCustomFont(font.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "2px 6px",
                }}
                title="Remove custom font"
              >
                ✕ Remove
              </button>
            </div>
          ))}
      </div>

      {/* Font Color */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label className="admin-label">Font Color</label>
        <div className="form-row">
          <input
            type="color"
            value={styles?.[`${prefix}Color`] || "#111827"}
            onChange={(e) =>
              handleStyleChange(`${prefix}Color`, e.target.value)
            }
            style={{ height: "40px", width: "80px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={styles?.[`${prefix}Color`] || ""}
            onChange={(e) =>
              handleStyleChange(`${prefix}Color`, e.target.value)
            }
            className="admin-input"
            placeholder="#111827"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: "12px" }}>
        {/* Font Size */}
        <div className="form-group">
          <label className="admin-label">Font Size (px)</label>
          <input
            type="number"
            value={styles?.[`${prefix}FontSize`] || ""}
            onChange={(e) =>
              handleStyleChange(
                `${prefix}FontSize`,
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="Auto"
          />
        </div>

        {/* Font Weight */}
        <div className="form-group">
          <label className="admin-label">Font Weight</label>
          <select
            value={
              showCustomWeight || (styles?.[`${prefix}FontWeight`] && 
              !["100", "200", "300", "400", "500", "600", "700", "800", "900"].includes(styles[`${prefix}FontWeight`]))
                ? "custom"
                : (styles?.[`${prefix}FontWeight`] || "")
            }
            onChange={(e) => {
              if (e.target.value === "custom") {
                setShowCustomWeight(true);
                setCustomWeight(styles?.[`${prefix}FontWeight`] || "");
              } else {
                setShowCustomWeight(false);
                handleStyleChange(`${prefix}FontWeight`, e.target.value || null);
              }
            }}
            className="admin-select"
          >
            <option value="">Default</option>
            <option value="100">100 (Thin)</option>
            <option value="200">200 (Extra Light)</option>
            <option value="300">300 (Light)</option>
            <option value="400">400 (Normal)</option>
            <option value="500">500 (Medium)</option>
            <option value="600">600 (Semi Bold)</option>
            <option value="700">700 (Bold)</option>
            <option value="800">800 (Extra Bold)</option>
            <option value="900">900 (Black)</option>
            <option value="custom">Custom</option>
          </select>
          {showCustomWeight && (
            <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                type="number"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                onBlur={() => {
                  if (customWeight) {
                    handleStyleChange(`${prefix}FontWeight`, customWeight);
                  }
                }}
                placeholder="Enter custom weight (1-1000)"
                min="1"
                max="1000"
                className="admin-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customWeight) {
                    handleStyleChange(`${prefix}FontWeight`, customWeight);
                    setShowCustomWeight(false);
                  }
                }}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: "12px", padding: "6px 12px", whiteSpace: "nowrap" }}
              >
                Apply
              </button>
            </div>
          )}
          {showCustomWeight && (
            <small style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "4px" }}>
              Enter a custom font weight value between 1 and 1000
            </small>
          )}
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: "12px" }}>
        {/* Font Style */}
        <div className="form-group">
          <label className="admin-label">Font Style</label>
          <select
            value={styles?.[`${prefix}FontStyle`] || ""}
            onChange={(e) =>
              handleStyleChange(`${prefix}FontStyle`, e.target.value || null)
            }
            className="admin-select"
          >
            <option value="">Normal</option>
            <option value="italic">Italic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>

        {/* Text Transform */}
        <div className="form-group">
          <label className="admin-label">Text Transform</label>
          <select
            value={styles?.[`${prefix}TextTransform`] || ""}
            onChange={(e) =>
              handleStyleChange(
                `${prefix}TextTransform`,
                e.target.value || null
              )
            }
            className="admin-select"
          >
            <option value="">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: "12px" }}>
        {/* Line Height */}
        <div className="form-group">
          <label className="admin-label">Line Height</label>
          <input
            type="number"
            step="0.1"
            value={styles?.[`${prefix}LineHeight`] || ""}
            onChange={(e) =>
              handleStyleChange(
                `${prefix}LineHeight`,
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="1.5"
          />
        </div>

        {/* Letter Spacing */}
        <div className="form-group">
          <label className="admin-label">Letter Spacing (em)</label>
          <input
            type="number"
            step="0.01"
            value={styles?.[`${prefix}LetterSpacing`] || ""}
            onChange={(e) =>
              handleStyleChange(
                `${prefix}LetterSpacing`,
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            className="admin-input"
            placeholder="-0.02"
          />
        </div>
      </div>

      {/* Text Decoration */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label className="admin-label">Text Decoration</label>
        <select
          value={styles?.[`${prefix}TextDecoration`] || ""}
          onChange={(e) =>
            handleStyleChange(`${prefix}TextDecoration`, e.target.value || null)
          }
          className="admin-select"
        >
          <option value="">None</option>
          <option value="underline">Underline</option>
          <option value="overline">Overline</option>
          <option value="line-through">Line Through</option>
        </select>
      </div>

      {/* Text Shadow */}
      <div className="form-group">
        <label className="admin-label">Text Shadow</label>
        <input
          type="text"
          value={styles?.[`${prefix}TextShadow`] || ""}
          onChange={(e) =>
            handleStyleChange(`${prefix}TextShadow`, e.target.value)
          }
          className="admin-input"
          placeholder="0 2px 4px rgba(0,0,0,0.1)"
        />
        <small
          style={{
            display: "block",
            marginTop: "4px",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          Format: offsetX offsetY blurRadius color
        </small>
      </div>
    </div>
  );
};

/**
 * Wrapper function for backward compatibility
 * Use <FontStyling /> component directly for better performance
 */
export const renderFontStyling = (prefix, label, styles, handleStyleChange) => {
  return (
    <FontStyling
      prefix={prefix}
      label={label}
      styles={styles}
      handleStyleChange={handleStyleChange}
    />
  );
};
