import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import InlineFontEditor from "../../components/BrandPageEditor/InlineFontEditor";
import {
  getCookiesPolicy,
  saveCookiesPolicy,
  importCookiesPolicyFromLive,
  getDefaultCookiesPolicy,
} from "../../services/cookiesPolicyService";
import { useAuth } from "../../auth/useAuth";
import "./CookiesPolicyManagement.css";

export default function CookiesPolicyManagement() {
  const { basePath } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCookiesPolicy();
      setPolicy(data);
    } catch (err) {
      console.error("Error loading cookies policy:", err);
      setError("Failed to load cookies policy. Please try again.");
      // Load default on error
      setPolicy(getDefaultCookiesPolicy());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await saveCookiesPolicy(policy);
      setSuccess("Cookies Policy saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving cookies policy:", err);
      setError("Failed to save cookies policy. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);
      const imported = await importCookiesPolicyFromLive();
      setPolicy(imported);
      setSuccess("Cookies Policy imported from live site successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error importing cookies policy:", err);
      setError("Failed to import cookies policy. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handleTagChange = (field, value) => {
    setPolicy((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSectionChange = (sectionId, field, value) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      ),
    }));
  };

  const handleSectionContentChange = (sectionId, value) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, content: value } : section
      ),
    }));
  };

  const handleListItemChange = (sectionId, itemIndex, value) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId && section.listItems) {
          const updatedItems = [...section.listItems];
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], text: value };
          return { ...section, listItems: updatedItems };
        }
        return section;
      }),
    }));
  };

  const handleAddListItem = (sectionId) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            listItems: [
              ...(section.listItems || []),
              { text: "", order: (section.listItems?.length || 0) + 1 },
            ],
          };
        }
        return section;
      }),
    }));
  };

  const handleDeleteListItem = (sectionId, itemIndex) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId && section.listItems) {
          return {
            ...section,
            listItems: section.listItems.filter((_, i) => i !== itemIndex),
          };
        }
        return section;
      }),
    }));
  };

  const handleContactInfoChange = (field, value) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === "contact" && section.contactInfo) {
          return {
            ...section,
            contactInfo: {
              ...section.contactInfo,
              [field]: value,
            },
          };
        }
        return section;
      }),
    }));
  };

  const handleAddSection = () => {
    setPolicy((prev) => {
      const maxOrder = Math.max(...prev.sections.map((s) => s.order || 0), 0);
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: `section-${Date.now()}`,
            title: "New Section",
            content: "",
            order: maxOrder + 1,
          },
        ],
      };
    });
  };

  const handleDeleteSection = (sectionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? This action cannot be undone."
      )
    ) {
      setPolicy((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      }));
    }
  };

  const handleReorderSection = (sectionId, direction) => {
    setPolicy((prev) => {
      const sections = [...prev.sections];
      const index = sections.findIndex((s) => s.id === sectionId);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === sections.length - 1)
      ) {
        return prev;
      }
      const newIndex = direction === "up" ? index - 1 : index + 1;
      [sections[index], sections[newIndex]] = [
        sections[newIndex],
        sections[index],
      ];
      // Update order values
      sections.forEach((section, i) => {
        section.order = i + 1;
      });
      return { ...prev, sections };
    });
  };

  if (loading) {
    return (
      <AdminLayout currentPage="cookies-policy" basePath={basePath}>
        <div className="admin-loading">Loading cookies policy...</div>
      </AdminLayout>
    );
  }

  if (!policy) {
    return (
      <AdminLayout currentPage="cookies-policy" basePath={basePath}>
        <div className="admin-error">Failed to load cookies policy.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="cookies-policy" basePath={basePath}>
      <div className="cookies-policy-management">
        <div className="admin-page-header">
          <h1 className="admin-heading-1">Cookies Policy Management</h1>
          <p className="admin-text-sm admin-mb-lg">
            Manage the content of your Cookies Policy page. Edit sections, add
            new content, and update contact information.
          </p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">{error}</div>
        )}
        {success && (
          <div className="admin-alert admin-alert-success">{success}</div>
        )}

        <div className="admin-card admin-mb-md">
          <div className="admin-card-header">
            <h2 className="admin-heading-2">Tag Settings</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label className="admin-label">
                Tag Star
                <input
                  type="text"
                  className="admin-input"
                  value={policy.tagStar || "★"}
                  onChange={(e) => handleTagChange("tagStar", e.target.value)}
                  placeholder="★"
                />
              </label>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">
                Tag Text
                <input
                  type="text"
                  className="admin-input"
                  value={policy.tagText || "COOKIES POLICY"}
                  onChange={(e) => handleTagChange("tagText", e.target.value)}
                  placeholder="COOKIES POLICY"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="admin-card admin-mb-md">
          <div className="admin-card-header">
            <h2 className="admin-heading-2">Policy Sections</h2>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleAddSection}
            >
              + Add Section
            </button>
          </div>
          <div className="admin-card-body">
            {policy.sections
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((section, index) => (
                <div key={section.id} className="section-editor admin-mb-lg">
                  <div className="section-editor-header">
                    <div className="section-controls">
                      <button
                        className="admin-btn-icon"
                        onClick={() => handleReorderSection(section.id, "up")}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="admin-btn-icon"
                        onClick={() =>
                          handleReorderSection(section.id, "down")
                        }
                        disabled={index === policy.sections.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      Delete Section
                    </button>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">
                      Section Title
                      <input
                        type="text"
                        className="admin-input"
                        value={section.title || ""}
                        onChange={(e) =>
                          handleSectionChange(section.id, "title", e.target.value)
                        }
                        placeholder="Section Title"
                      />
                    </label>
                  </div>

                  <div className="admin-form-group">
                    <InlineFontEditor
                      label="Section Content (supports inline font formatting)"
                      value={section.content || ""}
                      onChange={(value) =>
                        handleSectionContentChange(section.id, value)
                      }
                      placeholder="Section content..."
                      helpText="Use the formatting tools to change font, color, size, or weight for any word or phrase in the content."
                    />
                  </div>

                  {section.additionalContent && (
                    <div className="admin-form-group">
                      <InlineFontEditor
                        label="Additional Content (supports inline font formatting)"
                        value={section.additionalContent || ""}
                        onChange={(value) =>
                          handleSectionChange(
                            section.id,
                            "additionalContent",
                            value
                          )
                        }
                        placeholder="Additional content..."
                        helpText="Use formatting tools to style any word or phrase in the additional content."
                      />
                    </div>
                  )}

                  {section.listItems && section.listItems.length > 0 && (
                    <div className="admin-form-group">
                      <label className="admin-label">List Items</label>
                      {section.listItems.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="list-item-editor admin-mb-sm"
                        >
                          <div className="admin-input-group" style={{ width: '100%', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <InlineFontEditor
                                label={`List Item ${itemIndex + 1} (supports inline font formatting)`}
                                value={item.text || ""}
                                onChange={(value) =>
                                  handleListItemChange(
                                    section.id,
                                    itemIndex,
                                    value
                                  )
                                }
                                placeholder="List item text..."
                                helpText="Apply formatting to style any word or phrase in this list item."
                              />
                            </div>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() =>
                                handleDeleteListItem(section.id, itemIndex)
                              }
                              style={{ marginTop: '24px', alignSelf: 'flex-start' }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handleAddListItem(section.id)}
                      >
                        + Add List Item
                      </button>
                    </div>
                  )}

                  {section.id === "contact" && section.contactInfo && (
                    <div className="admin-form-group">
                      <h3 className="admin-heading-3">Contact Information</h3>
                      <div className="admin-form-group">
                        <label className="admin-label">
                          Email
                          <input
                            type="email"
                            className="admin-input"
                            value={section.contactInfo.email || ""}
                            onChange={(e) =>
                              handleContactInfoChange("email", e.target.value)
                            }
                            placeholder="marketing@soilkingfoods.com"
                          />
                        </label>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">
                          Phone
                          <input
                            type="text"
                            className="admin-input"
                            value={section.contactInfo.phone || ""}
                            onChange={(e) =>
                              handleContactInfoChange("phone", e.target.value)
                            }
                            placeholder="+91 8143150953 | 04023399533"
                          />
                        </label>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-label">
                          Address
                          <textarea
                            className="admin-textarea"
                            rows="2"
                            value={section.contactInfo.address || ""}
                            onChange={(e) =>
                              handleContactInfoChange("address", e.target.value)
                            }
                            placeholder="Full address..."
                          />
                        </label>
                      </div>
                      {section.contactInfo.contactPageLink && (
                        <div className="admin-form-group">
                          <label className="admin-label">
                            Contact Page Link
                            <input
                              type="text"
                              className="admin-input"
                              value={section.contactInfo.contactPageLink || ""}
                              onChange={(e) =>
                                handleContactInfoChange(
                                  "contactPageLink",
                                  e.target.value
                                )
                              }
                              placeholder="/contact"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="admin-form-group">
                      <label className="admin-label">Subsections</label>
                      {section.subsections.map((subsection, subIndex) => (
                        <div
                          key={subsection.id || subIndex}
                          className="subsection-editor admin-mb-md"
                        >
                          <div className="admin-form-group">
                            <label className="admin-label">
                              Subsection Title
                              <input
                                type="text"
                                className="admin-input"
                                value={subsection.title || ""}
                                onChange={(e) => {
                                  setPolicy((prev) => ({
                                    ...prev,
                                    sections: prev.sections.map((s) => {
                                      if (s.id === section.id) {
                                        const updatedSubsections = [
                                          ...(s.subsections || []),
                                        ];
                                        updatedSubsections[subIndex] = {
                                          ...updatedSubsections[subIndex],
                                          title: e.target.value,
                                        };
                                        return {
                                          ...s,
                                          subsections: updatedSubsections,
                                        };
                                      }
                                      return s;
                                    }),
                                  }));
                                }}
                                placeholder="Subsection title..."
                              />
                            </label>
                          </div>
                          <div className="admin-form-group">
                            <InlineFontEditor
                              label="Subsection Content (supports inline font formatting)"
                              value={subsection.content || ""}
                              onChange={(value) => {
                                setPolicy((prev) => ({
                                  ...prev,
                                  sections: prev.sections.map((s) => {
                                    if (s.id === section.id) {
                                      const updatedSubsections = [
                                        ...(s.subsections || []),
                                      ];
                                      updatedSubsections[subIndex] = {
                                        ...updatedSubsections[subIndex],
                                        content: value,
                                      };
                                      return {
                                        ...s,
                                        subsections: updatedSubsections,
                                      };
                                    }
                                    return s;
                                  }),
                                }));
                              }}
                              placeholder="Subsection content..."
                              helpText="Use formatting tools to style any word or phrase in the subsection content."
                            />
                          </div>
                          {subsection.listItems &&
                            subsection.listItems.length > 0 && (
                              <div className="admin-form-group">
                                <label className="admin-label">
                                  Subsection List Items
                                </label>
                                {subsection.listItems.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className="list-item-editor admin-mb-sm"
                                  >
                                    <div className="admin-input-group" style={{ width: '100%', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                      <div style={{ flex: 1 }}>
                                        <InlineFontEditor
                                          label={`Subsection List Item ${itemIndex + 1} (supports inline font formatting)`}
                                          value={item.text || ""}
                                          onChange={(value) => {
                                            setPolicy((prev) => ({
                                              ...prev,
                                              sections: prev.sections.map((s) => {
                                                if (s.id === section.id) {
                                                  const updatedSubsections = [
                                                    ...(s.subsections || []),
                                                  ];
                                                  const updatedItems = [
                                                    ...(updatedSubsections[subIndex]
                                                      .listItems || []),
                                                  ];
                                                  updatedItems[itemIndex] = {
                                                    ...updatedItems[itemIndex],
                                                    text: value,
                                                  };
                                                  updatedSubsections[subIndex] = {
                                                    ...updatedSubsections[subIndex],
                                                    listItems: updatedItems,
                                                  };
                                                  return {
                                                    ...s,
                                                    subsections:
                                                      updatedSubsections,
                                                  };
                                                }
                                                return s;
                                              }),
                                            }));
                                          }}
                                          placeholder="List item text..."
                                          helpText="Apply formatting to style any word or phrase in this list item."
                                        />
                                      </div>
                                      <button
                                        className="admin-btn admin-btn-danger admin-btn-sm"
                                        onClick={() => {
                                          setPolicy((prev) => ({
                                            ...prev,
                                            sections: prev.sections.map((s) => {
                                              if (s.id === section.id) {
                                                const updatedSubsections = [
                                                  ...(s.subsections || []),
                                                ];
                                                updatedSubsections[subIndex] = {
                                                  ...updatedSubsections[subIndex],
                                                  listItems:
                                                    updatedSubsections[
                                                      subIndex
                                                    ].listItems.filter(
                                                      (_, i) => i !== itemIndex
                                                    ),
                                                };
                                                return {
                                                  ...s,
                                                  subsections:
                                                    updatedSubsections,
                                                };
                                              }
                                              return s;
                                            }),
                                          }));
                                        }}
                                        style={{ marginTop: '24px', alignSelf: 'flex-start' }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  className="admin-btn admin-btn-secondary admin-btn-sm"
                                  onClick={() => {
                                    setPolicy((prev) => ({
                                      ...prev,
                                      sections: prev.sections.map((s) => {
                                        if (s.id === section.id) {
                                          const updatedSubsections = [
                                            ...(s.subsections || []),
                                          ];
                                          if (
                                            !updatedSubsections[subIndex]
                                              .listItems
                                          ) {
                                            updatedSubsections[subIndex].listItems =
                                              [];
                                          }
                                          updatedSubsections[subIndex] = {
                                            ...updatedSubsections[subIndex],
                                            listItems: [
                                              ...updatedSubsections[subIndex]
                                                .listItems,
                                              { text: "" },
                                            ],
                                          };
                                          return {
                                            ...s,
                                            subsections: updatedSubsections,
                                          };
                                        }
                                        return s;
                                      }),
                                    }));
                                  }}
                                >
                                  + Add List Item
                                </button>
                              </div>
                            )}
                          {subsection.additionalContent && (
                            <div className="admin-form-group">
                              <InlineFontEditor
                                label="Additional Content (supports inline font formatting)"
                                value={subsection.additionalContent || ""}
                                onChange={(value) => {
                                  setPolicy((prev) => ({
                                    ...prev,
                                    sections: prev.sections.map((s) => {
                                      if (s.id === section.id) {
                                        const updatedSubsections = [
                                          ...(s.subsections || []),
                                        ];
                                        updatedSubsections[subIndex] = {
                                          ...updatedSubsections[subIndex],
                                          additionalContent: value,
                                        };
                                        return {
                                          ...s,
                                          subsections: updatedSubsections,
                                        };
                                      }
                                      return s;
                                    }),
                                  }));
                                }}
                                placeholder="Additional content..."
                                helpText="Use formatting tools to style any word or phrase in the additional content."
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="admin-actions">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? "Importing..." : "Import from Live Site"}
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

