import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Categories.css";
import "../pages/Brands.css";
import SectionTag from "./SectionTag";
import {
  getBrands,
  getCategories,
  getProducts,
} from "../admin/services/productService";
import { resolveImageUrl } from "../utils/imageUtils";

// Define the order of categories (starting with Grains)
const categoryOrder = [
  "Grains",
  "Spices & Seasonings",
  "Masala Powders",
  "Appalam",
  "Culinary Pastes"
];

// Helper to convert category chip to URL-friendly slug
const chipToSlug = (chip) => {
  if (!chip || chip === "All") return null;
  return chip.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "");
};

// Helper to convert URL slug back to chip (fuzzy match)
const slugToChip = (slug, availableChips) => {
  if (!slug) return "All";
  const normalizedSlug = slug.toLowerCase();
  // Try exact match first
  const exactMatch = availableChips.find(
    (c) => chipToSlug(c) === normalizedSlug
  );
  if (exactMatch) return exactMatch;
  // Try partial match
  const partialMatch = availableChips.find(
    (c) =>
      c.toLowerCase().includes(normalizedSlug) ||
      normalizedSlug.includes(c.toLowerCase().split(" ")[0])
  );
  return partialMatch || "All";
};

export default function Categories({
  selectedBrand: initialBrand = "All",
  initialCategory = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isProductsPage = location.pathname === "/products";
  
  // Try to load from cache immediately
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem('ubc_products_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 15 minutes old (extended for better performance)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 900000) {
          return parsed.data || { brands: [], categories: [], products: [] };
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return { brands: [], categories: [], products: [] };
  };

  const cachedData = getCachedData();
  const [brands, setBrands] = useState(cachedData.brands);
  const [categories, setCategories] = useState(cachedData.categories);
  const [products, setProducts] = useState(cachedData.products);
  const [loading, setLoading] = useState(false); // Start with false - show cached content immediately
  const [active, setActive] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // Number of products per page (2 rows x 4 columns)

  // Fetch brands, categories, and products from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check module visibility settings
        const { getModuleVisibility } = await import("../admin/services/moduleVisibilityService");
        const { MODULES } = await import("../admin/auth/roleConfig");
        const moduleVisibility = await getModuleVisibility();
        const isProductsVisible = moduleVisibility[MODULES.PRODUCTS] !== false;
        const isBrandPagesVisible = moduleVisibility[MODULES.BRAND_PAGES] !== false;

        // Only fetch data if modules are visible
        const promises = [];
        if (isBrandPagesVisible) {
          promises.push(getBrands());
        } else {
          promises.push(Promise.resolve([]));
        }
        if (isProductsVisible) {
          promises.push(getCategories());
          promises.push(getProducts());
        } else {
          promises.push(Promise.resolve([]));
          promises.push(Promise.resolve([]));
        }

        const [brandsData, categoriesData, productsData] = await Promise.all(promises);

        // Filter enabled items only
        const enabledBrands = isBrandPagesVisible 
          ? brandsData.filter((b) => b.enabled !== false)
          : [];
        const enabledCategories = isProductsVisible
          ? categoriesData.filter((c) => c.enabled !== false)
          : [];
        const enabledProducts = isProductsVisible
          ? productsData.filter((p) => p.enabled !== false)
          : [];

        setBrands(enabledBrands);
        setCategories(enabledCategories);
        setProducts(enabledProducts);
        
        // Cache the data
        try {
          localStorage.setItem('ubc_products_data', JSON.stringify({
            data: { brands: enabledBrands, categories: enabledCategories, products: enabledProducts },
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }
      } catch (error) {
        console.error("Error fetching brands/categories/products:", error);
        // Don't clear cached data on error - keep showing it
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // State for resolved brand icon URLs
  const [brandIconUrls, setBrandIconUrls] = useState({});
  // State for resolved product image URLs
  const [productImageUrls, setProductImageUrls] = useState({});

  // Resolve brand icon URLs
  useEffect(() => {
    const resolveBrandIcons = async () => {
      const resolvedUrls = {};
      for (const brand of brands) {
        if (brand.icon) {
          try {
            const url = await resolveImageUrl(brand.icon);
            if (url) {
              resolvedUrls[brand.id] = url;
            }
          } catch (error) {
            console.error(
              `Error resolving icon for brand ${brand.name}:`,
              error
            );
          }
        }
      }
      setBrandIconUrls(resolvedUrls);
    };

    if (brands.length > 0) {
      resolveBrandIcons();
    }
  }, [brands]);

  // Resolve product image URLs
  useEffect(() => {
    const resolveProductImages = async () => {
      const resolvedUrls = {};
      for (const product of products) {
        if (product.image) {
          try {
            const url = await resolveImageUrl(product.image);
            if (url) {
              resolvedUrls[product.id] = url;
            }
          } catch (error) {
            console.error(
              `Error resolving image for product ${product.title}:`,
              error
            );
          }
        }
      }
      setProductImageUrls(resolvedUrls);
    };

    if (products.length > 0) {
      resolveProductImages();
    }
  }, [products]);

  // Build brands array with "All" option
  // Use brandId (identifier like "soil-king") for URLs and filtering, but keep document ID for category matching
  const brandsWithAll = useMemo(() => {
    const allBrands = [{ id: "All", name: "All Brands", icon: null }];
    return allBrands.concat(
      brands.map((brand) => ({
        id: brand.brandId || brand.id, // Use brandId (identifier) for URLs/filtering
        documentId: brand.id, // Keep document ID for matching with categories
        name: brand.name,
        icon: brandIconUrls[brand.id] || brand.icon || null, // Use resolved URL if available
      }))
    );
  }, [brands, brandIconUrls]);

  // Helper function to sort chips by predefined order
  const sortChipsByOrder = useCallback((chips) => {
    const sorted = chips.filter((chip) => chip === "All"); // Keep "All" first
    const otherChips = chips.filter((chip) => chip !== "All");
    
    // Sort other chips by predefined order
    const sortedOther = categoryOrder
      .map((orderName) => 
        otherChips.find((chip) => 
          chip.toLowerCase().includes(orderName.toLowerCase()) || 
          orderName.toLowerCase().includes(chip.toLowerCase())
        )
      )
      .filter(Boolean); // Remove undefined
    
    // Add any chips not in the predefined order at the end (alphabetically)
    const remaining = otherChips.filter(
      (chip) => !sortedOther.includes(chip)
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    
    return [...sorted, ...sortedOther, ...remaining];
  }, []);

  // Build chips by brand dynamically from categories
  // Categories store brandId as the document ID, so we match using document ID
  const chipsByBrand = useMemo(() => {
    const result = { All: ["All"] };

    brands.forEach((brand) => {
      // Match categories using document ID (brand.id) since that's what's stored in category.brandId
      const brandCategories = categories.filter((c) => c.brandId === brand.id);
      const chips = [
        "All",
        ...brandCategories.map((c) => c.chip).filter(Boolean),
      ];
      // Use brandId (identifier) for the key so URLs work correctly
      const brandKey = brand.brandId || brand.id;
      result[brandKey] = sortChipsByOrder([...new Set(chips)]); // Remove duplicates and sort
    });

    // Build "All" chips from all unique chips
    const allChips = [
      "All",
      ...new Set(categories.map((c) => c.chip).filter(Boolean)),
    ];
    result["All"] = sortChipsByOrder(allChips);

    return result;
  }, [brands, categories, sortChipsByOrder]);

  // Get category chips based on selected brand
  const chips = useMemo(() => {
    return chipsByBrand[selectedBrand] || chipsByBrand["All"] || ["All"];
  }, [chipsByBrand, selectedBrand]);

  // Update selectedBrand when initialBrand prop changes (from URL)
  useEffect(() => {
    setSelectedBrand(initialBrand);
  }, [initialBrand]);

  // Update active category when initialCategory changes from URL
  useEffect(() => {
    if (initialCategory && !loading && chips.length > 0) {
      const mappedChip = slugToChip(initialCategory, chips);
      if (chips.includes(mappedChip)) {
        setActive(mappedChip);
      } else {
        setActive("All");
      }
    } else if (!initialCategory) {
      // When no category in URL, set to "All" to show categories (if brand selected) or all products (if both "All")
      setActive("All");
    }
  }, [initialCategory, chips, loading]);

  // Reset active category when brand changes (if current category doesn't exist for new brand)
  // Also ensure active is "All" when brand changes and no category is in URL
  useEffect(() => {
    if (!loading && chips.length > 0) {
      if (!chips.includes(active)) {
        setActive("All");
      }
      // If no initialCategory and brand changes, ensure active is "All" to show categories
      if (!initialCategory && active !== "All") {
        setActive("All");
      }
    }
  }, [selectedBrand, chips, active, loading, initialCategory]);

  // Get visible products (when active !== 'All', show products filtered by category)
  // OR when both brand and category are "All", show all products sorted by category name
  const visibleProducts = useMemo(() => {
    let filtered = products;

    // If a specific category is selected, filter by category
    if (active !== "All") {
      // Find the active category
      const activeCategory = categories.find((c) => c.chip === active);
      if (!activeCategory) return [];
      
      // Filter products by category
      filtered = filtered.filter((p) => {
        // Match category using document ID
        return p.categoryId === activeCategory.id;
      });
    }
    // If active === "All" and selectedBrand === "All", show all products (no filtering)

    // Filter by brand if selected
    if (selectedBrand !== "All") {
      // Find the brand by identifier (brandId)
      const brand = brands.find((b) => (b.brandId || b.id) === selectedBrand);
      if (brand) {
        filtered = filtered.filter((p) => p.brandId === brand.id);
      }
    }

    // When filter is "All" (active === "All"), sort products by predefined category order
    if (active === "All") {
      filtered = filtered.sort((a, b) => {
        // Find categories for both products
        const categoryA = categories.find((c) => c.id === a.categoryId);
        const categoryB = categories.find((c) => c.id === b.categoryId);
        
        // Get category names (use chip, title, or id as fallback)
        const nameA = categoryA?.chip || categoryA?.title || categoryA?.id || "";
        const nameB = categoryB?.chip || categoryB?.title || categoryB?.id || "";
        
        // Get index in predefined order (if not found, put at end)
        const indexA = categoryOrder.findIndex(
          (orderName) => nameA.toLowerCase().includes(orderName.toLowerCase()) || 
                        orderName.toLowerCase().includes(nameA.toLowerCase())
        );
        const indexB = categoryOrder.findIndex(
          (orderName) => nameB.toLowerCase().includes(orderName.toLowerCase()) || 
                        orderName.toLowerCase().includes(nameB.toLowerCase())
        );
        
        // If both found in order, sort by order index
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only A found, A comes first
        if (indexA !== -1) return -1;
        // If only B found, B comes first
        if (indexB !== -1) return 1;
        // If neither found, sort alphabetically
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      });
    }

    return filtered;
  }, [active, selectedBrand, products, categories, brands]);

  // Pagination logic
  const totalPages = Math.ceil(visibleProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = visibleProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [active, selectedBrand]);

  return (
    <section
      id="products"
      className="section categories-section"
      aria-labelledby="categories-heading"
    >
      <div className="container">
        <h2 id="categories-heading">
          Explore our finest products
          <br />
          crafted <span className="playfair-text">for</span> everyday flavor
        </h2>

        {/* Brand Filter Buttons */}
        {(
          <div className="brands-buttons-wrapper">
            {brandsWithAll.map((brand) => (
              <button
                key={brand.id}
                className={`brand-button ${
                  selectedBrand === brand.id ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedBrand(brand.id);
                  // Reset category to 'All' when brand changes
                  const newChips =
                    chipsByBrand[brand.id] || chipsByBrand["All"];
                  if (!newChips.includes(active)) {
                    setActive("All");
                  }
                  // Update URL / navigation only on the products page.
                  if (isProductsPage) {
                    if (brand.id === "All") {
                      navigate("/products");
                    } else {
                      navigate(`/products?brand=${brand.id}`);
                    }
                  } else {
                    // Stay on the current (home) page; optionally update the query string for sharing.
                    const search =
                      brand.id === "All" ? "" : `?brand=${brand.id}`;
                    navigate({ pathname: location.pathname, search }, { replace: true });
                  }
                }}
                role="tab"
                aria-selected={selectedBrand === brand.id}
                aria-controls="categories-grid"
              >
                {brand.icon && (
                  <img
                    src={brand.icon}
                    alt={brand.name}
                    className="brand-button-icon"
                  />
                )}
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
        )}

        <SectionTag label="★ CATEGORIES" />

        {/* Category Filter Buttons */}
        {(
          <div className="categories-buttons-wrapper">
            {chips.map((c, index) => (
              <button
                key={`chip-${selectedBrand}-${c}-${index}`}
                className={`category-button ${active === c ? "active" : ""}`}
                onClick={() => {
                  setActive(c);
                  const categoryParam = chipToSlug(c);
                  if (isProductsPage) {
                    // On products page, navigate as before
                    if (c === "All") {
                      if (selectedBrand === "All") {
                        navigate("/products");
                      } else {
                        navigate(`/products?brand=${selectedBrand}`);
                      }
                    } else if (categoryParam) {
                      navigate(
                        `/products?brand=${selectedBrand}&category=${categoryParam}`
                      );
                    }
                  } else {
                    // On home (or other pages), stay on page and just update query string
                    let search = "";
                    if (c !== "All" && categoryParam) {
                      search = `?category=${categoryParam}`;
                      if (selectedBrand !== "All") {
                        search += `&brand=${selectedBrand}`;
                      }
                    } else if (selectedBrand !== "All") {
                      search = `?brand=${selectedBrand}`;
                    }
                    navigate({ pathname: location.pathname, search }, { replace: true });
                  }
                }}
                role="tab"
                aria-selected={active === c}
                aria-controls="categories-grid"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Categories/Products List - Always show products based on filters */}
        {!loading && (
          <div className="products-list-section">
            {/* Show products based on filters */}
            <>
                {/* Products Title - Show when not viewing a specific category */}
                {active === "All" && (
                  <h3 className="products-list-title">
                    {selectedBrand === "All"
                      ? "All Products"
                      : `Products - ${brands.find(b => (b.brandId || b.id) === selectedBrand)?.name || selectedBrand}`}
                  </h3>
                )}
                {visibleProducts.length > 0 ? (
                  <>
                  <div className="brand-prod-row">
                    {paginatedProducts.map((product, index) => {
                  // Debug: Log product details for Chintu Masala
                  if (
                    product.title &&
                    product.title.toLowerCase().includes("chintu")
                  ) {
                    console.log("Chintu Masala product details:", {
                      id: product.id,
                      title: product.title,
                      fullProduct: product,
                      hasId: !!product.id,
                      idType: typeof product.id,
                      idValue: product.id,
                    });
                  }
                  // Debug: Log if product.id is missing
                  if (!product.id) {
                    console.warn("Product missing ID:", product.title, product);
                  }
                  return (
                    <article
                      key={product.id || `product-${index}`}
                      className="brand-prod-card"
                    >
                      <div className="brand-prod-media">
                        {productImageUrls[product.id] || product.image ? (
                          <img
                            src={productImageUrls[product.id] || product.image}
                            alt={product.title}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "200px",
                              backgroundColor: "#f3f4f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#9CA3AF",
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="brand-prod-body">
                        <div className="brand-prod-header">
                          <div className="brand-prod-title-row">
                            <h3
                              className="brand-prod-name"
                              style={{
                                textAlign: product.titleAlign || "left",
                                fontSize: product.titleFontSize
                                  ? `${product.titleFontSize}px`
                                  : undefined,
                                width: product.titleWidth
                                  ? `${product.titleWidth}px`
                                  : undefined,
                              }}
                            >
                              {product.title}
                            </h3>
                            {(() => {
                            // Use custom href if available, otherwise use product detail page
                            // Encode product ID to handle special characters
                            const productIdUrl =
                              product.id && product.id.trim()
                                ? `/product/${encodeURIComponent(product.id)}`
                                : null;
                            const linkUrl = product.href || productIdUrl;

                            if (!linkUrl) {
                              return (
                                <span
                                  className="chip-link"
                                  style={{
                                    opacity: 0.5,
                                    cursor: "not-allowed",
                                    pointerEvents: "none",
                                  }}
                                  title="Product ID is missing"
                                >
                                  Know More
                                </span>
                              );
                            }

                            // If href is an external URL or starts with http, use regular anchor
                            if (
                              linkUrl.startsWith("http://") ||
                              linkUrl.startsWith("https://") ||
                              linkUrl.startsWith("//")
                            ) {
                              return (
                                <a
                                  href={linkUrl}
                                  className="chip-link"
                                  onClick={(e) => {
                                    console.log(
                                      "Know More clicked for:",
                                      product.title,
                                      "Custom href:",
                                      linkUrl
                                    );
                                  }}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Know More
                                </a>
                              );
                            }

                            // Use React Router Link for internal routes
                            return (
                              <Link
                                to={linkUrl}
                                className="chip-link"
                                onClick={(e) => {
                                  console.log(
                                    "Know More clicked for:",
                                    product.title,
                                    "ID:",
                                    product.id,
                                    "URL:",
                                    linkUrl,
                                    "Has custom href:",
                                    !!product.href
                                  );
                                  // Ensure navigation happens
                                }}
                              >
                                Know More
                              </Link>
                            );
                          })()}
                          </div>
                          <div className="brand-prod-text-container">
                            {product.titleSub && (
                              <p
                                className="brand-prod-blurb"
                                style={{
                                  textAlign: product.titleSubAlign || "left",
                                  fontSize: product.titleSubFontSize
                                    ? `${product.titleSubFontSize}px`
                                    : undefined,
                                }}
                              >
                                {product.titleSub}
                              </p>
                            )}
                            {!product.titleSub && product.description && (
                              <p
                                className="brand-prod-blurb"
                                style={{
                                  textAlign: product.descriptionAlign || "left",
                                  fontSize: product.descriptionFontSize
                                    ? `${product.descriptionFontSize}px`
                                    : undefined,
                                }}
                              >
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-wrapper" style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "2rem",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #ddd",
                      backgroundColor: currentPage === 1 ? "#f3f4f6" : "#fff",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #ddd",
                        backgroundColor: currentPage === page ? "#007bff" : "#fff",
                        color: currentPage === page ? "#fff" : "#000",
                        cursor: "pointer",
                        borderRadius: "4px",
                        minWidth: "40px"
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #ddd",
                      backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#fff",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6B7280",
                    }}
                  >
                    <p>
                      No products found. Add products in the admin panel.
                    </p>
                  </div>
                )}
            </>
          </div>
        )}

        <div className="center">
          <a href="/products" className="btn" aria-label="Explore all products">
            Explore Products
          </a>
        </div>
      </div>
    </section>
  );
}
