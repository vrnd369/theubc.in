import React, { useRef, useEffect, useState } from "react";
import "./Brands.css";
import { getCategories, getBrands } from '../admin/services/productService';
import { resolveImageUrl } from '../utils/imageUtils';

/* Hero background */
import br1 from "../assets/br1.png";
import br2 from "../assets/br2.png";

export default function Wellness() {
  const brandId = 'wellness'; // Wellness brand identifier
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState({});

  /* --------- one-line row that moves only with arrows --------- */
  const rowRef = useRef(null);

  // Load categories from database
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      // First, get the brand to find the correct brandId format
      const brandsData = await getBrands();
      const brand = brandsData.find(b => (b.brandId || b.id) === brandId);
      
      let categoriesData = [];
      
      if (brand) {
        // Try with brand identifier first
        categoriesData = await getCategories(brand.brandId || brandId);
        
        // If no categories found with brand identifier, try with document ID
        if (categoriesData.length === 0) {
          categoriesData = await getCategories(brand.id);
        }
      } else {
        // Fallback: try with brandId directly
        categoriesData = await getCategories(brandId);
      }
      
      // Filter enabled categories only
      const enabledCategories = categoriesData.filter(cat => cat.enabled !== false);
      
      setCategories(enabledCategories);
      
      // Load category images
      enabledCategories.forEach((category, index) => {
        if (category.image) {
          resolveImageUrl(category.image).then(url => {
            if (url) setImageUrls(prev => ({ ...prev, [`category-${index}`]: url }));
          }).catch(() => {});
        }
      });
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };

  // Block manual wheel/touch/keyboard scrolling (arrow buttons only)
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const prevent = (e) => {
      // Only prevent horizontal scrolling, allow vertical scrolling
      if (e.type === 'wheel') {
        // Check if it's primarily a horizontal scroll (deltaX is larger than deltaY)
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
        // Allow vertical scrolling (deltaY) to pass through to the page
      } else {
        // For touchmove and keydown, prevent default
        e.preventDefault();
      }
    };
    row.addEventListener("wheel", prevent, { passive: false });
    row.addEventListener("touchmove", prevent, { passive: false });
    row.addEventListener("keydown", prevent, { passive: false });
    return () => {
      row.removeEventListener("wheel", prevent);
      row.removeEventListener("touchmove", prevent);
      row.removeEventListener("keydown", prevent);
    };
  }, [categories]); // Update when categories change

  // How far to slide (exactly one card + the gap)
  const stepWidth = () => {
    const row = rowRef.current;
    if (!row) return 0;
    const card = row.querySelector(".brand-prod-card");
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const w = (card?.offsetWidth || 0) + gap;
    return w || Math.round(row.clientWidth * 0.9);
  };

  const slide = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: dir * stepWidth(), behavior: "smooth" });
  };

  return (
    <main className="brand-page">
      {/* ===== 1) HERO ===== */}
      <section
        className="brand-hero wellness-hero"
        aria-label="Nurturing Wellness, One Product at a Time"
      >
        {/* Background image br1 */}
        <div 
          className="brand-hero__bg-image"
          style={{
            backgroundImage: `url("${br1}")`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
        
        {/* Foreground image br2 */}
        <div 
          className="brand-hero__fg-image"
          style={{
            backgroundImage: `url("${br2}")`,
          }}
        />
        
        <div className="brand-hero__overlay" />
        <div className="container brand-hero__inner">
          <h1 className="brand-hero__title">
            Nurturing <span className="brand-hero__italic">Wellness</span>,<br />
            One Product <span className="brand-hero__italic">at a Time</span>
          </h1>
          <p className="brand-hero__lead">
            Wellness by UBC brings you products designed for your health and vitality,<br/>crafted with care, quality, and your well-being in mind.
          </p>
          <a href="/products?brand=wellness" className="btn btn-primary">
            Explore Products
          </a>
        </div>
      </section>

      {/* ===== 2) ABOUT WELLNESS ===== */}
      <section className="brand-section brand-about">
        <div className="container">
          <div className="eyebrow">★ About Wellness</div>
          <div className="brand-grid">
            <h2 className="brand-title">Nurturing Wellness.</h2>
            <div className="brand-copy">
              <p>Wellness is more than a brand — it's a commitment to your health.</p>
              <p>
                Created with UBC's dedication to quality and purity, Wellness products
                are thoughtfully designed to support your active lifestyle and
                nutritional needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3) WHAT WE STAND FOR ===== */}
      <section className="brand-section brand-standfor">
        <div className="container">
          <div className="eyebrow">★ What We Stand For</div>
          <div className="brand-grid">
            <h2 className="brand-title">
              From Nature to Nutrition, <br className="hide-sm" />
              With Care.
            </h2>
            <div className="brand-copy">
              <p>
                Every Wellness product begins with a promise: natural ingredients,
                careful processing, and nutritional value.
              </p>
              <p className="muted">
                From wholesome grains and premium spices to health-focused kitchen
                essentials, every pack<br/>reflects our commitment to your wellness
                and<br/>vitality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4) WHY WELLNESS ===== */}
      <section className="brand-section brand-why">
        <div className="container">
          <div className="eyebrow">★ Why Wellness</div>
          <div className="brand-grid">
            <h2 className="brand-title">
              Because Your Health, <br className="hide-sm" />
              Matters Most.
            </h2>
            <div className="brand-copy">
              <p>
                We focus on what nourishes you. No compromises, no shortcuts —
                only products that support your wellness journey with natural
                goodness and<br/>authentic quality. Carefully crafted, trusted for
                health.
              </p>
              <a href="/products?brand=wellness" className="btn btn-primary">
                Explore Our Products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5) EXPLORE WELLNESS PRODUCTS ===== */}
      <section id="wellness-products" className="brand-section brand-products">
        <div className="container">
          <div className="prod-head">
            <div>
              <h2 className="prod-title">
                Explore Wellness
                <br /> Products
              </h2>
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
              <button
                aria-label="Next"
                className="btn icon-btn next"
                onClick={() => slide(1)}
              >
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true">
                  {/* shaft */}
                  <line x1="8" y1="20" x2="30" y2="20" />
                  {/* head */}
                  <polyline points="22 12 30 20 22 28" />
                </svg>
              </button>
            </div>
          </div>

          {/* one-line row; three cards per view on desktop */}
          <div className="brand-prod-row no-user-scroll" ref={rowRef}>
            {/* Show only categories */}
            {categories && categories.length > 0 && categories.map((category, index) => {
              const categoryImage = imageUrls[`category-${index}`] || category.image || '';
              const categoryHref = category.href || `/products?brand=${brandId}${category.categoryId ? `&category=${category.categoryId}` : ''}`;
              return (
                <article 
                  className="brand-prod-card" 
                  key={category.id || category.categoryId || index}
                >
                  <div className="brand-prod-media">
                    {categoryImage && (
                      <img 
                        src={categoryImage} 
                        alt={category.title || 'UBC wellness product category'}
                      />
                    )}
                  </div>

                  <div className="brand-prod-body">
                    <div className="brand-prod-header">
                      <div className="brand-prod-title-row">
                        {category.title && (
                          <h3 className="brand-prod-name">
                            {category.title}
                          </h3>
                        )}
                        <a 
                          href={categoryHref} 
                          className="chip-link"
                        >
                          Know More
                        </a>
                      </div>
                      <div className="brand-prod-text-container">
                        {category.subtitle && (
                          <p className="brand-prod-blurb">
                            {category.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

