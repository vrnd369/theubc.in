import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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

const NAV_CACHE_KEY = "ubc_nav_items";
const HEADER_CACHE_KEY = "ubc_header_config";
const LOGO_CACHE_KEY = "ubc_header_logo_resolved";

const loadJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* ignore */
  }
};

export default function Navbar({ previewHeaderConfig = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [navigationItems, setNavigationItems] = useState(() => loadJSON(NAV_CACHE_KEY) || []);
  
  // Load cached icons immediately
  const getCachedIcons = () => {
    try {
      const cached = localStorage.getItem('ubc_nav_icons');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 5 minutes old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 300000) {
          return parsed.data || {};
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return {};
  };
  
  const [resolvedIcons, setResolvedIcons] = useState(getCachedIcons());
  const [headerConfig, setHeaderConfig] = useState(() => loadJSON(HEADER_CACHE_KEY));
  const [resolvedLogo, setResolvedLogo] = useState(() => loadJSON(LOGO_CACHE_KEY));
  const leaveTimeoutRef = useRef(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryFormConfig, setEnquiryFormConfig] = useState(null);
  const [enquiryButtonText, setEnquiryButtonText] = useState('Enquiry Form');
  const [enquiryButtonColor, setEnquiryButtonColor] = useState('#007bff');

  // Fetch navigation from Firestore and resolve images - optimized for performance
  const fetchNavigation = async (forceRefresh = false) => {
    try {
      const items = await getNavigationItems();

      // Set navigation items IMMEDIATELY - don't wait for icons
      setNavigationItems(items);
      saveJSON(NAV_CACHE_KEY, items);

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
        // Cache the resolved icons
        try {
          localStorage.setItem('ubc_nav_icons', JSON.stringify({
            data: iconMap,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }
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
        saveJSON(HEADER_CACHE_KEY, config);

        // Resolve logo if configured
        if (config.logo) {
          const logoUrl = await resolveImageUrl(config.logo);
          setResolvedLogo(logoUrl);
          saveJSON(LOGO_CACHE_KEY, logoUrl);
        } else {
          setResolvedLogo(null);
          saveJSON(LOGO_CACHE_KEY, null);
        }
      } catch (error) {
        console.error("Error fetching header config:", error);
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

  // Fetch navigation config for enquiry button settings - optimized
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

  // close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const handleMouseEnter = (name, e) => {
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
    if (!isMobileMenuOpen) setOpenDropdown(null);
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

  // Check if current route matches a navigation item
  const isItemActive = (item) => {
    if (item.type === "dropdown") {
      return item.items?.some((subItem) => {
        if (subItem.type === "submenu") {
          return subItem.subItems?.some(
            (subSubItem) =>
              location.pathname === subSubItem.path ||
              location.pathname.startsWith(subSubItem.path)
          );
        }
        return (
          location.pathname === subItem.path ||
          location.pathname.startsWith(subItem.path)
        );
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
      return (
        <div
          key={dropdownId}
          className={`dropdown ${isActive ? "active" : ""} ${
            isOpen ? "open" : ""
          }`}
          onMouseEnter={(e) => {
            e.stopPropagation();
            handleMouseEnter(dropdownId, e);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            handleMouseLeave(dropdownId);
          }}
        >
          <span
            onClick={(e) => toggleDropdown(dropdownId, e)}
            className={`dropdown-trigger ${isActive ? "active" : ""}`}
          >
            {item.label} ▾
          </span>
          <div
            className={`menu ${
              item.id === "nav-products" ? "categories-menu" : "brands-menu"
            } ${isOpen ? "open" : ""}`}
            onMouseEnter={(e) => {
              e.stopPropagation();
              // Keep this dropdown open when hovering over its menu
              if (leaveTimeoutRef.current) {
                clearTimeout(leaveTimeoutRef.current);
                leaveTimeoutRef.current = null;
              }
              setOpenDropdown(dropdownId);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              handleMouseLeave(dropdownId);
            }}
          >
            {item.items?.map((subItem) =>
              renderSubItem(subItem, dropdownId, item.id === "nav-products")
            )}
          </div>
        </div>
      );
    }
    return null;
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
        return (
          <Link
            key={subItem.id}
            to={subItem.path}
            className="category-menu-item"
            onClick={closeMobileMenu}
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
              <span>{subItem.label}</span>
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
    .navbar-wrap .container { 
      max-width: ${headerConfig.containerMaxWidth || "1280px"} !important; 
      padding-left: ${headerConfig.containerPadding || "24px"} !important; 
      padding-right: ${headerConfig.containerPadding || "24px"} !important; 
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
    .nav-links a.active { 
      color: ${headerConfig.linkColorActive} !important; 
      background-color: ${
        headerConfig.linkActiveBackground || "#e8eaf0"
      } !important; 
      font-weight: 500 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid rgba(25, 29, 35, 0.1) !important;
      transform: scale(1.02) !important;
    }
    .nav-links a:active {
      transform: scale(0.98) !important;
      transition: transform 0.1s ease !important;
    }
    .nav-links a:hover { 
      background-color: ${headerConfig.linkHoverBackground} !important; 
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
      color: ${headerConfig.linkColorActive} !important; 
      font-weight: 500 !important;
      background-color: ${
        headerConfig.linkActiveBackground || "#e8eaf0"
      } !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid rgba(25, 29, 35, 0.1) !important;
    }
    .dropdown.active {
      background-color: ${
        headerConfig.linkActiveBackground || "#e8eaf0"
      } !important;
    }
    .dropdown:active .dropdown-trigger {
      transform: scale(0.98) !important;
      transition: transform 0.1s ease !important;
    }
    .dropdown:hover { 
      background-color: ${headerConfig.linkHoverBackground} !important; 
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
    .dropdown .menu a { 
      padding: ${headerConfig.dropdownItemPadding || "10px"} !important; 
      border-radius: ${
        headerConfig.dropdownItemBorderRadius || "10px"
      } !important; 
      color: ${headerConfig.dropdownItemColor || "#374151"} !important; 
    }
    .dropdown .menu a:hover { 
      background: ${headerConfig.dropdownItemHover} !important; 
    }
    .brands-menu .brand-item { 
      color: ${headerConfig.dropdownItemColor || "#374151"} !important; 
    }
    .brands-menu .brand-item:hover { 
      background: ${headerConfig.dropdownItemHover} !important; 
    }
    .category-menu-item:hover { 
      color: ${
        headerConfig.dropdownCategoryHoverColor || "#1e3a8a"
      } !important; 
    }
    .brand-icon { 
      width: ${headerConfig.brandIconSize || "28px"} !important; 
      height: ${headerConfig.brandIconSize || "28px"} !important; 
    }
    .category-icon { 
      width: ${headerConfig.categoryIconSize || "100px"} !important; 
      height: ${headerConfig.categoryIconSize || "100px"} !important; 
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
      background: ${headerConfig.ctaBackgroundHover} !important; 
      box-shadow: ${headerConfig.ctaShadow} !important; 
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
    .nav-links a, .nav-links .dropdown { 
      border-bottom-color: ${
        headerConfig.mobileMenuBorderColor || "rgba(229, 231, 235, 0.5)"
      } !important; 
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
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 2000);
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
