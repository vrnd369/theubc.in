import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import {
  getBrandPages,
  deleteBrandPage,
  updateBrandPage,
  getBrandPage,
} from "../../services/brandPageService";
import { getBrands } from "../../services/productService";
import {
  importBrandPageFromStatic,
  importWellnessPageFromStatic,
  generateBrandPageTemplate,
} from "../../services/brandPageImportService";
import BrandPageEditor from "../../components/BrandPageEditor/BrandPageEditor";
import BrandPagePreview from "../../components/BrandPagePreview/BrandPagePreview";
import { usePermissions } from "../../auth/usePermissions";
import { resolveImageUrl } from "../../../utils/imageUtils";
import "./BrandPagesManagement.css";

export default function BrandPagesManagement() {
  const { canDelete, canCreate } = usePermissions();
  const [brandPages, setBrandPages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showCloneSelector, setShowCloneSelector] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [importing, setImporting] = useState(false);
  const [previewPage, setPreviewPage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [resolvedBrandImages, setResolvedBrandImages] = useState({});
  const [brandImageErrors, setBrandImageErrors] = useState({});
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Reset all form states on mount/refresh - this MUST run first
    // Use a function to ensure synchronous reset
    const resetStates = () => {
      setEditingPage(null);
      setShowAddForm(false);
      setShowBrandSelector(false);
      setShowTemplateSelector(false);
      setShowCloneSelector(false);
      setSelectedBrand(null);
      setPreviewPage(null);
      if (window._cloneSourcePage) {
        window._cloneSourcePage = null;
      }
    };

    // Reset immediately on mount/refresh
    resetStates();
    isInitialMount.current = true;

    // Fetch data after reset
    fetchData().then(() => {
      // Mark as no longer initial mount after data is loaded
      isInitialMount.current = false;
    });

    // Cleanup function to ensure states are cleared on unmount
    return () => {
      resetStates();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pagesData, brandsData] = await Promise.all([
        getBrandPages(),
        getBrands(),
      ]);
      setBrandPages(pagesData);
      setBrands(brandsData.filter((b) => b.enabled !== false));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load brand pages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resolve brand icons when brands change
  useEffect(() => {
    const resolveBrandImages = async () => {
      if (brands.length === 0) {
        setResolvedBrandImages({});
        return;
      }

      const imagePromises = brands.map(async (brand) => {
        if (brand.icon) {
          try {
            // Check if it's already a valid URL
            if (typeof brand.icon === 'string' && (
              brand.icon.startsWith('data:') || 
              brand.icon.startsWith('http://') || 
              brand.icon.startsWith('https://') ||
              brand.icon.startsWith('/')
            )) {
              return { id: brand.id, url: brand.icon };
            }
            
            // Otherwise, try to resolve it
            const url = await resolveImageUrl(brand.icon);
            return { id: brand.id, url: url || brand.icon }; // Fallback to original if resolution fails
          } catch (error) {
            console.error(`Error resolving icon for brand ${brand.id}:`, error);
            // Return original icon value as fallback
            return { id: brand.id, url: brand.icon };
          }
        }
        return { id: brand.id, url: null };
      });

      const results = await Promise.all(imagePromises);
      const imageMap = {};
      results.forEach(({ id, url }) => {
        if (url) {
          imageMap[id] = url;
        }
      });
      setResolvedBrandImages(imageMap);
    };

    resolveBrandImages();
  }, [brands]);

  const handleCreateNew = () => {
    setShowBrandSelector(true);
    setEditingPage(null);
    setShowAddForm(false);
  };

  const handleBrandSelected = (brand) => {
    setSelectedBrand(brand);
    setShowBrandSelector(false);
    setShowTemplateSelector(true);
  };

  const handleTemplateSelected = (templateType) => {
    if (!selectedBrand) return;

    // Mark that we're explicitly creating (not from refresh)
    isInitialMount.current = false;
    const templateData = generateBrandPageTemplate(selectedBrand, templateType);
    setEditingPage(templateData);
    setShowTemplateSelector(false);
    setShowAddForm(true);
    setSelectedBrand(null);
  };

  // eslint-disable-next-line no-unused-vars
  const handleCloneFromExisting = async (sourcePageId) => {
    try {
      const sourcePage = brandPages.find((p) => p.id === sourcePageId);
      if (!sourcePage) {
        setError("Source page not found");
        return;
      }

      // Show brand selector for the new page
      setShowBrandSelector(true);
      setEditingPage(null);
      setShowAddForm(false);

      // Store source page for cloning after brand selection
      window._cloneSourcePage = sourcePage;
    } catch (err) {
      console.error("Error preparing clone:", err);
      setError("Failed to prepare clone");
    }
  };

  const handleEdit = (page) => {
    // Mark that we're explicitly editing (not from refresh)
    isInitialMount.current = false;
    setEditingPage(page);
    setShowAddForm(true);
    setShowBrandSelector(false);
    setShowTemplateSelector(false);
  };

  const handlePreview = async (page) => {
    try {
      setLoadingPreview(true);
      // Fetch the full page data
      const fullPageData = await getBrandPage(page.id);
      setPreviewPage(fullPageData);
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Failed to load preview. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewPage(null);
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      setError("You don't have permission to delete items.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this brand page? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteBrandPage(id);
      await fetchData();
      setSuccess("Brand page deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting brand page:", err);
      setError("Error deleting brand page. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleToggleEnable = async (id, enabled) => {
    try {
      await updateBrandPage(id, { enabled });
      await fetchData();
    } catch (err) {
      console.error("Error toggling brand page:", err);
      setError("Error updating brand page. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSave = async () => {
    await fetchData();
    setEditingPage(null);
    setShowAddForm(false);
    setSuccess("Brand page saved successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCancel = () => {
    setEditingPage(null);
    setShowAddForm(false);
    setShowBrandSelector(false);
    setShowTemplateSelector(false);
    setShowCloneSelector(false);
    setSelectedBrand(null);
    setPreviewPage(null);
    window._cloneSourcePage = null;
  };

  const handleImportFromStatic = async (brandId) => {
    if (
      !window.confirm(
        `This will import the brand page for "${brandId}" from the current static page component.\n\n` +
          "If a page already exists, it will not be overwritten.\n\n" +
          "Continue?"
      )
    ) {
      return;
    }

    try {
      setImporting(true);
      setError(null);

      // Use appropriate import function based on brandId
      let result;
      if (
        brandId === "wellness" ||
        brandId.toLowerCase().includes("wellness")
      ) {
        result = await importWellnessPageFromStatic(brandId);
      } else {
        result = await importBrandPageFromStatic(brandId);
      }

      if (result.success) {
        setSuccess(result.message);
        await fetchData();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error("Error importing brand page:", err);
      setError(`Failed to import brand page: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setImporting(false);
    }
  };

  // Handle clone after brand selection
  useEffect(() => {
    // Only run if we're actively in clone mode (not on initial mount/refresh)
    // Check that we're not loading and form is not already showing
    if (
      selectedBrand &&
      window._cloneSourcePage &&
      showTemplateSelector &&
      !loading &&
      !showAddForm
    ) {
      // Clone the source page data but update brand info
      const clonedData = {
        ...window._cloneSourcePage,
        id: undefined, // Remove ID so it creates a new page
        brandId: selectedBrand.brandId || selectedBrand.id,
        brandName: selectedBrand.name,
        // Replace brand name in text fields
        hero: {
          ...window._cloneSourcePage.hero,
          title:
            window._cloneSourcePage.hero?.title?.replace(
              window._cloneSourcePage.brandName || "Soil King",
              selectedBrand.name
            ) || `${selectedBrand.name} - Rooted in Goodness`,
        },
        about: {
          ...window._cloneSourcePage.about,
          eyebrow: `★ About ${selectedBrand.name}`,
          paragraphs:
            window._cloneSourcePage.about?.paragraphs?.map((p) =>
              p.replace(
                window._cloneSourcePage.brandName || "Soil King",
                selectedBrand.name
              )
            ) || [],
        },
        why: {
          ...window._cloneSourcePage.why,
          eyebrow: `★ Why ${selectedBrand.name}`,
          paragraphs:
            window._cloneSourcePage.why?.paragraphs?.map((p) =>
              p.replace(
                window._cloneSourcePage.brandName || "Soil King",
                selectedBrand.name
              )
            ) || [],
        },
        products: {
          ...window._cloneSourcePage.products,
          title: `Explore ${selectedBrand.name} Products`,
          items:
            window._cloneSourcePage.products?.items?.map((item) => ({
              ...item,
              href:
                item.href?.replace(
                  window._cloneSourcePage.brandId || "soil-king",
                  selectedBrand.brandId || selectedBrand.id
                ) ||
                `/products?brand=${selectedBrand.brandId || selectedBrand.id}`,
            })) || [],
        },
      };

      // Mark that we're explicitly cloning (not from refresh)
      isInitialMount.current = false;
      setEditingPage(clonedData);
      setShowTemplateSelector(false);
      setShowAddForm(true);
      setSelectedBrand(null);
      window._cloneSourcePage = null;
    }
  }, [selectedBrand, showTemplateSelector, loading, showAddForm]);

  return (
    <AdminLayout currentPage="brands">
      <div className="brand-pages-management">
        <div className="brand-pages-header">
          <div>
            <h1 className="admin-heading-1">Brand Pages Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              Create and manage brand pages. Each brand can have its own
              dedicated page with custom content.
            </p>
          </div>
          <div className="header-actions">
            {brands.length > 0 && (
              <button
                onClick={() => {
                  const brandId = prompt(
                    "Enter brand ID to import (e.g., soil-king, wellness):"
                  );
                  if (brandId) {
                    handleImportFromStatic(brandId);
                  }
                }}
                className="admin-btn admin-btn-secondary"
                disabled={importing}
                title="Import from static page - enter brand ID"
              >
                {importing ? "⏳ Importing..." : "📥 Import Brand Page"}
              </button>
            )}
            {canCreate && (
              <button
                onClick={handleCreateNew}
                className="admin-btn admin-btn-primary"
                disabled={importing}
              >
                + Create New Brand Page
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button
              onClick={() => setError(null)}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="admin-alert admin-alert-success">
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Brand Selector Modal */}
        {showBrandSelector && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="admin-heading-2">Select Brand</h2>
                <button onClick={handleCancel} className="modal-close">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="admin-text-sm admin-mb-md">
                  Choose a brand to create a page for. If the brand doesn't
                  exist, create it in Product Management first.
                </p>
                <div className="brand-selector-grid">
                  {brands.map((brand) => {
                    const iconUrl = resolvedBrandImages[brand.id] || brand.icon;
                    const hasValidIcon = iconUrl && (
                      iconUrl.startsWith('data:') || 
                      iconUrl.startsWith('http://') || 
                      iconUrl.startsWith('https://') ||
                      iconUrl.startsWith('/')
                    );
                    const hasError = brandImageErrors[brand.id];
                    const showPlaceholder = !hasValidIcon || !iconUrl || hasError;

                    return (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelected(brand)}
                        className="brand-selector-card"
                      >
                        <div className="brand-selector-icon-wrapper">
                          {hasValidIcon && !hasError ? (
                            <img
                              src={iconUrl}
                              alt={brand.name || 'UBC brand icon'}
                              className="brand-selector-icon"
                              onError={(e) => {
                                setBrandImageErrors(prev => ({ ...prev, [brand.id]: true }));
                                e.target.style.display = "none";
                              }}
                              onLoad={() => {
                                setBrandImageErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors[brand.id];
                                  return newErrors;
                                });
                              }}
                            />
                          ) : null}
                          {showPlaceholder && (
                            <div className="brand-selector-icon-placeholder">
                              <span>🏷️</span>
                            </div>
                          )}
                        </div>
                        <span className="brand-selector-name">{brand.name}</span>
                        {brandPages.find(
                          (p) => p.brandId === (brand.brandId || brand.id)
                        ) && (
                          <span className="brand-selector-badge">
                            Page Exists
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {brands.length === 0 && (
                  <div className="admin-empty-state">
                    <p>
                      No brands found. Create a brand in Product Management
                      first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="admin-heading-2">Choose Template</h2>
                <button onClick={handleCancel} className="modal-close">
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="admin-text-sm admin-mb-md">
                  Select a template to start with. You can customize everything
                  after creation.
                </p>
                <div className="template-selector-grid">
                  <button
                    onClick={() => handleTemplateSelected("standard")}
                    className="template-card"
                  >
                    <div className="template-icon">📋</div>
                    <h3 className="template-title">Standard Template</h3>
                    <p className="template-description">
                      Pre-filled with all sections: Hero, About, What We Stand
                      For, Why, and Products
                    </p>
                    <span className="template-badge">Recommended</span>
                  </button>
                  <button
                    onClick={() => handleTemplateSelected("minimal")}
                    className="template-card"
                  >
                    <div className="template-icon">📑</div>
                    <h3 className="template-title">Minimal Template</h3>
                    <p className="template-description">
                      Just Hero and About sections. Perfect for quick setup.
                    </p>
                  </button>
                  <button
                    onClick={() => handleTemplateSelected("blank")}
                    className="template-card"
                  >
                    <div className="template-icon">✨</div>
                    <h3 className="template-title">Blank Template</h3>
                    <p className="template-description">
                      Start from scratch with empty sections. Full control.
                    </p>
                  </button>
                  {brandPages.length > 0 && (
                    <button
                      onClick={() => {
                        setShowTemplateSelector(false);
                        setShowCloneSelector(true);
                      }}
                      className="template-card"
                    >
                      <div className="template-icon">🔄</div>
                      <h3 className="template-title">Clone from Existing</h3>
                      <p className="template-description">
                        Copy content from an existing brand page and customize
                        it.
                      </p>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clone Selector Modal */}
        {showCloneSelector && (
          <div
            className="modal-overlay"
            onClick={() => setShowCloneSelector(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="admin-heading-2">
                  Clone from Existing Brand Page
                </h2>
                <button
                  onClick={() => setShowCloneSelector(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="admin-text-sm admin-mb-md">
                  Select a brand page to clone. All content will be copied to
                  the new brand.
                </p>
                <div className="brand-selector-grid">
                  {brandPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        window._cloneSourcePage = page;
                        setShowCloneSelector(false);
                        setShowBrandSelector(true);
                      }}
                      className="brand-selector-card"
                    >
                      <span className="brand-selector-name">
                        {page.brandName || page.brandId}
                      </span>
                      <span
                        className="brand-selector-badge"
                        style={{ background: "#3b82f6", color: "white" }}
                      >
                        Clone This
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading brand pages...</p>
          </div>
        ) : (
          <>
            {/* Add/Edit Form - Only show if explicitly triggered, not on initial load/refresh */}
            {!loading &&
              !isInitialMount.current &&
              showAddForm &&
              editingPage && (
                <div className="brand-page-editor-container brand-page-editor-with-preview">
                  <BrandPageEditor
                    page={editingPage}
                    brands={brands}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    showPreview={true}
                  />
                </div>
              )}

            {/* Brand Pages List */}
            {brandPages.length === 0 ? (
              <div className="admin-empty-state">
                <div className="empty-icon">📄</div>
                <h3>No Brand Pages Yet</h3>
                <p className="admin-text-sm admin-mt-sm">
                  Create your first brand page or import from the existing
                  static page.
                </p>
                <div className="empty-state-actions">
                  {canCreate && (
                    <button
                      onClick={handleCreateNew}
                      className="admin-btn admin-btn-primary admin-mt-md"
                    >
                      Create New Brand Page
                    </button>
                  )}
                  {brands.length > 0 && (
                    <button
                      onClick={() => {
                        const brandId = prompt(
                          "Enter brand ID to import (e.g., soil-king, wellness):"
                        );
                        if (brandId) {
                          handleImportFromStatic(brandId);
                        }
                      }}
                      className="admin-btn admin-btn-secondary admin-mt-md"
                      disabled={importing}
                    >
                      {importing ? "⏳ Importing..." : "📥 Import Brand Page"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="brand-pages-grid">
                {brandPages.slice(0, 10).map((page) => (
                  <div key={page.id} className="brand-page-card">
                    <div className="brand-page-card-header">
                      <div>
                        <h3 className="brand-page-card-title">
                          {page.brandName || page.brandId}
                        </h3>
                        <p className="brand-page-card-meta">
                          Brand ID: {page.brandId}
                        </p>
                        <p className="brand-page-card-meta">
                          URL: <code>/brands/{page.brandId}</code>
                        </p>
                      </div>
                      <div className="brand-page-card-badges">
                        {page.enabled !== false ? (
                          <span className="brand-page-badge brand-page-badge-success">
                            Active
                          </span>
                        ) : (
                          <span className="brand-page-badge brand-page-badge-inactive">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="brand-page-card-sections">
                      <div className="section-indicator">
                        {page.hero && (
                          <span className="section-dot" title="Hero Section">
                            H
                          </span>
                        )}
                        {page.about && (
                          <span className="section-dot" title="About Section">
                            A
                          </span>
                        )}
                        {page.standFor && (
                          <span
                            className="section-dot"
                            title="Stand For Section"
                          >
                            S
                          </span>
                        )}
                        {page.why && (
                          <span className="section-dot" title="Why Section">
                            W
                          </span>
                        )}
                        {page.products && (
                          <span
                            className="section-dot"
                            title="Products Section"
                          >
                            P
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="brand-page-card-actions">
                      <button
                        onClick={() => handlePreview(page)}
                        className="admin-btn admin-btn-secondary"
                        disabled={loadingPreview}
                        title="Live Preview"
                      >
                        {loadingPreview ? "⏳ Loading..." : "👁️ Preview"}
                      </button>
                      <a
                        href={`/brands/${page.brandId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn-secondary"
                        title="Open in new tab"
                      >
                        🔗 View Live
                      </a>
                      <button
                        onClick={() => handleEdit(page)}
                        className="admin-btn admin-btn-secondary"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() =>
                          handleToggleEnable(page.id, !page.enabled)
                        }
                        className="admin-btn admin-btn-secondary"
                      >
                        {page.enabled !== false ? "👁️‍🗨️ Hide" : "👁️ Show"}
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="admin-btn admin-btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Preview Modal */}
        {previewPage && (
          <BrandPagePreview
            pageData={previewPage}
            onClose={handleClosePreview}
          />
        )}
      </div>
    </AdminLayout>
  );
}
