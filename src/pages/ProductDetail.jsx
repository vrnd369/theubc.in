import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProductDetail.css';
import SectionTag from '../components/SectionTag';
import { getProduct, getProducts, getBrands, getCategories } from '../admin/services/productService';
import { resolveImageUrl } from '../utils/imageUtils';
import probgImage from '../assets/probg1.png';

// Static icon imports for USO section
// These icons are used by default, with fallback to dashboard-uploaded icons
// Default icons (Layer 1-4) are used as fallback
// To add specific icons, place them in src/assets/ with these names:
// - pillar-pure-natural.png
// - pillar-aroma-locked.png
// - pillar-no-preservatives.png
// - pillar-no-colours.png
// Then uncomment the imports below and update the getStaticIcon function
import iconDefault1 from '../assets/Layer 1.png';
import iconDefault2 from '../assets/Layer 2.png';
import iconDefault3 from '../assets/Layer 3.png';
import iconDefault4 from '../assets/Layer 4.png';

// Uncomment these when you add the specific icon files to assets folder:
// import iconPureNatural from '../assets/pillar-pure-natural.png';
// import iconAromaLocked from '../assets/pillar-aroma-locked.png';
// import iconNoPreservatives from '../assets/pillar-no-preservatives.png';
// import iconNoColours from '../assets/pillar-no-colours.png';

