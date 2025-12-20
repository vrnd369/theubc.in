import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import NavigationItemCard from '../../components/NavigationItemCard/NavigationItemCard';
import NavigationEditor from '../../components/NavigationEditor/NavigationEditor';
import Navbar from '../../../components/Navbar';
import { 
  getNavigationItems, 
  addNavigationItem,
  getNavigationConfig,
  setNavigationConfig
} from '../../services/navigationService';
import { usePermissions } from '../../auth/usePermissions';
import soilKingIcon from '../../../assets/soilkingicon.png';
import wellnessIcon from '../../../assets/wellnessicon.png';
import masalasSpicesIcon from '../../../assets/masalas and spices.png';
import riceIcon from '../../../assets/rice.png';
import appalamIcon from '../../../assets/appalam.png';
import pasteIcon from '../../../assets/paste.png';
import './NavigationManagement.css';

export default function NavigationManagement() {
  const { canDelete, canCreate } = usePermissions();
  const [navigationItems, setNavigationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);
  const [refreshNavbar, setRefreshNavbar] = useState(0); // Force navbar refresh
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [enquiryButtonText, setEnquiryButtonText] = useState('Enquiry Form');
  const [enquiryButtonColor, setEnquiryButtonColor] = useState('#007bff');
  const [hoverEffectColor, setHoverEffectColor] = useState('#F7F7FB');
  const [productDropdownHoverColor, setProductDropdownHoverColor] = useState('#F7F7FB');
  const [savingEnquiryButton, setSavingEnquiryButton] = useState(false);
  const [savingHoverColor, setSavingHoverColor] = useState(false);
  const [savingProductDropdownHoverColor, setSavingProductDropdownHoverColor] = useState(false);
  const editorContainerRef = useRef(null);

  useEffect(() => {
    fetchConfig();
    fetchNavigationItems();
  }, []);

  // Scroll to editor when editing or adding
  useEffect(() => {
    if ((editingItem || showAddForm) && editorContainerRef.current) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        editorContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [editingItem, showAddForm]);

  const fetchConfig = async () => {
    try {
      const config = await getNavigationConfig();
      setAutoGenerate(config.autoGenerate !== false);
      setEnquiryButtonText(config.enquiryButtonText || 'Enquiry Form');
      setEnquiryButtonColor(config.enquiryButtonColor || '#007bff');
      setHoverEffectColor(config.hoverEffectColor || '#F7F7FB');
      setProductDropdownHoverColor(config.productDropdownHoverColor || '#F7F7FB');
    } catch (err) {
      console.error('Error fetching navigation config:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleToggleAutoGenerate = async (enabled) => {
    try {
      await setNavigationConfig({ autoGenerate: enabled });
      setAutoGenerate(enabled);
      await fetchNavigationItems();
      alert(enabled 
        ? 'Auto-generate enabled! Navigation will now sync automatically from brands and categories.' 
        : 'Auto-generate disabled! You can now manually manage navigation items.'
      );
    } catch (err) {
      console.error('Error updating navigation config:', err);
      alert('Error updating navigation configuration. Please try again.');
    }
  };

  const handleSaveEnquiryButton = async () => {
    try {
      setSavingEnquiryButton(true);
      // Get current config to preserve other settings
      const currentConfig = await getNavigationConfig();
      await setNavigationConfig({
        ...currentConfig,
        enquiryButtonText: enquiryButtonText.trim() || 'Enquiry Form',
        enquiryButtonColor: enquiryButtonColor || '#007bff'
      });
      alert('Enquiry button settings saved successfully!');
      setRefreshNavbar(prev => prev + 1); // Refresh navbar preview
    } catch (err) {
      console.error('Error saving enquiry button settings:', err);
      alert('Error saving enquiry button settings. Please try again.');
    } finally {
      setSavingEnquiryButton(false);
    }
  };

  const handleSaveHoverColor = async () => {
    try {
      setSavingHoverColor(true);
      // Get current config to preserve other settings
      const currentConfig = await getNavigationConfig();
      await setNavigationConfig({
        ...currentConfig,
        hoverEffectColor: hoverEffectColor || '#F7F7FB'
      });
      alert('Hover effect color saved successfully!');
      setRefreshNavbar(prev => prev + 1); // Refresh navbar preview
    } catch (err) {
      console.error('Error saving hover effect color:', err);
      alert('Error saving hover effect color. Please try again.');
    } finally {
      setSavingHoverColor(false);
    }
  };

  const handleSaveProductDropdownHoverColor = async () => {
    try {
      setSavingProductDropdownHoverColor(true);
      // Get current config to preserve other settings
      const currentConfig = await getNavigationConfig();
      await setNavigationConfig({
        ...currentConfig,
        productDropdownHoverColor: productDropdownHoverColor || '#F7F7FB'
      });
      alert('Product dropdown hover color saved successfully!');
      setRefreshNavbar(prev => prev + 1); // Refresh navbar preview
    } catch (err) {
      console.error('Error saving product dropdown hover color:', err);
      alert('Error saving product dropdown hover color. Please try again.');
    } finally {
      setSavingProductDropdownHoverColor(false);
    }
  };

  const fetchNavigationItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getNavigationItems();
      setNavigationItems(items);
      // Trigger navbar refresh to show updated navigation
      setRefreshNavbar(prev => prev + 1);
    } catch (err) {
      console.error('Error fetching navigation:', err);
      setError('Failed to load navigation items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddForm(false);
  };

  const handleDelete = async (item) => {
    // Extract the correct ID - prefer firestoreId, then id
    const itemId = item?.firestoreId || item?.id || item;
    
    if (!itemId || typeof itemId !== 'string') {
      alert('Error: Cannot delete navigation item. Invalid item ID.');
      console.error('Invalid item for deletion:', item);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this navigation item? This action cannot be undone.')) {
      try {
        const { deleteNavigationItem } = await import('../../services/navigationService');
        await deleteNavigationItem(itemId);
        await fetchNavigationItems();
        alert('Navigation item deleted successfully!');
      } catch (err) {
        console.error('Error deleting item:', err);
        alert(`Error deleting navigation item: ${err.message || 'Please try again.'}`);
      }
    }
  };

  const handleSave = async () => {
    await fetchNavigationItems();
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setShowAddForm(false);
  };

  // Import default navigation structure (migration tool)
  const handleImportDefaultNavigation = async () => {
    if (!window.confirm('This will import the default navigation structure. Continue?')) {
      return;
    }

    const defaultNavigation = [
      {
        label: 'Home',
        path: '/',
        type: 'link',
        order: 1
      },
      {
        label: 'About Us',
        path: '/about',
        type: 'link',
        order: 2
      },
      {
        label: 'Our Brands',
        path: '/brands',
        type: 'dropdown',
        order: 3,
        items: [
          {
            id: 'brand-soil-king',
            label: 'Soil King',
            path: '/brands/soil-king',
            type: 'link',
            icon: soilKingIcon
          },
          {
            id: 'brand-wellness',
            label: 'Wellness',
            path: '/brands/wellness',
            type: 'link',
            icon: wellnessIcon
          }
        ]
      },
      {
        label: 'Products',
        path: '/products',
        type: 'dropdown',
        order: 4,
        items: [
          {
            id: 'product-soil-king',
            label: 'Soil King',
            path: '/products?brand=soil-king',
            type: 'submenu',
            icon: soilKingIcon,
            subItems: [
              {
                id: 'sub-masalas',
                label: 'Masalas',
                path: '/products?brand=soil-king&category=masalas',
                icon: masalasSpicesIcon
              },
              {
                id: 'sub-masalas-spices',
                label: 'Masalas & Spices',
                path: '/products?brand=soil-king&category=masalas-spices',
                icon: masalasSpicesIcon
              },
              {
                id: 'sub-rice',
                label: 'Rice',
                path: '/products?brand=soil-king&category=rice',
                icon: riceIcon
              },
              {
                id: 'sub-appalams',
                label: 'Appalams & Crisps',
                path: '/products?brand=soil-king&category=appalams',
                icon: appalamIcon
              },
              {
                id: 'sub-pastes',
                label: 'Pastes & Ready Mix',
                path: '/products?brand=soil-king&category=pastes',
                icon: pasteIcon
              }
            ]
          },
          {
            id: 'product-wellness',
            label: 'Wellness',
            path: '/products?brand=wellness',
            type: 'submenu',
            icon: wellnessIcon,
            subItems: [
              {
                id: 'sub-premium-masalas',
                label: 'Premium Masalas',
                path: '/products?brand=wellness&category=masalas',
                icon: masalasSpicesIcon
              },
              {
                id: 'sub-spice-collection',
                label: 'Spice Collection',
                path: '/products?brand=wellness&category=masalas-spices',
                icon: masalasSpicesIcon
              },
              {
                id: 'sub-organic-rice',
                label: 'Organic Rice',
                path: '/products?brand=wellness&category=rice',
                icon: riceIcon
              },
              {
                id: 'sub-healthy-snacks',
                label: 'Healthy Snacks',
                path: '/products?brand=wellness&category=appalams',
                icon: appalamIcon
              },
              {
                id: 'sub-pure-spices',
                label: 'Pure Spices',
                path: '/products?brand=wellness&category=spices',
                icon: masalasSpicesIcon
              },
              {
                id: 'sub-organic-pastes',
                label: 'Organic Pastes',
                path: '/products?brand=wellness&category=pastes',
                icon: pasteIcon
              }
            ]
          }
        ]
      },
      {
        label: 'Contact Us',
        path: '/contact',
        type: 'link',
        order: 5
      },
      {
        label: 'Careers',
        path: '/careers',
        type: 'link',
        order: 6
      }
    ];

    try {
      // Add all navigation items
      for (const item of defaultNavigation) {
        await addNavigationItem(item);
      }
      alert('Default navigation imported successfully!');
      await fetchNavigationItems();
    } catch (err) {
      console.error('Error importing navigation:', err);
      alert('Error importing navigation. Please try again.');
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="navigation">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p className="admin-text-sm">Loading navigation items...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="navigation">
      <div className="navigation-management">
        {/* Page Header */}
        <div className="navigation-header">
          <div>
            <h1 className="admin-heading-1">Navigation Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              {autoGenerate 
                ? 'Navigation is automatically generated from your brands and categories. Changes to brands/categories will automatically update the navbar.'
                : 'Manage your website navigation menu, dropdowns, and submenus manually.'
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--admin-spacing-sm)', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => handleToggleAutoGenerate(e.target.checked)}
                disabled={configLoading}
              />
              <span className="admin-text-sm">Auto-generate from Products</span>
            </label>
            {canCreate && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
              }}
              className="admin-btn admin-btn-primary"
            >
              + Add New Item
            </button>
            )}
          </div>
        </div>

        {/* Auto-generate Info Banner */}
        {autoGenerate && (
          <div className="admin-alert admin-alert-info" style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
            <strong>ℹ️ Auto-Generate Enabled</strong>
            <p className="admin-text-sm admin-mt-xs">
              <strong>Hybrid Mode:</strong> Navigation items are automatically generated from brands and categories in <strong>Product Management</strong>. 
              The dropdown items (Our Brands and Products) are auto-managed, but you can edit the main navigation item properties (label, path, type, order).
              When you add, edit, or delete brands/categories in Product Management, the dropdown items will automatically update.
            </p>
            <p className="admin-text-sm admin-mt-xs" style={{ marginTop: '8px' }}>
              <strong>Note:</strong> For auto-generated items, the ID and dropdown items list are managed automatically. You can still edit the label, path, type, and order.
            </p>
          </div>
        )}

        {/* Enquiry Button Settings */}
        <div className="admin-card" style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
          <div style={{ marginBottom: 'var(--admin-spacing-md)' }}>
            <h2 className="admin-heading-3">Enquiry Button Settings</h2>
            <p className="admin-text-sm admin-mt-xs" style={{ color: 'var(--admin-text-light)' }}>
              Customize the enquiry button text and color that appears in the navigation bar.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-spacing-md)' }}>
            <div>
              <label className="admin-label">
                Button Text
              </label>
              <input
                type="text"
                value={enquiryButtonText}
                onChange={(e) => setEnquiryButtonText(e.target.value)}
                placeholder="Enquiry Form"
                className="admin-input"
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>
            <div>
              <label className="admin-label">
                Button Color
              </label>
              <div style={{ display: 'flex', gap: 'var(--admin-spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={enquiryButtonColor}
                  onChange={(e) => setEnquiryButtonColor(e.target.value)}
                  className="admin-input"
                  style={{ width: '60px', height: '40px', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={enquiryButtonColor}
                  onChange={(e) => setEnquiryButtonColor(e.target.value)}
                  placeholder="#007bff"
                  className="admin-input"
                  style={{ width: '120px' }}
                />
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: enquiryButtonColor,
                    border: '1px solid var(--admin-border-color)',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                  title="Preview"
                />
              </div>
            </div>
            <div>
              <button
                onClick={handleSaveEnquiryButton}
                disabled={savingEnquiryButton || configLoading}
                className="admin-btn admin-btn-primary"
              >
                {savingEnquiryButton ? 'Saving...' : 'Save Enquiry Button Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Hover Effect Color Settings */}
        <div className="admin-card" style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
          <div style={{ marginBottom: 'var(--admin-spacing-md)' }}>
            <h2 className="admin-heading-3">Navigation Hover Effect Color</h2>
            <p className="admin-text-sm admin-mt-xs" style={{ color: 'var(--admin-text-light)' }}>
              Customize the background color that appears when hovering over the enquiry form button.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-spacing-md)' }}>
            <div>
              <label className="admin-label">
                Hover Effect Color
              </label>
              <div style={{ display: 'flex', gap: 'var(--admin-spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={hoverEffectColor}
                  onChange={(e) => setHoverEffectColor(e.target.value)}
                  className="admin-input"
                  style={{ width: '60px', height: '40px', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={hoverEffectColor}
                  onChange={(e) => setHoverEffectColor(e.target.value)}
                  placeholder="#F7F7FB"
                  className="admin-input"
                  style={{ width: '120px' }}
                />
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: hoverEffectColor,
                    border: '1px solid var(--admin-border-color)',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                  title="Preview"
                />
              </div>
              <small className="form-hint" style={{ display: 'block', marginTop: '8px', color: 'var(--admin-text-light)' }}>
                This color will be applied when users hover over the enquiry form button.
              </small>
            </div>
            <div>
              <button
                onClick={handleSaveHoverColor}
                disabled={savingHoverColor || configLoading}
                className="admin-btn admin-btn-primary"
              >
                {savingHoverColor ? 'Saving...' : 'Save Hover Effect Color'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Dropdown Hover Effect Color Settings */}
        <div className="admin-card" style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
          <div style={{ marginBottom: 'var(--admin-spacing-md)' }}>
            <h2 className="admin-heading-3">Product Dropdown Hover Effect Color</h2>
            <p className="admin-text-sm admin-mt-xs" style={{ color: 'var(--admin-text-light)' }}>
              Customize the background color that appears when hovering over product dropdown category items.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-spacing-md)' }}>
            <div>
              <label className="admin-label">
                Product Dropdown Hover Color
              </label>
              <div style={{ display: 'flex', gap: 'var(--admin-spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={productDropdownHoverColor}
                  onChange={(e) => setProductDropdownHoverColor(e.target.value)}
                  className="admin-input"
                  style={{ width: '60px', height: '40px', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={productDropdownHoverColor}
                  onChange={(e) => setProductDropdownHoverColor(e.target.value)}
                  placeholder="#F7F7FB"
                  className="admin-input"
                  style={{ width: '120px' }}
                />
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: productDropdownHoverColor,
                    border: '1px solid var(--admin-border-color)',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                  title="Preview"
                />
              </div>
              <small className="form-hint" style={{ display: 'block', marginTop: '8px', color: 'var(--admin-text-light)' }}>
                This color will be applied when users hover over category items in the product dropdown menu.
              </small>
            </div>
            <div>
              <button
                onClick={handleSaveProductDropdownHoverColor}
                disabled={savingProductDropdownHoverColor || configLoading}
                className="admin-btn admin-btn-primary"
              >
                {savingProductDropdownHoverColor ? 'Saving...' : 'Save Product Dropdown Hover Color'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Navbar Preview */}
        <div className="navbar-preview-section">
          <div className="preview-header">
            <div>
              <h2 className="admin-heading-3">Live Navigation Preview</h2>
              <p className="admin-text-sm">See how your navigation looks on the website. Changes will appear here after saving.</p>
              <p className="admin-text-sm admin-mt-xs" style={{ color: 'var(--admin-text-light)', fontStyle: 'italic' }}>
                💡 Header styling (logo, colors, fonts) can be customized in <strong>Header Styling</strong> page.
              </p>
            </div>
            {navigationItems.length === 0 && (
              <button
                onClick={handleImportDefaultNavigation}
                className="admin-btn admin-btn-secondary"
              >
                📥 Import Default Navigation
              </button>
            )}
          </div>
          <div className="navbar-preview-container">
            <div className="preview-wrapper">
              <Navbar key={refreshNavbar} />
            </div>
            {navigationItems.length === 0 && (
              <div className="preview-empty-state">
                <p className="admin-text-sm">No navigation items found. The navbar will appear here once you add items.</p>
                <p className="admin-text-sm admin-mt-sm">
                  Click "Import Default Navigation" above to import the current website navigation, or create new items below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button onClick={fetchNavigationItems} className="admin-btn admin-btn-secondary admin-mt-sm">
              Retry
            </button>
          </div>
        )}

        {/* Add/Edit Form - Show when editing or adding (works for both auto-generate enabled and disabled) */}
        {(showAddForm || editingItem) && (
          <div className="navigation-editor-container" ref={editorContainerRef}>
            <NavigationEditor
              item={editingItem}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Navigation Items List */}
        {autoGenerate ? (
          // Show editable view when auto-generate is enabled (items can be edited but id/autoGenerated are preserved)
          <div className="navigation-items-grid">
            {navigationItems.slice(0, 10).map((item, index) => (
              <div key={item.id || item.firestoreId || index} className="navigation-item-card admin-card">
                <div className="navigation-item-header">
                  <div className="navigation-item-title-section">
                    <h3 className="admin-heading-3">{item.label}</h3>
                    {item.autoGenerated && (
                      <span className="admin-badge" style={{ 
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        marginLeft: '8px'
                      }}>
                        Auto-generated
                      </span>
                    )}
                  </div>
                  <div className="navigation-item-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="admin-btn admin-btn-secondary"
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    {!item.autoGenerated && canDelete && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="admin-btn admin-btn-danger"
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="navigation-item-details">
                  <div className="detail-row">
                    <span className="detail-label">Path:</span>
                    <span className="detail-value">{item.path || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{item.type || 'link'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Order:</span>
                    <span className="detail-value">{item.order}</span>
                  </div>
                  {item.autoGenerated && (
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {item.id}
                      </span>
                    </div>
                  )}
                  {item.type === 'dropdown' && item.items && (
                    <div className="detail-row">
                      <span className="detail-label">Items:</span>
                      <span className="detail-value">
                        {item.items.length} {item.items.length === 1 ? 'item' : 'items'} (auto-generated)
                      </span>
                    </div>
                  )}
                </div>
                {item.type === 'dropdown' && item.items && item.items.length > 0 && (
                  <div className="navigation-item-preview">
                    <p className="preview-label">Preview:</p>
                    <div className="preview-items">
                      {item.items.slice(0, 3).map((subItem, idx) => (
                        <span key={idx} className="preview-item">
                          {subItem.label}
                        </span>
                      ))}
                      {item.items.length > 3 && (
                        <span className="preview-item-more">
                          +{item.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : navigationItems.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-text">No navigation items found.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="admin-btn admin-btn-primary admin-mt-md"
            >
              Create Your First Item
            </button>
          </div>
        ) : (
          <div className="navigation-items-grid">
            {navigationItems.slice(0, 10).map((item) => (
              <NavigationItemCard
                key={item.firestoreId || item.id}
                item={item}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

