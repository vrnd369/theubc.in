import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import InlineFontEditor from "../../components/BrandPageEditor/InlineFontEditor";
import { commonFonts } from "../../components/BrandPageEditor/renderFontStyling";
import LiveFooterPreview from "../../components/LiveFooterPreview/LiveFooterPreview";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import {
  getFooterConfig,
  saveFooterConfig,
  importFooterFromLive,
} from "../../services/footerService";
import { getNavigationItems } from "../../services/navigationService";
import { usePermissions } from "../../auth/usePermissions";
import { ROLE } from "../../auth/roleConfig";
import "./FooterManagement.css";

export default function FooterManagement() {
  const { role } = usePermissions();
  const isSuperAdmin = role === ROLE.SUPER_ADMIN;
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [livePreviewData, setLivePreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [navigationItems, setNavigationItems] = useState([]);
  const [showCustomWeight, setShowCustomWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState("");

  useEffect(() => {
    loadConfig();
    loadNavigationItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if current weight is custom and show input if needed
  useEffect(() => {
    if (config?.slogan?.fontWeight && ![400, 500, 600, 700].includes(config.slogan.fontWeight)) {
      setShowCustomWeight(true);
      setCustomWeight(String(config.slogan.fontWeight));
    }
  }, [config]);

  const loadNavigationItems = async () => {
    try {
      const items = await getNavigationItems();
      // Filter to get only top-level links (not dropdowns)
      const topLevelLinks = items
        .filter((item) => item.type === "link")
        .map((item) => ({
          label: item.label,
          path: item.path,
        }));
      setNavigationItems(topLevelLinks);

      // Update config with navigation links if config exists
      if (config) {
        updateConfig((prev) => ({
          ...prev,
          navigationLinks: topLevelLinks,
        }));
      }
    } catch (err) {
      console.error("Error loading navigation items:", err);
    }
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const existing = await getFooterConfig();
      if (existing) {
        // Validate logo image ID if it exists
        if (
          existing.logo?.url &&
          !existing.logo.url.startsWith("data:") &&
          !existing.logo.url.startsWith("http://") &&
          !existing.logo.url.startsWith("https://")
        ) {
          try {
            const { getImageById } = await import(
              "../../services/imageService"
            );
            const imageData = await getImageById(existing.logo.url);
            if (!imageData || !imageData.startsWith("data:image")) {
              console.warn(
                "Invalid logo image ID detected:",
                existing.logo.url
              );
              console.warn("Clearing invalid image ID from config");
              existing.logo.url = ""; // Clear invalid image ID
            }
          } catch (validationError) {
            console.error("Error validating logo image:", validationError);
            console.warn("Clearing potentially invalid image ID");
            existing.logo.url = ""; // Clear on validation error
          }
        }

        setConfig(existing);
        setOriginalConfig(JSON.parse(JSON.stringify(existing)));
        setLivePreviewData(existing);
      } else {
        // If no config yet, start with defaults
        const defaultConfig = {
          backgroundColor: "#333494",
          logo: {
            url: "/assets/Logo.png",
            width: 203,
            height: 78.65,
            alt: "UBC",
          },
          navigationLinks: [],
          contact: {
            email: {
              label: "Email",
              value: "info@theubc.com",
              href: "mailto:info@theubc.com",
            },
            phone: {
              label: "Phone",
              value: "+91 95878 35849",
              href: "tel:+919587835849",
            },
          },
          slogan: {
            text: "Crafting purity,\npreserving taste.",
            fontFamily: "Inter",
            fontSize: 48,
            fontWeight: 500,
            color: "#FFFFFF",
            lineHeight: 106,
            letterSpacing: -0.05,
            textTransform: "lowercase",
          },
          socialMedia: [
            {
              id: "linkedin",
              name: "LinkedIn",
              url: "https://linkedin.com",
              icon: "linkedin",
            },
          ],
          addresses: [
            {
              id: "corporate",
              heading: "Corporate Office",
              text: "H.No. 8-2-334/60 & 61,\nRoad No. 5, Banjara Hills,\nHyderabad-500034,\nTelangana.",
              fontFamily: "Inter",
              fontSize: 12,
              fontWeight: 400,
              color: "#C9D2FF",
              lineHeight: 140,
            },
            {
              id: "main",
              heading: "Main Office",
              text: "Sy. No 810 to 812 & 820, 821,\nVillage & Mandal :\nGummadidala-502313, District:\nSangareddy- Telangana.",
              fontFamily: "Inter",
              fontSize: 12,
              fontWeight: 400,
              color: "#C9D2FF",
              lineHeight: 140,
            },
          ],
          bottomBar: {
            developedBy: {
              text: "Designed & Developed by",
              company: "WikiWakyWoo",
              url: "https://www.wikiwakywoo.com/",
              fontFamily: "Inter",
              fontSize: 10.6,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: 17.5,
            },
            copyright: {
              text: "All Rights Reserved, United Brothers Company (UBC)",
              fontFamily: "Inter",
              fontSize: 10.6,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: 17.5,
            },
            legalLinks: [
              {
                id: "privacy",
                text: "Privacy policy",
                url: "/privacy",
              },
              {
                id: "cookies",
                text: "Cookies",
                url: "/cookies",
              },
            ],
          },
          dimensions: {
            desktop: {
              paddingTop: 72,
              paddingBottom: 24,
              minHeight: 574,
              logoWidth: 203,
              logoHeight: 78.65,
              gridColumns: "520px 260px 320px",
              columnGap: 64,
              rowGap: 48,
            },
            tablet: {
              paddingTop: 64,
              paddingBottom: 24,
              logoWidth: 190,
              logoHeight: 73.5,
              columnGap: 40,
              rowGap: 36,
            },
            mobile: {
              paddingTop: 56,
              paddingBottom: 20,
              logoWidth: 150,
              logoHeight: 58,
              columnGap: 24,
              rowGap: 32,
            },
            smallMobile: {
              paddingTop: 48,
              paddingBottom: 16,
              logoWidth: 150,
              logoHeight: 58,
              columnGap: 16,
              rowGap: 24,
            },
          },
        };
        setConfig(defaultConfig);
        setOriginalConfig(JSON.parse(JSON.stringify(defaultConfig)));
        setLivePreviewData(defaultConfig);
      }
    } catch (err) {
      console.error("Error loading footer config:", err);
      setError("Failed to load footer settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updater) => {
    setConfig((prev) => {
      const base = prev || {};
      const updated = typeof updater === "function" ? updater(base) : updater;
      const newConfig = { ...base, ...updated };
      // Update live preview data
      setLivePreviewData(newConfig);
      return newConfig;
    });
  };

  const hasUnsavedChanges = () => {
    if (!config || !originalConfig) return false;
    return JSON.stringify(config) !== JSON.stringify(originalConfig);
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Load navigation items before saving
      const items = await getNavigationItems();
      const topLevelLinks = items
        .filter((item) => item.type === "link")
        .map((item) => ({
          label: item.label,
          path: item.path,
        }));

      const configToSave = {
        ...config,
        navigationLinks: topLevelLinks,
      };

      await saveFooterConfig(configToSave);
      setOriginalConfig(JSON.parse(JSON.stringify(configToSave)));
      setConfig(configToSave);
      setLivePreviewData(configToSave);
      setSuccess("Footer settings saved successfully!");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving footer config:", err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    const confirm = window.confirm(
      "This will import the default footer configuration from the live site.\n\n" +
        "This will overwrite your current settings. Continue?"
    );

    if (!confirm) return;

    try {
      setImporting(true);
      setError(null);
      const imported = await importFooterFromLive();
      setConfig(imported);
      setOriginalConfig(JSON.parse(JSON.stringify(imported)));
      setLivePreviewData(imported);
      setSuccess("Footer imported successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error importing footer:", err);
      setError(`Failed to import: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleLogoChange = async (imageUrl) => {
    // If empty string, clear the logo
    if (!imageUrl || imageUrl.trim() === "") {
      updateConfig((prev) => ({
        ...prev,
        logo: {
          ...(prev.logo || {}),
          url: "",
        },
      }));
      return;
    }

    // Validate the image ID exists if it's not a URL
    if (!imageUrl.startsWith("data:") && !imageUrl.startsWith("http")) {
      try {
        const { getImageById } = await import("../../services/imageService");
        const imageData = await getImageById(imageUrl);
        if (!imageData || !imageData.startsWith("data:image")) {
          console.error("Invalid image ID:", imageUrl);
          alert(
            "The selected image could not be found. Please select a different image."
          );
          return;
        }
      } catch (error) {
        console.error("Error validating image:", error);
        alert("Error validating image. Please try selecting the image again.");
        return;
      }
    }

    updateConfig((prev) => ({
      ...prev,
      logo: {
        ...(prev.logo || {}),
        url: imageUrl,
      },
    }));
  };

  const handleSocialMediaChange = (index, field, value) => {
    updateConfig((prev) => {
      const social = [...(prev.socialMedia || [])];
      social[index] = {
        ...social[index],
        [field]: value,
      };
      return { ...prev, socialMedia: social };
    });
  };

  const handleAddSocialMedia = () => {
    updateConfig((prev) => ({
      ...prev,
      socialMedia: [
        ...(prev.socialMedia || []),
        {
          id: `social-${Date.now()}`,
          name: "LinkedIn",
          url: "",
          icon: "linkedin",
        },
      ],
    }));
  };

  const handleDeleteSocialMedia = (index) => {
    updateConfig((prev) => {
      const social = [...(prev.socialMedia || [])];
      social.splice(index, 1);
      return { ...prev, socialMedia: social };
    });
  };

  const handleAddressChange = (index, field, value) => {
    updateConfig((prev) => {
      const addresses = [...(prev.addresses || [])];
      addresses[index] = {
        ...addresses[index],
        [field]: value,
      };
      return { ...prev, addresses };
    });
  };

  const handleAddAddress = () => {
    updateConfig((prev) => ({
      ...prev,
      addresses: [
        ...(prev.addresses || []),
        {
          id: `address-${Date.now()}`,
          heading: "",
          text: "",
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: 400,
          color: "#C9D2FF",
          lineHeight: 140,
        },
      ],
    }));
  };

  const handleDeleteAddress = (index) => {
    updateConfig((prev) => {
      const addresses = [...(prev.addresses || [])];
      addresses.splice(index, 1);
      return { ...prev, addresses };
    });
  };

  const handleLegalLinkChange = (index, field, value) => {
    updateConfig((prev) => {
      const links = [...(prev.bottomBar?.legalLinks || [])];
      links[index] = {
        ...links[index],
        [field]: value,
      };
      return {
        ...prev,
        bottomBar: {
          ...(prev.bottomBar || {}),
          legalLinks: links,
        },
      };
    });
  };

  const handleAddLegalLink = () => {
    updateConfig((prev) => ({
      ...prev,
      bottomBar: {
        ...(prev.bottomBar || {}),
        legalLinks: [
          ...(prev.bottomBar?.legalLinks || []),
          {
            id: `legal-${Date.now()}`,
            text: "",
            url: "",
          },
        ],
      },
    }));
  };

  const handleDeleteLegalLink = (index) => {
    updateConfig((prev) => {
      const links = [...(prev.bottomBar?.legalLinks || [])];
      links.splice(index, 1);
      return {
        ...prev,
        bottomBar: {
          ...(prev.bottomBar || {}),
          legalLinks: links,
        },
      };
    });
  };

  return (
    <AdminLayout currentPage="footer">
      <div className="footer-management">
        <div className="footer-management-header">
          <div>
            <h1 className="admin-heading-1">Footer Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              Manage your website footer: logo, navigation links, contact info,
              social media, addresses, and more.
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleImport}
              className="admin-btn admin-btn-secondary"
              disabled={importing || loading}
            >
              {importing ? "📥 Importing..." : "📥 Import from Live Site"}
            </button>
            {hasUnsavedChanges() && (
              <button
                onClick={loadConfig}
                className="admin-btn admin-btn-secondary"
                disabled={saving || loading || !config}
              >
                ❌ Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className={`admin-btn admin-btn-primary ${
                hasUnsavedChanges() ? "has-changes" : ""
              }`}
              disabled={saving || loading || !config}
            >
              {saving
                ? "💾 Saving..."
                : hasUnsavedChanges()
                ? "💾 Save Changes"
                : "💾 Save Settings"}
            </button>
          </div>
        </div>

        {success && (
          <div className="admin-alert admin-alert-success">
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              ×
            </button>
          </div>
        )}

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

        {loading || !config ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading footer settings...</p>
          </div>
        ) : (
          <div className="footer-management-split-layout">
            {/* Left Side: Live Preview */}
            <div className="split-preview-panel">
              <div className="preview-header">
                <div>
                  <h2 className="admin-heading-3">Live Preview</h2>
                  <p className="admin-text-sm">
                    See changes in real-time as you edit
                  </p>
                </div>
                <div className="preview-controls">
                  <button
                    onClick={() => setLivePreviewData(config)}
                    className="admin-btn admin-btn-secondary"
                    title="Refresh preview"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              <div className="split-preview-container">
                <LiveFooterPreview footerData={livePreviewData || config} />
              </div>
            </div>

            {/* Right Side: Editor */}
            <div className="split-editor-panel">
              <div className="footer-editor admin-card">
                {/* Background Color */}
                <div className="form-section">
                  <h3 className="section-title">Background Color</h3>
                  <div className="form-group">
                    <label className="admin-label">Footer Background</label>
                    <small className="form-hint">
                      Set the background color for the entire footer. Use the
                      color picker or enter a hex code (e.g., #333494).
                    </small>
                    <div className="form-row">
                      <input
                        type="color"
                        className="admin-input"
                        style={{ height: "40px", width: "80px" }}
                        value={config.backgroundColor || "#333494"}
                        onChange={(e) =>
                          updateConfig({ backgroundColor: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={config.backgroundColor || "#333494"}
                        onChange={(e) =>
                          updateConfig({ backgroundColor: e.target.value })
                        }
                        placeholder="#333494"
                      />
                    </div>
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Background Color"}
                    </button>
                  </div>
                </div>

                {/* Logo */}
                <div className="form-section">
                  <h3 className="section-title">Logo</h3>
                  <div className="form-group">
                    <label className="admin-label">Logo Image</label>
                    <small className="form-hint">
                      Select the logo image that will appear at the top of the
                      footer. You can choose from uploaded images or use a URL.
                    </small>
                    <ImageSelector
                      value={config.logo?.url || ""}
                      onChange={handleLogoChange}
                      label="Select Footer Logo"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">Logo Width (px)</label>
                      <small className="form-hint">
                        Set the width of the logo in pixels. This controls how
                        wide the logo appears in the footer.
                      </small>
                      <input
                        type="number"
                        className="admin-input"
                        value={config.logo?.width || 203}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            logo: {
                              ...(prev.logo || {}),
                              width: parseInt(e.target.value) || 203,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Logo Height (px)</label>
                      <small className="form-hint">
                        Set the height of the logo in pixels. This controls how
                        tall the logo appears in the footer.
                      </small>
                      <input
                        type="number"
                        className="admin-input"
                        value={config.logo?.height || 78.65}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            logo: {
                              ...(prev.logo || {}),
                              height: parseFloat(e.target.value) || 78.65,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Logo"}
                    </button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="form-section">
                  <h3 className="section-title">Navigation Links</h3>
                  <p className="form-hint" style={{ marginBottom: "16px" }}>
                    Navigation links are automatically synced from Navigation
                    Management. Changes made there will reflect here.
                  </p>
                  <div className="form-group">
                    <label className="admin-label">Current Links</label>
                    <div className="navigation-links-preview">
                      {navigationItems.length > 0 ? (
                        navigationItems.map((item, index) => (
                          <div key={index} className="nav-link-item">
                            <span className="nav-link-label">{item.label}</span>
                            <span className="nav-link-path">{item.path}</span>
                          </div>
                        ))
                      ) : (
                        <p className="form-hint">
                          No navigation links found. Add links in Navigation
                          Management.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Navigation Links"}
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="form-section">
                  <h3 className="section-title">Contact Information</h3>
                  <div className="form-group">
                    <label className="admin-label">Email Label</label>
                    <small className="form-hint">
                      The text label displayed before the email address (e.g.,
                      "Email", "Contact Us").
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.contact?.email?.label || "Email"}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          contact: {
                            ...(prev.contact || {}),
                            email: {
                              ...(prev.contact?.email || {}),
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Email Address</label>
                    <small className="form-hint">
                      The actual email address that will be displayed and used
                      for the mailto link. Users can click to send an email.
                    </small>
                    <input
                      type="email"
                      className="admin-input"
                      value={config.contact?.email?.value || ""}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          contact: {
                            ...(prev.contact || {}),
                            email: {
                              ...(prev.contact?.email || {}),
                              value: e.target.value,
                              href: `mailto:${e.target.value}`,
                            },
                          },
                        }))
                      }
                      placeholder="info@theubc.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Phone Label</label>
                    <small className="form-hint">
                      The text label displayed before the phone number (e.g.,
                      "Phone", "Call Us").
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.contact?.phone?.label || "Phone"}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          contact: {
                            ...(prev.contact || {}),
                            phone: {
                              ...(prev.contact?.phone || {}),
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Phone Number</label>
                    <small className="form-hint">
                      The phone number that will be displayed and used for the
                      tel link. Users can click to call on mobile devices.
                    </small>
                    <input
                      type="tel"
                      className="admin-input"
                      value={config.contact?.phone?.value || ""}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          contact: {
                            ...(prev.contact || {}),
                            phone: {
                              ...(prev.contact?.phone || {}),
                              value: e.target.value,
                              href: `tel:${e.target.value.replace(/\s/g, "")}`,
                            },
                          },
                        }))
                      }
                      placeholder="+91 95878 35849"
                    />
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Contact Info"}
                    </button>
                  </div>
                </div>

                {/* Slogan */}
                <div className="form-section">
                  <h3 className="section-title">Slogan</h3>
                  <div className="form-group">
                    <InlineFontEditor
                      label="Slogan Text (supports inline font formatting)"
                      value={config.slogan?.text || ""}
                      onChange={(value) =>
                        updateConfig((prev) => ({
                          ...prev,
                          slogan: {
                            ...(prev.slogan || {}),
                            text: value,
                          },
                        }))
                      }
                      placeholder="Crafting purity,\npreserving taste."
                      helpText="Use Enter for line breaks. Apply formatting to style any word or phrase."
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">Font Family</label>
                      <small className="form-hint">
                        Choose the font family for the slogan text. This affects
                        the overall typography style.
                      </small>
                      <select
                        className="admin-select"
                        value={
                          config.slogan?.fontFamily ||
                          "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
                        }
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            slogan: {
                              ...(prev.slogan || {}),
                              fontFamily: e.target.value,
                            },
                          }))
                        }
                        disabled={!isSuperAdmin}
                        style={{
                          opacity: isSuperAdmin ? 1 : 0.6,
                          cursor: isSuperAdmin ? "pointer" : "not-allowed",
                        }}
                      >
                        <option value="">Default (Inherit)</option>
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
                      {!isSuperAdmin && (
                        <small className="form-hint" style={{ fontStyle: "italic", color: "#64748b" }}>
                          Font selection is restricted to Super Admin. Using default font.
                        </small>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Font Size (px)</label>
                      <small className="form-hint">
                        Set the size of the slogan text in pixels. Larger values
                        make the text more prominent.
                      </small>
                      <input
                        type="number"
                        className="admin-input"
                        value={config.slogan?.fontSize || 48}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            slogan: {
                              ...(prev.slogan || {}),
                              fontSize: parseInt(e.target.value) || 48,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">Font Weight</label>
                      <small className="form-hint">
                        Control the thickness of the text. Higher values
                        (600-700) make text bolder, lower values (400) make it
                        lighter.
                      </small>
                      <select
                        className="admin-select"
                        value={
                          showCustomWeight || (config.slogan?.fontWeight && 
                          ![400, 500, 600, 700].includes(config.slogan.fontWeight))
                            ? "custom"
                            : (config.slogan?.fontWeight || 500)
                        }
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setShowCustomWeight(true);
                            setCustomWeight(config.slogan?.fontWeight?.toString() || "");
                          } else {
                            setShowCustomWeight(false);
                            updateConfig((prev) => ({
                              ...prev,
                              slogan: {
                                ...(prev.slogan || {}),
                                fontWeight: parseInt(e.target.value) || 500,
                              },
                            }));
                          }
                        }}
                      >
                        <option value={400}>400 (Normal)</option>
                        <option value={500}>500 (Medium)</option>
                        <option value={600}>600 (Semi Bold)</option>
                        <option value={700}>700 (Bold)</option>
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
                                updateConfig((prev) => ({
                                  ...prev,
                                  slogan: {
                                    ...(prev.slogan || {}),
                                    fontWeight: parseInt(customWeight) || 500,
                                  },
                                }));
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
                                updateConfig((prev) => ({
                                  ...prev,
                                  slogan: {
                                    ...(prev.slogan || {}),
                                    fontWeight: parseInt(customWeight) || 500,
                                  },
                                }));
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
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Text Color</label>
                      <small className="form-hint">
                        Set the color of the slogan text. Use the color picker
                        or enter a hex code.
                      </small>
                      <div className="form-row">
                        <input
                          type="color"
                          className="admin-input"
                          style={{ height: "40px", width: "80px" }}
                          value={config.slogan?.color || "#FFFFFF"}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              slogan: {
                                ...(prev.slogan || {}),
                                color: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          type="text"
                          className="admin-input"
                          value={config.slogan?.color || "#FFFFFF"}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              slogan: {
                                ...(prev.slogan || {}),
                                color: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Slogan"}
                    </button>
                  </div>
                </div>

                {/* Social Media */}
                <div className="form-section">
                  <div className="section-header">
                    <h3 className="section-title">Social Media Links</h3>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleAddSocialMedia}
                    >
                      + Add Social Link
                    </button>
                  </div>
                  {(config.socialMedia || []).map((social, index) => (
                    <div key={social.id || index} className="array-item-editor">
                      <div className="array-item-header">
                        <h5>Social Link {index + 1}</h5>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDeleteSocialMedia(index)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="form-group">
                        <label className="admin-label">
                          Social Media Platform
                        </label>
                        <small className="form-hint">
                          Select the social media platform. This determines
                          which icon will be displayed in the footer.
                        </small>
                        <select
                          className="admin-select"
                          value={social.icon || "linkedin"}
                          onChange={(e) =>
                            handleSocialMediaChange(
                              index,
                              "icon",
                              e.target.value
                            )
                          }
                        >
                          <option value="linkedin">LinkedIn</option>
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                          <option value="youtube">YouTube</option>
                          <option value="pinterest">Pinterest</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="admin-label">Platform Name</label>
                        <small className="form-hint">
                          Enter the display name for this social media platform
                          (e.g., "LinkedIn", "Facebook", "Twitter").
                        </small>
                        <input
                          type="text"
                          className="admin-input"
                          value={social.name || ""}
                          onChange={(e) =>
                            handleSocialMediaChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="LinkedIn, Facebook, Twitter, etc."
                        />
                      </div>
                      <div className="form-group">
                        <label className="admin-label">URL</label>
                        <small className="form-hint">
                          Enter the full URL to your social media profile or
                          page. This is where users will be directed when they
                          click the icon.
                        </small>
                        <input
                          type="url"
                          className="admin-input"
                          value={social.url || ""}
                          onChange={(e) =>
                            handleSocialMediaChange(
                              index,
                              "url",
                              e.target.value
                            )
                          }
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Social Media"}
                    </button>
                  </div>
                </div>

                {/* Addresses */}
                <div className="form-section">
                  <div className="section-header">
                    <h3 className="section-title">Addresses</h3>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleAddAddress}
                    >
                      + Add Address
                    </button>
                  </div>
                  {(config.addresses || []).map((address, index) => (
                    <div
                      key={address.id || index}
                      className="array-item-editor"
                    >
                      <div className="array-item-header">
                        <h5>Address {index + 1}</h5>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDeleteAddress(index)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="form-group">
                        <InlineFontEditor
                          label="Heading (supports inline font formatting)"
                          value={address.heading || ""}
                          onChange={(value) =>
                            handleAddressChange(index, "heading", value)
                          }
                          placeholder="Corporate Office"
                        />
                        <small className="form-hint">
                          Enter the heading for this address (e.g., "Corporate
                          Office", "Main Office"). You can apply formatting to
                          specific words.
                        </small>
                      </div>
                      <div className="form-group">
                        <InlineFontEditor
                          label="Address Text (line breaks + formatting)"
                          value={address.text || ""}
                          onChange={(value) =>
                            handleAddressChange(index, "text", value)
                          }
                          placeholder="Address here..."
                        />
                        <small className="form-hint">
                          Enter the full address text. Use Enter for line
                          breaks. You can apply formatting to specific parts of
                          the address.
                        </small>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="admin-label">Font Size (px)</label>
                          <small className="form-hint">
                            Set the font size for the address text in pixels.
                            This applies to both the heading and address text.
                          </small>
                          <input
                            type="number"
                            className="admin-input"
                            value={address.fontSize || 12}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "fontSize",
                                parseInt(e.target.value) || 12
                              )
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label className="admin-label">Text Color</label>
                          <small className="form-hint">
                            Set the color of the address text. Use the color
                            picker or enter a hex code.
                          </small>
                          <div className="form-row">
                            <input
                              type="color"
                              className="admin-input"
                              style={{ height: "40px", width: "80px" }}
                              value={address.color || "#C9D2FF"}
                              onChange={(e) =>
                                handleAddressChange(
                                  index,
                                  "color",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="text"
                              className="admin-input"
                              value={address.color || "#C9D2FF"}
                              onChange={(e) =>
                                handleAddressChange(
                                  index,
                                  "color",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Addresses"}
                    </button>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="form-section">
                  <h3 className="section-title">Bottom Bar</h3>

                  {/* Developed By */}
                  <div className="form-group">
                    <label className="admin-label">Developed By Text</label>
                    <small className="form-hint">
                      The text that appears before the company name (e.g.,
                      "Designed & Developed by").
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={config.bottomBar?.developedBy?.text || ""}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          bottomBar: {
                            ...(prev.bottomBar || {}),
                            developedBy: {
                              ...(prev.bottomBar?.developedBy || {}),
                              text: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Designed & Developed by"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">Company Name</label>
                      <small className="form-hint">
                        The name of the company that developed the website. This
                        will be displayed as a clickable link.
                      </small>
                      <input
                        type="text"
                        className="admin-input"
                        value={config.bottomBar?.developedBy?.company || ""}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            bottomBar: {
                              ...(prev.bottomBar || {}),
                              developedBy: {
                                ...(prev.bottomBar?.developedBy || {}),
                                company: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="WikiWakyWoo"
                      />
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Company URL</label>
                      <small className="form-hint">
                        The URL where users will be directed when they click the
                        company name. Enter the full website address.
                      </small>
                      <input
                        type="url"
                        className="admin-input"
                        value={config.bottomBar?.developedBy?.url || ""}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            bottomBar: {
                              ...(prev.bottomBar || {}),
                              developedBy: {
                                ...(prev.bottomBar?.developedBy || {}),
                                url: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="https://www.wikiwakywoo.com/"
                      />
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="form-group">
                    <InlineFontEditor
                      label="Copyright Text (supports inline font formatting)"
                      value={config.bottomBar?.copyright?.text || ""}
                      onChange={(value) =>
                        updateConfig((prev) => ({
                          ...prev,
                          bottomBar: {
                            ...(prev.bottomBar || {}),
                            copyright: {
                              ...(prev.bottomBar?.copyright || {}),
                              text: value,
                            },
                          },
                        }))
                      }
                      placeholder="All Rights Reserved, United Brothers Company (UBC)"
                    />
                    <small className="form-hint">
                      Enter the copyright notice text. You can apply formatting
                      to specific words or phrases (e.g., make the company name
                      bold).
                    </small>
                  </div>

                  {/* Legal Links */}
                  <div className="form-section">
                    <div className="section-header">
                      <h4 className="section-subtitle">Legal Links</h4>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleAddLegalLink}
                      >
                        + Add Link
                      </button>
                    </div>
                    {(config.bottomBar?.legalLinks || []).map((link, index) => (
                      <div key={link.id || index} className="array-item-editor">
                        <div className="array-item-header">
                          <h5>Link {index + 1}</h5>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDeleteLegalLink(index)}
                          >
                            Delete
                          </button>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="admin-label">Link Text</label>
                            <small className="form-hint">
                              The text that will be displayed for this legal
                              link (e.g., "Privacy policy", "Terms of Service").
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={link.text || ""}
                              onChange={(e) =>
                                handleLegalLinkChange(
                                  index,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder="Privacy policy"
                            />
                          </div>
                          <div className="form-group">
                            <label className="admin-label">URL</label>
                            <small className="form-hint">
                              The URL path where this link will navigate. Use
                              relative paths (e.g., "/privacy") or full URLs.
                            </small>
                            <input
                              type="text"
                              className="admin-input"
                              value={link.url || ""}
                              onChange={(e) =>
                                handleLegalLinkChange(
                                  index,
                                  "url",
                                  e.target.value
                                )
                              }
                              placeholder="/privacy"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="section-save-button">
                    <button
                      onClick={handleSave}
                      className="admin-btn admin-btn-primary"
                      disabled={saving || loading || !config}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Bottom Bar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
