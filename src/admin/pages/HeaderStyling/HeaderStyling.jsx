import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import { commonFonts } from "../../components/BrandPageEditor/renderFontStyling";
import Navbar from "../../../components/Navbar";
import {
  getHeaderConfig,
  setHeaderConfig,
  importHeaderFromLive,
} from "../../services/headerService";
import { usePermissions } from "../../auth/usePermissions";
import { ROLE } from "../../auth/roleConfig";
import "./HeaderStyling.css";

// Section Header Component with Save/Cancel buttons
function SectionHeader({
  title,
  sectionFields,
  onSave,
  onCancel,
  hasChanges,
  isSaving,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "12px",
        paddingBottom: "12px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <h3 className="section-title" style={{ margin: 0, flex: 1 }}>
        {title}
      </h3>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={onCancel}
          className="admin-btn admin-btn-secondary"
          disabled={isSaving || !hasChanges}
          style={{
            fontSize: "12px",
            padding: "6px 12px",
            opacity: hasChanges ? 1 : 0.5,
            cursor: hasChanges ? "pointer" : "not-allowed",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="admin-btn admin-btn-primary"
          disabled={isSaving || !hasChanges}
          style={{
            fontSize: "12px",
            padding: "6px 12px",
            opacity: hasChanges ? 1 : 0.5,
            cursor: hasChanges ? "pointer" : "not-allowed",
          }}
        >
          {isSaving ? "Saving..." : "Save Section"}
        </button>
        {hasChanges && (
          <span
            style={{
              fontSize: "11px",
              color: "#ef4444",
              marginLeft: "4px",
            }}
          >
            (Unsaved)
          </span>
        )}
      </div>
    </div>
  );
}

export default function HeaderStyling() {
  const { role } = usePermissions();
  const isSuperAdmin = role === ROLE.SUPER_ADMIN;
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshNavbar, setRefreshNavbar] = useState(0);
  const [savingSections, setSavingSections] = useState({});
  const [showCustomWeight, setShowCustomWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  // Check if current weight is custom and show input if needed
  useEffect(() => {
    if (config?.fontWeight && !["300", "400", "500", "600", "700"].includes(String(config.fontWeight))) {
      setShowCustomWeight(true);
      setCustomWeight(String(config.fontWeight));
    }
  }, [config]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const existing = await getHeaderConfig();
      setConfig(existing);
      setOriginalConfig(JSON.parse(JSON.stringify(existing))); // Deep copy
    } catch (err) {
      console.error("Error loading header config:", err);
      setError("Failed to load header settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }));
    // Refresh navbar preview
    setRefreshNavbar((prev) => prev + 1);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await setHeaderConfig(config);
      setOriginalConfig(JSON.parse(JSON.stringify(config))); // Update original
      alert("Header settings saved successfully!");
      // Refresh navbar to show changes
      setRefreshNavbar((prev) => prev + 1);
    } catch (err) {
      console.error("Error saving header config:", err);
      setError("Failed to save header settings. Please try again.");
      alert("Error saving header settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSectionSave = async (sectionFields) => {
    const sectionKey = sectionFields.join("-");
    try {
      setSavingSections((prev) => ({ ...prev, [sectionKey]: true }));
      setError(null);
      await setHeaderConfig(config);
      // Update original config for saved fields only
      const updatedOriginal = { ...originalConfig };
      sectionFields.forEach((field) => {
        if (config[field] !== undefined) {
          updatedOriginal[field] = config[field];
        }
      });
      setOriginalConfig(updatedOriginal);
      alert("Section settings saved successfully!");
      setRefreshNavbar((prev) => prev + 1);
    } catch (err) {
      console.error("Error saving section config:", err);
      alert("Error saving section settings. Please try again.");
    } finally {
      setSavingSections((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  const handleSectionCancel = (sectionFields) => {
    if (!originalConfig) return;
    
    const hasChanges = sectionFields.some(
      (field) => config[field] !== originalConfig[field]
    );

    if (!hasChanges) {
      return; // No changes to cancel
    }

    if (
      !window.confirm(
        "Are you sure you want to cancel changes in this section? All unsaved changes will be lost."
      )
    ) {
      return;
    }

    // Restore original values for this section
    const restoredConfig = { ...config };
    sectionFields.forEach((field) => {
      if (originalConfig[field] !== undefined) {
        restoredConfig[field] = originalConfig[field];
      }
    });
    setConfig(restoredConfig);
    setRefreshNavbar((prev) => prev + 1);
  };

  const hasSectionChanges = (sectionFields) => {
    if (!originalConfig || !config) return false;
    return sectionFields.some((field) => {
      const currentValue = config[field];
      const originalValue = originalConfig[field];
      // Handle null/undefined comparisons
      if (currentValue === undefined && originalValue === undefined) return false;
      if (currentValue === null && originalValue === null) return false;
      return String(currentValue || "") !== String(originalValue || "");
    });
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all header settings to default? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      // Force default values
      setConfig({
        logo: null,
        navbarBackground: "rgba(255,255,255,0.85)",
        navbarBackgroundScrolled: "#FFFFFF",
        navbarBorder: "rgba(229,231,235,0.85)",
        navbarBorderScrolled: "rgba(17,24,39,0.10)",
        navbarShadow: "0 6px 18px rgba(0,0,0,0.08)",
        navbarShadowScrolled: "0 10px 30px rgba(0,0,0,0.12)",
        navbarPaddingTop: "8px",
        navbarPaddingBottom: "8px",
        navbarPaddingLeft: "30px",
        navbarPaddingRight: "20px",
        navbarPaddingTopScrolled: "8px",
        navbarPaddingBottomScrolled: "8px",
        navbarPaddingLeftScrolled: "28px",
        navbarPaddingRightScrolled: "18px",
        navbarWrapPaddingTop: "16px",
        navbarWrapPaddingBottom: "16px",
        navbarGap: "20px",
        linkColor: "rgba(25, 29, 35, 0.6)",
        linkColorActive: "rgba(25, 29, 35, 0.9)",
        linkHoverBackground: "#F0F1F6",
        linkPadding: "10px 12px",
        linkBorderRadius: "12px",
        linkLineHeight: "21px",
        linkLetterSpacing: "0%",
        dropdownBackground: "#FFFFFF",
        dropdownBorder: "rgba(229,231,235,.7)",
        dropdownShadow:
          "0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)",
        dropdownItemHover: "#F7F7FB",
        dropdownBorderRadius: "16px",
        dropdownPadding: "12px 8px",
        dropdownMinWidth: "220px",
        dropdownItemPadding: "10px",
        dropdownItemBorderRadius: "10px",
        dropdownTopOffset: "calc(100% + 4px)",
        dropdownItemColor: "#374151",
        dropdownItemHoverColor: "#374151",
        dropdownCategoryHoverColor: "#1e3a8a",
        ctaBackground: "#323790",
        ctaBackgroundHover: "#1C1F52",
        ctaColor: "#FFFFFF",
        ctaShadow: "0 8px 20px rgba(50, 55, 144, 0.4)",
        ctaWidth: "154px",
        ctaHeight: "47px",
        ctaPadding: "0",
        ctaBorderRadius: "999px",
        ctaFontSize: "14px",
        ctaLineHeight: "22.5px",
        ctaLetterSpacing: "-0.19px",
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        fontWeight: "400",
        logoHeight: "36px",
        logoFilter: "none",
        navbarBorderRadius: "999px",
        navbarHeight: "80px",
        navbarHeightScrolled: "80px",
        brandIconSize: "28px",
        categoryIconSize: "100px",
        submenuIconSize: "120px",
        mobileMenuBackground: "#FFFFFF",
        mobileMenuPadding: "70px 20px 20px 20px",
        mobileMenuBorderColor: "rgba(229, 231, 235, 0.5)",
        mobileMenuShadow: "0 0 40px rgba(0, 0, 0, 0.1)",
        hamburgerColor: "#374151",
        hamburgerSize: "28px",
        hamburgerBarHeight: "3px",
        hamburgerBarBorderRadius: "2px",
        transitionDuration: "0.25s",
        transitionTiming: "ease",
        containerMaxWidth: "1280px",
        containerPadding: "24px",
        submenuBorderRadius: "12px",
        submenuPadding: "8px",
        submenuMinWidth: "360px",
        submenuMaxWidth: "400px",
        submenuShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",
        navbarZIndex: "100",
        dropdownZIndex: "1001",
        submenuZIndex: "1002",
        hamburgerZIndex: "1001",
        mobileNavZIndex: "1000",
      });
      setRefreshNavbar((prev) => prev + 1);
      alert("Header settings reset to default.");
    } catch (err) {
      console.error("Error resetting header config:", err);
      alert("Error resetting header settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromLive = async () => {
    try {
      const existing = await getHeaderConfig();
      if (existing && Object.keys(existing).length > 0) {
        const confirm = window.confirm(
          "A Header configuration already exists.\n\nImporting from the live website will overwrite current settings with the default styles from Navbar.css.\n\nDo you want to continue?"
        );
        if (!confirm) return;
      }

      setImporting(true);
      setError(null);
      const imported = await importHeaderFromLive();
      setConfig(imported);
      setRefreshNavbar((prev) => prev + 1);
      alert(
        "✅ Header settings imported from live website!\n\nAll current styles from Navbar.css have been imported."
      );
    } catch (err) {
      console.error("Error importing header config:", err);
      setError(`Failed to import from live website: ${err.message}`);
      alert(`Error importing from live website: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (loading || !config) {
    return (
      <AdminLayout currentPage="header">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="admin-text">Loading header settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="header">
      <div className="header-styling">
        <div className="header-styling-header">
          <div>
            <h1 className="admin-heading-1">Header & Navigation Styling</h1>
            <p className="admin-text-sm admin-mt-sm">
              Customize your website header: logo, colors, fonts, and styling
              options.
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleImportFromLive}
              className="admin-btn admin-btn-secondary"
              disabled={importing || saving}
            >
              {importing ? "⏳ Importing..." : "📥 Import from Live Website"}
            </button>
            <button
              onClick={handleReset}
              className="admin-btn admin-btn-secondary"
              disabled={saving || importing}
            >
              🔄 Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="admin-btn admin-btn-primary"
              disabled={saving || importing}
            >
              {saving ? "💾 Saving..." : "💾 Save Settings"}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button
              onClick={loadConfig}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Live Preview */}
        <div className="header-preview-section">
          <div className="preview-header">
            <h2 className="admin-heading-3">Live Header Preview</h2>
            <p className="admin-text-sm">
              See how your header looks with the current settings.
            </p>
          </div>
          <div className="header-preview-container">
            <div
              className="preview-wrapper"
              style={{ position: "relative", paddingTop: "100px" }}
            >
              <Navbar key={refreshNavbar} previewHeaderConfig={config} />
            </div>
          </div>
        </div>

        <div className="header-editor admin-card">
          {/* Logo Settings */}
          <div className="form-section">
            <SectionHeader
              title="Logo Settings"
              sectionFields={["logo", "logoHeight", "logoFilter"]}
              onSave={() =>
                handleSectionSave(["logo", "logoHeight", "logoFilter"])
              }
              onCancel={() =>
                handleSectionCancel(["logo", "logoHeight", "logoFilter"])
              }
              hasChanges={hasSectionChanges([
                "logo",
                "logoHeight",
                "logoFilter",
              ])}
              isSaving={
                savingSections["logo-logoHeight-logoFilter"] || false
              }
            />

            <div className="form-group">
              <ImageSelector
                value={config.logo || ""}
                onChange={(url) => updateConfig({ logo: url || null })}
                label="Logo Image"
                isIcon={false}
              />
              <small className="form-hint">
                <strong>How it works:</strong> Upload or select a logo image
                from your media library. This logo appears at the left side of
                the navigation bar. If left empty, the default logo from your
                assets folder will be used. <strong>Recommended:</strong> Use
                PNG format with transparent background, optimal size 200-400px
                width. Keep file size under 100KB for fast loading.
              </small>
            </div>

            <div className="form-group">
              <label className="admin-label">Logo Height</label>
              <input
                type="text"
                className="admin-input"
                value={config.logoHeight || "36px"}
                onChange={(e) => updateConfig({ logoHeight: e.target.value })}
                placeholder="36px"
              />
              <small className="form-hint">
                <strong>How it works:</strong> Controls the vertical size of
                your logo in the navbar. The width adjusts automatically to
                maintain aspect ratio. <strong>Recommended:</strong> Desktop:
                36-40px, Tablet: 32-36px, Mobile: 28-32px. Use px units (e.g.,
                36px, 40px). Higher values make the logo more prominent but take
                more space.
              </small>
            </div>

            <div className="form-group">
              <label className="admin-label">Logo Filter (CSS Filter)</label>
              <input
                type="text"
                className="admin-input"
                value={config.logoFilter || "none"}
                onChange={(e) => updateConfig({ logoFilter: e.target.value })}
                placeholder="none"
              />
              <small className="form-hint">
                <strong>How it works:</strong> CSS filter applied to the logo
                image. Can be used to change logo color, brightness, contrast,
                etc. <strong>Recommended:</strong> Use "none" to display logo in
                its original colors. You can add custom filters like
                "brightness(0.8)" or "grayscale(100%)" if needed.
              </small>
            </div>
          </div>

          {/* Navbar Background & Border */}
          <div className="form-section">
            <SectionHeader
              title="Navbar Background & Border"
              sectionFields={[
                "navbarBackground",
                "navbarBackgroundScrolled",
                "navbarBorder",
                "navbarBorderScrolled",
                "navbarShadow",
                "navbarShadowScrolled",
                "navbarBorderRadius",
                "navbarHeight",
                "navbarHeightScrolled",
                "navbarPaddingTop",
                "navbarPaddingBottom",
                "navbarPaddingLeft",
                "navbarPaddingRight",
                "navbarPaddingTopScrolled",
                "navbarPaddingBottomScrolled",
                "navbarPaddingLeftScrolled",
                "navbarPaddingRightScrolled",
                "navbarWrapPaddingTop",
                "navbarWrapPaddingBottom",
                "navbarGap",
              ]}
              onSave={() =>
                handleSectionSave([
                  "navbarBackground",
                  "navbarBackgroundScrolled",
                  "navbarBorder",
                  "navbarBorderScrolled",
                  "navbarShadow",
                  "navbarShadowScrolled",
                  "navbarBorderRadius",
                  "navbarHeight",
                  "navbarHeightScrolled",
                  "navbarPaddingTop",
                  "navbarPaddingBottom",
                  "navbarPaddingLeft",
                  "navbarPaddingRight",
                  "navbarPaddingTopScrolled",
                  "navbarPaddingBottomScrolled",
                  "navbarPaddingLeftScrolled",
                  "navbarPaddingRightScrolled",
                  "navbarWrapPaddingTop",
                  "navbarWrapPaddingBottom",
                  "navbarGap",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "navbarBackground",
                  "navbarBackgroundScrolled",
                  "navbarBorder",
                  "navbarBorderScrolled",
                  "navbarShadow",
                  "navbarShadowScrolled",
                  "navbarBorderRadius",
                  "navbarHeight",
                  "navbarHeightScrolled",
                  "navbarPaddingTop",
                  "navbarPaddingBottom",
                  "navbarPaddingLeft",
                  "navbarPaddingRight",
                  "navbarPaddingTopScrolled",
                  "navbarPaddingBottomScrolled",
                  "navbarPaddingLeftScrolled",
                  "navbarPaddingRightScrolled",
                  "navbarWrapPaddingTop",
                  "navbarWrapPaddingBottom",
                  "navbarGap",
                ])
              }
              hasChanges={hasSectionChanges([
                "navbarBackground",
                "navbarBackgroundScrolled",
                "navbarBorder",
                "navbarBorderScrolled",
                "navbarShadow",
                "navbarShadowScrolled",
                "navbarBorderRadius",
                "navbarHeight",
                "navbarHeightScrolled",
                "navbarPaddingTop",
                "navbarPaddingBottom",
                "navbarPaddingLeft",
                "navbarPaddingRight",
                "navbarPaddingTopScrolled",
                "navbarPaddingBottomScrolled",
                "navbarPaddingLeftScrolled",
                "navbarPaddingRightScrolled",
                "navbarWrapPaddingTop",
                "navbarWrapPaddingBottom",
                "navbarGap",
              ])}
              isSaving={
                savingSections[
                  "navbarBackground-navbarBackgroundScrolled-navbarBorder-navbarBorderScrolled-navbarShadow-navbarShadowScrolled-navbarBorderRadius-navbarHeight-navbarHeightScrolled-navbarPaddingTop-navbarPaddingBottom-navbarPaddingLeft-navbarPaddingRight-navbarPaddingTopScrolled-navbarPaddingBottomScrolled-navbarPaddingLeftScrolled-navbarPaddingRightScrolled-navbarWrapPaddingTop-navbarWrapPaddingBottom-navbarGap"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">
                  Background Color (Default)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarBackground || "rgba(255,255,255,0.85)"}
                  onChange={(e) =>
                    updateConfig({ navbarBackground: e.target.value })
                  }
                  placeholder="rgba(255,255,255,0.85)"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={
                    config.navbarBackground?.match(
                      /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                    )?.[0]
                      ? `#${parseInt(
                          config.navbarBackground.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[1]
                        )
                          .toString(16)
                          .padStart(2, "0")}${parseInt(
                          config.navbarBackground.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[2]
                        )
                          .toString(16)
                          .padStart(2, "0")}${parseInt(
                          config.navbarBackground.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[3]
                        )
                          .toString(16)
                          .padStart(2, "0")}`
                      : "#FFFFFF"
                  }
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    updateConfig({
                      navbarBackground: `rgba(${r},${g},${b},0.85)`,
                    });
                  }}
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Background color when the page
                  is at the top (not scrolled). The default uses 85% opacity
                  (0.85) for a semi-transparent effect that blends with content
                  behind. <strong>Recommended:</strong> Use rgba() format with
                  0.7-0.9 opacity for transparency (e.g., rgba(255,255,255,0.85)
                  for white, rgba(0,0,0,0.8) for dark). Lower opacity = more
                  transparent.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">
                  Background Color (Scrolled)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarBackgroundScrolled || "#FFFFFF"}
                  onChange={(e) =>
                    updateConfig({ navbarBackgroundScrolled: e.target.value })
                  }
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.navbarBackgroundScrolled || "#FFFFFF"}
                  onChange={(e) =>
                    updateConfig({ navbarBackgroundScrolled: e.target.value })
                  }
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Background color after user
                  scrolls down the page. Typically more opaque/solid than
                  default for better readability. <strong>Recommended:</strong>{" "}
                  Use solid colors (hex format like #FFFFFF) or rgba with 1.0
                  opacity. Usually white (#FFFFFF) or a light gray for light
                  themes, dark colors for dark themes.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Border Color (Default)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarBorder || "rgba(229,231,235,0.85)"}
                  onChange={(e) =>
                    updateConfig({ navbarBorder: e.target.value })
                  }
                  placeholder="rgba(229,231,235,0.85)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Color of the border around the
                  navbar when at top of page. Creates subtle separation from
                  page content. <strong>Recommended:</strong> Light gray with
                  transparency (rgba(229,231,235,0.85) = light gray, 85%
                  opacity). Use subtle colors that don't distract. Set opacity
                  to 0 for no border.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Border Color (Scrolled)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarBorderScrolled || "rgba(17,24,39,0.10)"}
                  onChange={(e) =>
                    updateConfig({ navbarBorderScrolled: e.target.value })
                  }
                  placeholder="rgba(17,24,39,0.10)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Border color when navbar is
                  scrolled. Usually slightly darker/more visible than default
                  for better definition. <strong>Recommended:</strong> Dark gray
                  with low opacity (rgba(17,24,39,0.10) = dark gray, 10%
                  opacity) for subtle definition. Keep opacity between 0.08-0.15
                  for professional look.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Box Shadow (Default)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarShadow || "0 6px 18px rgba(0,0,0,0.08)"}
                  onChange={(e) =>
                    updateConfig({ navbarShadow: e.target.value })
                  }
                  placeholder="0 6px 18px rgba(0,0,0,0.08)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> CSS box-shadow creates depth
                  and separation. Format: "offsetX offsetY blur spread color".{" "}
                  <strong>Recommended:</strong> Subtle shadow at top: "0 6px
                  18px rgba(0,0,0,0.08)" (horizontal 0, vertical 6px, blur 18px,
                  8% black). Keep opacity 0.05-0.12 for subtle effect. Use
                  "none" to remove shadow.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Box Shadow (Scrolled)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={
                    config.navbarShadowScrolled ||
                    "0 10px 30px rgba(0,0,0,0.12)"
                  }
                  onChange={(e) =>
                    updateConfig({ navbarShadowScrolled: e.target.value })
                  }
                  placeholder="0 10px 30px rgba(0,0,0,0.12)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Stronger shadow when scrolled
                  to emphasize navbar elevation above content.{" "}
                  <strong>Recommended:</strong> More pronounced: "0 10px 30px
                  rgba(0,0,0,0.12)" (vertical 10px, blur 30px, 12% opacity).
                  Increase blur and opacity slightly from default for better
                  depth perception.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarBorderRadius || "999px"}
                  onChange={(e) =>
                    updateConfig({ navbarBorderRadius: e.target.value })
                  }
                  placeholder="999px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Controls how rounded the navbar
                  corners are. Creates the "pill" shape.{" "}
                  <strong>Recommended:</strong> 999px (fully rounded pill shape)
                  for modern look. Use 0px for square corners, 8-16px for
                  slightly rounded, 999px for full pill. Higher values = more
                  rounded.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Height</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarHeight || "80px"}
                  onChange={(e) =>
                    updateConfig({ navbarHeight: e.target.value })
                  }
                  placeholder="80px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Vertical height of the navbar
                  in pixels. Affects both default and scrolled states.{" "}
                  <strong>Recommended:</strong> Desktop: 70-80px (comfortable
                  spacing), Tablet: 60-70px, Mobile: 50-60px. Keep consistent
                  with logo height (navbar should be 2-2.5x logo height). Use px
                  units.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Padding Top (Default)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingTop || "8px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingTop: e.target.value })
                  }
                  placeholder="8px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Padding Bottom (Default)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingBottom || "8px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingBottom: e.target.value })
                  }
                  placeholder="8px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Padding Left (Default)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingLeft || "30px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingLeft: e.target.value })
                  }
                  placeholder="30px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Padding Right (Default)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingRight || "20px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingRight: e.target.value })
                  }
                  placeholder="20px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Padding Top (Scrolled)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingTopScrolled || "8px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingTopScrolled: e.target.value })
                  }
                  placeholder="8px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Padding Bottom (Scrolled)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingBottomScrolled || "8px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingBottomScrolled: e.target.value })
                  }
                  placeholder="8px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Padding Left (Scrolled)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingLeftScrolled || "28px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingLeftScrolled: e.target.value })
                  }
                  placeholder="28px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Padding Right (Scrolled)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarPaddingRightScrolled || "18px"}
                  onChange={(e) =>
                    updateConfig({ navbarPaddingRightScrolled: e.target.value })
                  }
                  placeholder="18px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Navbar Wrap Padding Top</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarWrapPaddingTop || "16px"}
                  onChange={(e) =>
                    updateConfig({ navbarWrapPaddingTop: e.target.value })
                  }
                  placeholder="16px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Navbar Wrap Padding Bottom</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarWrapPaddingBottom || "16px"}
                  onChange={(e) =>
                    updateConfig({ navbarWrapPaddingBottom: e.target.value })
                  }
                  placeholder="16px"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Gap Between Items</label>
              <input
                type="text"
                className="admin-input"
                value={config.navbarGap || "20px"}
                onChange={(e) => updateConfig({ navbarGap: e.target.value })}
                placeholder="20px"
              />
              <small className="form-hint">
                <strong>How it works:</strong> Space between navbar items (logo,
                links, CTA button). <strong>Recommended:</strong> Desktop: 20px,
                Tablet: 8-12px, Mobile: 12-16px. Larger gaps = more breathing
                room but less items fit.
              </small>
            </div>
          </div>

          {/* Link Colors */}
          <div className="form-section">
            <SectionHeader
              title="Navigation Link Colors"
              sectionFields={[
                "linkColor",
                "linkColorActive",
                "linkHoverBackground",
                "linkPadding",
                "linkBorderRadius",
                "linkLineHeight",
                "linkLetterSpacing",
              ]}
              onSave={() =>
                handleSectionSave([
                  "linkColor",
                  "linkColorActive",
                  "linkHoverBackground",
                  "linkPadding",
                  "linkBorderRadius",
                  "linkLineHeight",
                  "linkLetterSpacing",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "linkColor",
                  "linkColorActive",
                  "linkHoverBackground",
                  "linkPadding",
                  "linkBorderRadius",
                  "linkLineHeight",
                  "linkLetterSpacing",
                ])
              }
              hasChanges={hasSectionChanges([
                "linkColor",
                "linkColorActive",
                "linkHoverBackground",
                "linkPadding",
                "linkBorderRadius",
                "linkLineHeight",
                "linkLetterSpacing",
              ])}
              isSaving={
                savingSections[
                  "linkColor-linkColorActive-linkHoverBackground-linkPadding-linkBorderRadius-linkLineHeight-linkLetterSpacing"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Link Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.linkColor || "rgba(25, 29, 35, 0.6)"}
                  onChange={(e) => updateConfig({ linkColor: e.target.value })}
                  placeholder="rgba(25, 29, 35, 0.6)"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={
                    config.linkColor?.match(
                      /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                    )?.[0]
                      ? `#${parseInt(
                          config.linkColor.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[1]
                        )
                          .toString(16)
                          .padStart(2, "0")}${parseInt(
                          config.linkColor.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[2]
                        )
                          .toString(16)
                          .padStart(2, "0")}${parseInt(
                          config.linkColor.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[3]
                        )
                          .toString(16)
                          .padStart(2, "0")}`
                      : "#191D23"
                  }
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    updateConfig({ linkColor: `rgba(${r},${g},${b},0.6)` });
                  }}
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Color of navigation menu links
                  in their normal (non-active) state.{" "}
                  <strong>Recommended:</strong> Use rgba() with 0.5-0.7 opacity
                  for subtle, readable links (e.g., rgba(25, 29, 35, 0.6) = dark
                  gray at 60% opacity). Lower opacity = more subtle, higher =
                  more prominent. Ensure contrast ratio meets WCAG AA (4.5:1)
                  for accessibility.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Active Link Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.linkColorActive || "rgba(25, 29, 35, 0.9)"}
                  onChange={(e) =>
                    updateConfig({ linkColorActive: e.target.value })
                  }
                  placeholder="rgba(25, 29, 35, 0.9)"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={
                    config.linkColorActive?.match(
                      /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                    )?.[0]
                      ? `#${parseInt(
                          config.linkColorActive.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[1]
                        )
                          .toString(16)
                          .padStart(2, "0")}${parseInt(
                          config.linkColorActive.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[2]
                        )
                          .toString(16)
                          .padStart(2, "0")}${parseInt(
                          config.linkColorActive.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                          )?.[3]
                        )
                          .toString(16)
                          .padStart(2, "0")}`
                      : "#191D23"
                  }
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    updateConfig({
                      linkColorActive: `rgba(${r},${g},${b},0.9)`,
                    });
                  }}
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Color for the currently
                  active/selected navigation link (matches current page). Should
                  be more prominent than normal links.{" "}
                  <strong>Recommended:</strong> Use same color as link color but
                  with higher opacity (0.8-1.0) for clear distinction. Example:
                  rgba(25, 29, 35, 0.9) = 90% opacity. Should be 20-30% more
                  opaque than link color.
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Link Hover Background</label>
              <input
                type="text"
                className="admin-input"
                value={config.linkHoverBackground || "#F0F1F6"}
                onChange={(e) =>
                  updateConfig({ linkHoverBackground: e.target.value })
                }
                placeholder="#F0F1F6"
              />
              <input
                type="color"
                className="admin-input admin-mt-xs"
                value={config.linkHoverBackground || "#F0F1F6"}
                onChange={(e) =>
                  updateConfig({ linkHoverBackground: e.target.value })
                }
              />
              <small className="form-hint">
                <strong>How it works:</strong> Background color that appears
                when users hover over navigation links. Provides visual feedback
                for interactivity. <strong>Recommended:</strong> Light gray/blue
                tint (e.g., #F0F1F6, #F3F4F6) for subtle hover effect. Should be
                5-10% darker than navbar background. Use transparent or same as
                background to disable hover effect.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Link Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.linkPadding || "10px 12px"}
                  onChange={(e) => updateConfig({ linkPadding: e.target.value })}
                  placeholder="10px 12px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Padding inside navigation links
                  (top/bottom left/right). <strong>Recommended:</strong> Desktop:
                  10px 12px, Tablet: 8px 8px, Mobile: 12px 0. Use CSS padding
                  format.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Link Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.linkBorderRadius || "12px"}
                  onChange={(e) =>
                    updateConfig({ linkBorderRadius: e.target.value })
                  }
                  placeholder="12px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Rounded corners for navigation
                  links. <strong>Recommended:</strong> 12px for subtle rounding,
                  0px for square, 999px for pill shape.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Link Line Height</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.linkLineHeight || "21px"}
                  onChange={(e) =>
                    updateConfig({ linkLineHeight: e.target.value })
                  }
                  placeholder="21px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Link Letter Spacing</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.linkLetterSpacing || "0%"}
                  onChange={(e) =>
                    updateConfig({ linkLetterSpacing: e.target.value })
                  }
                  placeholder="0%"
                />
              </div>
            </div>
          </div>

          {/* Dropdown Colors */}
          <div className="form-section">
            <SectionHeader
              title="Dropdown Menu Colors"
              sectionFields={[
                "dropdownBackground",
                "dropdownBorder",
                "dropdownShadow",
                "dropdownItemHover",
                "dropdownBorderRadius",
                "dropdownPadding",
                "dropdownMinWidth",
                "dropdownItemPadding",
                "dropdownItemBorderRadius",
                "dropdownTopOffset",
                "dropdownItemColor",
                "dropdownItemHoverColor",
                "dropdownCategoryHoverColor",
              ]}
              onSave={() =>
                handleSectionSave([
                  "dropdownBackground",
                  "dropdownBorder",
                  "dropdownShadow",
                  "dropdownItemHover",
                  "dropdownBorderRadius",
                  "dropdownPadding",
                  "dropdownMinWidth",
                  "dropdownItemPadding",
                  "dropdownItemBorderRadius",
                  "dropdownTopOffset",
                  "dropdownItemColor",
                  "dropdownItemHoverColor",
                  "dropdownCategoryHoverColor",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "dropdownBackground",
                  "dropdownBorder",
                  "dropdownShadow",
                  "dropdownItemHover",
                  "dropdownBorderRadius",
                  "dropdownPadding",
                  "dropdownMinWidth",
                  "dropdownItemPadding",
                  "dropdownItemBorderRadius",
                  "dropdownTopOffset",
                  "dropdownItemColor",
                  "dropdownItemHoverColor",
                  "dropdownCategoryHoverColor",
                ])
              }
              hasChanges={hasSectionChanges([
                "dropdownBackground",
                "dropdownBorder",
                "dropdownShadow",
                "dropdownItemHover",
                "dropdownBorderRadius",
                "dropdownPadding",
                "dropdownMinWidth",
                "dropdownItemPadding",
                "dropdownItemBorderRadius",
                "dropdownTopOffset",
                "dropdownItemColor",
                "dropdownItemHoverColor",
                "dropdownCategoryHoverColor",
              ])}
              isSaving={
                savingSections[
                  "dropdownBackground-dropdownBorder-dropdownShadow-dropdownItemHover-dropdownBorderRadius-dropdownPadding-dropdownMinWidth-dropdownItemPadding-dropdownItemBorderRadius-dropdownTopOffset-dropdownItemColor-dropdownItemHoverColor-dropdownCategoryHoverColor"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Dropdown Background</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownBackground || "#FFFFFF"}
                  onChange={(e) =>
                    updateConfig({ dropdownBackground: e.target.value })
                  }
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.dropdownBackground || "#FFFFFF"}
                  onChange={(e) =>
                    updateConfig({ dropdownBackground: e.target.value })
                  }
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Background color of dropdown
                  menus that appear when clicking navigation items with submenus
                  (e.g., Brands, Products). <strong>Recommended:</strong> White
                  (#FFFFFF) or light color for good contrast with text. Should
                  match or complement navbar background. Use solid colors (not
                  transparent) for readability.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Border</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownBorder || "rgba(229,231,235,.7)"}
                  onChange={(e) =>
                    updateConfig({ dropdownBorder: e.target.value })
                  }
                  placeholder="rgba(229,231,235,.7)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Border color around dropdown
                  menu containers. Creates separation from page content and
                  defines menu boundaries. <strong>Recommended:</strong> Light
                  gray with 0.6-0.8 opacity (e.g., rgba(229,231,235,.7) = light
                  gray, 70% opacity). Subtle borders work best - avoid dark or
                  thick borders that distract from content.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Dropdown Shadow</label>
                <input
                  type="text"
                  className="admin-input"
                  value={
                    config.dropdownShadow ||
                    "0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)"
                  }
                  onChange={(e) =>
                    updateConfig({ dropdownShadow: e.target.value })
                  }
                  placeholder="0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Box shadow for dropdown menus
                  to create depth and elevation above page content. Can use
                  multiple shadows for layered effect.{" "}
                  <strong>Recommended:</strong> Two-shadow combo: "0 10px 40px
                  rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)" (large soft shadow
                  + small sharp shadow). Keep opacity 0.08-0.15. Use "none" to
                  remove shadow.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Item Hover</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownItemHover || "#F7F7FB"}
                  onChange={(e) =>
                    updateConfig({ dropdownItemHover: e.target.value })
                  }
                  placeholder="#F7F7FB"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.dropdownItemHover || "#F7F7FB"}
                  onChange={(e) =>
                    updateConfig({ dropdownItemHover: e.target.value })
                  }
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Background color when hovering
                  over individual items within dropdown menus. Provides visual
                  feedback for clickable items. <strong>Recommended:</strong>{" "}
                  Very light gray/blue (e.g., #F7F7FB, #F9FAFB) - slightly
                  lighter than link hover background. Should be subtle but
                  noticeable. Use transparent to disable hover effect.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Dropdown Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownBorderRadius || "16px"}
                  onChange={(e) =>
                    updateConfig({ dropdownBorderRadius: e.target.value })
                  }
                  placeholder="16px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownPadding || "12px 8px"}
                  onChange={(e) =>
                    updateConfig({ dropdownPadding: e.target.value })
                  }
                  placeholder="12px 8px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Dropdown Min Width</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownMinWidth || "220px"}
                  onChange={(e) =>
                    updateConfig({ dropdownMinWidth: e.target.value })
                  }
                  placeholder="220px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Item Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownItemPadding || "10px"}
                  onChange={(e) =>
                    updateConfig({ dropdownItemPadding: e.target.value })
                  }
                  placeholder="10px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Dropdown Item Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownItemBorderRadius || "10px"}
                  onChange={(e) =>
                    updateConfig({ dropdownItemBorderRadius: e.target.value })
                  }
                  placeholder="10px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Top Offset</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownTopOffset || "calc(100% + 4px)"}
                  onChange={(e) =>
                    updateConfig({ dropdownTopOffset: e.target.value })
                  }
                  placeholder="calc(100% + 4px)"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Dropdown Item Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownItemColor || "#374151"}
                  onChange={(e) =>
                    updateConfig({ dropdownItemColor: e.target.value })
                  }
                  placeholder="#374151"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.dropdownItemColor || "#374151"}
                  onChange={(e) =>
                    updateConfig({ dropdownItemColor: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Category Hover Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownCategoryHoverColor || "#1e3a8a"}
                  onChange={(e) =>
                    updateConfig({ dropdownCategoryHoverColor: e.target.value })
                  }
                  placeholder="#1e3a8a"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.dropdownCategoryHoverColor || "#1e3a8a"}
                  onChange={(e) =>
                    updateConfig({ dropdownCategoryHoverColor: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* CTA Button Colors */}
          <div className="form-section">
            <SectionHeader
              title="CTA Button Colors"
              sectionFields={[
                "ctaBackground",
                "ctaBackgroundHover",
                "ctaColor",
                "ctaShadow",
                "ctaWidth",
                "ctaHeight",
                "ctaPadding",
                "ctaBorderRadius",
                "ctaFontSize",
                "ctaLineHeight",
                "ctaLetterSpacing",
              ]}
              onSave={() =>
                handleSectionSave([
                  "ctaBackground",
                  "ctaBackgroundHover",
                  "ctaColor",
                  "ctaShadow",
                  "ctaWidth",
                  "ctaHeight",
                  "ctaPadding",
                  "ctaBorderRadius",
                  "ctaFontSize",
                  "ctaLineHeight",
                  "ctaLetterSpacing",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "ctaBackground",
                  "ctaBackgroundHover",
                  "ctaColor",
                  "ctaShadow",
                  "ctaWidth",
                  "ctaHeight",
                  "ctaPadding",
                  "ctaBorderRadius",
                  "ctaFontSize",
                  "ctaLineHeight",
                  "ctaLetterSpacing",
                ])
              }
              hasChanges={hasSectionChanges([
                "ctaBackground",
                "ctaBackgroundHover",
                "ctaColor",
                "ctaShadow",
                "ctaWidth",
                "ctaHeight",
                "ctaPadding",
                "ctaBorderRadius",
                "ctaFontSize",
                "ctaLineHeight",
                "ctaLetterSpacing",
              ])}
              isSaving={
                savingSections[
                  "ctaBackground-ctaBackgroundHover-ctaColor-ctaShadow-ctaWidth-ctaHeight-ctaPadding-ctaBorderRadius-ctaFontSize-ctaLineHeight-ctaLetterSpacing"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Button Background</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaBackground || "#323790"}
                  onChange={(e) =>
                    updateConfig({ ctaBackground: e.target.value })
                  }
                  placeholder="#323790"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.ctaBackground || "#323790"}
                  onChange={(e) =>
                    updateConfig({ ctaBackground: e.target.value })
                  }
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Background color of the
                  Call-to-Action (CTA) button in the navbar (usually "Contact"
                  or similar). Should be prominent and match brand colors.{" "}
                  <strong>Recommended:</strong> Use your primary brand color
                  (e.g., #323790 = deep blue). Should contrast well with navbar
                  background. Use hex format (#RRGGBB). Keep it bold and
                  attention-grabbing.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Button Background (Hover)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaBackgroundHover || "#1C1F52"}
                  onChange={(e) =>
                    updateConfig({ ctaBackgroundHover: e.target.value })
                  }
                  placeholder="#1C1F52"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.ctaBackgroundHover || "#1C1F52"}
                  onChange={(e) =>
                    updateConfig({ ctaBackgroundHover: e.target.value })
                  }
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Background color when user
                  hovers over the CTA button. Should be darker than default for
                  clear feedback. <strong>Recommended:</strong> 15-25% darker
                  than button background (e.g., if button is #323790, hover
                  should be #1C1F52). Creates depth and indicates interactivity.
                  Use hex format.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Button Text Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaColor || "#FFFFFF"}
                  onChange={(e) => updateConfig({ ctaColor: e.target.value })}
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.ctaColor || "#FFFFFF"}
                  onChange={(e) => updateConfig({ ctaColor: e.target.value })}
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Text color inside the CTA
                  button. Must have high contrast with button background for
                  readability. <strong>Recommended:</strong> White (#FFFFFF) for
                  dark buttons, dark colors (#000000, #191D23) for light
                  buttons. Ensure WCAG AA contrast ratio of at least 4.5:1 with
                  background. White is standard for most brand-colored buttons.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Button Shadow (Hover)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={
                    config.ctaShadow || "0 8px 20px rgba(50, 55, 144, 0.4)"
                  }
                  onChange={(e) => updateConfig({ ctaShadow: e.target.value })}
                  placeholder="0 8px 20px rgba(50, 55, 144, 0.4)"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Box shadow that appears when
                  hovering over the CTA button. Creates elevation effect and
                  draws attention. <strong>Recommended:</strong> Colored shadow
                  matching button color: "0 8px 20px rgba(50, 55, 144, 0.4)"
                  (vertical 8px, blur 20px, 40% opacity of button color). Higher
                  opacity (0.3-0.5) creates more dramatic effect. Use "none" to
                  disable.
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Button Width</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaWidth || "154px"}
                  onChange={(e) => updateConfig({ ctaWidth: e.target.value })}
                  placeholder="154px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Button Height</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaHeight || "47px"}
                  onChange={(e) => updateConfig({ ctaHeight: e.target.value })}
                  placeholder="47px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Button Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaPadding || "0"}
                  onChange={(e) => updateConfig({ ctaPadding: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Button Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaBorderRadius || "999px"}
                  onChange={(e) =>
                    updateConfig({ ctaBorderRadius: e.target.value })
                  }
                  placeholder="999px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Button Font Size</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaFontSize || "14px"}
                  onChange={(e) => updateConfig({ ctaFontSize: e.target.value })}
                  placeholder="14px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Button Line Height</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.ctaLineHeight || "22.5px"}
                  onChange={(e) =>
                    updateConfig({ ctaLineHeight: e.target.value })
                  }
                  placeholder="22.5px"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Button Letter Spacing</label>
              <input
                type="text"
                className="admin-input"
                value={config.ctaLetterSpacing || "-0.19px"}
                onChange={(e) =>
                  updateConfig({ ctaLetterSpacing: e.target.value })
                }
                placeholder="-0.19px"
              />
            </div>
          </div>

          {/* Font Settings */}
          <div className="form-section">
            <SectionHeader
              title="Font Settings"
              sectionFields={["fontFamily", "fontSize", "fontWeight"]}
              onSave={() => handleSectionSave(["fontFamily", "fontSize", "fontWeight"])}
              onCancel={() =>
                handleSectionCancel(["fontFamily", "fontSize", "fontWeight"])
              }
              hasChanges={hasSectionChanges(["fontFamily", "fontSize", "fontWeight"])}
              isSaving={savingSections["fontFamily-fontSize-fontWeight"] || false}
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Font Family</label>
                <select
                  className="admin-select"
                  value={
                    config.fontFamily ||
                    "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
                  }
                  onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                  disabled={!isSuperAdmin}
                  style={{
                    opacity: isSuperAdmin ? 1 : 0.6,
                    cursor: isSuperAdmin ? "pointer" : "not-allowed",
                  }}
                >
                  {isSuperAdmin ? (
                    commonFonts.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))
                  ) : (
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
                    <strong>How it works:</strong> CSS font-family stack for all
                    navigation text. Uses fallback fonts if primary isn't
                    available. <strong>Recommended:</strong> Select from the
                    dropdown above. All fonts include proper fallbacks for better
                    compatibility.
                  </small>
                )}
              </div>
              <div className="form-group">
                <label className="admin-label">Font Size</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.fontSize || "14px"}
                  onChange={(e) => updateConfig({ fontSize: e.target.value })}
                  placeholder="14px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Base font size for all
                  navigation links and text. Affects readability and navbar
                  spacing. <strong>Recommended:</strong> Desktop: 14-16px
                  (optimal readability), Tablet: 13-14px, Mobile: 14px. Use px
                  units for consistency. Smaller (12-13px) = compact, larger
                  (16-18px) = more prominent. 14px is standard for navigation
                  menus.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Font Weight</label>
                <select
                  className="admin-select"
                  value={
                    showCustomWeight || (config.fontWeight && 
                    !["300", "400", "500", "600", "700"].includes(config.fontWeight))
                      ? "custom"
                      : (config.fontWeight || "400")
                  }
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setShowCustomWeight(true);
                      setCustomWeight(config.fontWeight || "");
                    } else {
                      setShowCustomWeight(false);
                      updateConfig({ fontWeight: e.target.value });
                    }
                  }}
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-Bold (600)</option>
                  <option value="700">Bold (700)</option>
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
                          updateConfig({ fontWeight: customWeight });
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
                          updateConfig({ fontWeight: customWeight });
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
                <small className="form-hint">
                  <strong>How it works:</strong> Thickness/boldness of
                  navigation text. Higher numbers = bolder text.{" "}
                  <strong>Recommended:</strong> 400 (Regular) for standard
                  navigation - clean and readable. 300 (Light) for
                  minimal/elegant look. 500-600 for emphasis. 700 (Bold) is too
                  heavy for navigation. Ensure your font family supports the
                  selected weight.
                </small>
              </div>
            </div>
          </div>

          {/* Icon Sizes */}
          <div className="form-section">
            <SectionHeader
              title="Icon Sizes"
              sectionFields={[
                "brandIconSize",
                "categoryIconSize",
                "submenuIconSize",
              ]}
              onSave={() =>
                handleSectionSave([
                  "brandIconSize",
                  "categoryIconSize",
                  "submenuIconSize",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "brandIconSize",
                  "categoryIconSize",
                  "submenuIconSize",
                ])
              }
              hasChanges={hasSectionChanges([
                "brandIconSize",
                "categoryIconSize",
                "submenuIconSize",
              ])}
              isSaving={
                savingSections[
                  "brandIconSize-categoryIconSize-submenuIconSize"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Brand Icon Size</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.brandIconSize || "28px"}
                  onChange={(e) =>
                    updateConfig({ brandIconSize: e.target.value })
                  }
                  placeholder="28px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Size of brand icons in dropdown
                  menus. <strong>Recommended:</strong> Desktop: 28px, Tablet:
                  26px, Mobile: 24px. Use px units.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Category Icon Size</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.categoryIconSize || "100px"}
                  onChange={(e) =>
                    updateConfig({ categoryIconSize: e.target.value })
                  }
                  placeholder="100px"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Size of category icons in
                  Products dropdown. <strong>Recommended:</strong> Desktop:
                  100px, Tablet: 90px, Mobile: 70px. Use px units.
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Submenu Icon Size</label>
              <input
                type="text"
                className="admin-input"
                value={config.submenuIconSize || "120px"}
                onChange={(e) =>
                  updateConfig({ submenuIconSize: e.target.value })
                }
                placeholder="120px"
              />
              <small className="form-hint">
                <strong>How it works:</strong> Size of icons in nested submenus.
                <strong>Recommended:</strong> Desktop: 120px, Tablet: 110px,
                Mobile: 100px. Use px units.
              </small>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="form-section">
            <SectionHeader
              title="Mobile Menu Settings"
              sectionFields={[
                "mobileMenuBackground",
                "mobileMenuPadding",
                "mobileMenuBorderColor",
                "mobileMenuShadow",
              ]}
              onSave={() =>
                handleSectionSave([
                  "mobileMenuBackground",
                  "mobileMenuPadding",
                  "mobileMenuBorderColor",
                  "mobileMenuShadow",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "mobileMenuBackground",
                  "mobileMenuPadding",
                  "mobileMenuBorderColor",
                  "mobileMenuShadow",
                ])
              }
              hasChanges={hasSectionChanges([
                "mobileMenuBackground",
                "mobileMenuPadding",
                "mobileMenuBorderColor",
                "mobileMenuShadow",
              ])}
              isSaving={
                savingSections[
                  "mobileMenuBackground-mobileMenuPadding-mobileMenuBorderColor-mobileMenuShadow"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Mobile Menu Background</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.mobileMenuBackground || "#FFFFFF"}
                  onChange={(e) =>
                    updateConfig({ mobileMenuBackground: e.target.value })
                  }
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.mobileMenuBackground || "#FFFFFF"}
                  onChange={(e) =>
                    updateConfig({ mobileMenuBackground: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Mobile Menu Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.mobileMenuPadding || "70px 20px 20px 20px"}
                  onChange={(e) =>
                    updateConfig({ mobileMenuPadding: e.target.value })
                  }
                  placeholder="70px 20px 20px 20px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Mobile Menu Border Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={
                    config.mobileMenuBorderColor || "rgba(229, 231, 235, 0.5)"
                  }
                  onChange={(e) =>
                    updateConfig({ mobileMenuBorderColor: e.target.value })
                  }
                  placeholder="rgba(229, 231, 235, 0.5)"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Mobile Menu Shadow</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.mobileMenuShadow || "0 0 40px rgba(0, 0, 0, 0.1)"}
                  onChange={(e) =>
                    updateConfig({ mobileMenuShadow: e.target.value })
                  }
                  placeholder="0 0 40px rgba(0, 0, 0, 0.1)"
                />
              </div>
            </div>
          </div>

          {/* Hamburger Menu */}
          <div className="form-section">
            <SectionHeader
              title="Hamburger Menu Settings"
              sectionFields={[
                "hamburgerColor",
                "hamburgerSize",
                "hamburgerBarHeight",
                "hamburgerBarBorderRadius",
              ]}
              onSave={() =>
                handleSectionSave([
                  "hamburgerColor",
                  "hamburgerSize",
                  "hamburgerBarHeight",
                  "hamburgerBarBorderRadius",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "hamburgerColor",
                  "hamburgerSize",
                  "hamburgerBarHeight",
                  "hamburgerBarBorderRadius",
                ])
              }
              hasChanges={hasSectionChanges([
                "hamburgerColor",
                "hamburgerSize",
                "hamburgerBarHeight",
                "hamburgerBarBorderRadius",
              ])}
              isSaving={
                savingSections[
                  "hamburgerColor-hamburgerSize-hamburgerBarHeight-hamburgerBarBorderRadius"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Hamburger Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.hamburgerColor || "#374151"}
                  onChange={(e) =>
                    updateConfig({ hamburgerColor: e.target.value })
                  }
                  placeholder="#374151"
                />
                <input
                  type="color"
                  className="admin-input admin-mt-xs"
                  value={config.hamburgerColor || "#374151"}
                  onChange={(e) =>
                    updateConfig({ hamburgerColor: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Hamburger Size</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.hamburgerSize || "28px"}
                  onChange={(e) =>
                    updateConfig({ hamburgerSize: e.target.value })
                  }
                  placeholder="28px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Hamburger Bar Height</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.hamburgerBarHeight || "3px"}
                  onChange={(e) =>
                    updateConfig({ hamburgerBarHeight: e.target.value })
                  }
                  placeholder="3px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Hamburger Bar Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.hamburgerBarBorderRadius || "2px"}
                  onChange={(e) =>
                    updateConfig({ hamburgerBarBorderRadius: e.target.value })
                  }
                  placeholder="2px"
                />
              </div>
            </div>
          </div>

          {/* Transitions */}
          <div className="form-section">
            <SectionHeader
              title="Transition Settings"
              sectionFields={["transitionDuration", "transitionTiming"]}
              onSave={() =>
                handleSectionSave(["transitionDuration", "transitionTiming"])
              }
              onCancel={() =>
                handleSectionCancel(["transitionDuration", "transitionTiming"])
              }
              hasChanges={hasSectionChanges(["transitionDuration", "transitionTiming"])}
              isSaving={savingSections["transitionDuration-transitionTiming"] || false}
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Transition Duration</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.transitionDuration || "0.25s"}
                  onChange={(e) =>
                    updateConfig({ transitionDuration: e.target.value })
                  }
                  placeholder="0.25s"
                />
                <small className="form-hint">
                  <strong>How it works:</strong> Duration of CSS transitions for
                  navbar animations. <strong>Recommended:</strong> 0.2s-0.3s for
                  smooth animations. Use s or ms units.
                </small>
              </div>
              <div className="form-group">
                <label className="admin-label">Transition Timing</label>
                <select
                  className="admin-select"
                  value={config.transitionTiming || "ease"}
                  onChange={(e) =>
                    updateConfig({ transitionTiming: e.target.value })
                  }
                >
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="linear">Linear</option>
                  <option value="cubic-bezier(0.4, 0, 0.2, 1)">
                    Cubic Bezier
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Container */}
          <div className="form-section">
            <SectionHeader
              title="Container Settings"
              sectionFields={["containerMaxWidth", "containerPadding"]}
              onSave={() =>
                handleSectionSave(["containerMaxWidth", "containerPadding"])
              }
              onCancel={() =>
                handleSectionCancel(["containerMaxWidth", "containerPadding"])
              }
              hasChanges={hasSectionChanges(["containerMaxWidth", "containerPadding"])}
              isSaving={savingSections["containerMaxWidth-containerPadding"] || false}
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Container Max Width</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.containerMaxWidth || "1280px"}
                  onChange={(e) =>
                    updateConfig({ containerMaxWidth: e.target.value })
                  }
                  placeholder="1280px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Container Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.containerPadding || "24px"}
                  onChange={(e) =>
                    updateConfig({ containerPadding: e.target.value })
                  }
                  placeholder="24px"
                />
              </div>
            </div>
          </div>

          {/* Submenu */}
          <div className="form-section">
            <SectionHeader
              title="Submenu Settings"
              sectionFields={[
                "submenuBorderRadius",
                "submenuPadding",
                "submenuMinWidth",
                "submenuMaxWidth",
                "submenuShadow",
              ]}
              onSave={() =>
                handleSectionSave([
                  "submenuBorderRadius",
                  "submenuPadding",
                  "submenuMinWidth",
                  "submenuMaxWidth",
                  "submenuShadow",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "submenuBorderRadius",
                  "submenuPadding",
                  "submenuMinWidth",
                  "submenuMaxWidth",
                  "submenuShadow",
                ])
              }
              hasChanges={hasSectionChanges([
                "submenuBorderRadius",
                "submenuPadding",
                "submenuMinWidth",
                "submenuMaxWidth",
                "submenuShadow",
              ])}
              isSaving={
                savingSections[
                  "submenuBorderRadius-submenuPadding-submenuMinWidth-submenuMaxWidth-submenuShadow"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Submenu Border Radius</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.submenuBorderRadius || "12px"}
                  onChange={(e) =>
                    updateConfig({ submenuBorderRadius: e.target.value })
                  }
                  placeholder="12px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Submenu Padding</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.submenuPadding || "8px"}
                  onChange={(e) =>
                    updateConfig({ submenuPadding: e.target.value })
                  }
                  placeholder="8px"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Submenu Min Width</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.submenuMinWidth || "360px"}
                  onChange={(e) =>
                    updateConfig({ submenuMinWidth: e.target.value })
                  }
                  placeholder="360px"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Submenu Max Width</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.submenuMaxWidth || "400px"}
                  onChange={(e) =>
                    updateConfig({ submenuMaxWidth: e.target.value })
                  }
                  placeholder="400px"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Submenu Shadow</label>
              <input
                type="text"
                className="admin-input"
                value={
                  config.submenuShadow ||
                  "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)"
                }
                onChange={(e) =>
                  updateConfig({ submenuShadow: e.target.value })
                }
                placeholder="0 20px 60px rgba(0, 0, 0, 0.15)..."
              />
            </div>
          </div>

          {/* Z-Index */}
          <div className="form-section">
            <SectionHeader
              title="Z-Index Settings"
              sectionFields={[
                "navbarZIndex",
                "dropdownZIndex",
                "submenuZIndex",
                "hamburgerZIndex",
                "mobileNavZIndex",
              ]}
              onSave={() =>
                handleSectionSave([
                  "navbarZIndex",
                  "dropdownZIndex",
                  "submenuZIndex",
                  "hamburgerZIndex",
                  "mobileNavZIndex",
                ])
              }
              onCancel={() =>
                handleSectionCancel([
                  "navbarZIndex",
                  "dropdownZIndex",
                  "submenuZIndex",
                  "hamburgerZIndex",
                  "mobileNavZIndex",
                ])
              }
              hasChanges={hasSectionChanges([
                "navbarZIndex",
                "dropdownZIndex",
                "submenuZIndex",
                "hamburgerZIndex",
                "mobileNavZIndex",
              ])}
              isSaving={
                savingSections[
                  "navbarZIndex-dropdownZIndex-submenuZIndex-hamburgerZIndex-mobileNavZIndex"
                ] || false
              }
            />

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Navbar Z-Index</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.navbarZIndex || "100"}
                  onChange={(e) =>
                    updateConfig({ navbarZIndex: e.target.value })
                  }
                  placeholder="100"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Dropdown Z-Index</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.dropdownZIndex || "1001"}
                  onChange={(e) =>
                    updateConfig({ dropdownZIndex: e.target.value })
                  }
                  placeholder="1001"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">Submenu Z-Index</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.submenuZIndex || "1002"}
                  onChange={(e) =>
                    updateConfig({ submenuZIndex: e.target.value })
                  }
                  placeholder="1002"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">Hamburger Z-Index</label>
                <input
                  type="text"
                  className="admin-input"
                  value={config.hamburgerZIndex || "1001"}
                  onChange={(e) =>
                    updateConfig({ hamburgerZIndex: e.target.value })
                  }
                  placeholder="1001"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="admin-label">Mobile Nav Z-Index</label>
              <input
                type="text"
                className="admin-input"
                value={config.mobileNavZIndex || "1000"}
                onChange={(e) =>
                  updateConfig({ mobileNavZIndex: e.target.value })
                }
                placeholder="1000"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