// Mapping function to get static icon based on pillar title
const getStaticIcon = (pillarTitle, index) => {
  // Default icons array
  const defaultIcons = [iconDefault1, iconDefault2, iconDefault3, iconDefault4];
  
  if (!pillarTitle) {
    // Fallback to default icons by index if no title
    return defaultIcons[index] || null;
  }

  // Map common pillar titles to static icons
  // Uncomment these when you add the specific icon files:
  // const titleLower = pillarTitle.toLowerCase().trim();
  // if (iconPureNatural && titleLower.includes('pure') && titleLower.includes('natural')) {
  //   return iconPureNatural;
  // }
  // if (iconAromaLocked && titleLower.includes('aroma') && titleLower.includes('lock')) {
  //   return iconAromaLocked;
  // }
  // if (iconNoPreservatives && titleLower.includes('preservative')) {
  //   return iconNoPreservatives;
  // }
  // if (iconNoColours && (titleLower.includes('colour') || titleLower.includes('color'))) {
  //   return iconNoColours;
  // }
  
  // Fallback to default icons by index
  return defaultIcons[index] || null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [brandName, setBrandName] = useState('Products');
  const [categoryName, setCategoryName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const rowRef = useRef(null);
  // State for resolved image URLs
  const [resolvedImages, setResolvedImages] = useState({
    productImage: null,
    whyChooseBackground: null,
    pillarIcons: {},
    relatedProductImages: {}
  });

  // Fetch product data from Firebase - optimized for performance
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch the product
        const productData = await getProduct(id);
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        // Transform Firebase data to match component expectations
        const transformedProduct = {
          id: productData.id,
          title: productData.title || '',
          titleSub: productData.titleSub || '',
          category: productData.category || 'Product',
          description: productData.description || '',
          description2: productData.description2 || '',
          image: productData.image || '',
          sizes: productData.sizes || [],
          nutrition: productData.nutrition || [],
          benefits: productData.benefits || [],
          whyChooseTitle: productData.whyChooseTitle || '',
          whyChooseTitleAlign: productData.whyChooseTitleAlign || 'left',
          whyChooseBackground: productData.whyChooseBackground || '',
          uspTag: productData.uspTag || '',
          uspTitle: productData.uspTitle || '',
          uspTitleAlign: productData.uspTitleAlign || 'left',
          // Only preserve customizable fields (font sizes and titleSubWidth)
          // Font weights, styles, and widths use CSS defaults
          titleFontSize: productData.titleFontSize,
          titleSubFontSize: productData.titleSubFontSize,
          titleSubWidth: productData.titleSubWidth,
          pillars: productData.pillars || [],
          brandId: productData.brandId,
          categoryId: productData.categoryId
        };

        // Set product IMMEDIATELY - don't wait for images
        setProduct(transformedProduct);

        // Set default size if available
        if (transformedProduct.sizes && transformedProduct.sizes.length > 0) {
          setSelectedSize(transformedProduct.sizes[0]);
        }

        // Resolve product images in background (non-blocking)
        const imagePromises = [];
        
        // Resolve main product image
        if (transformedProduct.image) {
          imagePromises.push(
            resolveImageUrl(transformedProduct.image).then(url => {
              setResolvedImages(prev => ({ ...prev, productImage: url }));
            }).catch(err => console.error('Error resolving product image:', err))
          );
        }
        
        // Resolve why choose background
        if (transformedProduct.whyChooseBackground) {
          imagePromises.push(
            resolveImageUrl(transformedProduct.whyChooseBackground).then(url => {
              setResolvedImages(prev => ({ ...prev, whyChooseBackground: url }));
            }).catch(err => console.error('Error resolving why choose background:', err))
          );
        }
        
        // Note: Pillar icons now use static assets from src/assets
        // Dashboard-uploaded icons will be used as fallback if static icons don't exist
        // No need to resolve pillar icons from Firebase anymore

        // Fetch brand name, category info, and related products in parallel (optimized)
        if (productData.brandId) {
          try {
            // Fetch brands, categories, and products in parallel for better performance
            const [brands, allProducts] = await Promise.all([
              getBrands(),
              getProducts()
            ]);
            
            // Try to find brand by both id and brandId
            const brand = brands.find(b => 
              (b.id === productData.brandId) || 
              (b.brandId === productData.brandId) ||
              (b.id === productData.brandId)
            );
            
            if (brand) {
              setBrandName(brand.name);
              
              // Fetch categories to get category information
              let categoryInfo = null;
              if (productData.categoryId) {
                try {
                  const allCategories = await getCategories();
                  categoryInfo = allCategories.find(c => c.id === productData.categoryId);
                  if (categoryInfo) {
                    setCategoryName(categoryInfo.chip || categoryInfo.title || 'Category');
                  }
                } catch (catErr) {
                  console.error('Error fetching category:', catErr);
                }
              }
              
              // Filter products STRICTLY by same category only
              let related = [];
              
              if (productData.categoryId) {
                // Normalize categoryId for comparison (trim whitespace, handle null/undefined)
                const targetCategoryId = String(productData.categoryId).trim();
                
                // Only show products in the exact same category
                related = allProducts.filter(p => {
                  // Skip current product and disabled products
                  if (p.id === id || p.enabled === false) {
                    return false;
                  }
                  
                  // Normalize product's categoryId for comparison
                  const productCategoryId = p.categoryId ? String(p.categoryId).trim() : null;
                  
                  // Strict category matching - must match exactly
                  const categoryMatch = productCategoryId === targetCategoryId;
                  
                  // Additional check: also match by category document ID if categoryId is stored differently
                  // Some products might have category.id instead of categoryId
                  const categoryIdMatch = p.category?.id ? 
                    String(p.category.id).trim() === targetCategoryId : false;
                  
                  return categoryMatch || categoryIdMatch;
                });
                
                // Limit to 8 products, but only show same category products
                related = related.slice(0, 8);
                
                // Debug logging to help identify category matching issues
                if (related.length === 0) {
                  console.log('No related products found for category:', {
                    productCategoryId: targetCategoryId,
                    categoryName: categoryInfo?.chip || categoryInfo?.title,
                    totalProducts: allProducts.length,
                    productsWithCategoryId: allProducts.filter(p => p.categoryId).length,
                    sampleProductCategoryIds: allProducts
                      .filter(p => p.categoryId)
                      .slice(0, 10)
                      .map(p => ({ 
                        id: p.id, 
                        title: p.title, 
                        categoryId: p.categoryId,
                        categoryIdType: typeof p.categoryId,
                        matches: String(p.categoryId || '').trim() === targetCategoryId
                      }))
                  });
                } else {
                  console.log('Found related products:', {
                    count: related.length,
                    categoryId: targetCategoryId,
                    categoryName: categoryInfo?.chip || categoryInfo?.title,
                    productTitles: related.map(p => p.title)
                  });
                }
              } else {
                // No categoryId available - don't show related products
                // User wants category-only filtering
                related = [];
                console.log('Product has no categoryId, not showing related products');
              }
              
              setRelatedProducts(related);
              
              // Resolve related product images in background
              related.forEach((p) => {
                if (p.image) {
                  imagePromises.push(
                    resolveImageUrl(p.image).then(url => {
                      setResolvedImages(prev => ({
                        ...prev,
                        relatedProductImages: { ...prev.relatedProductImages, [p.id]: url }
                      }));
                    }).catch(err => console.error(`Error resolving related product ${p.id} image:`, err))
                  );
                }
              });
            } else {
              // Brand not found, try fetching products directly with brandId
              const related = await getProducts(productData.brandId, null);
              const filtered = related
                .filter(p => p.id !== id && p.enabled !== false)
                .slice(0, 8);
              setRelatedProducts(filtered);
              
              filtered.forEach((p) => {
                if (p.image) {
                  imagePromises.push(
                    resolveImageUrl(p.image).then(url => {
                      setResolvedImages(prev => ({
                        ...prev,
                        relatedProductImages: { ...prev.relatedProductImages, [p.id]: url }
                      }));
                    }).catch(err => console.error(`Error resolving related product ${p.id} image:`, err))
                  );
                }
              });
            }
          } catch (err) {
            console.error('Error fetching brand/products:', err);
          }
        }

        // Wait for all images to resolve (but don't block rendering)
        Promise.all(imagePromises).catch(() => {});

        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

  /* Prevent manual scroll on the product row (use arrows only) */
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const prevent = (e) => {
      if (e.type === 'wheel') {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    };
    row.addEventListener('wheel', prevent, { passive: false });
    row.addEventListener('touchmove', prevent, { passive: false });
    row.addEventListener('keydown', prevent, { passive: false });
    return () => {
      row.removeEventListener('wheel', prevent);
      row.removeEventListener('touchmove', prevent);
      row.removeEventListener('keydown', prevent);
    };
  }, [relatedProducts]); // Update when related products change

  const stepWidth = () => {
    const row = rowRef.current;
    if (!row) return 0;
    const card = row.querySelector('.brand-prod-card');
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const w = (card?.offsetWidth || 0) + gap;
    return w || Math.round(row.clientWidth * 0.9);
  };

  const slide = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: dir * stepWidth(), behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = product
      ? `${product.title} - UBC | United Brothers Company`
      : 'Product - UBC | United Brothers Company';
  }, [product]);

  // Loading state
  if (loading) {
    return (
      <main className="product-detail">
        <div className="container">
          <div className="product-loading" style={{ 
            padding: '100px 20px', 
            textAlign: 'center' 
          }}>
            <div style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #323790',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <p>Loading product...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </main>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <main className="product-detail">
        <div className="container">
          <div className="product-not-found" style={{ 
            padding: '100px 20px', 
            textAlign: 'center' 
          }}>
            <h1>Product Not Found</h1>
            <p>{error || "The product you're looking for doesn't exist."}</p>
            <button onClick={() => navigate('/products')} className="btn">
              Back to Products
            </button>
          </div>
        </div>
      </main>
    );
  }

  // helper to render the multi-line benefit text
  const renderBenefitLines = (benefit) => {
    if (!benefit || !benefit.description) return null;

    // Split by <br/> if present, otherwise treat as single paragraph
    const parts = benefit.description.split('<br/>');
    return (
      <div className="benefit-text">
        {parts.map((part, idx) => (
          <p key={idx} className="benefit-line">
            {part.trim()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <main className="product-detail">
      <section className="product-detail-section">
        <div className="container">
          <div className="product-detail-grid">
            {/* Left: Product Image */}
            <div className="product-image-wrapper">
              <div className="product-image-card">
                {resolvedImages.productImage || product.image ? (
                  <img 
                    src={resolvedImages.productImage || product.image} 
                    alt={product.title} 
                    className="product-image" 
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '466px', 
                    backgroundColor: '#f3f4f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#9CA3AF',
                    borderRadius: '16px'
                  }}>
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="product-details">
              <SectionTag label={(product.category || 'PRODUCT').toUpperCase()} />
              <h1 
                className="product-title" 
                style={{ 
                  fontSize: product.titleFontSize ? `${product.titleFontSize}px` : undefined,
                }}
              >
                {product.title}
                {product.titleSub && (
                  <span 
                    className="product-title-sub" 
                    style={{ 
                      display: 'block', 
                      fontSize: product.titleSubFontSize ? `${product.titleSubFontSize}px` : undefined,
                      width: product.titleSubWidth ? `${product.titleSubWidth}px` : undefined,
                      marginTop: '8px',
                    }}
                  >
                    {product.titleSub}
                  </span>
                )}
              </h1>

              {product.description && (
                <p className="product-description">
                  {product.description}
                </p>
              )}
              {product.description2 && (
                <p className="product-description-2">
                  {product.description2}
                </p>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <>
                  <div className="divider"></div>
                  <div className="available-sizes">
                    <h3 className="sizes-title">Available Sizes</h3>
                    <div className="sizes-list">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {product.nutrition && (
                <>
                  <div className="divider"></div>

                  <div className="nutritional-info">
                    <h3 className="nutrition-title">Nutritional Information (Per 100g)</h3>

                    <table className="nutrition-table">
                      <tbody>
                        {product.nutrition.map((item, index) => {
                          const isSub =
                            item.nutrient === 'Sugar' || item.nutrient === 'Saturated Fat';
                          return (
                            <tr key={index}>
                              <td className={isSub ? 'nutrient sub' : 'nutrient'}>
                                {isSub ? '— ' : ''}
                                {item.nutrient}
                              </td>
                              <td className="nutrient-val">{item.value}</td>
                              <td className="nutrient-dv">{item.dailyValue}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="divider"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section
        className="why-choose-section"
        style={{
          backgroundImage: `url(${resolvedImages.whyChooseBackground || product.whyChooseBackground || probgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="why-choose-overlay"></div>
        <div className="container">
          <div className="why-choose-grid">
            <div className="why-choose-left">
              <h2 className="why-choose-title" dangerouslySetInnerHTML={{
                __html: (product.whyChooseTitle 
                  ? product.whyChooseTitle
                      .replace(/{Product Name}/g, product.title)
                      .replace(/\n/g, '<br />') // Convert newlines to <br />
                  : `Why Choose<br />Our ${product.title}?`
                ).replace(/<br\s*\/?>/gi, '<br />')
              }} style={{ textAlign: product.whyChooseTitleAlign || 'left' }} />
            </div>

            <div className="why-choose-right">
              {product.benefits && product.benefits.length > 0 ? (
                product.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <p className="benefit-label">Benefits:</p>
                    <h3 className="benefit-subtitle">{benefit.title} -</h3>
                    {renderBenefitLines(benefit)}
                  </div>
                ))
              ) : (
                <div className="benefit-item">
                  <p className="benefit-label">No benefits added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      {product.pillars && product.pillars.length > 0 && (
        <section className="four-pillars-section">
          <div className="container">
            <div className="pillars-grid">
              <div className="pillars-left">
                <SectionTag label={product.uspTag || "★ USP"} />
                <h2 className="pillars-title" dangerouslySetInnerHTML={{
                  __html: (product.uspTitle || "The Four Pillars<br /><span style=\"white-space: nowrap;\">of Our Quality Spice</span>")
                    .replace(/<br\s*\/?>/gi, '<br />')
                    .replace(/\n/g, '<br />')
                }} style={{ textAlign: product.uspTitleAlign || 'left' }} />
              </div>

              <div className="pillars-right">
                <div className="pillars-grid-items">
                  {product.pillars.map((pillar, index) => {
                    // Get static icon first, fallback to dashboard-uploaded icon
                    const staticIcon = getStaticIcon(pillar.title, index);
                    const iconSrc = staticIcon || (resolvedImages.pillarIcons[index] || pillar.icon);
                    
                    return (
                      <div key={index} className="pillar-item">
                        {iconSrc && (
                          <div className="pillar-icon">
                            <img 
                              src={iconSrc} 
                              alt={pillar.title || `Pillar ${index + 1}`} 
                            />
                          </div>
                        )}
                        {pillar.title && (
                          <h3 className="pillar-title">{pillar.title}</h3>
                        )}
                        {pillar.description && (
                          <p className="pillar-description" dangerouslySetInnerHTML={{
                            __html: pillar.description.replace(/<br\s*\/?>/gi, '<br />')
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Explore Related Products */}
      <section className="brand-products product-detail-products">
        <div className="container">
          <div className="prod-head">
            <div>
              {categoryName ? (
                <>
                  <SectionTag label={`★ ${categoryName.toUpperCase()}`} />
                  <h2 className="prod-title" style={{ marginTop: '0.5rem' }}>
                    More from {categoryName}
                  </h2>
                  <p style={{ 
                    marginTop: '0.5rem', 
                    color: '#6B7280', 
                    fontSize: '1rem',
                    fontWeight: '400'
                  }}>
                    Explore other products in this category
                  </p>
                </>
              ) : (
                <Link
                  to="/products"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h2 className="prod-title">
                    Explore {brandName}
                    <br /> Products
                  </h2>
                </Link>
              )}
            </div>

            <div className="prod-arrows">
              <button
                aria-label="Previous"
                className="btn icon-btn prev"
                onClick={() => slide(-1)}
              >
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true">
                  {/* shaft */}
                  <line x1="32" y1="20" x2="10" y2="20" />
                  {/* head */}
                  <polyline points="18 12 10 20 18 28" />
                </svg>
              </button>
              <button aria-label="Next" className="btn icon-btn next" onClick={() => slide(1)}>
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true">
                  {/* shaft */}
                  <line x1="8" y1="20" x2="30" y2="20" />
                  {/* head */}
                  <polyline points="22 12 30 20 22 28" />
                </svg>
              </button>
            </div>
          </div>

          <div className="brand-prod-row no-user-scroll" ref={rowRef}>
            {relatedProducts.length > 0 ? (
              relatedProducts.map((p) => (
                <article className="brand-prod-card" key={p.id}>
                  <div className="brand-prod-media">
                    {(resolvedImages.relatedProductImages[p.id] || p.image) ? (
                      <img src={resolvedImages.relatedProductImages[p.id] || p.image} alt={p.title} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9CA3AF'
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="brand-prod-body">
                    <div className="brand-prod-header">
                      <div className="brand-prod-text-container">
                        <h3 className="brand-prod-name">{p.title}</h3>
                        {p.titleSub && (
                          <p className="brand-prod-blurb">{p.titleSub}</p>
                        )}
                        {!p.titleSub && p.description && (
                          <p className="brand-prod-blurb">{p.description}</p>
                        )}
                      </div>
                      <Link to={`/product/${p.id}`} className="chip-link">
                        Know More
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#6B7280' 
              }}>
                <p>No related products available</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
