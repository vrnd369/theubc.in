import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import {
  getBrands,
  getCategories,
  getProducts,
  addBrand,
  addCategory,
  addProduct,
  updateBrand,
  updateCategory,
  updateProduct,
  deleteBrand,
  deleteCategory,
  deleteProduct,
} from "../../services/productService";
import { importExistingData } from "../../services/productImportService";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import ProductPreview from "./ProductPreview";
import CategoryPreview from "./CategoryPreview";
import { resolveImageUrl } from "../../../utils/imageUtils";
import { usePermissions } from "../../auth/usePermissions";
import { useAuditLog } from "../../hooks/useAuditLog";
import "./ProductManagement.css";

export default function ProductManagement() {
  const { canDelete, canCreate } = usePermissions();
  const { logCreate, logUpdate, logDelete } = useAuditLog();
  // Initialize activeTab from localStorage or default to 'brands'
  const getInitialTab = () => {
    try {
      const savedTab = localStorage.getItem("productManagementActiveTab");
      if (savedTab && ["brands", "categories", "products"].includes(savedTab)) {
        return savedTab;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    return "brands";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab()); // 'brands', 'categories', 'products'
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [importing, setImporting] = useState(false);

  // Filter states for categories
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryBrandFilter, setCategoryBrandFilter] = useState("");
  const [categoryEnabledFilter, setCategoryEnabledFilter] = useState("all"); // 'all', 'enabled', 'disabled'

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("productManagementActiveTab", activeTab);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [activeTab]);

  // Load data when tab changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "brands") {
        const data = await getBrands();
        setBrands(data);
      } else if (activeTab === "categories") {
        const data = await getCategories();
        setCategories(data);
      } else if (activeTab === "products") {
        const data = await getProducts();
        setProducts(data);
        // Also load categories and brands when products tab is active (needed for product form)
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        const brandsData = await getBrands();
        setBrands(brandsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please check your Firebase connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setEditingItem(null);
    setError(null);
    setSuccess(null);
    // Ensure categories and brands are loaded for product form
    if (activeTab === "products") {
      try {
        if (categories.length === 0) {
          const categoriesData = await getCategories();
          setCategories(categoriesData);
        }
        if (brands.length === 0) {
          const brandsData = await getBrands();
          setBrands(brandsData);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    }
    setShowForm(true);
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    setError(null);
    setSuccess(null);
    // Ensure categories and brands are loaded for product form
    if (activeTab === "products") {
      try {
        if (categories.length === 0) {
          const categoriesData = await getCategories();
          setCategories(categoriesData);
        }
        if (brands.length === 0) {
          const brandsData = await getBrands();
          setBrands(brandsData);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      setError("You don't have permission to delete items.");
      return;
    }
    const itemType =
      activeTab === "brands"
        ? "brand"
        : activeTab === "categories"
        ? "category"
        : "product";
    if (
      !window.confirm(
        `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      )
    ) {
      return;
    }

    if (!id) {
      setError(
        `Cannot delete ${itemType}: Missing ID. Please refresh the page and try again.`
      );
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      console.log(`Attempting to delete ${itemType} with ID:`, id);
      
      // Get item name before deleting for audit log
      let itemName = `${itemType} (ID: ${id})`;
      if (activeTab === "brands") {
        const brand = brands.find(b => b.id === id);
        itemName = brand ? `Brand: ${brand.name || brand.brandId || id}` : itemName;
        await deleteBrand(id);
        await logDelete("products", itemName, id);
      } else if (activeTab === "categories") {
        const category = categories.find(c => c.id === id);
        itemName = category ? `Category: ${category.name || category.categoryId || id}` : itemName;
        await deleteCategory(id);
        await logDelete("products", itemName, id);
      } else if (activeTab === "products") {
        const product = products.find(p => p.id === id);
        itemName = product ? `Product: ${product.name || product.productId || id}` : itemName;
        await deleteProduct(id);
        await logDelete("products", itemName, id);
      }
      console.log(`${itemType} deleted successfully`);
      await loadData();
      setSuccess(
        `${
          itemType.charAt(0).toUpperCase() + itemType.slice(1)
        } deleted successfully!`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error deleting:", error);
      const errorMessage =
        error.message ||
        `Failed to delete ${itemType}. Please check the browser console for details.`;
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSave = async (formData) => {
    try {
      setError(null);
      if (activeTab === "brands") {
        if (editingItem) {
          // Use the Firestore document ID from editingItem
          const documentId = editingItem.id;
          if (!documentId) {
            throw new Error(
              "Cannot update: Missing document ID. Please refresh and try again."
            );
          }
          console.log("Updating brand with document ID:", documentId);
          await updateBrand(documentId, formData);
          await logUpdate("products", `Brand: ${formData.name || formData.brandId || editingItem.name || "Unknown"}`, documentId);
          setSuccess("Brand updated successfully!");
        } else {
          await addBrand(formData);
          setSuccess("Brand added successfully!");
        }
      } else if (activeTab === "categories") {
        if (editingItem) {
          // Use the Firestore document ID from editingItem
          const documentId = editingItem.id;
          if (!documentId) {
            throw new Error(
              "Cannot update: Missing document ID. Please refresh and try again."
            );
          }
          console.log("Updating category with document ID:", documentId);
          // Don't include id or categoryId in formData when updating
          const { id, categoryId, ...updateData } = formData;
          await updateCategory(documentId, updateData);
          await logUpdate("products", `Category: ${formData.name || formData.categoryId || editingItem.name || "Unknown"}`, documentId);
          setSuccess("Category updated successfully!");
        } else {
          await addCategory(formData);
          await logCreate("products", `Category: ${formData.name || formData.categoryId || "Unknown"}`, null);
          setSuccess("Category added successfully!");
        }
      } else if (activeTab === "products") {
        if (editingItem) {
          // Use the Firestore document ID from editingItem
          // CRITICAL: editingItem.id MUST be the Firestore document ID (from doc.id), not a user-defined identifier
          const documentId = editingItem.id;
          if (!documentId) {
            throw new Error(
              "Cannot update: Missing document ID. Please refresh and try again."
            );
          }

          // Validate that documentId looks like a Firestore ID (alphanumeric, typically 20 chars)
          // User-defined IDs like "rice" would be shorter and might not match this pattern
          // But we can't rely on length alone, so we'll just use what we have
          console.log("Updating product with document ID:", documentId);
          console.log("Editing item full data:", editingItem);

          // Remove any user-defined 'id' field from formData before saving
          const { id: userDefinedId, ...updateData } = formData;

          await updateProduct(documentId, updateData);
          await logUpdate("products", `Product: ${formData.name || formData.productId || editingItem.name || "Unknown"}`, documentId);
          setSuccess("Product updated successfully!");
        } else {
          await addProduct(formData);
          await logCreate("products", `Product: ${formData.name || formData.productId || "Unknown"}`, null);
          setSuccess("Product added successfully!");
        }
      }
      await loadData();
      setShowForm(false);
      setEditingItem(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving:", error);
      const errorMessage =
        error.message || "Failed to save. Please check console for details.";
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setError(null);
    setSuccess(null);
  };

  const handleToggleEnable = async (item, enabled) => {
    const itemType = activeTab === "brands" ? "brand" : activeTab === "categories" ? "category" : "product";
    try {
      setError(null);
      const itemName = item.name || item.title || item.brandId || item.categoryId || item.id;
      
      if (activeTab === "brands") {
        await updateBrand(item.id, { enabled });
        await logUpdate("products", `Brand: ${itemName}`, item.id);
      } else if (activeTab === "categories") {
        await updateCategory(item.id, { enabled });
        await logUpdate("products", `Category: ${itemName}`, item.id);
      } else if (activeTab === "products") {
        await updateProduct(item.id, { enabled });
        await logUpdate("products", `Product: ${itemName}`, item.id);
      }
      
      await loadData();
      setSuccess(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${enabled ? 'shown' : 'hidden'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error toggling enable:", error);
      setError(`Failed to ${enabled ? 'show' : 'hide'} ${itemType}. Please try again.`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleImport = async () => {
    if (
      !window.confirm(
        "This will import existing brands, categories, and products from your codebase to Firebase. " +
          "If data already exists, duplicates may be created. Continue?"
      )
    ) {
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await importExistingData();
      if (result.success) {
        setSuccess(result.message);
        await loadData(); // Reload data after import
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error("Import error:", error);
      setError("Failed to import data. Please check console for details.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout currentPage="products">
      <div className="product-management">
        <div className="product-management-header">
          <div>
            <h1 className="admin-heading-1">Product Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              <strong>Single Source of Truth:</strong> Manage brands,
              categories, and products here. Changes automatically reflect
              across the entire website including navbar dropdowns, home page
              categories section, product pages, and brand pages.
            </p>
            <div
              className="admin-alert admin-alert-info"
              style={{
                marginTop: "var(--admin-spacing-md)",
                padding: "var(--admin-spacing-md)",
              }}
            >
              <div className="admin-text-sm" style={{ margin: 0 }}>
                <strong>💡 How it works:</strong> When you add/edit brands or
                categories here, they automatically appear in:
                <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                  <li>
                    Navbar "Our Brands" and "Products" dropdowns (managed in
                    Navigation Management with auto-generate enabled)
                  </li>
                  <li>
                    Home page Categories section (shows all enabled categories)
                  </li>
                  <li>Product detail pages and brand pages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="product-message product-message-success">
            <span className="message-icon">✓</span>
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="product-message product-message-error">
            <span className="message-icon">✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="product-tabs">
          <button
            className={`product-tab ${activeTab === "brands" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("brands");
              // Reset editing item when switching tabs, but keep form open
              if (showForm) {
                setEditingItem(null);
              }
            }}
          >
            <span className="tab-icon">🏷️</span>
            <span className="tab-label">Brands</span>
            <span className="tab-count">({brands.length})</span>
          </button>
          <button
            className={`product-tab ${
              activeTab === "categories" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("categories");
              // Reset editing item when switching tabs, but keep form open
              if (showForm) {
                setEditingItem(null);
              }
            }}
          >
            <span className="tab-icon">📁</span>
            <span className="tab-label">Categories</span>
            <span className="tab-count">({categories.length})</span>
          </button>
          <button
            className={`product-tab ${
              activeTab === "products" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("products");
              // Reset editing item when switching tabs, but keep form open
              if (showForm) {
                setEditingItem(null);
              }
            }}
          >
            <span className="tab-icon">📦</span>
            <span className="tab-label">Products</span>
            <span className="tab-count">({products.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="product-content">
          {loading ? (
            <div className="product-loading">
              <div className="admin-spinner"></div>
              <p>Loading {activeTab}...</p>
            </div>
          ) : (
            <>
              {/* List View */}
              <div className="product-list-header">
                <div>
                  <h2 className="admin-heading-2">
                    {activeTab === "brands" && "All Brands"}
                    {activeTab === "categories" && "All Categories"}
                    {activeTab === "products" && "All Products"}
                  </h2>
                  {(brands.length === 0 ||
                    categories.length === 0 ||
                    products.length === 0) && (
                    <p
                      className="admin-text-sm"
                      style={{
                        marginTop: "8px",
                        color: "var(--admin-warning)",
                      }}
                    >
                      💡 No data yet? Use the "Import Existing Data" button
                      below to migrate your hardcoded data.
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--admin-spacing-sm)",
                    flexWrap: "wrap",
                  }}
                >
                  {(brands.length === 0 ||
                    categories.length === 0 ||
                    products.length === 0) && (
                    <button
                      onClick={handleImport}
                      className="admin-btn admin-btn-success product-add-btn"
                      disabled={importing}
                    >
                      {importing ? (
                        <>
                          <span
                            className="admin-spinner"
                            style={{ width: "16px", height: "16px" }}
                          ></span>
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <span>📥</span>
                          <span>Import Existing Data</span>
                        </>
                      )}
                    </button>
                  )}
                  {canCreate && (
                  <button
                    onClick={handleAdd}
                    className="admin-btn admin-btn-primary product-add-btn"
                  >
                    <span>+</span>
                    <span>
                      Add{" "}
                      {activeTab === "brands"
                        ? "Brand"
                        : activeTab === "categories"
                        ? "Category"
                        : "Product"}
                    </span>
                  </button>
                  )}
                </div>
              </div>

              <div className="product-list">
                {activeTab === "brands" && (
                  <BrandList
                    items={brands}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleEnable={handleToggleEnable}
                    canDelete={canDelete}
                  />
                )}
                {activeTab === "categories" && (
                  <CategoryList
                    items={categories}
                    brands={brands}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleEnable={handleToggleEnable}
                    canDelete={canDelete}
                    search={categorySearch}
                    onSearchChange={setCategorySearch}
                    brandFilter={categoryBrandFilter}
                    onBrandFilterChange={setCategoryBrandFilter}
                    enabledFilter={categoryEnabledFilter}
                    onEnabledFilterChange={setCategoryEnabledFilter}
                  />
                )}
                {activeTab === "products" && (
                  <ProductList
                    items={products}
                    brands={brands}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleEnable={handleToggleEnable}
                    canDelete={canDelete}
                    onRefresh={loadData}
                  />
                )}
              </div>

              {/* Form Modal */}
              {showForm && (
                <ProductForm
                  type={activeTab}
                  item={editingItem}
                  brands={brands}
                  categories={categories}
                  products={products}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Brand List Component
function BrandList({ items, onEdit, onDelete, onToggleEnable, canDelete }) {
  const [resolvedImages, setResolvedImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Resolve all brand icons
  useEffect(() => {
    const resolveImages = async () => {
      const imagePromises = items.map(async (item) => {
        if (item.icon) {
          try {
            // Check if it's already a valid URL
            if (typeof item.icon === 'string' && (
              item.icon.startsWith('data:') || 
              item.icon.startsWith('http://') || 
              item.icon.startsWith('https://') ||
              item.icon.startsWith('/')
            )) {
              return { id: item.id, url: item.icon };
            }
            
            // Otherwise, try to resolve it
            const url = await resolveImageUrl(item.icon);
            return { id: item.id, url: url || item.icon }; // Fallback to original if resolution fails
          } catch (error) {
            console.error(`Error resolving icon for brand ${item.id}:`, error);
            // Return original icon value as fallback
            return { id: item.id, url: item.icon };
          }
        }
        return { id: item.id, url: null };
      });

      const results = await Promise.all(imagePromises);
      const imageMap = {};
      results.forEach(({ id, url }) => {
        if (url) {
          imageMap[id] = url;
        }
      });
      setResolvedImages(imageMap);
    };

    if (items.length > 0) {
      resolveImages();
    } else {
      setResolvedImages({});
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="product-empty-state">
        <div className="empty-icon">🏷️</div>
        <h3>No Brands Yet</h3>
        <p>
          Get started by adding your first brand. Brands will appear in the
          navbar and throughout your website.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {items.map((item) => {
        const iconUrl = resolvedImages[item.id] || item.icon;
        const hasValidIcon = iconUrl && (
          iconUrl.startsWith('data:') || 
          iconUrl.startsWith('http://') || 
          iconUrl.startsWith('https://') ||
          iconUrl.startsWith('/')
        );
        const hasError = imageErrors[item.id];
        const showPlaceholder = !hasValidIcon || !iconUrl || hasError;
        
        return (
          <div key={item.id} className="product-card">
            <div className="product-card-header">
              <div className="product-card-icon">
                {hasValidIcon && !hasError ? (
                  <img
                    src={iconUrl}
                    alt={item.name || 'Brand icon'}
                    onError={(e) => {
                      // Mark this image as failed
                      setImageErrors(prev => ({ ...prev, [item.id]: true }));
                      e.target.style.display = "none";
                    }}
                    onLoad={() => {
                      // Clear error if image loads successfully
                      setImageErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[item.id];
                        return newErrors;
                      });
                    }}
                  />
                ) : null}
                {showPlaceholder && (
                  <div className="icon-placeholder">
                    <span>🏷️</span>
                  </div>
                )}
              </div>
              <div className="product-card-info">
                <h3 className="product-card-title">{item.name}</h3>
                <p className="product-card-meta">
                  Brand ID: {item.brandId || item.id}
                </p>
                {item.enabled !== false && (
                  <span className="product-badge product-badge-success">
                    Active
                  </span>
                )}
                {item.enabled === false && (
                  <span className="product-badge product-badge-inactive">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <div className="product-card-actions">
              <button
                onClick={() => onToggleEnable(item, !(item.enabled !== false))}
                className={`admin-btn ${
                  item.enabled !== false ? "admin-btn-secondary" : "admin-btn-success"
                } product-action-btn`}
                title={item.enabled !== false ? "Hide from website" : "Show on website"}
              >
                {item.enabled !== false ? "👁️‍🗨️ Hide" : "👁️ Show"}
              </button>
              <button
                onClick={() => onEdit(item)}
                className="admin-btn admin-btn-secondary product-action-btn"
              >
                Edit
              </button>
              {canDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="admin-btn admin-btn-danger product-action-btn"
              >
                Delete
              </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Category List Component
function CategoryList({
  items,
  brands,
  onEdit,
  onDelete,
  onToggleEnable,
  canDelete,
  search,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  enabledFilter,
  onEnabledFilterChange,
}) {
  const [resolvedImages, setResolvedImages] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Resolve all category images
  useEffect(() => {
    const resolveImages = async () => {
      setImageLoading(true);
      setResolvedImages({}); // Clear previous images to force refresh

      if (items.length === 0) {
        setImageLoading(false);
        return;
      }

      const imagePromises = items.map(async (item) => {
        if (item.image) {
          try {
            const url = await resolveImageUrl(item.image);
            console.log(
              `Resolved image for category ${item.id}:`,
              url ? "Success" : "Failed"
            );
            return { id: item.id, url };
          } catch (error) {
            console.error(
              `Error resolving image for category ${item.id}:`,
              error
            );
            return { id: item.id, url: null };
          }
        }
        return { id: item.id, url: null };
      });

      try {
        const results = await Promise.all(imagePromises);
        const imageMap = {};
        results.forEach(({ id, url }) => {
          if (url) {
            imageMap[id] = url;
          }
        });
        setResolvedImages(imageMap);
        console.log(
          "Resolved category images:",
          Object.keys(imageMap).length,
          "of",
          items.length
        );
      } catch (error) {
        console.error("Error resolving category images:", error);
      } finally {
        setImageLoading(false);
      }
    };

    resolveImages();
  }, [items, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Filter categories based on search, brand, and enabled status
  const filteredItems = items.filter((item) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.title?.toLowerCase().includes(searchLower) ||
        item.subtitle?.toLowerCase().includes(searchLower) ||
        item.chip?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Brand filter
    if (brandFilter && item.brandId !== brandFilter) {
      return false;
    }

    // Enabled filter
    if (enabledFilter === "enabled" && item.enabled === false) {
      return false;
    }
    if (enabledFilter === "disabled" && item.enabled !== false) {
      return false;
    }

    return true;
  });

  if (items.length === 0) {
    return (
      <div className="product-empty-state">
        <div className="empty-icon">📁</div>
        <h3>No Categories Yet</h3>
        <p>
          Create categories to organize your products. Categories will appear in
          the home section and product pages.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Section */}
      <div className="category-filter-section">
        <div className="category-filter-row">
          <div className="category-filter-group">
            <label className="admin-label">Search Categories</label>
            <input
              type="text"
              className="admin-input"
              placeholder="Search by title, subtitle, or chip..."
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </div>

          <div className="category-filter-group">
            <label className="admin-label">Filter by Brand</label>
            <select
              className="admin-select"
              value={brandFilter || ""}
              onChange={(e) => onBrandFilterChange(e.target.value)}
              style={{ maxWidth: "200px" }}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="category-filter-group">
            <label className="admin-label">Status</label>
            <select
              className="admin-select"
              value={enabledFilter || "all"}
              onChange={(e) => onEnabledFilterChange(e.target.value)}
              style={{ maxWidth: "150px" }}
            >
              <option value="all">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {(search || brandFilter || enabledFilter !== "all") && (
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                onSearchChange("");
                onBrandFilterChange("");
                onEnabledFilterChange("all");
              }}
              style={{ alignSelf: "flex-end", marginTop: "24px" }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div
          className="category-filter-results"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            className="admin-text-sm"
            style={{ color: "var(--admin-text-light)" }}
          >
            Showing {filteredItems.length} of {items.length} categories
          </p>
          <button
            onClick={handleRefresh}
            className="admin-btn admin-btn-secondary"
            style={{ padding: "8px 16px", fontSize: "14px" }}
            disabled={imageLoading}
          >
            {imageLoading ? "⏳ Refreshing..." : "🔄 Refresh Images"}
          </button>
        </div>
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#F9FAFB",
            borderRadius: "4px",
            marginTop: "8px",
          }}
        >
          <span className="admin-text-sm" style={{ color: "#6B7280" }}>
            {imageLoading
              ? "Loading images..."
              : `Loaded ${Object.keys(resolvedImages).length} of ${
                  items.length
                } category images`}
          </span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="product-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Categories Found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          {filteredItems.length >= 50 && (
            <div
              className="admin-alert admin-alert-info"
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span className="admin-text-sm">
                <strong>Display Limit Reached:</strong> Showing{" "}
                <strong>50 of {filteredItems.length} categories</strong>. 
                {filteredItems.length > 50 && (
                  <> {filteredItems.length - 50} more category{filteredItems.length - 50 !== 1 ? 'ies' : 'y'} hidden. </>
                )}
                Use filters to narrow down your search and see all results.
              </span>
            </div>
          )}
          <div className="product-grid">
            {filteredItems.slice(0, 50).map((item) => {
            const brand = brands.find((b) => b.id === item.brandId);
            // Try resolved image first, then fallback to item.image (which might be a URL or ID)
            const imageUrl = resolvedImages[item.id] || item.image;
            // Check if imageUrl is a valid URL (data URL or http URL) or if we're still loading
            const isValidUrl =
              imageUrl &&
              (imageUrl.startsWith("data:") ||
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://"));
            const isImageId = imageUrl && !isValidUrl && !imageLoading; // Likely an unresolved image ID

            return (
              <div key={item.id} className="product-card">
                <div className="product-card-header">
                  {(imageUrl || imageLoading) && (
                    <div className="product-card-image">
                      {isValidUrl && (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          onError={(e) => {
                            console.error(
                              `Image failed to load for category ${item.id}:`,
                              imageUrl
                            );
                            e.target.style.display = "none";
                          }}
                          onLoad={() => {
                            console.log(
                              `Image loaded successfully for category ${item.id}`
                            );
                          }}
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      )}
                      {imageLoading && !resolvedImages[item.id] && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            color: "#6B7280",
                            minHeight: "100px",
                          }}
                        >
                          <span>Loading image...</span>
                        </div>
                      )}
                      {isImageId && !imageLoading && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            color: "#EF4444",
                            minHeight: "100px",
                            fontSize: "12px",
                            textAlign: "center",
                          }}
                        >
                          <span>
                            Image not found
                            <br />
                            (ID: {imageUrl.substring(0, 20)}...)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="product-card-info">
                    <h3 className="product-card-title">{item.title}</h3>
                    <p className="product-card-subtitle">{item.subtitle}</p>
                    <p className="product-card-meta">
                      <span className="meta-label">Brand:</span>{" "}
                      {brand?.name || "N/A"}
                    </p>
                    <p className="product-card-meta">
                      <span className="meta-label">Chip:</span>{" "}
                      {item.chip || "N/A"}
                    </p>
                    {item.enabled !== false && (
                      <span className="product-badge product-badge-success">
                        Active
                      </span>
                    )}
                    {item.enabled === false && (
                      <span className="product-badge product-badge-inactive">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="product-card-actions">
                  <button
                    onClick={() => onToggleEnable(item, !(item.enabled !== false))}
                    className={`admin-btn ${
                      item.enabled !== false ? "admin-btn-secondary" : "admin-btn-success"
                    } product-action-btn`}
                    title={item.enabled !== false ? "Hide from website" : "Show on website"}
                  >
                    {item.enabled !== false ? "👁️‍🗨️ Hide" : "👁️ Show"}
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="admin-btn admin-btn-secondary product-action-btn"
                  >
                    Edit
                  </button>
                  {canDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="admin-btn admin-btn-danger product-action-btn"
                  >
                    Delete
                  </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </>
  );
}

// Product List Component
function ProductList({
  items,
  brands,
  categories,
  onEdit,
  onDelete,
  onToggleEnable,
  canDelete,
  onRefresh,
}) {
  const [resolvedImages, setResolvedImages] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Resolve all product images
  useEffect(() => {
    const resolveImages = async () => {
      setImageLoading(true);
      setResolvedImages({}); // Clear previous images to force refresh

      if (items.length === 0) {
        setImageLoading(false);
        return;
      }

      const imagePromises = items.map(async (item) => {
        if (item.image) {
          try {
            const url = await resolveImageUrl(item.image);
            console.log(
              `Resolved image for product ${item.id}:`,
              url ? "Success" : "Failed"
            );
            return { id: item.id, url };
          } catch (error) {
            console.error(
              `Error resolving image for product ${item.id}:`,
              error
            );
            return { id: item.id, url: null };
          }
        }
        return { id: item.id, url: null };
      });

      try {
        const results = await Promise.all(imagePromises);
        const imageMap = {};
        results.forEach(({ id, url }) => {
          if (url) {
            imageMap[id] = url;
          }
        });
        setResolvedImages(imageMap);
        console.log(
          "Resolved images:",
          Object.keys(imageMap).length,
          "of",
          items.length
        );
      } catch (error) {
        console.error("Error resolving images:", error);
      } finally {
        setImageLoading(false);
      }
    };

    resolveImages();
  }, [items, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    if (onRefresh) {
      onRefresh();
    }
  };

  if (items.length === 0) {
    return (
      <div className="product-empty-state">
        <div className="empty-icon">📦</div>
        <h3>No Products Yet</h3>
        <p>
          Add products to showcase on your website. Products will be visible in
          the dashboard and on product pages.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "#F9FAFB",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="admin-text-sm" style={{ color: "#6B7280" }}>
            {imageLoading
              ? "Loading images..."
              : `Loaded ${Object.keys(resolvedImages).length} of ${
                  items.length
                } product images`}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="admin-btn admin-btn-secondary"
          style={{ padding: "8px 16px", fontSize: "14px" }}
          disabled={imageLoading}
        >
          {imageLoading ? "⏳ Refreshing..." : "🔄 Refresh Images"}
        </button>
      </div>
      {items.length >= 500 && (
        <div
          className="admin-alert admin-alert-info"
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <span className="admin-text-sm">
            <strong>Display Limit Reached:</strong> Showing{" "}
            <strong>500 of {items.length} products</strong>.
            {items.length > 500 && (
              <> {items.length - 500} more product{items.length - 500 !== 1 ? 's' : ''} hidden. </>
            )}
            Use search or filters to find specific products and see all results.
          </span>
        </div>
      )}
      <div className="product-grid">
        {items.slice(0, 500).map((item) => {
          const brand = brands.find((b) => b.id === item.brandId);
          const category = categories.find((c) => c.id === item.categoryId);
          // Try resolved image first, then fallback to item.image (which might be a URL or ID)
          const imageUrl = resolvedImages[item.id] || item.image;
          // Check if imageUrl is a valid URL (data URL or http URL) or if we're still loading
          const isValidUrl =
            imageUrl &&
            (imageUrl.startsWith("data:") ||
              imageUrl.startsWith("http://") ||
              imageUrl.startsWith("https://"));
          const isImageId = imageUrl && !isValidUrl && !imageLoading; // Likely an unresolved image ID

          return (
            <div key={item.id} className="product-card">
              <div className="product-card-header">
                {(imageUrl || imageLoading) && (
                  <div className="product-card-image">
                    {isValidUrl && (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        onError={(e) => {
                          console.error(
                            `Image failed to load for product ${item.id}:`,
                            imageUrl
                          );
                          e.target.style.display = "none";
                        }}
                        onLoad={() => {
                          console.log(
                            `Image loaded successfully for product ${item.id}`
                          );
                        }}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    )}
                    {imageLoading && !resolvedImages[item.id] && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px",
                          color: "#6B7280",
                          minHeight: "100px",
                        }}
                      >
                        <span>Loading image...</span>
                      </div>
                    )}
                    {isImageId && !imageLoading && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px",
                          color: "#EF4444",
                          minHeight: "100px",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        <span>
                          Image not found
                          <br />
                          (ID: {imageUrl.substring(0, 20)}...)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="product-card-info">
                  <h3 className="product-card-title">{item.title}</h3>
                  {item.titleSub && (
                    <p className="product-card-subtitle">{item.titleSub}</p>
                  )}
                  <p className="product-card-meta">
                    <span className="meta-label">Brand:</span>{" "}
                    {brand?.name || "N/A"}
                  </p>
                  <p className="product-card-meta">
                    <span className="meta-label">Category:</span>{" "}
                    {category?.title || "N/A"}
                  </p>
                  {item.enabled !== false && (
                    <span className="product-badge product-badge-success">
                      Active
                    </span>
                  )}
                  {item.enabled === false && (
                    <span className="product-badge product-badge-inactive">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="product-card-actions">
                <button
                  onClick={() => onToggleEnable(item, !(item.enabled !== false))}
                  className={`admin-btn ${
                    item.enabled !== false ? "admin-btn-secondary" : "admin-btn-success"
                  } product-action-btn`}
                  title={item.enabled !== false ? "Hide from website" : "Show on website"}
                >
                  {item.enabled !== false ? "👁️‍🗨️ Hide" : "👁️ Show"}
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="admin-btn admin-btn-secondary product-action-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="admin-btn admin-btn-danger product-action-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Form Component
function ProductForm({
  type,
  item,
  brands,
  categories,
  products,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (item) {
      // When editing, preserve the Firestore document ID separately
      // The item.id should be the Firestore document ID (from doc.id)
      // Remove any user-defined 'id' field from formData to avoid confusion
      const {
        id: documentId,
        categoryId,
        brandId: itemBrandId,
        ...itemData
      } = item;

      // Remove any user-defined 'id' field from itemData (products don't have user-defined IDs like brands do)
      const { id: userDefinedId, ...cleanItemData } = itemData;

      // Parse uspTag to extract star and text
      let uspTagStar = "★";
      let uspTagText = "USP";
      if (cleanItemData.uspTag) {
        const tagMatch = cleanItemData.uspTag.match(
          /^([★☆✦✧✩✪✫✬✭✮✯✰]?)\s*(.+)$/
        );
        if (tagMatch) {
          uspTagStar = tagMatch[1] || "★";
          uspTagText = tagMatch[2] || "USP";
        }
      }

      // Check if this is a special product type that needs default pillars
      const productTitle = (cleanItemData.title || '').toLowerCase();
      const isRoyalBasmatiRice = productTitle.includes('royal basmati');
      const isSuperBasmatiRice = productTitle.includes('super basmati');
      const isChilliPowder = productTitle.includes('chilli powder') || productTitle.includes('chili powder');
      const isTurmericPowder = productTitle.includes('turmeric powder');
      const isCorianderPowder = productTitle.includes('coriander powder');
      const isGaramMasala = productTitle.includes('garam masala');
      const isJeeraPowder = productTitle.includes('jeera powder') || productTitle.includes('cumin powder');
      const isCulinaryPaste = productTitle.includes('paste');
      const isAppalam = productTitle.includes('appalam');
      const isMasalaPowder = productTitle.includes('masala') && !isGaramMasala && !isAppalam;
      
      // Get default pillars for special product types
      let defaultPillars = [];
      if (isRoyalBasmatiRice) {
        defaultPillars = [
          {
            title: "Authentic Aroma",
            description: "Naturally fragrant rice that enhances every dish."
          },
          {
            title: "Perfect Grain Length",
            description: "Extra-long grains that remain separate and fluffy when cooked."
          },
          {
            title: "Carefully Aged",
            description: "Aged to perfection for superior texture and taste."
          },
          {
            title: "ISO Certified",
            description: "Certified under ISO 9001:2015 and ISO 22000:2018 standards for quality and food safety."
          }
        ];
      } else if (isSuperBasmatiRice) {
        defaultPillars = [
          {
            title: "Silky & Slender Grains",
            description: "Premium basmati rice with silky and slender grains for perfect texture."
          },
          {
            title: "Perfectly Aged",
            description: "Carefully aged to perfection for superior texture and authentic taste."
          },
          {
            title: "Rich Aroma & Flavor",
            description: "Naturally fragrant rice with distinctive nutty flavor that enhances every dish."
          },
          {
            title: "ISO Certified",
            description: "Certified under ISO 9001:2015 and ISO 22000:2018 standards for quality and food safety."
          }
        ];
      } else if (isChilliPowder) {
        defaultPillars = [
          {
            title: "Pure & Natural",
            description: "Made from the finest quality chillies, sourced from premium farms with no artificial additives."
          },
          {
            title: "Advanced Tech",
            description: "Processed using advanced technology to preserve natural flavor, color, and nutritional value."
          },
          {
            title: "Rich Aroma & Color",
            description: "Intense aroma and vibrant color that enhances the taste and appearance of your dishes."
          },
          {
            title: "Triple-Layer Protection",
            description: "Triple-layer packaging ensures freshness, quality, and protection from moisture and contaminants."
          }
        ];
      } else if (isTurmericPowder) {
        defaultPillars = [
          {
            title: "Pure & Natural",
            description: "Made from the finest quality turmeric, sourced from premium farms with no artificial additives."
          },
          {
            title: "Advanced Tech",
            description: "Processed using advanced technology to preserve natural flavor, color, and nutritional value."
          },
          {
            title: "High Curcumin",
            description: "Rich in curcumin content, providing maximum health benefits and vibrant color to your dishes."
          },
          {
            title: "Triple-Layer Protection",
            description: "Triple-layer packaging ensures freshness, quality, and protection from moisture and contaminants."
          }
        ];
      } else if (isGaramMasala) {
        defaultPillars = [
          {
            title: "Pure & Natural",
            description: "Made from the finest quality spices, sourced from premium farms with no artificial additives."
          },
          {
            title: "Aroma Locked",
            description: "Special processing technology locks in the natural aroma and flavor for maximum freshness."
          },
          {
            title: "No Added Preservatives",
            description: "100% natural with no added preservatives, ensuring pure and authentic taste."
          },
          {
            title: "No Added Colours",
            description: "No artificial colors added, maintaining the natural appearance and quality of the spices."
          }
        ];
      } else if (isAppalam) {
        defaultPillars = [
          {
            title: "Rich in Protein",
            description: "Protein-packed for everyday energy in every crispy bite."
          },
          {
            title: "Sun-Dried for Goodness",
            description: "Traditional sun-drying locks in flavor and light, airy texture."
          },
          {
            title: "Quality Ingredients",
            description: "Made with carefully selected ingredients for authentic taste."
          },
          {
            title: "Crispy & Light",
            description: "Delicately crisp and light for a perfect, anytime snack."
          }
        ];
      } else if (isCulinaryPaste) {
        defaultPillars = [
          {
            title: "Thick & Grainy",
            description: "Rich, thick, and grainy texture for authentic taste."
          },
          {
            title: "Freshness Sealed",
            description: "Sealed to lock in freshness, aroma, and flavor."
          },
          {
            title: "No Added Colours",
            description: "No artificial colours added—pure natural goodness."
          },
          {
            title: "No Added Preservatives",
            description: "Zero added preservatives for clean, honest taste."
          }
        ];
      } else if (isMasalaPowder) {
        defaultPillars = [
          {
            title: "Pure & Natural",
            description: "Made from the finest quality spices, sourced from premium farms with no artificial additives."
          },
          {
            title: "Aroma Locked",
            description: "Special processing technology locks in the natural aroma and flavor for maximum freshness."
          },
          {
            title: "No Added Preservatives",
            description: "100% natural with no added preservatives, ensuring pure and authentic taste."
          },
          {
            title: "No Added Colours",
            description: "No artificial colors added, maintaining the natural appearance and quality of the spices."
          }
        ];
      } else if (isJeeraPowder) {
        defaultPillars = [
          {
            title: "Pure & Natural",
            description: "Made from the finest quality jeera (cumin), sourced from premium farms with no artificial additives."
          },
          {
            title: "Advanced Tech",
            description: "Processed using advanced technology to preserve natural flavor, aroma, and nutritional value."
          },
          {
            title: "Stone-Ground Freshness",
            description: "Traditional stone-ground method ensures maximum freshness and authentic flavor in every batch."
          },
          {
            title: "Triple-Layer Protection",
            description: "Triple-layer packaging ensures freshness, quality, and protection from moisture and contaminants."
          }
        ];
      } else if (isCorianderPowder) {
        defaultPillars = [
          {
            title: "Pure & Natural",
            description: "Made from the finest quality coriander, sourced from premium farms with no artificial additives."
          },
          {
            title: "Advanced Tech",
            description: "Processed using advanced technology to preserve natural flavor, color, and nutritional value."
          },
          {
            title: "Fresh Aroma & Rich Color",
            description: "Intense fresh aroma and vibrant color that enhances the taste and appearance of your dishes."
          },
          {
            title: "Triple-Layer Protection",
            description: "Triple-layer packaging ensures freshness, quality, and protection from moisture and contaminants."
          }
        ];
      }
      
      // Merge existing pillars with defaults - ensure we have 4 pillars for special products
      let mergedPillars = cleanItemData.pillars || [];
      if ((isRoyalBasmatiRice || isSuperBasmatiRice || isChilliPowder || isTurmericPowder || isCorianderPowder || isGaramMasala || isAppalam || isCulinaryPaste || isMasalaPowder || isJeeraPowder) && defaultPillars.length > 0) {
        // Ensure we have exactly 4 pillars, filling in defaults where missing
        const finalPillars = [];
        for (let i = 0; i < 4; i++) {
          if (mergedPillars[i]) {
            // Use existing pillar but fill in defaults if title/description is missing
            finalPillars.push({
              ...mergedPillars[i],
              title: mergedPillars[i].title || defaultPillars[i].title,
              description: mergedPillars[i].description || defaultPillars[i].description
            });
          } else {
            // Add default pillar if missing
            finalPillars.push(defaultPillars[i]);
          }
        }
        mergedPillars = finalPillars;
      }

      // Ensure font weight and style values are strings for dropdowns
      // Convert numbers to strings for select inputs
      setFormData({
        ...cleanItemData,
        // Ensure we're using the correct brandId (document ID, not identifier)
        brandId: itemBrandId || item.brandId,
        // CRITICAL: Preserve categoryId when editing - it was destructured but not included
        categoryId: categoryId || item.categoryId || cleanItemData.categoryId || "",
        uspTagStar: uspTagStar,
        uspTagText: uspTagText,
        // Only preserve customizable fields (font sizes and titleSubWidth)
        // Font weights, styles, and widths use CSS defaults
        titleSubWidth:
          cleanItemData.titleSubWidth !== undefined &&
          cleanItemData.titleSubWidth !== null
            ? cleanItemData.titleSubWidth
            : "",
        // Ensure titleSub is preserved
        titleSub: cleanItemData.titleSub || "",
        // Use merged pillars with defaults
        pillars: mergedPillars,
      });

      // Store the document ID separately so we can use it when saving
      // We'll pass it through the onSave callback
    } else {
      // Initialize empty form based on type
      if (type === "brands") {
        setFormData({
          name: "",
          id: "",
          icon: "",
          order: brands.length,
          enabled: true,
        });
      } else if (type === "categories") {
        setFormData({
          title: "",
          subtitle: "",
          chip: "",
          brandId: brands.length > 0 ? brands[0].id : "",
          image: "",
          href: "",
          knowMoreText: "Know More",
          knowMoreBgColor: "#f3f4f6",
          order: categories.length,
          enabled: true,
        });
      } else if (type === "products") {
        setFormData({
          title: "",
          titleSub: "",
          brandId: brands.length > 0 ? brands[0].id : "",
          categoryId: categories.length > 0 ? categories[0].id : "",
          category: "",
          description: "",
          description2: "",
          image: "",
          sizes: [],
          nutrition: [],
          benefits: [],
          whyChooseTitle: "",
          whyChooseTitleAlign: "left",
          whyChooseBackground: "",
          uspTag: "★ USP",
          uspTagStar: "★",
          uspTagText: "USP",
          uspTitle: "",
          uspTitleAlign: "left",
          // Font weights, styles, and widths use CSS defaults - no need to set them
          pillars: [],
          order: products ? products.length : 0,
          enabled: true,
        });
      }
    }
  }, [item, type, brands, categories, products]);

  const validate = () => {
    const newErrors = {};

    if (type === "brands") {
      if (!formData.name?.trim()) newErrors.name = "Brand name is required";
      if (!formData.id?.trim())
        newErrors.id = 'Brand ID is required (e.g., "soil-king")';
    } else if (type === "categories") {
      if (!formData.title?.trim())
        newErrors.title = "Category title is required";
      if (!formData.brandId) newErrors.brandId = "Please select a brand";
      if (!formData.chip?.trim())
        newErrors.chip = "Chip name is required (display name for filters)";
    } else if (type === "products") {
      if (!formData.title?.trim())
        newErrors.title = "Product title is required";
      if (!formData.brandId) newErrors.brandId = "Please select a brand";
      if (!formData.categoryId)
        newErrors.categoryId = "Please select a category";
    }

    setErrors(newErrors);
    
    // If there are errors, scroll to and focus the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      let errorElement = null;
      
      // Map field names to specific IDs
      const fieldIdMap = {
        'title': 'product-title-input',
        'brandId': 'product-brand-select',
        'categoryId': 'product-category-select'
      };
      
      // Try to find by ID first
      if (fieldIdMap[firstErrorField]) {
        errorElement = document.getElementById(fieldIdMap[firstErrorField]);
      }
      
      // If not found by ID, try by name attribute
      if (!errorElement) {
        errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      }
      
      // If still not found, try generic selectors
      if (!errorElement) {
        errorElement = document.querySelector(
          `#${firstErrorField}, 
           .admin-input[name="${firstErrorField}"],
           .admin-select[name="${firstErrorField}"]`
        );
      }
      
      // If found, scroll to and highlight it
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          errorElement.focus();
          // Add a highlight effect
          errorElement.style.borderColor = '#ef4444';
          errorElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
          errorElement.style.transition = 'all 0.3s ease';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            if (errorElement && !errors[firstErrorField]) {
              errorElement.style.borderColor = '';
              errorElement.style.boxShadow = '';
            }
          }, 3000);
        }, 300);
      }
      
      // Show error message at top of form
      const formElement = document.querySelector('.product-form');
      if (formElement) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-validation-error';
        errorMessage.style.cssText = `
          background-color: #fee2e2;
          border: 1px solid #fca5a5;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        `;
        errorMessage.textContent = `Please fill in the required fields: ${Object.keys(newErrors).map(key => {
          if (key === 'categoryId') return 'Category';
          if (key === 'brandId') return 'Brand';
          return key.charAt(0).toUpperCase() + key.slice(1);
        }).join(', ')}`;
        
        // Remove existing error message if any
        const existingError = formElement.querySelector('.form-validation-error');
        if (existingError) {
          existingError.remove();
        }
        
        formElement.insertBefore(errorMessage, formElement.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (errorMessage.parentElement) {
            errorMessage.style.transition = 'opacity 0.3s ease';
            errorMessage.style.opacity = '0';
            setTimeout(() => errorMessage.remove(), 300);
          }
        }, 5000);
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    if (type === "brands") {
      setFormData({ ...formData, icon: imageUrl });
    } else {
      setFormData({ ...formData, image: imageUrl });
    }
  };

  return (
    <div className="product-form-overlay" onClick={onCancel}>
      <div
        className={`product-form-modal ${
          showPreview && (type === "products" || type === "categories")
            ? "with-preview"
            : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="product-form-header">
          <h2 className="admin-heading-2">
            {item ? "Edit" : "Add"}{" "}
            {type === "brands"
              ? "Brand"
              : type === "categories"
              ? "Category"
              : "Product"}
          </h2>
          <div
            style={{
              display: "flex",
              gap: "var(--admin-spacing-sm)",
              alignItems: "center",
            }}
          >
            {(type === "products" || type === "categories") && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="admin-btn admin-btn-secondary"
                style={{ padding: "8px 16px" }}
              >
                {showPreview ? "👁️ Hide Preview" : "👁️ Show Preview"}
              </button>
            )}
            <button onClick={onCancel} className="product-form-close">
              ×
            </button>
          </div>
        </div>

        <div
          className={`product-form-content-wrapper ${
            showPreview && (type === "products" || type === "categories")
              ? "with-preview"
              : ""
          }`}
        >
          <form onSubmit={handleSubmit} className="product-form">
            {/* Brand Form */}
            {type === "brands" && (
              <>
                <div className="form-group">
                  <label className="admin-label">Brand Name *</label>
                  <small className="form-hint">
                    Enter the display name of the brand (e.g., "Soil King", "UBC
                    Premium"). This name appears throughout the website.
                  </small>
                  <input
                    type="text"
                    className={`admin-input ${
                      errors.name ? "input-error" : ""
                    }`}
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Soil King"
                  />
                  {errors.name && (
                    <span className="form-error">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Brand ID *</label>
                  <small className="form-hint">
                    Enter a unique identifier for this brand (e.g., "soil-king",
                    "ubc-premium"). This ID is used in URLs and must be
                    lowercase with hyphens. It cannot be changed after creation.
                  </small>
                  <input
                    type="text"
                    className={`admin-input ${errors.id ? "input-error" : ""}`}
                    value={formData.id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    placeholder="e.g., soil-king (used in URLs)"
                  />
                  {errors.id && <span className="form-error">{errors.id}</span>}
                </div>

                <div className="form-group">
                  <label className="admin-label">Brand Icon</label>
                  <small className="form-hint">
                    Upload or select an icon image for this brand. The icon
                    appears in navigation menus, category filters, and brand
                    pages.
                  </small>
                  <ImageSelector
                    value={formData.icon || ""}
                    onChange={handleImageSelect}
                  />
                </div>

                <div className="form-section">
                  <h4 className="section-subtitle">
                    Text Alignment & Dimensions
                  </h4>
                  <div className="form-group">
                    <label className="admin-label">
                      Brand Name Text Alignment
                    </label>
                    <small className="form-hint">
                      Choose how the brand name text is aligned (left, center,
                      or right). This affects how the brand name appears on
                      brand pages and category cards.
                    </small>
                    <select
                      className="admin-select"
                      value={formData.nameAlign || "left"}
                      onChange={(e) =>
                        setFormData({ ...formData, nameAlign: e.target.value })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">
                        Brand Name Font Size (px)
                      </label>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.nameFontSize || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nameFontSize: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="22"
                      />
                      <small className="form-hint">
                        Set the font size in pixels for the brand name. Leave
                        empty to use the default size.
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="admin-label">
                        Brand Name Width (px)
                      </label>
                      <small className="form-hint">
                        Set a fixed width in pixels for the brand name
                        container. Leave empty for automatic width based on
                        content.
                      </small>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.nameWidth || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nameWidth: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="auto"
                      />
                    </div>
                  </div>

                  <div className="section-save-button">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="admin-btn admin-btn-primary"
                      disabled={saving}
                    >
                      {saving
                        ? "💾 Saving..."
                        : "💾 Save Text Alignment & Dimensions"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">Display Order</label>
                  <small className="form-hint">
                    Set the display order for this brand. Lower numbers appear
                    first in lists and navigation menus.
                  </small>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    <input
                      type="checkbox"
                      checked={formData.enabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, enabled: e.target.checked })
                      }
                    />
                    <span style={{ marginLeft: "8px" }}>
                      Enabled (visible on website)
                    </span>
                  </label>
                  <small className="form-hint">
                    When enabled, this brand will be visible on the website.
                    Disabled brands are hidden from navigation, category
                    filters, and product listings.
                  </small>
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Brand"}
                  </button>
                </div>
              </>
            )}

            {/* Category Form */}
            {type === "categories" && (
              <>
                <div className="form-group">
                  <label className="admin-label">Category Title *</label>
                  <small className="form-hint">
                    Enter the main title for this category (e.g., "Masalas",
                    "Rice Products"). This appears prominently on category cards
                    and pages.
                  </small>
                  <input
                    type="text"
                    className={`admin-input ${
                      errors.title ? "input-error" : ""
                    }`}
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Masalas"
                  />
                  {errors.title && (
                    <span className="form-error">{errors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Subtitle</label>
                  <small className="form-hint">
                    Enter a subtitle that describes this category (e.g.,
                    "Authentic blends for every dish"). This appears below the
                    category title.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.subtitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="e.g., Authentic blends for every dish"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Chip Name *</label>
                  <small className="form-hint">
                    Enter the name that appears in filter buttons and category
                    chips (e.g., "Masalas"). This is used for filtering products
                    by category.
                  </small>
                  <input
                    type="text"
                    className={`admin-input ${
                      errors.chip ? "input-error" : ""
                    }`}
                    value={formData.chip || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, chip: e.target.value })
                    }
                    placeholder="e.g., Masalas (displayed in filter buttons)"
                  />
                  {errors.chip && (
                    <span className="form-error">{errors.chip}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Brand *</label>
                  <small className="form-hint">
                    Select the brand that this category belongs to. Categories
                    are organized under brands, and products must match both
                    brand and category.
                  </small>
                  <select
                    className={`admin-select ${
                      errors.brandId ? "input-error" : ""
                    }`}
                    value={formData.brandId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brandId && (
                    <span className="form-error">{errors.brandId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Category Image</label>
                  <small className="form-hint">
                    Upload or select the main image for this category. This
                    image appears on category cards in the home page categories
                    section and category pages.
                  </small>
                  <ImageSelector
                    value={formData.image || ""}
                    onChange={(imageUrl) =>
                      setFormData({ ...formData, image: imageUrl })
                    }
                  />
                </div>

                <div className="form-section">
                  <h4 className="section-subtitle">
                    Text Alignment & Dimensions
                  </h4>
                  <div className="form-group">
                    <label className="admin-label">
                      Category Title Text Alignment
                    </label>
                    <small className="form-hint">
                      Choose how the category title text is aligned (left,
                      center, or right). This affects how the title appears on
                      category cards and pages.
                    </small>
                    <select
                      className="admin-select"
                      value={formData.titleAlign || "left"}
                      onChange={(e) =>
                        setFormData({ ...formData, titleAlign: e.target.value })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">
                        Title Font Size (px)
                      </label>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.titleFontSize || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            titleFontSize: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="22"
                      />
                      <small className="form-hint">
                        Font size for category title
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Title Width (px)</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.titleWidth || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            titleWidth: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="auto"
                      />
                      <small className="form-hint">
                        Leave empty for auto width
                      </small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="admin-label">
                      Subtitle Text Alignment
                    </label>
                    <select
                      className="admin-select"
                      value={formData.subtitleAlign || "left"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subtitleAlign: e.target.value,
                        })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                    <p className="form-hint">
                      Controls the text alignment of the category subtitle
                    </p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">
                        Subtitle Font Size (px)
                      </label>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.subtitleFontSize || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subtitleFontSize: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="14"
                      />
                      <small className="form-hint">
                        Font size for category subtitle
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Subtitle Width (px)</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.subtitleWidth || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subtitleWidth: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="auto"
                      />
                      <small className="form-hint">
                        Leave empty for auto width
                      </small>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Know More Button Link URL
                  </label>
                  <small className="form-hint">
                    Enter the URL that the "Know More" button links to (e.g.,
                    "/products?category=masalas&brand=soil-king"). Leave empty
                    to auto-generate based on brand and category chip.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.href || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, href: e.target.value })
                    }
                    placeholder="e.g., /products?category=masalas&brand=soil-king"
                  />
                </div>

                <div className="form-section">
                  <h4 className="section-subtitle">Know More Button Styling</h4>
                  <div className="form-group">
                    <label className="admin-label">Button Text</label>
                    <small className="form-hint">
                      Enter the text displayed on the "Know More" button (e.g.,
                      "Know More", "Explore", "View Products"). Default is "Know
                      More".
                    </small>
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.knowMoreText || "Know More"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          knowMoreText: e.target.value,
                        })
                      }
                      placeholder="e.g., Know More, Explore, View Products"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-label">
                      Button Background Color
                    </label>
                    <small className="form-hint">
                      Set the background color for the "Know More" button. Use
                      the color picker or enter a hex code. Default is #f3f4f6
                      (light gray).
                    </small>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--admin-spacing-sm)",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="color"
                        className="admin-input"
                        value={formData.knowMoreBgColor || "#f3f4f6"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            knowMoreBgColor: e.target.value,
                          })
                        }
                        style={{
                          width: "60px",
                          height: "40px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.knowMoreBgColor || "#f3f4f6"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            knowMoreBgColor: e.target.value,
                          })
                        }
                        placeholder="#f3f4f6"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  <div className="section-save-button">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="admin-btn admin-btn-primary"
                      disabled={saving}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Button Styling"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">Display Order</label>
                  <small className="form-hint">
                    Set the display order for this category. Lower numbers
                    appear first in category lists and the home page categories
                    section.
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
                        Only the first <strong>50 categories</strong> are displayed in the
                        management list. Use filters to find specific categories
                        if you have more than 50.
                      </span>
                    </div>
                  </div>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    <input
                      type="checkbox"
                      checked={formData.enabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, enabled: e.target.checked })
                      }
                    />
                    <span style={{ marginLeft: "8px" }}>Enabled</span>
                  </label>
                  <small className="form-hint">
                    When enabled, this category will be visible on the website.
                    Disabled categories are hidden from navigation, filters, and
                    product listings.
                  </small>
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Category"}
                  </button>
                </div>
              </>
            )}

            {/* Product Form */}
            {type === "products" && (
              <>
                <div className="form-group">
                  <label className="admin-label">Product Title *</label>
                  <small className="form-hint">
                    Enter the main title/name of the product (e.g., "Chicken
                    Masala", "Basmati Rice"). This appears prominently on
                    product pages and listings.
                  </small>
                  <input
                    id="product-title-input"
                    name="title"
                    type="text"
                    className={`admin-input ${
                      errors.title ? "input-error" : ""
                    }`}
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Chicken Masala"
                  />
                  {errors.title && (
                    <span className="form-error">{errors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Brand *</label>
                  <small className="form-hint">
                    Select the brand that this product belongs to. Products are
                    organized under brands, and you must select a brand before
                    choosing a category.
                  </small>
                  <select
                    id="product-brand-select"
                    name="brandId"
                    className={`admin-select ${
                      errors.brandId ? "input-error" : ""
                    }`}
                    value={formData.brandId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brandId && (
                    <span className="form-error">{errors.brandId}</span>
                  )}
                  {formData.brandId && (
                    <div className="form-group" style={{ marginTop: "8px" }}>
                      <label
                        className="admin-label"
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          fontWeight: "normal",
                        }}
                      >
                        Selected Brand:
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={
                          brands.find((b) => b.id === formData.brandId)?.name ||
                          ""
                        }
                        readOnly
                        style={{
                          backgroundColor: "#F9FAFB",
                          cursor: "not-allowed",
                          color: "#374151",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Category *</label>
                  <select
                    id="product-category-select"
                    name="categoryId"
                    className={`admin-select ${
                      errors.categoryId ? "input-error" : ""
                    }`}
                    value={formData.categoryId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    disabled={!formData.brandId}
                  >
                    <option value="">
                      {!formData.brandId
                        ? "Please select a brand first"
                        : "Select a category"}
                    </option>
                    {categories
                      .filter(
                        (cat) =>
                          !formData.brandId || cat.brandId === formData.brandId
                      )
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                  </select>
                  {!formData.brandId && (
                    <small
                      className="form-hint"
                      style={{
                        color: "#6B7280",
                        fontSize: "12px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Please select a brand first to see available categories
                    </small>
                  )}
                  {categories.length === 0 && (
                    <small
                      className="form-hint"
                      style={{
                        color: "#EF4444",
                        fontSize: "12px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      No categories available. Please add categories first.
                    </small>
                  )}
                  {formData.brandId &&
                    categories.filter((cat) => cat.brandId === formData.brandId)
                      .length === 0 && (
                      <small
                        className="form-hint"
                        style={{
                          color: "#EF4444",
                          fontSize: "12px",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        No categories found for the selected brand. Please add
                        categories for this brand first.
                      </small>
                    )}
                  {errors.categoryId && (
                    <span className="form-error">{errors.categoryId}</span>
                  )}
                  {formData.categoryId && (
                    <div className="form-group" style={{ marginTop: "8px" }}>
                      <label
                        className="admin-label"
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          fontWeight: "normal",
                        }}
                      >
                        Selected Category:
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={
                          categories.find((c) => c.id === formData.categoryId)
                            ?.title || ""
                        }
                        readOnly
                        style={{
                          backgroundColor: "#F9FAFB",
                          cursor: "not-allowed",
                          color: "#374151",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="admin-label">Title Font Size (px)</label>
                  <small className="form-hint">
                    Set the font size in pixels for the product title. Leave
                    empty to use the default size (44px).
                  </small>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.titleFontSize || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        titleFontSize: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="44"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Title Subtext</label>
                  <small className="form-hint">
                    Enter a subtext that appears below the product title (e.g.,
                    "by Soil King", "Premium Quality"). This provides additional
                    context about the product.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.titleSub || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, titleSub: e.target.value })
                    }
                    placeholder="e.g., by Soil King"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label">
                      Title Subtext Font Size (px)
                    </label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.titleSubFontSize || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleSubFontSize: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      placeholder="40"
                    />
                    <small className="form-hint">
                      Set the font size in pixels for the title subtext. Leave
                      empty to use the default size (40px).
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">
                      Title Subtext Width (px)
                    </label>
                    <small className="form-hint">
                      Set a fixed width in pixels for the title subtext
                      container. Leave empty for automatic width based on
                      content.
                    </small>
                    <input
                      type="number"
                      className="admin-input"
                      value={formData.titleSubWidth || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleSubWidth: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      placeholder="auto"
                    />
                  </div>
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Title & Subtext"}
                  </button>
                </div>

                <div className="form-group">
                  <label className="admin-label">Description</label>
                  <small className="form-hint">
                    Enter the main product description. This appears prominently
                    on the product page and provides key information about the
                    product.
                  </small>
                  <textarea
                    className="admin-input"
                    rows="3"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Main product description"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Secondary Description</label>
                  <small className="form-hint">
                    Enter additional product information or details. This
                    appears below the main description and can provide more
                    context or specifications.
                  </small>
                  <textarea
                    className="admin-input"
                    rows="3"
                    value={formData.description2 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description2: e.target.value })
                    }
                    placeholder="Additional product information"
                  />
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Descriptions"}
                  </button>
                </div>

                <div className="form-group">
                  <label className="admin-label">Category Tag</label>
                  <small className="form-hint">
                    Enter the category tag that appears on the product detail
                    page (e.g., "Masala", "Rice", "Spice"). This helps visitors
                    identify the product category at a glance.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Masala, Rice, Spice (shown as tag on product page)"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">Product Image</label>
                  <small className="form-hint">
                    Upload or select the main product image. This image appears
                    on product listings, product pages, and throughout the
                    website where the product is displayed.
                  </small>
                  <ImageSelector
                    value={formData.image || ""}
                    onChange={(imageUrl) =>
                      setFormData({ ...formData, image: imageUrl })
                    }
                  />
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Category Tag & Image"}
                  </button>
                </div>

                {/* Available Sizes */}
                <div className="form-group">
                  <label className="admin-label">Available Sizes</label>
                  <small className="form-hint">
                    Add the available sizes/packaging options for this product
                    (e.g., "100G", "500G", "1KG"). These appear on the product
                    page to show what sizes are available.
                  </small>
                  <div className="array-field">
                    {(formData.sizes || []).map((size, index) => (
                      <div key={index} className="array-item">
                        <input
                          type="text"
                          className="admin-input"
                          value={size}
                          onChange={(e) => {
                            const newSizes = [...(formData.sizes || [])];
                            newSizes[index] = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          placeholder="e.g., 100G, 500G"
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => {
                            const newSizes = (formData.sizes || []).filter(
                              (_, i) => i !== index
                            );
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          style={{ minWidth: "auto", padding: "8px 12px" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          sizes: [...(formData.sizes || []), ""],
                        });
                      }}
                      style={{ marginTop: "8px" }}
                    >
                      + Add Size
                    </button>
                  </div>
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Available Sizes"}
                  </button>
                </div>

                {/* Nutritional Information */}
                <div className="form-group">
                  <label className="admin-label">
                    Nutritional Information (Per 100g)
                  </label>
                  <div className="array-field">
                    {(formData.nutrition || []).map((item, index) => (
                      <div key={index} className="array-item nutrition-item">
                        <input
                          type="text"
                          className="admin-input"
                          value={item.nutrient || ""}
                          onChange={(e) => {
                            const newNutrition = [
                              ...(formData.nutrition || []),
                            ];
                            newNutrition[index] = {
                              ...newNutrition[index],
                              nutrient: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              nutrition: newNutrition,
                            });
                          }}
                          placeholder="Nutrient (e.g., Calories)"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          className="admin-input"
                          value={item.value || ""}
                          onChange={(e) => {
                            const newNutrition = [
                              ...(formData.nutrition || []),
                            ];
                            newNutrition[index] = {
                              ...newNutrition[index],
                              value: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              nutrition: newNutrition,
                            });
                          }}
                          placeholder="Value (e.g., 24Kcal)"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          className="admin-input"
                          value={item.dailyValue || ""}
                          onChange={(e) => {
                            const newNutrition = [
                              ...(formData.nutrition || []),
                            ];
                            newNutrition[index] = {
                              ...newNutrition[index],
                              dailyValue: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              nutrition: newNutrition,
                            });
                          }}
                          placeholder="Daily Value (e.g., 1% or -)"
                          style={{ flex: 1, maxWidth: "120px" }}
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => {
                            const newNutrition = (
                              formData.nutrition || []
                            ).filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              nutrition: newNutrition,
                            });
                          }}
                          style={{ minWidth: "auto", padding: "8px 12px" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          nutrition: [
                            ...(formData.nutrition || []),
                            { nutrient: "", value: "", dailyValue: "" },
                          ],
                        });
                      }}
                      style={{ marginTop: "8px" }}
                    >
                      + Add Nutrition Item
                    </button>
                  </div>
                </div>

                {/* Benefits */}
                <div className="form-group">
                  <label className="admin-label">
                    Benefits (Why Choose Section)
                  </label>
                  <small className="form-hint">
                    Add benefits that appear in the "Why Choose" section. Each
                    benefit has a title and description. These highlight the key
                    advantages of choosing this product.
                  </small>
                  <div className="array-field">
                    {(formData.benefits || []).map((benefit, index) => (
                      <div
                        key={index}
                        className="array-item benefit-item"
                      >
                        <label className="admin-label">
                          Benefit {index + 1}
                        </label>
                        <div className="form-group">
                          <label className="admin-label">
                            Benefit Title
                          </label>
                          <small className="form-hint">
                            Enter a short title for this benefit (e.g., "Steel",
                            "Authentic Flavor Blend"). This appears as the main
                            heading for the benefit.
                          </small>
                          <input
                            type="text"
                            className="admin-input"
                            value={benefit.title || ""}
                            onChange={(e) => {
                              const newBenefits = [
                                ...(formData.benefits || []),
                              ];
                              newBenefits[index] = {
                                ...newBenefits[index],
                                title: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                benefits: newBenefits,
                              });
                            }}
                            placeholder="Benefit Title (e.g., Steel, Authentic Flavor Blend)"
                          />
                        </div>
                        <div className="form-group">
                          <label className="admin-label">
                            Benefit Description
                          </label>
                          <small className="form-hint">
                            Enter a description explaining this benefit (e.g.,
                            "best quality spoons"). Use &lt;br/&gt; for line
                            breaks if needed.
                          </small>
                          <textarea
                            className="admin-input"
                            rows="3"
                            value={benefit.description || ""}
                            onChange={(e) => {
                              const newBenefits = [
                                ...(formData.benefits || []),
                              ];
                              newBenefits[index] = {
                                ...newBenefits[index],
                                description: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                benefits: newBenefits,
                              });
                            }}
                            placeholder="Benefit Description (e.g., best quality spoons). Use &lt;br/&gt; for line breaks."
                          />
                        </div>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => {
                            const newBenefits = (
                              formData.benefits || []
                            ).filter((_, i) => i !== index);
                            setFormData({ ...formData, benefits: newBenefits });
                          }}
                        >
                          Remove Benefit
                        </button>
                      </div>
                    ))}
                    {(!formData.benefits || formData.benefits.length === 0) && (
                      <p>
                        No benefits added. Click "Add Benefit" to add one.
                      </p>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          benefits: [
                            ...(formData.benefits || []),
                            { title: "", description: "" },
                          ],
                        });
                      }}
                    >
                      + Add Benefit
                    </button>
                  </div>
                  <div className="section-save-button">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="admin-btn admin-btn-primary"
                      disabled={saving}
                    >
                      {saving ? "💾 Saving..." : "💾 Save Benefits"}
                    </button>
                  </div>
                </div>

                {/* Why Choose Section */}
                <div
                  className="form-section-divider"
                  style={{ marginTop: "40px", pageBreakBefore: "always" }}
                >
                  <h3 className="form-section-title">Why Choose Section</h3>
                </div>

                <div className="form-group">
                  <label className="admin-label">Why Choose Title</label>
                  <textarea
                    className="admin-input"
                    rows="3"
                    value={formData.whyChooseTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whyChooseTitle: e.target.value,
                      })
                    }
                    placeholder="e.g., Why Choose Our&#10;{Product Name}?"
                  />
                  <p className="form-hint">
                    Use {"{Product Name}"} as placeholder - it will be replaced
                    with actual product title. Press Enter for line breaks
                    (e.g., "Why Choose Our" on first line, "{"{Product Name}"}"
                    on second line).
                  </p>
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Why Choose Title Text Alignment
                  </label>
                  <select
                    className="admin-select"
                    value={formData.whyChooseTitleAlign || "left"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whyChooseTitleAlign: e.target.value,
                      })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                  <p className="form-hint">
                    Controls the text alignment of the Why Choose title
                  </p>
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    Why Choose Background Image
                  </label>
                  <ImageSelector
                    value={formData.whyChooseBackground || ""}
                    onChange={(imageUrl) =>
                      setFormData({
                        ...formData,
                        whyChooseBackground: imageUrl,
                      })
                    }
                  />
                  <p className="form-hint">
                    Background image for the Why Choose section
                  </p>
                </div>

                {/* USP / Four Pillars Section */}
                <div className="form-section-divider">
                  <h3 className="form-section-title">
                    USP / Four Pillars Section
                  </h3>
                </div>

                <div className="form-group">
                  <label className="admin-label">USP Section Tag</label>
                  <small className="form-hint">
                    Select a star symbol from the dropdown and enter the tag
                    text (e.g., "USP", "ABOUT US"). This badge appears above the
                    USP section title.
                  </small>
                  <div
                    className="form-row"
                    style={{ gap: "8px", alignItems: "flex-end" }}
                  >
                    <div
                      className="form-group"
                      style={{ flex: "0 0 auto", marginBottom: 0 }}
                    >
                      <select
                        className="admin-select"
                        value={formData.uspTagStar || "★"}
                        onChange={(e) => {
                          const tagText = formData.uspTagText || "USP";
                          setFormData({
                            ...formData,
                            uspTagStar: e.target.value,
                            uspTag: `${e.target.value} ${tagText}`,
                          });
                        }}
                        style={{ minWidth: "80px" }}
                      >
                        <option value="★">★</option>
                        <option value="☆">☆</option>
                        <option value="✦">✦</option>
                        <option value="✧">✧</option>
                        <option value="✩">✩</option>
                        <option value="✪">✪</option>
                        <option value="✫">✫</option>
                        <option value="✬">✬</option>
                        <option value="✭">✭</option>
                        <option value="✮">✮</option>
                        <option value="✯">✯</option>
                        <option value="✰">✰</option>
                        <option value="">None</option>
                      </select>
                    </div>
                    <div
                      className="form-group"
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.uspTagText || "USP"}
                        onChange={(e) => {
                          const star = formData.uspTagStar || "★";
                          setFormData({
                            ...formData,
                            uspTagText: e.target.value,
                            uspTag: `${star} ${e.target.value}`,
                          });
                        }}
                        placeholder="USP, ABOUT US, CATEGORIES, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="admin-label">USP Section Title</label>
                  <small className="form-hint">
                    Enter the main title for the USP/Four Pillars section (e.g.,
                    "The Four Pillars of Our Quality Spice"). Use &lt;br/&gt;
                    for line breaks.
                  </small>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.uspTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, uspTitle: e.target.value })
                    }
                    placeholder="e.g., The Four Pillars of Our Quality Spice"
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    USP Section Title Text Alignment
                  </label>
                  <small className="form-hint">
                    Choose how the USP section title text is aligned (left,
                    center, or right). This affects how the title appears on the
                    product page.
                  </small>
                  <select
                    className="admin-select"
                    value={formData.uspTitleAlign || "left"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uspTitleAlign: e.target.value,
                      })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="admin-label">Four Pillars</label>
                  <small className="form-hint">
                    Add up to 4 pillars that represent the key qualities or USPs
                    of this product. Each pillar has an icon, title, and
                    description. Use &lt;br/&gt; in descriptions for line
                    breaks.
                  </small>
                  <div className="array-field">
                    {(formData.pillars || []).map((pillar, index) => (
                      <div key={index} className="array-item pillar-form-item">
                        <div className="pillar-form-header">
                          <h4 className="pillar-form-number">
                            Pillar {index + 1}
                          </h4>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => {
                              const newPillars = (
                                formData.pillars || []
                              ).filter((_, i) => i !== index);
                              setFormData({ ...formData, pillars: newPillars });
                            }}
                            style={{ minWidth: "auto", padding: "8px 12px" }}
                          >
                            Remove
                          </button>
                        </div>
                        <div
                          className="form-group"
                          style={{ marginBottom: "12px" }}
                        >
                          <label className="admin-label">Icon</label>
                          <small className="form-hint">
                            Upload or select an icon image for this pillar. The
                            icon appears next to the pillar title.
                          </small>
                          <ImageSelector
                            value={pillar.icon || ""}
                            onChange={(imageUrl) => {
                              const newPillars = [...(formData.pillars || [])];
                              newPillars[index] = {
                                ...newPillars[index],
                                icon: imageUrl,
                              };
                              setFormData({ ...formData, pillars: newPillars });
                            }}
                          />
                        </div>
                        <div
                          className="form-group"
                          style={{ marginBottom: "12px" }}
                        >
                          <label
                            className="admin-label"
                            style={{ fontSize: "13px" }}
                          >
                            Pillar Title
                          </label>
                          <small className="form-hint">
                            Enter the title for this pillar (e.g., "Pure &
                            Natural", "Premium Quality"). This appears as the
                            main heading for the pillar.
                          </small>
                          <input
                            type="text"
                            className="admin-input"
                            value={pillar.title || ""}
                            onChange={(e) => {
                              const newPillars = [...(formData.pillars || [])];
                              newPillars[index] = {
                                ...newPillars[index],
                                title: e.target.value,
                              };
                              setFormData({ ...formData, pillars: newPillars });
                            }}
                            placeholder="Pillar Title (e.g., Pure & Natural)"
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="admin-label"
                            style={{ fontSize: "13px" }}
                          >
                            Pillar Description
                          </label>
                          <small className="form-hint">
                            Enter a description explaining this pillar. Use
                            &lt;br/&gt; for line breaks if you need multiple
                            lines of text.
                          </small>
                          <textarea
                            className="admin-input"
                            rows="3"
                            value={pillar.description || ""}
                            onChange={(e) => {
                              const newPillars = [...(formData.pillars || [])];
                              newPillars[index] = {
                                ...newPillars[index],
                                description: e.target.value,
                              };
                              setFormData({ ...formData, pillars: newPillars });
                            }}
                            placeholder="Pillar Description (use &lt;br/&gt; for line breaks)"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          pillars: [
                            ...(formData.pillars || []),
                            { icon: "", title: "", description: "" },
                          ],
                        });
                      }}
                      style={{ marginTop: "8px" }}
                    >
                      + Add Pillar
                    </button>
                  </div>
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save USP & Four Pillars"}
                  </button>
                </div>

                <div className="form-group">
                  <label className="admin-label">Display Order</label>
                  <small className="form-hint">
                    Set the display order for this product. Lower numbers appear
                    first in product listings and category pages.
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
                        Only the first <strong>500 products</strong> are displayed in the
                        management list. Use search or filters to find specific
                        products if you have more than 500.
                      </span>
                    </div>
                  </div>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="admin-label">
                    <input
                      type="checkbox"
                      checked={formData.enabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, enabled: e.target.checked })
                      }
                    />
                    <span style={{ marginLeft: "8px" }}>Enabled</span>
                  </label>
                  <small className="form-hint">
                    When enabled, this product will be visible on the website.
                    Disabled products are hidden from product listings, category
                    pages, and search results.
                  </small>
                </div>

                <div className="section-save-button">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "💾 Saving..." : "💾 Save Product"}
                  </button>
                </div>
              </>
            )}

            <div className="product-form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="admin-btn admin-btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="admin-spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></span>
                    Saving...
                  </>
                ) : item ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          {type === "products" && showPreview && (
            <div className="product-form-preview">
              <div className="product-form-preview-header">
                <h3 className="admin-heading-3">Live Preview</h3>
                <p className="admin-text-sm">
                  See how your product will look on the website
                </p>
              </div>
              <div className="product-form-preview-content">
                <ProductPreview
                  formData={formData}
                  brands={brands}
                  categories={categories}
                />
              </div>
            </div>
          )}

          {type === "categories" && showPreview && (
            <div className="product-form-preview">
              <div className="product-form-preview-header">
                <h3 className="admin-heading-3">Live Preview</h3>
                <p className="admin-text-sm">
                  See how your category will look on the website
                </p>
              </div>
              <div className="product-form-preview-content">
                <CategoryPreview formData={formData} brands={brands} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
