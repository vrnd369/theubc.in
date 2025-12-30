import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/Logo ubc.png";
import {
  getNavigationItems,
  ensureAutoGenerateEnabled,
  getNavigationConfig,
} from "../admin/services/navigationService";
import { resolveImageUrl } from "../utils/imageUtils";
import { getHeaderConfig } from "../admin/services/headerService";
import { getEnquiryFormConfig } from "../admin/services/enquiryFormService";
import { cacheUtils } from "../utils/localStorageUtils";

export default function Navbar({ previewHeaderConfig = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [navigationItems, setNavigationItems] = useState(() => cacheUtils.loadNavItems());
  
  // Load cached icons immediately (with expiration check)
  const [resolvedIcons, setResolvedIcons] = useState(() => cacheUtils.loadNavIcons());
  const [headerConfig, setHeaderConfig] = useState(() => cacheUtils.loadHeaderConfig());
  const [resolvedLogo, setResolvedLogo] = useState(() => cacheUtils.loadLogo());
  const leaveTimeoutRef = useRef(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryFormConfig, setEnquiryFormConfig] = useState(null);
  const [enquiryButtonText, setEnquiryButtonText] = useState('Enquiry Form');
  const [enquiryButtonColor, setEnquiryButtonColor] = useState('#007bff');
  const [hoverEffectColor, setHoverEffectColor] = useState(null);

  // Fetch navigation from Firestore and resolve images - optimized for performance
  const fetchNavigation = async (forceRefresh = false) => {
    try {
      const items = await getNavigationItems();

      // Set navigation items IMMEDIATELY - don't wait for icons
      setNavigationItems(items);
      cacheUtils.saveNavItems(items);

      // Resolve icons in background (non-blocking) - don't await before setting items
      const iconPromises = [];
      const iconMap = {};

      const resolveIconsRecursive = (navItems) => {
        navItems.forEach((item) => {
          // Resolve icon for dropdown items
          if (item.items) {
            item.items.forEach((subItem) => {
              if (subItem.icon) {
                const iconKey = `${item.id}-${subItem.id}`;
                iconPromises.push(
                  resolveImageUrl(subItem.icon)
                    .then((url) => {
                      iconMap[iconKey] = url;
                    })
                    .catch((err) => {
                      console.error(
                        `Error resolving icon for ${subItem.label}:`,
                        err
                      );
                      iconMap[iconKey] = subItem.icon; // Fallback to original
                    })
                );
              }
              // Resolve icons for submenu items
              if (subItem.subItems) {
                subItem.subItems.forEach((subSubItem) => {
                  if (subSubItem.icon) {
                    const iconKey = `${item.id}-${subItem.id}-${subSubItem.id}`;
                    iconPromises.push(
                      resolveImageUrl(subSubItem.icon)
                        .then((url) => {
                          iconMap[iconKey] = url;
                        })
                        .catch((err) => {
                          console.error(
                            `Error resolving icon for ${subSubItem.label}:`,
                            err
                          );
                          iconMap[iconKey] = subSubItem.icon; // Fallback to original
                        })
                    );
                  }
                });
              }
            });
          }
        });
      };

      resolveIconsRecursive(items);
      
      // Resolve icons in background - update state when ready
      Promise.all(iconPromises).then(() => {
        setResolvedIcons(iconMap);
        // Cache the resolved icons with expiration
        cacheUtils.saveNavIcons(iconMap);
      }).catch(() => {
        // Even if some icons fail, update with what we have
        setResolvedIcons(iconMap);
      });
    } catch (error) {
      console.error("Error fetching navigation:", error);
      // Fallback to empty array if Firestore fails
      setNavigationItems([]);
    }
  };

  // Fetch header configuration
  useEffect(() => {
    // If preview config is provided, use it directly (for live preview in admin)
    if (previewHeaderConfig) {
      setHeaderConfig(previewHeaderConfig);
      // Resolve logo if configured
      if (previewHeaderConfig.logo) {
        resolveImageUrl(previewHeaderConfig.logo)
          .then((logoUrl) => setResolvedLogo(logoUrl))
          .catch(() => setResolvedLogo(null));
      } else {
        setResolvedLogo(null);
      }
      return;
    }

    // Otherwise, fetch from Firestore (with cache as instant fallback)
    const fetchHeaderConfig = async () => {
      try {
        const config = await getHeaderConfig();
        setHeaderConfig(config);
        cacheUtils.saveHeaderConfig(config);

        // Resolve logo if configured
        if (config.logo) {
          const logoUrl = await resolveImageUrl(config.logo);
          setResolvedLogo(logoUrl);
          cacheUtils.saveLogo(logoUrl);
        } else {
          setResolvedLogo(null);
          cacheUtils.saveLogo(null);
        }
      } catch (error) {
        console.warn("Error fetching header config, using cached/default:", error);
        // Try to use cached config if available
        const cachedConfig = cacheUtils.loadHeaderConfig();
        if (cachedConfig) {
          setHeaderConfig(cachedConfig);
          const cachedLogo = cacheUtils.loadLogo();
          if (cachedLogo) {
            setResolvedLogo(cachedLogo);
          }
        }
        // If no cache, defaults will be used (already set in state)
      }
    };

    fetchHeaderConfig();

    // Refresh header config less frequently - every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchHeaderConfig, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [previewHeaderConfig]);

  // Fetch enquiry form configuration
  useEffect(() => {
    const fetchEnquiryFormConfig = async () => {
      try {
        const config = await getEnquiryFormConfig();
        setEnquiryFormConfig(config);
      } catch (error) {
        console.error("Error fetching enquiry form config:", error);
      }
    };

    fetchEnquiryFormConfig();

    // Refresh enquiry form config less frequently - every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchEnquiryFormConfig, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Fetch navigation config for enquiry button settings and hover color - optimized
  useEffect(() => {
    const fetchNavigationConfig = async () => {
      try {
        const config = await getNavigationConfig();
        if (config.enquiryButtonText) {
          setEnquiryButtonText(config.enquiryButtonText);
        }
        if (config.enquiryButtonColor) {
          setEnquiryButtonColor(config.enquiryButtonColor);
        }
        if (config.hoverEffectColor) {
          setHoverEffectColor(config.hoverEffectColor);
        }
      } catch (error) {
        console.error("Error fetching navigation config:", error);
      }
    };

    fetchNavigationConfig();

    // Refresh navigation config less frequently - every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchNavigationConfig, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Combined initialization and navigation fetch - optimized
  useEffect(() => {
    // Ensure auto-generation is enabled on mount (non-blocking)
    ensureAutoGenerateEnabled().catch((err) => {
      console.error("Error ensuring auto-generation:", err);
    });
    
    // Fetch navigation on mount (uses cache immediately)
    fetchNavigation();
  }, []);

  // Refresh navigation only on window focus (debounced) - removed excessive refreshes
  useEffect(() => {
    let focusTimeout;
    const handleFocus = () => {
      // Debounce focus refresh to avoid multiple rapid refreshes
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        fetchNavigation(true);
      }, 1000); // Wait 1 second after focus before refreshing
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(focusTimeout);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    const handleResize = () => {
      // If we're on desktop (width > 1023px) and mobile menu is open, close it
      if (window.innerWidth > 1023 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
        setOpenSubmenu(null);
      }
    };

    // Debounce resize events to avoid excessive calls
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobileMenuOpen]);

  // close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Check if we're on mobile/tablet (where mouse events shouldn't trigger dropdowns)
  const isMobileView = () => {
    return window.innerWidth <= 1023;
  };

  const handleMouseEnter = (name, e) => {
    // Don't handle mouse events on mobile - only use click
    if (isMobileView()) return;
    
    // Clear any pending close timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    // Immediately set this dropdown as open - this will close any other open dropdown
    // React state updates are synchronous for the same render cycle
    setOpenDropdown(name);
  };
  const handleMouseLeave = (name) => {
    // Don't handle mouse events on mobile - only use click
    if (isMobileView()) return;
    
    // Add a small delay before closing to allow moving to the menu
    leaveTimeoutRef.current = setTimeout(() => {
      // Only close if this is still the open dropdown
      if (openDropdown === name) {
        setOpenDropdown(null);
      }
      leaveTimeoutRef.current = null;
    }, 150);
  };
  const toggleDropdown = (name, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((v) => !v);
    // Always close all dropdowns when toggling mobile menu
    setOpenDropdown(null);
    setOpenSubmenu(null);
  };
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenu(null);
  };
  const handleLogoClick = (e) => {
    closeMobileMenu();
    // If already on home page, prevent navigation and scroll to top
    if (location.pathname === "/") {
      e.preventDefault();
      // Use multiple methods to ensure scrolling works
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // Also try scrolling to hero section if it exists
      const heroSection = document.querySelector('.hero') || document.querySelector('section.hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // If on another page, navigate to home and scroll to top after navigation
      navigate("/");
      // Use setTimeout with longer delay to ensure page has loaded
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // Also try scrolling to hero section if it exists
        const heroSection = document.querySelector('.hero') || document.querySelector('section.hero');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  };

  // lock body scroll when the sheet is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  // Handle wheel events on categories scroll container to enable horizontal scrolling with vertical mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      const container = e.currentTarget;
      // Only handle if there's vertical scroll (deltaY) and the container can scroll horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Prevent default vertical scrolling
        e.preventDefault();
        // Convert vertical scroll to horizontal scroll
        container.scrollLeft += e.deltaY;
      }
    };

    // Use a small timeout to ensure DOM is updated after state changes
    const timeoutId = setTimeout(() => {
      // Find all categories scroll containers and add event listeners
      const containers = document.querySelectorAll('.categories-scroll-container');
      containers.forEach((container) => {
        container.addEventListener('wheel', handleWheel, { passive: false });
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      // Clean up: find all containers and remove listeners
      const containers = document.querySelectorAll('.categories-scroll-container');
      containers.forEach((container) => {
        container.removeEventListener('wheel', handleWheel);
      });
    };
  }, [openDropdown, navigationItems]); // Re-run when dropdown opens or navigation items change

  // Helper function to parse query parameters from a path string
  const parseQueryParams = (pathString) => {
    const params = {};
    if (pathString && pathString.includes('?')) {
      const queryString = pathString.split('?')[1];
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }
    return params;
  };

  // Check if current route matches a navigation item
  const isItemActive = (item) => {
    if (item.type === "dropdown") {
      // First check if the dropdown's own path matches
      if (item.path) {
        const itemPathname = item.path.split('?')[0];
        const pathnameMatch = 
          location.pathname === itemPathname ||
          (itemPathname !== "/" && location.pathname.startsWith(itemPathname));
        
        if (pathnameMatch) {
          // If the dropdown path has query params, check if they match
          if (item.path.includes('?')) {
            const itemParams = parseQueryParams(item.path);
            const currentCategory = searchParams.get('category');
            const currentBrand = searchParams.get('brand');
            
            // If item specifies category, it must match
            if (itemParams.category && currentCategory !== itemParams.category) {
              // Pathname matches but category doesn't, continue checking sub-items
            } else if (itemParams.brand && currentBrand !== itemParams.brand) {
              // Pathname matches but brand doesn't, continue checking sub-items
            } else {
              // Pathname matches and query params match (or no query params in item path)
              return true;
            }
          } else {
            // Pathname matches and no query params in dropdown path - it's active
            return true;
          }
        }
      }
      
      // Then check if any sub-item matches
      return item.items?.some((subItem) => {
        if (subItem.type === "submenu") {
          return subItem.subItems?.some((subSubItem) => {
            if (!subSubItem.path) return false;
            
            // Extract pathname from subSubItem.path (remove query params)
            const itemPathname = subSubItem.path.split('?')[0];
            
            // Check pathname match
            const pathnameMatch = 
              location.pathname === itemPathname ||
              (itemPathname !== "/" && location.pathname.startsWith(itemPathname));
            
            // If pathname matches and subSubItem has query params, check them
            if (pathnameMatch && subSubItem.path.includes('?')) {
              const itemParams = parseQueryParams(subSubItem.path);
              const currentCategory = searchParams.get('category');
              const currentBrand = searchParams.get('brand');
              
              // Check if category matches
              if (itemParams.category) {
                if (currentCategory !== itemParams.category) {
                  return false;
                }
              }
              
              // Check if brand matches (if specified in item)
              if (itemParams.brand) {
                if (currentBrand !== itemParams.brand) {
                  return false;
                }
              }
            }
            
            return pathnameMatch;
          });
        }
        
        if (!subItem.path) return false;
        
        // Extract pathname from subItem.path (remove query params)
        const itemPathname = subItem.path.split('?')[0];
        
        // Check pathname match
        const pathnameMatch = 
          location.pathname === itemPathname ||
          (itemPathname !== "/" && location.pathname.startsWith(itemPathname));
        
        // If pathname matches and subItem has query params, check them
        if (pathnameMatch && subItem.path.includes('?')) {
          const itemParams = parseQueryParams(subItem.path);
          const currentCategory = searchParams.get('category');
          const currentBrand = searchParams.get('brand');
          
          // Check if category matches
          if (itemParams.category) {
            if (currentCategory !== itemParams.category) {
              return false;
            }
          }
          
          // Check if brand matches (if specified in item)
          if (itemParams.brand) {
            if (currentBrand !== itemParams.brand) {
              return false;
            }
          }
        }
        
        return pathnameMatch;
      });
    }
    return (
      location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path))
    );
  };

  // Render navigation items dynamically
  const renderNavItem = (item) => {
    if (item.type === "link") {
      return (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === "/"}
          onClick={closeMobileMenu}
        >
          {item.label}
        </NavLink>
      );
    }

    if (item.type === "dropdown") {
      const isActive = isItemActive(item);
      // Use a unique identifier - item.id or generate one from label
      const dropdownId =
        item.id || `dropdown-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
      const isOpen = openDropdown === dropdownId;
      const isCategoriesMenu = item.id === "nav-products";
      // Hide arrow on brand pages for "Our Brands" dropdown
      const isBrandPage = location.pathname.startsWith("/brands");
      const isOurBrandsDropdown = item.id === "nav-our-brands";
      // Hide arrow on products page for "Products" dropdown
      const isProductsPage = location.pathname === "/products";
      const isProductsDropdown = item.id === "nav-products";
      const shouldHideArrow = (isBrandPage && isOurBrandsDropdown) || (isProductsPage && isProductsDropdown);
      
      return (
        <div
          key={dropdownId}
          className={`dropdown ${isActive ? "active" : ""} ${
            isOpen ? "open" : ""
          }`}
          onMouseEnter={(e) => {
            // Only handle mouse events on desktop
            if (isMobileView()) return;
            e.stopPropagation();
            handleMouseEnter(dropdownId, e);
          }}
          onMouseLeave={(e) => {
            // Only handle mouse events on desktop
            if (isMobileView()) return;
            e.stopPropagation();
            handleMouseLeave(dropdownId);
          }}
        >
          <span
            onClick={(e) => toggleDropdown(dropdownId, e)}
            className={`dropdown-trigger ${isActive ? "active" : ""}`}
          >
            {item.label}
            {!shouldHideArrow && <span className="dropdown-arrow"></span>}
          </span>
          <div
            className={`menu ${
              isCategoriesMenu ? "categories-menu" : "brands-menu"
            } ${isOpen ? "open" : ""}`}
            onMouseEnter={(e) => {
              // Only handle mouse events on desktop
              if (isMobileView()) return;
              e.stopPropagation();
              // Keep this dropdown open when hovering over its menu
              if (leaveTimeoutRef.current) {
                clearTimeout(leaveTimeoutRef.current);
                leaveTimeoutRef.current = null;
              }
              setOpenDropdown(dropdownId);
            }}
            onMouseLeave={(e) => {
              // Only handle mouse events on desktop
              if (isMobileView()) return;
              e.stopPropagation();
              handleMouseLeave(dropdownId);
            }}
          >
            {isCategoriesMenu ? (
              <>
                <div className="categories-scroll-container">
                  {item.items?.map((subItem) =>
                    renderSubItem(subItem, dropdownId, isCategoriesMenu)
                  )}
                </div>
                {/* View All Products button - fixed and centered */}
                <Link
                  to="/products"
                  className="btn cta view-all-products-btn"
                  onClick={closeMobileMenu}
                >
                  View All Products
                </Link>
              </>
            ) : (
              <>
                {item.items?.map((subItem) =>
                  renderSubItem(subItem, dropdownId, isCategoriesMenu)
                )}
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get category color based on category name/id - each category gets a unique color
  const getCategoryColor = (categoryLabel, categoryId) => {
    const label = (categoryLabel || '').toLowerCase();
    const id = (categoryId || '').toLowerCase();
    
    // Check for masala powders first (more specific, contains "masala")
    if (label.includes('masala') || id.includes('masala')) {
      return '#DC2626'; // Red - unique for Masala Powders
    }
    // Check for spices & seasonings
    if (label.includes('spice') || label.includes('seasoning') || id.includes('spice') || id.includes('seasoning')) {
      return '#92400E'; // Brown - unique for Spices & Seasonings
    }
    // Check for grains (including rice)
    if (label.includes('grain') || label.includes('rice') || id.includes('grain') || id.includes('rice')) {
      return '#0F766E'; // Dark Teal - unique for Grains
    }
    // Check for appalam
    if (label.includes('appalam') || label.includes('crisp') || id.includes('appalam') || id.includes('crisp')) {
      return '#9333EA'; // Purple - unique for Appalam
    }
    // Check for culinary pastes
    if (label.includes('paste') || label.includes('culinary') || id.includes('paste') || id.includes('culinary')) {
      return '#EA580C'; // Orange - unique for Culinary Pastes
    }
    // Default color for any other categories
    return '#6B7280'; // Gray
  };

  const renderSubItem = (subItem, parentId, isCategories = false) => {
    const iconKey = `${parentId}-${subItem.id}`;
    // Use resolved icon if available, otherwise use original icon reference
    // This ensures icons show even if not yet resolved
    // If icon is already a URL (http/https/data), use it directly
    const iconToUse = resolvedIcons[iconKey] || 
      (subItem.icon && (subItem.icon.startsWith('http://') || 
                        subItem.icon.startsWith('https://') || 
                        subItem.icon.startsWith('data:')) 
        ? subItem.icon 
        : null);

    if (subItem.type === "link") {
      // Render as category item if it's in Products dropdown
      if (isCategories) {
        const categoryColor = getCategoryColor(subItem.label, subItem.id);
        return (
          <Link
            key={subItem.id}
            to={subItem.path}
            className="category-menu-item"
            onClick={closeMobileMenu}
            style={{ "--cat-bg": categoryColor }}
          >
            <div className="category-menu-item-content">
              {iconToUse && (
                <img
                  src={iconToUse}
                  alt={subItem.label}
                  className="category-icon"
                  onError={(e) => {
                    // Try to resolve again if image fails
                    if (subItem.icon && !resolvedIcons[iconKey]) {
                      resolveImageUrl(subItem.icon)
                        .then((url) => {
                          if (url) {
                            setResolvedIcons(prev => ({ ...prev, [iconKey]: url }));
                            e.target.src = url;
                            e.target.style.display = "block";
                          } else {
                            e.target.style.display = "none";
                          }
                        })
                        .catch(() => {
                          e.target.style.display = "none";
                        });
                    } else {
                      e.target.style.display = "none";
                    }
                  }}
                />
              )}
              <span className="category-label">{subItem.label}</span>
            </div>
          </Link>
        );
      }
      // Default brand item rendering
      return (
        <Link
          key={subItem.id}
          to={subItem.path}
          className="brand-item"
          onClick={closeMobileMenu}
        >
          {iconToUse && (
            <img
              src={iconToUse}
              alt={subItem.label}
              className="brand-icon"
              onError={(e) => {
                // Try to resolve again if image fails
                if (subItem.icon && !resolvedIcons[iconKey]) {
                  resolveImageUrl(subItem.icon)
                    .then((url) => {
                      if (url) {
                        setResolvedIcons(prev => ({ ...prev, [iconKey]: url }));
                        e.target.src = url;
                        e.target.style.display = "block";
                      } else {
                        e.target.style.display = "none";
                      }
                    })
                    .catch(() => {
                      e.target.style.display = "none";
                    });
                } else {
                  e.target.style.display = "none";
                }
              }}
            />
          )}
          <span>{subItem.label}</span>
        </Link>
      );
    }

    if (subItem.type === "submenu") {
      const submenuId = `${parentId}-${subItem.id}`;
      const subIconKey = `${parentId}-${subItem.id}`;
      const subIconToUse = resolvedIcons[subIconKey] || 
        (subItem.icon && (subItem.icon.startsWith('http://') || 
                          subItem.icon.startsWith('https://') || 
                          subItem.icon.startsWith('data:')) 
          ? subItem.icon 
          : null);
      return (
        <div
          key={subItem.id}
          className={`brand-item-with-submenu ${
            openSubmenu === submenuId ? "submenu-open" : ""
          }`}
        >
          <Link
            to={subItem.path}
            className="brand-item brand-header"
            onClick={closeMobileMenu}
            onMouseEnter={() => setOpenSubmenu(submenuId)}
          >
            {subIconToUse && (
              <img
                src={subIconToUse}
                alt={subItem.label}
                className="brand-icon"
                onError={(e) => {
                  // Try to resolve again if image fails
                  if (subItem.icon && !resolvedIcons[subIconKey]) {
                    resolveImageUrl(subItem.icon)
                      .then((url) => {
                        if (url) {
                          setResolvedIcons(prev => ({ ...prev, [subIconKey]: url }));
                          e.target.src = url;
                          e.target.style.display = "block";
                        } else {
                          e.target.style.display = "none";
                        }
                      })
                      .catch(() => {
                        e.target.style.display = "none";
                      });
                  } else {
                    e.target.style.display = "none";
                  }
                }}
              />
            )}
            <span>{subItem.label}</span>
          </Link>
          <div className={`submenu ${openSubmenu === submenuId ? "open" : ""}`}>
            {subItem.subItems?.map((subSubItem) => {
              const subSubIconKey = `${parentId}-${subItem.id}-${subSubItem.id}`;
              const subSubIconToUse = resolvedIcons[subSubIconKey] || 
                (subSubItem.icon && (subSubItem.icon.startsWith('http://') || 
                                      subSubItem.icon.startsWith('https://') || 
                                      subSubItem.icon.startsWith('data:')) 
                  ? subSubItem.icon 
                  : null);
              return (
                <NavLink
                  key={subSubItem.id}
                  to={subSubItem.path}
                  className="submenu-item"
                  onClick={closeMobileMenu}
                >
                  <div className="submenu-item-content">
                    {subSubIconToUse && (
                      <img
                        src={subSubIconToUse}
                        alt={subSubItem.label}
                        className="brand-icon"
                        onError={(e) => {
                          // Try to resolve again if image fails
                          if (subSubItem.icon && !resolvedIcons[subSubIconKey]) {
                            resolveImageUrl(subSubItem.icon)
                              .then((url) => {
                                if (url) {
                                  setResolvedIcons(prev => ({ ...prev, [subSubIconKey]: url }));
                                  e.target.src = url;
                                  e.target.style.display = "block";
                                } else {
                                  e.target.style.display = "none";
                                }
                              })
                              .catch(() => {
                                e.target.style.display = "none";
                              });
                          } else {
                            e.target.style.display = "none";
                          }
                        }}
                      />
                    )}
                    <span>{subSubItem.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get current logo for loading state (commented out - not currently used)
  // const loadingLogo = resolvedLogo || logo;
  // const loadingBrandImgStyle = headerConfig
  //   ? {
  //       height: headerConfig.logoHeight,
  //       minHeight: headerConfig.logoHeight,
  //       maxHeight: headerConfig.logoHeight,
  //       filter:
  //         headerConfig.logoFilter && headerConfig.logoFilter.trim() !== ""
  //           ? headerConfig.logoFilter
  //           : "none",
  //     }
  //   : {
  //       filter: "none", // Ensure no filter when no config
  //     };
  // const loadingNavbarStyle = headerConfig
  //   ? {
  //       background: isScrolled
  //         ? headerConfig.navbarBackgroundScrolled
  //         : headerConfig.navbarBackground,
  //       borderColor: isScrolled
  //         ? headerConfig.navbarBorderScrolled
  //         : headerConfig.navbarBorder,
  //       boxShadow: isScrolled
  //         ? headerConfig.navbarShadowScrolled
  //         : headerConfig.navbarShadow,
  //       borderRadius: headerConfig.navbarBorderRadius,
  //       height: isScrolled
  //         ? headerConfig.navbarHeightScrolled
  //         : headerConfig.navbarHeight,
  //       minHeight: isScrolled
  //         ? headerConfig.navbarHeightScrolled
  //         : headerConfig.navbarHeight,
  //       maxHeight: isScrolled
  //         ? headerConfig.navbarHeightScrolled
  //         : headerConfig.navbarHeight,
  //       paddingTop: isScrolled
  //         ? headerConfig.navbarPaddingTopScrolled
  //         : headerConfig.navbarPaddingTop,
  //       paddingBottom: isScrolled
  //         ? headerConfig.navbarPaddingBottomScrolled
  //         : headerConfig.navbarPaddingBottom,
  //       paddingLeft: isScrolled
  //         ? headerConfig.navbarPaddingLeftScrolled
  //         : headerConfig.navbarPaddingLeft,
  //       paddingRight: isScrolled
  //         ? headerConfig.navbarPaddingRightScrolled
  //         : headerConfig.navbarPaddingRight,
  //       gap: headerConfig.navbarGap,
  //     }
  //   : {};

  // Don't show loading state - render navbar immediately with cached/default data
  // if (loading) {
  //   return (
  //     <header className={`navbar-wrap ${isScrolled ? "scrolled" : ""}`}>
  //       <div className="container">
  //         <div
  //           className={`navbar ${isScrolled ? "scrolled" : ""}`}
  //           style={loadingNavbarStyle}
  //         >
  //           <Link
  //             to="/"
  //             className="brand"
  //             onClick={handleLogoClick}
  //             aria-label="UBC Home"
  //           >
  //             <img src={loadingLogo} alt="UBC" style={loadingBrandImgStyle} />
  //           </Link>
  //         </div>
  //       </div>
  //     </header>
  //   );
  // }

  // Get current logo
  const currentLogo = resolvedLogo || logo;

  // Build dynamic styles based on header config
  const navbarStyle = headerConfig
    ? {
        background: isScrolled
          ? headerConfig.navbarBackgroundScrolled
          : headerConfig.navbarBackground,
        borderColor: isScrolled
          ? headerConfig.navbarBorderScrolled
          : headerConfig.navbarBorder,
        boxShadow: isScrolled
          ? headerConfig.navbarShadowScrolled
          : headerConfig.navbarShadow,
        borderRadius: headerConfig.navbarBorderRadius,
        height: isScrolled
          ? headerConfig.navbarHeightScrolled
          : headerConfig.navbarHeight,
        minHeight: isScrolled
          ? headerConfig.navbarHeightScrolled
          : headerConfig.navbarHeight,
        maxHeight: isScrolled
          ? headerConfig.navbarHeightScrolled
          : headerConfig.navbarHeight,
        paddingTop: isScrolled
          ? headerConfig.navbarPaddingTopScrolled
          : headerConfig.navbarPaddingTop,
        paddingBottom: isScrolled
          ? headerConfig.navbarPaddingBottomScrolled
          : headerConfig.navbarPaddingBottom,
        paddingLeft: isScrolled
          ? headerConfig.navbarPaddingLeftScrolled
          : headerConfig.navbarPaddingLeft,
        paddingRight: isScrolled
          ? headerConfig.navbarPaddingRightScrolled
          : headerConfig.navbarPaddingRight,
        gap: headerConfig.navbarGap,
      }
    : {};

  const brandImgStyle = headerConfig
    ? {
        height: headerConfig.logoHeight,
        minHeight: headerConfig.logoHeight,
        maxHeight: headerConfig.logoHeight,
        filter:
          headerConfig.logoFilter && headerConfig.logoFilter.trim() !== ""
            ? headerConfig.logoFilter
            : "none",
      }
    : {
        filter: "none", // Ensure no filter when no config
      };

  // Generate dynamic CSS for header config
  const dynamicCSS = headerConfig
    ? `
    .navbar-wrap { 
      padding-top: ${headerConfig.navbarWrapPaddingTop || "16px"} !important; 
      padding-bottom: ${
        headerConfig.navbarWrapPaddingBottom || "16px"
      } !important; 
      z-index: ${headerConfig.navbarZIndex || "100"} !important; 
    }
    /* Container styles - only apply to desktop/tablet, not mobile */
    @media (min-width: 769px) {
      .navbar-wrap .container { 
        max-width: ${headerConfig.containerMaxWidth || "1280px"} !important; 
        padding-left: ${headerConfig.containerPadding || "24px"} !important; 
        padding-right: ${headerConfig.containerPadding || "24px"} !important; 
      }
    }
    .nav-links { 
      font-family: ${headerConfig.fontFamily} !important; 
      gap: ${headerConfig.navbarGap || "20px"} !important; 
    }
    .nav-links a { 
      color: ${headerConfig.linkColor} !important; 
      font-size: ${headerConfig.fontSize} !important; 
      font-weight: ${headerConfig.fontWeight} !important; 
      font-family: ${headerConfig.fontFamily} !important; 
      padding: ${headerConfig.linkPadding || "10px 12px"} !important; 
      border-radius: ${headerConfig.linkBorderRadius || "12px"} !important; 
      line-height: ${headerConfig.linkLineHeight || "21px"} !important; 
      letter-spacing: ${headerConfig.linkLetterSpacing || "0%"} !important; 
    }
    .nav-links a.active,
    .nav-links a[class*="active"],
    a.active.nav-link,
    .nav-links .active { 
      color: #000000 !important; 
      font-weight: 700 !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      transform: none !important;
      outline: none !important;
    }
    .nav-links a:active {
      color: #000000 !important;
      font-weight: 700 !important;
      background: transparent !important;
      transform: none !important;
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .nav-links a:hover { 
      background: transparent !important;
      outline: none !important;
    }
    .nav-links a:focus,
    .nav-links a:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .dropdown { 
      font-family: ${headerConfig.fontFamily} !important; 
      font-size: ${headerConfig.fontSize} !important; 
      font-weight: ${headerConfig.fontWeight} !important; 
      color: ${headerConfig.linkColor} !important; 
      padding: ${headerConfig.linkPadding || "10px 12px"} !important; 
      border-radius: ${headerConfig.linkBorderRadius || "12px"} !important; 
    }
    .dropdown.active .dropdown-trigger, .dropdown-trigger.active { 
      color: #000000 !important; 
      font-weight: 700 !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      transform: none !important;
      outline: none !important;
    }
    .dropdown.active {
      background-color: transparent !important;
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .dropdown:active .dropdown-trigger {
      color: #000000 !important;
      font-weight: 700 !important;
      background: transparent !important;
      transform: none !important;
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .dropdown:hover .dropdown-trigger { 
      background: transparent !important;
      outline: none !important;
    }
    .dropdown:hover {
      background: transparent !important;
      outline: none !important;
    }
    .dropdown:focus,
    .dropdown:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .dropdown-trigger:focus,
    .dropdown-trigger:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    .dropdown .menu { 
      background: ${headerConfig.dropdownBackground} !important; 
      border-color: ${headerConfig.dropdownBorder} !important; 
      box-shadow: ${headerConfig.dropdownShadow} !important; 
      border-radius: ${headerConfig.dropdownBorderRadius || "16px"} !important; 
      padding: ${headerConfig.dropdownPadding || "12px 8px"} !important; 
      min-width: ${headerConfig.dropdownMinWidth || "220px"} !important; 
      top: ${headerConfig.dropdownTopOffset || "calc(100% + 4px)"} !important; 
      z-index: ${headerConfig.dropdownZIndex || "1001"} !important; 
    }
    .dropdown .menu.categories-menu { 
      background: rgba(255, 255, 255, 0.85) !important; 
      border-color: rgba(229, 231, 235, 0.85) !important; 
      transition: background-color 0.1s ease !important;
    }
    
    /* Grey background on categories menu hover */
    .dropdown .menu.categories-menu:hover {
      background: #e5e7eb !important;
    }
    
    /* Grey background on categories scroll container hover */
    .categories-scroll-container:hover {
      background-color: #e5e7eb !important;
      border-radius: 16px !important;
    }
    /* Override padding for brands menu on desktop */
    @media (min-width: 1024px) {
      .dropdown .menu.brands-menu,
      .dropdown:hover .menu.brands-menu,
      .dropdown .menu.brands-menu.open,
      .dropdown.open .menu.brands-menu {
        padding: 4px 8px !important;
      }
      .brands-menu .brand-item,
      .dropdown .menu.brands-menu .brand-item {
        padding: 4px 12px !important;
      }
    }
    .dropdown .menu a { 
      padding: ${headerConfig.dropdownItemPadding || "10px"} !important; 
      border-radius: ${
        headerConfig.dropdownItemBorderRadius || "10px"
      } !important; 
      color: ${headerConfig.dropdownItemColor || "#374151"} !important; 
    }
    .dropdown .menu a.view-all-products-btn { 
      border-radius: 999px !important; 
      padding: 0 !important; 
    }
    /* General hover rule - but exclude category-menu-item */
    .dropdown .menu a:not(.category-menu-item):hover { 
      background: transparent !important; 
    }
    /* Category menu items preserve their background color via CSS variable on hover */
    .category-menu-item:hover {
      background: var(--cat-bg, #6B7280) !important;
    }
    .dropdown .menu a.view-all-products-btn:hover { 
      background: #1C1F52 !important; 
      transform: translateY(-2px) scale(1.1) !important;
      padding-left: 24px !important;
      padding-right: 24px !important;
      max-width: none !important;
      width: auto !important;
      overflow: visible !important;
      z-index: 10 !important;
      position: relative !important;
    }
    .brands-menu .brand-item { 
      color: ${headerConfig.dropdownItemColor || "#374151"} !important; 
    }
    .brands-menu .brand-item:hover { 
      background: transparent !important; 
    }
    .dropdown .menu.brands-menu {
      min-width: 150px !important;
      max-width: 150px !important;
      background: #ffffff !important;
      border-color: rgba(229, 231, 235, 0.85) !important;
    }
    .categories-menu { 
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      gap: 0 !important;
      left: 0 !important;
      right: 0 !important;
      margin: 0 auto !important;
      max-width: 1280px !important;
      padding: 20px 24px 16px 24px !important;
      padding-left: 24px !important;
      padding-right: 24px !important;
      box-sizing: border-box !important;
      overflow: visible !important;
    }
    .categories-scroll-container {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      gap: 15px !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      scroll-behavior: smooth !important;
      -webkit-overflow-scrolling: touch !important;
      width: 100% !important;
      padding-bottom: 8px !important;
    }
    .categories-scroll-container::-webkit-scrollbar {
      width: 0px !important;
      background: transparent !important;
    }
    .categories-scroll-container {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    @media (min-width: 768px) {
      .view-all-products-btn {
        margin-top: 16px !important;
        margin-bottom: 0 !important;
        margin-left: auto !important;
        margin-right: auto !important;
        align-self: center !important;
      }
    }
    /* Tablet-specific overrides for dropdown positioning */
    @media (min-width: 768px) and (max-width: 1023px) {
      .dropdown {
        position: relative !important;
      }
      .dropdown:has(.categories-menu) {
        position: relative !important;
      }
      .dropdown .menu {
        position: absolute !important;
        top: calc(100% + 4px) !important;
      }
      .dropdown .menu.categories-menu {
        position: absolute !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        top: calc(100% + 4px) !important;
      }
    }
    /* Category menu item hover - preserve background color via CSS variable */
    .category-menu-item:hover,
    a.category-menu-item:hover,
    .dropdown .menu a.category-menu-item:hover,
    .nav-links .dropdown .menu a.category-menu-item:hover { 
      background: var(--cat-bg, #6B7280) !important;
      transform: none !important;
      box-shadow: none !important;
      opacity: 1 !important;
      border-radius: 28px !important;
      color: #FFFFFF !important;
    }
    .category-menu-item-content {
      border-radius: 28px !important;
    }
    .category-menu-item-content:hover {
      border-radius: 28px !important;
      transform: none !important;
    }
    .category-menu-item {
      overflow: hidden !important;
      background: var(--cat-bg, #6B7280) !important;
    }
    
    /* Grey background on categories container hover */
    .categories-scroll-container:hover {
      background-color: #e5e7eb !important;
      border-radius: 16px !important;
    }
    .brand-icon { 
      width: ${headerConfig.brandIconSize || "28px"} !important; 
      height: ${headerConfig.brandIconSize || "28px"} !important; 
    }
    .category-icon { 
      width: 120px !important;
      height: 120px !important;
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: contain !important;
      flex-shrink: 0 !important;
      border-radius: 24px !important;
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .category-icon {
        width: 150px !important;
        height: 150px !important;
        max-width: 150px !important;
        max-height: 150px !important;
        border-radius: 24px !important;
      }
    }
    @media (min-width: 1024px) {
      .category-icon {
        width: 200px !important;
        height: 200px !important;
        max-width: 200px !important;
        max-height: 200px !important;
        border-radius: 28px !important;
      }
    }
    .category-menu-item {
      flex: 0 0 auto !important;
      min-width: 220px !important;
      width: auto !important;
      border-radius: 28px !important;
      overflow: hidden !important;
    }
    @media (min-width: 768px) and (max-width: 1023px) {
.category-menu-item {
        min-width: 260px !important;
        min-height: 240px !important;
        border-radius: 30px !important;
        overflow: hidden !important;
      }
    }
    @media (min-width: 1024px) {
      .category-menu-item {
        min-width: 320px !important;
        min-height: 300px !important;
        border-radius: 32px !important;
        overflow: hidden !important;
      }
    }
    .category-label {
      font-size: ${headerConfig.categoryLabelSize || "18px"} !important;
      color: #FFFFFF !important;
      font-weight: 700 !important;
      line-height: 1.3 !important;
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
      display: block !important;
      max-height: none !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      text-align: center !important;
      width: 100% !important;
    }
    .submenu-item .brand-icon { 
      width: ${headerConfig.submenuIconSize || "120px"} !important; 
      height: ${headerConfig.submenuIconSize || "120px"} !important; 
    }
    .submenu { 
      border-radius: ${headerConfig.submenuBorderRadius || "12px"} !important; 
      padding: ${headerConfig.submenuPadding || "8px"} !important; 
      min-width: ${headerConfig.submenuMinWidth || "360px"} !important; 
      max-width: ${headerConfig.submenuMaxWidth || "400px"} !important; 
      box-shadow: ${
        headerConfig.submenuShadow ||
        "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)"
      } !important; 
      z-index: ${headerConfig.submenuZIndex || "1002"} !important; 
    }
    .btn.cta, .cta { 
      background: ${headerConfig.ctaBackground} !important; 
      color: ${headerConfig.ctaColor} !important; 
      width: ${headerConfig.ctaWidth || "154px"} !important; 
      min-width: ${headerConfig.ctaWidth || "154px"} !important; 
      max-width: ${headerConfig.ctaWidth || "154px"} !important; 
      height: ${headerConfig.ctaHeight || "47px"} !important; 
      min-height: ${headerConfig.ctaHeight || "47px"} !important; 
      max-height: ${headerConfig.ctaHeight || "47px"} !important; 
      padding: ${headerConfig.ctaPadding || "0"} !important; 
      border-radius: ${headerConfig.ctaBorderRadius || "999px"} !important; 
      font-size: ${headerConfig.ctaFontSize || "14px"} !important; 
      line-height: ${headerConfig.ctaLineHeight || "22.5px"} !important; 
      letter-spacing: ${headerConfig.ctaLetterSpacing || "-0.19px"} !important; 
      font-family: ${headerConfig.fontFamily} !important; 
    }
    .btn.cta:hover, .cta:hover { 
      background: ${hoverEffectColor || headerConfig.ctaBackgroundHover} !important; 
      box-shadow: ${headerConfig.ctaShadow} !important; 
      transform: translateY(-2px) scale(1.1) !important;
      padding-left: 24px !important;
      padding-right: 24px !important;
      max-width: none !important;
      width: auto !important;
      overflow: visible !important;
      z-index: 10 !important;
      position: relative !important;
    }
    .btn.cta:active, .cta:active {
      transform: translateY(0) scale(0.98) !important;
      transition: all 0.1s ease !important;
    }
    .hamburger { 
      width: ${headerConfig.hamburgerSize || "28px"} !important; 
      min-width: ${headerConfig.hamburgerSize || "28px"} !important; 
      max-width: ${headerConfig.hamburgerSize || "28px"} !important; 
      height: ${headerConfig.hamburgerSize || "28px"} !important; 
      min-height: ${headerConfig.hamburgerSize || "28px"} !important; 
      max-height: ${headerConfig.hamburgerSize || "28px"} !important; 
      z-index: ${headerConfig.hamburgerZIndex || "1001"} !important; 
    }
    .hamburger span { 
      height: ${headerConfig.hamburgerBarHeight || "3px"} !important; 
      min-height: ${headerConfig.hamburgerBarHeight || "3px"} !important; 
      max-height: ${headerConfig.hamburgerBarHeight || "3px"} !important; 
      background: ${headerConfig.hamburgerColor || "#374151"} !important; 
      border-radius: ${
        headerConfig.hamburgerBarBorderRadius || "2px"
      } !important; 
    }
    .nav-links.mobile-open { 
      background: ${headerConfig.mobileMenuBackground || "#FFFFFF"} !important; 
      padding: ${
        headerConfig.mobileMenuPadding || "70px 20px 20px 20px"
      } !important; 
      box-shadow: ${
        headerConfig.mobileMenuShadow || "0 0 40px rgba(0, 0, 0, 0.1)"
      } !important; 
      z-index: ${headerConfig.mobileNavZIndex || "1000"} !important; 
    }
    .brand { 
      height: ${headerConfig.logoHeight || "36px"} !important; 
      min-height: ${headerConfig.logoHeight || "36px"} !important; 
      max-height: ${headerConfig.logoHeight || "36px"} !important; 
    }
    .brand img { 
      height: ${headerConfig.logoHeight || "36px"} !important; 
      min-height: ${headerConfig.logoHeight || "36px"} !important; 
      max-height: ${headerConfig.logoHeight || "36px"} !important; 
      filter: ${
        headerConfig.logoFilter && headerConfig.logoFilter.trim() !== ""
          ? headerConfig.logoFilter
          : "none"
      } !important; 
    }
    .navbar.scrolled .brand img { 
      height: ${headerConfig.logoHeight || "36px"} !important; 
      min-height: ${headerConfig.logoHeight || "36px"} !important; 
      max-height: ${headerConfig.logoHeight || "36px"} !important; 
      filter: ${
        headerConfig.logoFilter && headerConfig.logoFilter.trim() !== ""
          ? headerConfig.logoFilter
          : "none"
      } !important; 
    }
    .navbar, .navbar *, .nav-links a, .dropdown, .dropdown .menu, .btn.cta, .hamburger, .hamburger span { 
      transition-duration: ${
        headerConfig.transitionDuration || "0.25s"
      } !important; 
      transition-timing-function: ${
        headerConfig.transitionTiming || "ease"
      } !important; 
    }
  `
    : "";

  return (
    <header className={`navbar-wrap ${isScrolled ? "scrolled" : ""}`}>
      {dynamicCSS && <style>{dynamicCSS}</style>}
      <div className="container">
        <div
          className={`navbar ${isScrolled ? "scrolled" : ""}`}
          style={navbarStyle}
        >
          {/* left: logo */}
          <Link
            to="/"
            className="brand"
            onClick={handleLogoClick}
            aria-label="UBC Home"
          >
            <img src={currentLogo} alt="UBC" style={brandImgStyle} />
          </Link>

          {/* center: nav links */}
          <nav
            className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}
            aria-label="Primary"
            id="primary-navigation"
          >
            {navigationItems.map((item, index) => {
              const rendered = renderNavItem(item);
              if (!rendered) return null;
              // React needs key on the direct child of map, not on nested elements
              // Clone element and ensure key is set at map level
              const key = item.id || `nav-item-${index}-${item.label}`;
              return React.cloneElement(rendered, { key });
            })}
          </nav>

          {/* right: single CTA - desktop only */}
          <button
            className="btn cta desktop-cta"
            onClick={() => setIsEnquiryModalOpen(true)}
            style={{ backgroundColor: enquiryButtonColor }}
          >
            {enquiryButtonText}
          </button>

          {/* hamburger */}
          <button
            className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Enquiry Form Modal */}
      {isEnquiryModalOpen && (
        <div
          className="enquiry-modal-overlay"
          onClick={() => setIsEnquiryModalOpen(false)}
        >
          <div
            className="enquiry-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="enquiry-modal-close"
              onClick={() => setIsEnquiryModalOpen(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <EnquiryForm
              config={enquiryFormConfig}
              onClose={() => setIsEnquiryModalOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}

// Enquiry Form Component
function EnquiryForm({ config, onClose }) {
  // Initialize form data from config
  const getInitialFormData = (formConfig) => {
    if (!formConfig || !formConfig.fields) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        requirement: "Traders and distributors",
        message: "",
      };
    }
    const initialData = {};
    formConfig.fields.forEach((field) => {
      if (field.type === "select" && field.defaultValue) {
        initialData[field.name] = field.defaultValue;
      } else {
        initialData[field.name] = "";
      }
    });
    return initialData;
  };

  const [formData, setFormData] = useState(() => getInitialFormData(config));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Update form data when config changes
  useEffect(() => {
    setFormData(getInitialFormData(config));
  }, [config]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { submitForm } = await import(
        "../admin/services/formSubmissionService"
      );
      await submitForm(formData);
      setSubmitStatus("success");
      // Reset form
      setFormData(getInitialFormData());
      // Close modal after 10 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 10000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use default config if not provided
  const formConfig = config || {
    title: "Enquiry Form",
    subtitle: "Tell us what you need",
    buttonText: "Submit Form",
    submittingText: "Submitting...",
    successMessage: "Thank you! Your enquiry has been submitted successfully.",
    errorMessage:
      "There was an error submitting your enquiry. Please try again.",
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "John",
        required: true,
        order: 1,
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Smith",
        required: true,
        order: 2,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "john@gmail.com",
        required: true,
        order: 3,
      },
      {
        name: "requirement",
        label: "Requirement",
        type: "select",
        placeholder: "Select requirement",
        required: true,
        defaultValue: "Traders and distributors",
        options: ["Traders and distributors", "Partnership", "General Enquiry"],
        order: 4,
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Your message here...",
        required: false,
        rows: 5,
        order: 5,
      },
    ],
  };

  const sortedFields = formConfig.fields
    ? [...formConfig.fields].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const renderField = (field) => {
    const fieldId = `enquiry-${field.name}`;
    const fieldValue = formData[field.name] || "";

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="enquiry-form-group">
            <label htmlFor={fieldId} className="enquiry-form-label">
              {field.label}
              {field.required && <span style={{ color: "red" }}> *</span>}
            </label>
            <textarea
              id={fieldId}
              name={field.name}
              value={fieldValue}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder || ""}
              rows={field.rows || 5}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="enquiry-form-group">
            <label htmlFor={fieldId} className="enquiry-form-label">
              {field.label}
              {field.required && <span style={{ color: "red" }}> *</span>}
            </label>
            <select
              id={fieldId}
              name={field.name}
              value={fieldValue}
              onChange={handleChange}
              required={field.required}
            >
              {field.placeholder && (
                <option value="" disabled>
                  {field.placeholder}
                </option>
              )}
              {field.options &&
                field.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        );

      case "email":
        return (
          <div key={field.name} className="enquiry-form-group">
            <label htmlFor={fieldId} className="enquiry-form-label">
              {field.label}
              {field.required && <span style={{ color: "red" }}> *</span>}
            </label>
            <input
              type="email"
              id={fieldId}
              name={field.name}
              value={fieldValue}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder || ""}
            />
          </div>
        );

      default:
        return (
          <div key={field.name} className="enquiry-form-group">
            <label htmlFor={fieldId} className="enquiry-form-label">
              {field.label}
              {field.required && <span style={{ color: "red" }}> *</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              name={field.name}
              value={fieldValue}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder || ""}
            />
          </div>
        );
    }
  };

  return (
    <div className="enquiry-form-container">
      <h2 className="enquiry-form-title">
        {formConfig.title || "Enquiry Form"}
      </h2>
      <p className="enquiry-form-subtitle">
        {formConfig.subtitle || "Tell us what you need"}
      </p>

      {submitStatus === "success" && (
        <div className="enquiry-form-message enquiry-form-success">
          {formConfig.successMessage ||
            "Thank you! Your enquiry has been submitted successfully."}
        </div>
      )}
      {submitStatus === "error" && (
        <div className="enquiry-form-message enquiry-form-error">
          {formConfig.errorMessage ||
            "There was an error submitting your enquiry. Please try again."}
        </div>
      )}

      <form className="enquiry-form" onSubmit={handleSubmit}>
        {sortedFields.map((field) => renderField(field))}

        <button
          type="submit"
          className="enquiry-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? formConfig.submittingText || "Submitting..."
            : formConfig.buttonText || "Submit Form"}
        </button>
      </form>
    </div>
  );
}
