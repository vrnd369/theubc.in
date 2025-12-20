import React, { useState, useRef, useEffect } from "react";
import {
  getAllFonts,
  saveCustomFont,
  removeCustomFont,
} from "./renderFontStyling";
import { usePermissions } from "../../auth/usePermissions";
import { ROLE } from "../../auth/roleConfig";

/**
 * Inline Font Editor Component
 * Allows users to apply font styling to specific words or lines within text
 * Uses simple markup: [font:FontName]text[/font] or [color:#ff0000]text[/color]
 * For admin and sub_admin: font formatting controls are disabled (only Super Admin can change fonts)
 */
export default function InlineFontEditor({
  value,
  onChange,
  placeholder,
  label,
  helpText,
}) {
  const { role } = usePermissions();
  const isSuperAdmin = role === ROLE.SUPER_ADMIN;
  const canChangeFont = isSuperAdmin; // Only Super Admin can change fonts
  const [showFormatting, setShowFormatting] = useState(false);
  const [showAddFont, setShowAddFont] = useState(false);
  const [customFontName, setCustomFontName] = useState("");
  const [customFontValue, setCustomFontValue] = useState("");
  const [allFonts, setAllFonts] = useState(getAllFonts());
  const [customWeight, setCustomWeight] = useState("");
  const [showCustomWeight, setShowCustomWeight] = useState(false);
  const textareaRef = useRef(null);

  // Refresh fonts when custom fonts change
  useEffect(() => {
    setAllFonts(getAllFonts());
  }, [showAddFont]);

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

  /**
   * Remove existing formatting tags of a specific type from text
   * Handles nested tags, case variations, and partial selections
   */
  const removeExistingTags = (text, tagType) => {
    if (!text) return text;

    // Pattern to match opening and closing tags of the same type (case-insensitive)
    // e.g., [font:name]...[/font] or [Font:name]...[/Font] or [color:#hex]...[/color]
    // Use dotAll flag (s) to match newlines, and handle nested tags
    const tagPattern = new RegExp(
      `\\[${tagType}:[^\\]]+\\]([\\s\\S]*?)\\[\\/${tagType}\\]`,
      "gi"
    );

    let cleanedText = text;
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    // Keep removing tags until no more are found (handles nested tags)
    while (hasChanges && iterations < maxIterations) {
      const before = cleanedText;
      cleanedText = cleanedText.replace(tagPattern, (match, content) => {
        // Replace the full tag with just its content
        return content;
      });
      hasChanges = before !== cleanedText;
      iterations++;
    }

    return cleanedText;
  };

  const insertFormatting = (tag, closingTag, tagType = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // If applying a font tag and selected text already has font tags, remove them first
    if (tagType === "font" && selectedText) {
      selectedText = removeExistingTags(selectedText, "font");
    }
    // Same for other tag types to prevent nesting
    else if (tagType && selectedText) {
      selectedText = removeExistingTags(selectedText, tagType);
    }

    let newText;
    if (selectedText) {
      // Wrap selected text (now cleaned of existing tags)
      newText = beforeText + tag + selectedText + closingTag + afterText;
    } else {
      // Insert tags at cursor
      newText = beforeText + tag + closingTag + afterText;
    }

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText
        ? start + tag.length + selectedText.length + closingTag.length
        : start + tag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertFontTag = (fontValue) => {
    // Extract font name from CSS value (e.g., "'Nunito', sans-serif" -> "Nunito")
    // Or use the value as-is if it's a simple name
    let fontName = fontValue;
    const match = fontValue.match(/['"]([^'"]+)['"]/);
    if (match) {
      fontName = match[1];
    } else {
      // If no quotes, take the first part before comma
      fontName = fontValue.split(",")[0].trim();
    }
    insertFormatting(`[font:${fontName}]`, "[/font]", "font");
    setShowFormatting(false);
  };

  const insertColorTag = (color) => {
    insertFormatting(`[color:${color}]`, "[/color]", "color");
    setShowFormatting(false);
  };

  const insertSizeTag = (size) => {
    insertFormatting(`[size:${size}px]`, "[/size]", "size");
    setShowFormatting(false);
  };

  const insertWeightTag = (weight) => {
    insertFormatting(`[weight:${weight}]`, "[/weight]", "weight");
    setShowFormatting(false);
  };

  const insertStyleTag = (style) => {
    insertFormatting(`[style:${style}]`, "[/style]", "style");
    setShowFormatting(false);
  };

  return (
    <div className="inline-font-editor" style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <label className="admin-label" style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
          {label}
        </label>
        {canChangeFont && (
        <button
          type="button"
          onClick={() => setShowFormatting(!showFormatting)}
          className="admin-btn admin-btn-secondary"
          style={{
            fontSize: "13px",
            padding: "6px 16px",
            fontWeight: "500",
            background: showFormatting ? "#3b82f6" : "#f1f5f9",
            color: showFormatting ? "#ffffff" : "#475569",
            border: "1px solid",
            borderColor: showFormatting ? "#3b82f6" : "#e2e8f0",
            borderRadius: "6px",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
        >
          {showFormatting ? "▼ Hide Formatting" : "▲ Show Formatting"}
        </button>
        )}
      </div>

      {showFormatting && canChangeFont && (
        <div
          style={{
            marginBottom: "16px",
            padding: "20px",
            background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
            borderRadius: "8px",
            border: "2px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header with clear instructions */}
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background: "#eff6ff",
              borderRadius: "6px",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#1e40af",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>💡</span>
              <span>How to Use Formatting</span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#1e3a8a",
                lineHeight: "1.6",
              }}
            >
              <strong>Method 1:</strong> Select text in the field below, then click a formatting option above.
              <br />
              <strong>Method 2:</strong> Type tags manually: <code style={{ background: "#dbeafe", padding: "2px 6px", borderRadius: "3px", fontSize: "11px" }}>[color:#ff0000]text[/color]</code>
            </div>
          </div>

          {/* Formatting Controls Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {/* Font Family */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                  🎨 Font Family
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddFont(!showAddFont)}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: showAddFont ? "#ef4444" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!showAddFont) e.target.style.background = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    if (!showAddFont) e.target.style.background = "#3b82f6";
                  }}
                >
                  {showAddFont ? "✕ Cancel" : "+ Add Font"}
                </button>
              </div>

              {showAddFont && canChangeFont && (
                <div
                  style={{
                    padding: "12px",
                    background: "#ffffff",
                    borderRadius: "6px",
                    border: "2px solid #3b82f6",
                    marginBottom: "8px",
                    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>
                      Font Display Name:
                    </label>
                    <input
                      type="text"
                      value={customFontName}
                      onChange={(e) => setCustomFontName(e.target.value)}
                      placeholder="e.g., Nunito, Custom Font"
                      className="admin-input"
                      style={{
                        fontSize: "12px",
                        padding: "6px 10px",
                        width: "100%",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>
                      Font CSS Value:
                    </label>
                    <input
                      type="text"
                      value={customFontValue}
                      onChange={(e) => setCustomFontValue(e.target.value)}
                      placeholder="'Nunito', sans-serif"
                      className="admin-input"
                      style={{
                        fontSize: "12px",
                        padding: "6px 10px",
                        width: "100%",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                      }}
                    />
                    <small style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "4px" }}>
                      Format: 'Font Name', fallback, sans-serif
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomFont}
                    className="admin-btn admin-btn-primary"
                    style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      width: "100%",
                      fontWeight: "500",
                    }}
                  >
                    ✓ Add Font
                  </button>
                </div>
              )}

              <select
                onChange={(e) =>
                  e.target.value && insertFontTag(e.target.value)
                }
                className="admin-select"
                disabled={!canChangeFont}
                style={{
                  fontSize: "13px",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  background: "#ffffff",
                  cursor: canChangeFont ? "pointer" : "not-allowed",
                  fontWeight: "500",
                  opacity: canChangeFont ? 1 : 0.6,
                }}
                defaultValue=""
              >
                <option value="">Select Font</option>
                {canChangeFont && allFonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label} {font.isCustom ? "⭐" : ""}
                  </option>
                ))}
                {!canChangeFont && (
                  <option value="Inter, ui-sans-serif, system-ui, -apple-system, sans-serif">
                    Inter (Default)
                  </option>
                )}
              </select>

              {/* Show custom fonts with remove option */}
              {allFonts.filter((font) => font.isCustom).length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>
                    Custom Fonts:
                  </div>
                  {allFonts
                    .filter((font) => font.isCustom)
                    .map((font) => (
                      <div
                        key={font.value}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "4px",
                          padding: "6px 10px",
                          background: "#f8fafc",
                          borderRadius: "5px",
                          border: "1px solid #e2e8f0",
                          fontSize: "11px",
                        }}
                      >
                        <span style={{ color: "#475569", fontWeight: "500" }}>
                          ⭐ {font.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove "${font.label}"?`)) {
                              removeCustomFont(font.value);
                              setAllFonts(getAllFonts());
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "12px",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "transparent";
                          }}
                          title="Remove custom font"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Color */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                🎨 Color
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="color"
                  onChange={(e) => insertColorTag(e.target.value)}
                  style={{
                    height: "40px",
                    width: "60px",
                    cursor: "pointer",
                    border: "2px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "2px",
                    background: "#ffffff",
                  }}
                  title="Click to pick a color"
                />
                <input
                  type="text"
                  placeholder="#ff0000"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.target.value) {
                      insertColorTag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="admin-input"
                  style={{
                    fontSize: "13px",
                    padding: "8px 12px",
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                  }}
                />
              </div>
              <small style={{ fontSize: "10px", color: "#64748b" }}>
                Enter hex code or pick from color picker
              </small>
            </div>

            {/* Size */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                📏 Size (px)
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="number"
                  id={`size-input-${label}`}
                  placeholder="24"
                  min="1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.target.value) {
                      insertSizeTag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="admin-input"
                  style={{
                    fontSize: "13px",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(`size-input-${label}`);
                    if (input && input.value) {
                      insertSizeTag(input.value);
                      input.value = "";
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                  }}
                  title="Apply size to selected text"
                >
                  Apply
                </button>
              </div>
              <small style={{ fontSize: "10px", color: "#64748b" }}>
                Enter size in pixels (e.g., 24) and click Apply or press Enter
              </small>
            </div>

            {/* Weight */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                ⚖️ Weight
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setShowCustomWeight(true);
                  } else if (e.target.value) {
                    setShowCustomWeight(false);
                    insertWeightTag(e.target.value);
                  }
                }}
                className="admin-select"
                style={{
                  fontSize: "13px",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                defaultValue=""
              >
                <option value="">Select Weight</option>
                <option value="400">400 - Normal</option>
                <option value="600">600 - Semi Bold</option>
                <option value="700">700 - Bold</option>
                <option value="custom">Custom</option>
              </select>
              {showCustomWeight && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="number"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    placeholder="e.g., 350, 450, 550"
                    min="1"
                    max="1000"
                    className="admin-input"
                    style={{
                      fontSize: "13px",
                      padding: "8px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      flex: 1,
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && customWeight) {
                        insertWeightTag(customWeight);
                        setCustomWeight("");
                        setShowCustomWeight(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customWeight) {
                        insertWeightTag(customWeight);
                        setCustomWeight("");
                        setShowCustomWeight(false);
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                    }}
                    title="Apply custom weight to selected text"
                  >
                    Apply
                  </button>
                </div>
              )}
              <small style={{ fontSize: "10px", color: "#64748b" }}>
                Choose font thickness or enter custom value (1-1000)
              </small>
            </div>

            {/* Style */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                ✏️ Style
              </label>
              <select
                onChange={(e) =>
                  e.target.value && insertStyleTag(e.target.value)
                }
                className="admin-select"
                style={{
                  fontSize: "13px",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                defaultValue=""
              >
                <option value="">Select Style</option>
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>
              <small style={{ fontSize: "10px", color: "#64748b" }}>
                Choose text style
              </small>
            </div>
          </div>

          {/* Examples and Usage Guide */}
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "#fef3c7",
              borderRadius: "6px",
              border: "1px solid #fde68a",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#92400e",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📚</span>
              <span>Formatting Examples</span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#78350f",
                lineHeight: "1.8",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong>Basic Formatting:</strong>
                <div style={{ marginTop: "4px", fontFamily: "monospace", fontSize: "11px", background: "#ffffff", padding: "6px", borderRadius: "4px", border: "1px solid #fde68a" }}>
                  <div>[color:#ff0000]Red Text[/color]</div>
                  <div>[weight:700]Bold Text[/weight]</div>
                  <div>[style:italic]Italic Text[/style]</div>
                  <div>[size:24px]Large Text[/size]</div>
                </div>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Combined Formatting:</strong>
                <div style={{ marginTop: "4px", fontFamily: "monospace", fontSize: "11px", background: "#ffffff", padding: "6px", borderRadius: "4px", border: "1px solid #fde68a" }}>
                  <div>[color:#3b82f6][weight:600]Blue Bold Text[/weight][/color]</div>
                  <div>[style:italic][size:20px]Italic Large[/size][/style]</div>
                </div>
              </div>
              <div>
                <strong>Font Family:</strong>
                <div style={{ marginTop: "4px", fontFamily: "monospace", fontSize: "11px", background: "#ffffff", padding: "6px", borderRadius: "4px", border: "1px solid #fde68a" }}>
                  <div>[font:Playfair Display]Elegant Text[/font]</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              background: "#ecfdf5",
              borderRadius: "6px",
              border: "1px solid #a7f3d0",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#065f46",
                lineHeight: "1.6",
              }}
            >
              <strong>💡 Quick Tips:</strong>
              <ul style={{ margin: "6px 0 0 20px", padding: 0 }}>
                <li>Select text first, then click a formatting option</li>
                <li>Tags can be nested: <code style={{ background: "#d1fae5", padding: "1px 4px", borderRadius: "3px", fontSize: "10px" }}>[color:#ff0000][weight:700]text[/weight][/color]</code></li>
                <li>Always close tags in reverse order of opening</li>
                <li>You can type tags manually or use the controls above</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Text Input Area */}
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          placeholder={placeholder}
          rows={label?.toLowerCase().includes("title") ? 3 : 4}
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            padding: "12px",
            border: "2px solid #cbd5e1",
            borderRadius: "6px",
            width: "100%",
            resize: "vertical",
            lineHeight: "1.6",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#cbd5e1";
            e.target.style.boxShadow = "none";
          }}
        />
        {showFormatting && canChangeFont && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              fontSize: "10px",
              color: "#64748b",
              background: "#f8fafc",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
            }}
          >
            Formatting Active
          </div>
        )}
      </div>

      {helpText && canChangeFont && (
        <small
          style={{
            display: "block",
            marginTop: "4px",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          {helpText}
        </small>
      )}
      {!canChangeFont && (
        <small
          style={{
            display: "block",
            marginTop: "4px",
            color: "#64748b",
            fontSize: "12px",
            fontStyle: "italic",
          }}
        >
          Note: Font formatting is not available for your role. You can edit text content only. Only Super Admin can change fonts.
        </small>
      )}
    </div>
  );
}

/**
 * Parse inline formatting tags and convert to React elements
 * Supports: [font:name], [color:#hex], [size:px], [weight:value], [style:value]
 * Handles nested and overlapping tags properly using a stack-based approach
 */
export const parseInlineFormatting = (text) => {
  if (!text) return text;

  // Pattern to match opening and closing tags
  const openTagPattern = /\[(font|color|size|weight|style):([^\]]+)\]/g;
  const closeTagPattern = /\[\/(font|color|size|weight|style)\]/g;

  // Find all tag positions
  const tags = [];
  let match;

  // Reset regex lastIndex
  openTagPattern.lastIndex = 0;
  closeTagPattern.lastIndex = 0;

  // Find all opening tags
  while ((match = openTagPattern.exec(text)) !== null) {
    tags.push({
      type: "open",
      index: match.index,
      tagType: match[1],
      tagValue: match[2],
      length: match[0].length,
    });
  }

  // Find all closing tags
  while ((match = closeTagPattern.exec(text)) !== null) {
    tags.push({
      type: "close",
      index: match.index,
      tagType: match[1],
      length: match[0].length,
    });
  }

  // Sort tags by position
  tags.sort((a, b) => a.index - b.index);

  // If no tags found, return text as-is
  if (tags.length === 0) {
    return text;
  }

  // Process text with tags
  const parts = [];
  let currentStyles = {};
  let lastIndex = 0;

  for (const tag of tags) {
    // Add text before this tag
    if (tag.index > lastIndex) {
      const textContent = text.substring(lastIndex, tag.index);
      if (textContent) {
        parts.push({
          content: textContent,
          style: { ...currentStyles },
        });
      }
    }

    // Process the tag
    if (tag.type === "open") {
      // Apply style based on tag type
      switch (tag.tagType) {
        case "font":
          currentStyles.fontFamily = tag.tagValue;
          break;
        case "color":
          currentStyles.color = tag.tagValue;
          break;
        case "size":
          // Handle size value - remove 'px' if present, then add it back
          // Also handle cases where user might enter just a number
          let sizeValue = tag.tagValue.trim();
          // Remove 'px' suffix if present (case insensitive)
          sizeValue = sizeValue.replace(/px$/i, "");
          // Remove any whitespace
          sizeValue = sizeValue.trim();
          // Ensure it's a valid number
          const parsedSize = parseFloat(sizeValue);
          if (sizeValue && !isNaN(parsedSize) && parsedSize > 0) {
            // Set fontSize - React inline styles will override parent styles
            // Use the parsed number to ensure clean value
            currentStyles.fontSize = `${parsedSize}px`;
          }
          break;
        case "weight":
          currentStyles.fontWeight = tag.tagValue;
          break;
        case "style":
          currentStyles.fontStyle = tag.tagValue;
          break;
        default:
          break;
      }
    } else if (tag.type === "close") {
      // Remove style when closing tag is found
      switch (tag.tagType) {
        case "font":
          delete currentStyles.fontFamily;
          break;
        case "color":
          delete currentStyles.color;
          break;
        case "size":
          delete currentStyles.fontSize;
          break;
        case "weight":
          delete currentStyles.fontWeight;
          break;
        case "style":
          delete currentStyles.fontStyle;
          break;
        default:
          break;
      }
    }

    lastIndex = tag.index + tag.length;
  }

  // Add remaining text after last tag
  if (lastIndex < text.length) {
    const textContent = text.substring(lastIndex);
    if (textContent) {
      parts.push({
        content: textContent,
        style: { ...currentStyles },
      });
    }
  }

  // If no parts created, return original text
  if (parts.length === 0) {
    return text;
  }

  // Convert to React elements, merging adjacent parts with same styles
  const mergedParts = [];
  let currentPart = null;

  for (const part of parts) {
    const styleKey = JSON.stringify(part.style);
    if (currentPart && JSON.stringify(currentPart.style) === styleKey) {
      // Merge with previous part if styles match
      currentPart.content += part.content;
    } else {
      // Start new part
      if (currentPart) {
        mergedParts.push(currentPart);
      }
      currentPart = { ...part };
    }
  }

  if (currentPart) {
    mergedParts.push(currentPart);
  }

  // Convert to React elements
  return mergedParts.map((part, index) => {
    const hasStyle = Object.keys(part.style).length > 0;
    if (hasStyle) {
      // Ensure fontSize and other styles are properly formatted
      const finalStyle = { ...part.style };
      // Make sure fontSize is a string with 'px' if it exists
      if (finalStyle.fontSize) {
        if (typeof finalStyle.fontSize === 'number') {
          finalStyle.fontSize = `${finalStyle.fontSize}px`;
        } else if (typeof finalStyle.fontSize === 'string' && !finalStyle.fontSize.includes('px') && !isNaN(parseFloat(finalStyle.fontSize))) {
          finalStyle.fontSize = `${finalStyle.fontSize}px`;
        }
      }
      return (
        <span key={`format-${index}`} style={finalStyle}>
          {part.content}
        </span>
      );
    }
    return <React.Fragment key={`text-${index}`}>{part.content}</React.Fragment>;
  });
};
