import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProductDetail.css';
import SectionTag from '../components/SectionTag';
import { getProduct, getProducts, getBrands, getCategories } from '../admin/services/productService';
import { resolveImageUrl } from '../utils/imageUtils';
import probgImage from '../assets/probg1.png';
import { RiceIcon, ClockIcon, SteamIcon, IsoIcon, LeafIcon, LightbulbIcon, TripleLayerIcon } from '../components/icons/RiceIcons';

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
        
        // Resolve pillar icons
        if (transformedProduct.pillars && transformedProduct.pillars.length > 0) {
          transformedProduct.pillars.forEach((pillar, index) => {
            if (pillar.icon) {
              imagePromises.push(
                resolveImageUrl(pillar.icon).then(url => {
                  setResolvedImages(prev => ({
                    ...prev,
                    pillarIcons: { ...prev.pillarIcons, [index]: url }
                  }));
                }).catch(err => console.error(`Error resolving pillar ${index} icon:`, err))
              );
            }
          });
        }

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

  // Check if this is Royal Basmati Rice product
  const isRoyalBasmatiRice = product?.title?.toLowerCase().includes('royal basmati');
  
  // Check if this is Super Basmati Rice product
  const isSuperBasmatiRice = product?.title?.toLowerCase().includes('super basmati');
  
  // Check if this is Chilli Powder product
  const isChilliPowder = product?.title?.toLowerCase().includes('chilli powder') || 
                         product?.title?.toLowerCase().includes('chili powder');
  
  // Check if this is Turmeric Powder product
  const isTurmericPowder = product?.title?.toLowerCase().includes('turmeric powder');
  
  // Check if this is Coriander Powder product
  const isCorianderPowder = product?.title?.toLowerCase().includes('coriander powder');
  
  // Check if this is Garam Masala product
  const isGaramMasala = product?.title?.toLowerCase().includes('garam masala');
  
  // Check if this is Jeera Powder product
  const isJeeraPowder = product?.title?.toLowerCase().includes('jeera powder') || 
                       product?.title?.toLowerCase().includes('cumin powder');

  // Check if this is Culinary Paste product
  const isCulinaryPaste = product?.title?.toLowerCase().includes('paste');

  // Check if this is Appalam product (masala or plain)
  const isAppalam = product?.title?.toLowerCase().includes('appalam');
  
  // Check if this is any Masala Powder product (excluding Garam Masala and Appalam which are handled separately)
  const isMasalaPowder = product?.title?.toLowerCase().includes('masala') && !isGaramMasala && !isAppalam;

  // Get pillars with defaults for Royal Basmati Rice - ensure 4 pillars are always shown
  const getRoyalBasmatiPillars = () => {
    if (!isRoyalBasmatiRice) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Royal Basmati Rice
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Super Basmati Rice - ensure 4 pillars are always shown
  const getSuperBasmatiPillars = () => {
    if (!isSuperBasmatiRice) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Super Basmati Rice
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Chilli Powder - ensure 4 pillars are always shown
  const getChilliPowderPillars = () => {
    if (!isChilliPowder) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Chilli Powder
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Culinary Paste products - ensure 4 pillars are always shown
  const getCulinaryPastePillars = () => {
    if (!isCulinaryPaste) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Culinary Paste
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Appalam products (masala and plain) - ensure 4 pillars are always shown
  const getAppalamPillars = () => {
    if (!isAppalam) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Appalam
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for all Masala Powders (meat masala, sambar masala, etc.) - ensure 4 pillars are always shown
  const getMasalaPowderPillars = () => {
    if (!isMasalaPowder) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Masala Powders
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Garam Masala - ensure 4 pillars are always shown
  const getGaramMasalaPillars = () => {
    if (!isGaramMasala) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Garam Masala
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Jeera Powder - ensure 4 pillars are always shown
  const getJeeraPowderPillars = () => {
    if (!isJeeraPowder) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Jeera Powder
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Turmeric Powder - ensure 4 pillars are always shown
  const getTurmericPowderPillars = () => {
    if (!isTurmericPowder) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Turmeric Powder
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Get pillars with defaults for Coriander Powder - ensure 4 pillars are always shown
  const getCorianderPowderPillars = () => {
    if (!isCorianderPowder) return product.pillars || [];

    const defaultPillars = [
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

    const existingPillars = product.pillars || [];
    const pillars = [];

    // Ensure we have exactly 4 pillars for Coriander Powder
    for (let i = 0; i < 4; i++) {
      if (existingPillars[i]) {
        // Use existing pillar but fill in defaults if missing
        pillars.push({
          ...existingPillars[i],
          title: existingPillars[i].title || defaultPillars[i].title,
          description: existingPillars[i].description || defaultPillars[i].description
        });
      } else {
        // Add default pillar if missing
        pillars.push(defaultPillars[i]);
      }
    }

    return pillars;
  };

  // Default descriptions for Royal Basmati Rice pillars
  const getRoyalBasmatiPillarData = (pillar, index) => {
    if (!isRoyalBasmatiRice) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Jeera Powder pillars
  const getJeeraPowderPillarData = (pillar, index) => {
    if (!isJeeraPowder) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Garam Masala pillars
  const getGaramMasalaPillarData = (pillar, index) => {
    if (!isGaramMasala) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Masala Powder pillars (meat masala, sambar masala, etc.)
  const getMasalaPowderPillarData = (pillar, index) => {
    if (!isMasalaPowder) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Culinary Paste pillars
  const getCulinaryPastePillarData = (pillar, index) => {
    if (!isCulinaryPaste) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Appalam pillars
  const getAppalamPillarData = (pillar, index) => {
    if (!isAppalam) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Coriander Powder pillars
  const getCorianderPowderPillarData = (pillar, index) => {
    if (!isCorianderPowder) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Turmeric Powder pillars
  const getTurmericPowderPillarData = (pillar, index) => {
    if (!isTurmericPowder) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Chilli Powder pillars
  const getChilliPowderPillarData = (pillar, index) => {
    if (!isChilliPowder) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Default descriptions for Super Basmati Rice pillars
  const getSuperBasmatiPillarData = (pillar, index) => {
    if (!isSuperBasmatiRice) return pillar;

    const defaultPillars = [
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

    const defaultPillar = defaultPillars[index] || {};
    return {
      ...pillar,
      title: pillar.title || defaultPillar.title || `Pillar ${index + 1}`,
      description: pillar.description || defaultPillar.description || ''
    };
  };

  // Helper function to get the appropriate icon for product pillars
  const getRiceIcon = (pillar, index) => {
    if (!isRoyalBasmatiRice && !isSuperBasmatiRice && !isChilliPowder) return null;
    
    const title = (pillar.title || '').toLowerCase();
    const description = (pillar.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // For Chilli Powder - matching the image order:
    // Index 0: Pure & Natural -> LeafIcon
    // Index 1: Advanced Tech -> LightbulbIcon
    // Index 2: Rich Aroma & Color -> SteamIcon
    // Index 3: Triple-Layer Protection -> TripleLayerIcon
    if (isChilliPowder) {
      if (combined.includes('pure') || combined.includes('natural') || index === 0) {
        return <LeafIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('tech') || combined.includes('advanced') || index === 1) {
        return <LightbulbIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('aroma') || combined.includes('color') || combined.includes('rich') || index === 2) {
        return <SteamIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('layer') || combined.includes('protection') || combined.includes('triple') || index === 3) {
        return <TripleLayerIcon size={64} color="#BF6543" />;
      }
      
      // Default fallback for Chilli Powder
      const icons = [LeafIcon, LightbulbIcon, SteamIcon, TripleLayerIcon];
      const IconComponent = icons[index % icons.length];
      return <IconComponent size={64} color="#BF6543" />;
    }

    // For Super Basmati Rice - matching the image order:
    // Index 0: Silky & Slender Grains -> RiceIcon
    // Index 1: Perfectly Aged -> ClockIcon
    // Index 2: Rich Aroma & Flavor -> SteamIcon
    // Index 3: ISO Certified -> IsoIcon
    if (isSuperBasmatiRice) {
      if (combined.includes('grain') || combined.includes('silky') || combined.includes('slender') || index === 0) {
        return <RiceIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('aged') || combined.includes('time') || combined.includes('perfectly') || index === 1) {
        return <ClockIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('aroma') || combined.includes('flavor') || combined.includes('fragrant') || combined.includes('rich') || index === 2) {
        return <SteamIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('iso') || combined.includes('certified') || combined.includes('certification') || index === 3) {
        return <IsoIcon size={64} />;
      }
      
      // Default fallback for Super Basmati Rice
      const icons = [RiceIcon, ClockIcon, SteamIcon, IsoIcon];
      const IconComponent = icons[index % icons.length];
      if (IconComponent === IsoIcon) {
        return <IsoIcon size={64} />;
      }
      return <IconComponent size={64} color="#BF6543" />;
    }

    // For Royal Basmati Rice - matching the image order:
    // Index 0: Authentic Aroma -> SteamIcon
    // Index 1: Perfect Grain Length -> RiceIcon
    // Index 2: Carefully Aged -> ClockIcon
    // Index 3: ISO Certified -> IsoIcon
    if (isRoyalBasmatiRice) {
      if (combined.includes('aroma') || combined.includes('fragrant') || index === 0) {
        return <SteamIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('grain') || combined.includes('rice') || combined.includes('length') || index === 1) {
        return <RiceIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('aged') || combined.includes('time') || combined.includes('carefully') || index === 2) {
        return <ClockIcon size={64} color="#BF6543" />;
      }
      if (combined.includes('iso') || combined.includes('certified') || combined.includes('certification') || index === 3) {
        return <IsoIcon size={64} />;
      }
      
      // Default fallback for Royal Basmati Rice
      const icons = [SteamIcon, RiceIcon, ClockIcon, IsoIcon];
      const IconComponent = icons[index % icons.length];
      if (IconComponent === IsoIcon) {
        return <IsoIcon size={64} />;
      }
      return <IconComponent size={64} color="#BF6543" />;
    }
    
    return null;
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
      {(() => {
        const pillarsToShow = isJeeraPowder
          ? getJeeraPowderPillars()
          : isGaramMasala
            ? getGaramMasalaPillars()
            : isAppalam
              ? getAppalamPillars()
              : isCulinaryPaste
                ? getCulinaryPastePillars()
                : isMasalaPowder
                  ? getMasalaPowderPillars()
                  : isCorianderPowder
                    ? getCorianderPowderPillars()
                    : isTurmericPowder
                      ? getTurmericPowderPillars()
                      : isChilliPowder
                        ? getChilliPowderPillars()
                        : isSuperBasmatiRice 
                          ? getSuperBasmatiPillars() 
                          : isRoyalBasmatiRice 
                            ? getRoyalBasmatiPillars() 
                            : (product.pillars || []);
        return pillarsToShow.length > 0 && (
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
                    {pillarsToShow.map((pillar, index) => {
                      const enhancedPillar = isJeeraPowder
                        ? getJeeraPowderPillarData(pillar, index)
                        : isGaramMasala
                          ? getGaramMasalaPillarData(pillar, index)
                          : isAppalam
                            ? getAppalamPillarData(pillar, index)
                            : isCulinaryPaste
                              ? getCulinaryPastePillarData(pillar, index)
                              : isMasalaPowder
                                ? getMasalaPowderPillarData(pillar, index)
                                : isCorianderPowder
                                  ? getCorianderPowderPillarData(pillar, index)
                                  : isTurmericPowder
                                    ? getTurmericPowderPillarData(pillar, index)
                                    : isChilliPowder
                                      ? getChilliPowderPillarData(pillar, index)
                                      : isSuperBasmatiRice 
                                        ? getSuperBasmatiPillarData(pillar, index)
                                        : isRoyalBasmatiRice 
                                          ? getRoyalBasmatiPillarData(pillar, index)
                                          : pillar;
                      // Check if pillar has a custom icon set in database
                      const hasCustomIcon = resolvedImages.pillarIcons[index] || pillar.icon;
                      // Only use React icon if no custom icon is set
                      const riceIcon = hasCustomIcon ? null : getRiceIcon(enhancedPillar, index);
                      const shouldShowIcon = riceIcon || hasCustomIcon;
                      
                      return (
                        <div key={index} className="pillar-item">
                          {shouldShowIcon && (
                            <div className="pillar-icon">
                              {hasCustomIcon ? (
                                <img 
                                  src={resolvedImages.pillarIcons[index] || pillar.icon} 
                                  alt={enhancedPillar.title || `Pillar ${index + 1}`} 
                                />
                              ) : riceIcon ? (
                                riceIcon
                              ) : null}
                            </div>
                          )}
                          {enhancedPillar.title && (
                            <h3 className="pillar-title">{enhancedPillar.title}</h3>
                          )}
                          {enhancedPillar.description && (
                            <p className="pillar-description" dangerouslySetInnerHTML={{
                              __html: enhancedPillar.description.replace(/<br\s*\/?>/gi, '<br />')
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
        );
      })()}

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
