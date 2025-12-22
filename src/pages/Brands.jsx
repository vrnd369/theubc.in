import React, { useRef, useEffect, useState } from "react";
import "./Brands.css";

/* Hero background */
import br1 from "../assets/br1.png";
import br2 from "../assets/br2.png";

/* Product images */
import prodMasalas from "../assets/masalas.png";
import prodRice from "../assets/rice.png";
import prodAppalams from "../assets/appalam.png";
import prodAtta from "../assets/spices.png"; // 4th tile

const PRODUCTS = [
  {
    id: "masalas",
    image: prodMasalas,
    title: "Masalas",
    blurb: "Authentic blends for every dish",
    cta: "Know More",
    href: "/products?brand=soil-king&category=masala-powders",
  },
  {
    id: "rice",
    image: prodRice,
    title: "Rice",
    blurb: "Fragrant grains, rich in tradition",
    cta: "Know More",
    href: "/products?brand=soil-king&category=grains",
  },
  {
    id: "appalams",
    image: prodAppalams,
    title: "Appalams & Crisps",
    blurb: "Crispy delights for every meal",
    cta: "Know More",
    href: "/products?brand=soil-king&category=appalam",
  },
  {
    id: "atta",
    image: prodAtta,
    title: "Flours & Atta",
    blurb: "Daily staples for wholesome meals",
    cta: "Know More",
    href: "/products?brand=soil-king&category=grains",
  },
];

export default function Brand() {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update arrow states based on scroll position
  const updateArrowStates = () => {
    const row = rowRef.current;
    if (!row) return;

    const { scrollLeft, scrollWidth, clientWidth } = row;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Block manual horizontal scroll (allow vertical scroll)
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    row.addEventListener("wheel", onWheel, { passive: false });
    row.addEventListener("scroll", updateArrowStates);
    
    // Initial check
    updateArrowStates();

    return () => {
      row.removeEventListener("wheel", onWheel);
      row.removeEventListener("scroll", updateArrowStates);
    };
  }, []);

  // How far to slide (exactly one card + the gap)
  const stepWidth = () => {
    const row = rowRef.current;
    if (!row) return 0;

    const card = row.querySelector(".brand-prod-card");
    if (!card) return 0;

    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;

    return card.offsetWidth + gap;
  };

  const slide = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;

    row.scrollBy({
      left: dir * stepWidth(),
      behavior: "smooth",
    });
    
    // Update states after a short delay to allow scroll to complete
    setTimeout(updateArrowStates, 100);
  };

  return (
    <main className="brand-page">
      {/* ===== 1) HERO ===== */}
      <section
        className="brand-hero"
        aria-label="Rooted in Goodness, Growing with Trust"
      >
        {/* Background image br1 */}
        <div
          className="brand-hero__bg-image"
          style={{
            backgroundImage: `url("${br1}")`,
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
            Rooted <span className="brand-hero__italic">in</span> Goodness,
            <br />
            Growing <span className="brand-hero__italic">with</span> Trust
          </h1>
          <p className="brand-hero__lead">
            From fertile soils to your family’s table, every UBC product carries
            the
            <br />
            richness of nature, crafted with purity, care, and tradition.
          </p>
          <a href="/products?brand=soil-king" className="btn btn-primary">
            Explore Products
          </a>
        </div>
      </section>

      {/* ===== 2) ABOUT SOIL KING ===== */}
      <section className="brand-section brand-about">
        <div className="container">
          <div className="eyebrow">★ About Soil King</div>
          <div className="brand-grid">
            <h2 className="brand-title">Rooted in Goodness.</h2>
            <div className="brand-copy">
              <p>Soil King is more than a brand — it’s a bond with the land.</p>
              <p>
                Born from UBC’s vision of delivering everyday essentials with
                honesty and quality, Soil King carries forward the values of
                purity, nourishment, and care.
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
              From Soil to Shelf, <br className="hide-sm" />
              With Sincerity.
            </h2>
            <div className="brand-copy">
              <p>
                Every Soil King product begins with a promise: clean sourcing,
                careful processing, and sincere effort.
              </p>
              <p className="muted">
                From premium grains and authentic spices to ready-to-use kitchen
                essentials, every pack reflects our commitment to your family’s
                health and taste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4) WHY SOIL KING ===== */}
      <section className="brand-section brand-why">
        <div className="container">
          <div className="eyebrow">★ Why Soil King</div>
          <div className="brand-grid">
            <h2 className="brand-title">
              Because What’s Real, <br className="hide-sm" />
              Stays Real.
            </h2>
            <div className="brand-copy">
              <p>
                We never cut corners. No unnecessary additives, no shortcuts —
                only grains, spices, and essentials that remain true to their
                natural taste and benefits. Carefully packed, trusted by
                families.
              </p>
              <a href="/products?brand=soil-king" className="btn btn-primary">
                Explore Our Products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5) EXPLORE SOIL KING PRODUCTS ===== */}
      <section id="soilking-products" className="brand-section brand-products">
        <div className="container">
          <div className="prod-head">
            <div>
              <h2 className="prod-title">
                Explore Soil Kings
                <br /> Products
              </h2>
            </div>

            <div className="prod-arrows">
              <button
                aria-label="Previous"
                className="btn icon-btn prev"
                onClick={() => slide(-1)}
                type="button"
              >
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollLeft ? '#111827' : '#6B7280' }}>
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
                type="button"
              >
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollRight ? '#111827' : '#6B7280' }}>
                  {/* shaft */}
                  <line x1="8" y1="20" x2="30" y2="20" />
                  {/* head */}
                  <polyline points="22 12 30 20 22 28" />
                </svg>
              </button>
            </div>
          </div>

          {/* one-line row; arrows control the scroll */}
          <div className="brand-prod-row no-user-scroll" ref={rowRef}>
            {PRODUCTS.map((p) => (
              <article className="brand-prod-card" key={p.id}>
                <div className="brand-prod-media">
                  <img src={p.image} alt={p.title} />
                </div>

                <div className="brand-prod-body">
                  <div className="brand-prod-header">
                    <div className="brand-prod-title-row">
                      <h3 className="brand-prod-name">{p.title}</h3>
                      <a href={p.href} className="chip-link">
                        {p.cta}
                      </a>
                    </div>
                    <div className="brand-prod-text-container">
                      <p className="brand-prod-blurb">{p.blurb}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
