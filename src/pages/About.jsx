import React, { useRef, useEffect, useState } from 'react';
import DynamicAbout from '../components/DynamicAbout';
import './About.css';
import SectionTag from '../components/SectionTag';
import buildingImg from '../assets/about us image.png';

/* ----- Certification logos ----- */
import certFSSC from '../assets/fssac.png';
import certFSSAI from '../assets/fssai.png';
import certISO from '../assets/iso.png';

/* ----- Media & News images ----- */
import newsSoilKing from '../assets/Genesis Creative 12.png';
import newsFSSC from '../assets/Genesis Creative 16.png';
import newsExpo from '../assets/Genesis Creative 14.png';
import newsMEA from '../assets/Genesis Creative 15.png'; // 4th card

/* ----- Leaders (real images) ----- */
import jameelKhanImg from '../assets/Frame 231.png';
import taherKhanImg from '../assets/Frame 232.png';
import bilalKhanImg from '../assets/Frame 234.png';
import abdurRahmanKhanImg from '../assets/Frame 235.png';

const founders = [
  { id: 1, name: 'Mr. Jameel Khan',        role: 'The Grandfather',     image: jameelKhanImg },
  { id: 2, name: 'Mr. Taher Khan',         role: 'The Father',          image: taherKhanImg }
];

const leaders = [
  { id: 3, name: 'Mr. Bilal Khan',         role: 'Managing Director',   image: bilalKhanImg },
  { id: 4, name: 'Mr. Abdur Rahman Khan',  role: 'Managing Director',   image: abdurRahmanKhanImg }
];

const CERTS = [
  { id: 'fssc',  logo: certFSSC,  title: 'FSSC 22000', desc: 'The world’s most respected food safety certification.' },
  { id: 'fssai', logo: certFSSAI, title: 'FSSAI',      desc: 'Licensed under India’s Food Safety and Standards Authority.' },
  { id: 'iso',   logo: certISO,   title: 'ISO 22000',  desc: 'Meeting international food safety management benchmarks.' }
];

const NEWS = [
  {
    id: 'soil-king',
    image: newsSoilKing,
    title: 'Launch of Soil King Spices range now available pan-India',
    tag: 'Announcements'
  },
  {
    id: 'fssc-22000',
    image: newsFSSC,
    title: 'UBC achieves FSSC 22000 certification milestone',
    tag: 'Press Releases'
  },
  {
    id: 'world-food-expo',
    image: newsExpo,
    title: 'UBC at World Food Expo, Dubai.',
    tag: 'Events'
  },
  {
    id: 'middle-east',
    image: newsMEA,
    title: 'UBC expands to Middle East markets.',
    tag: 'Press Releases'
  },
];

// Static About page (fallback - used by DynamicAbout)
function StaticAbout() {
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

  // Disable manual horizontal scroll; allow only programmatic scroll via arrows
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
    row.addEventListener('scroll', updateArrowStates);
    
    // Initial check
    updateArrowStates();

    return () => {
      row.removeEventListener('wheel', prevent);
      row.removeEventListener('touchmove', prevent);
      row.removeEventListener('keydown', prevent);
      row.removeEventListener('scroll', updateArrowStates);
    };
  }, []);

  const getStep = () => {
    const row = rowRef.current;
    if (!row) return 0;
    const card = row.querySelector('.news-card');
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const w = (card?.offsetWidth || 0) + gap;
    return w || Math.round(row.clientWidth * 0.9);
  };

  const scrollByStep = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;
    const step = getStep();
    if (step === 0) return;
    
    // Ensure the element is scrollable
    if (row.scrollWidth <= row.clientWidth && dir > 0) return;
    if (row.scrollLeft <= 0 && dir < 0) return;
    
    row.scrollBy({ left: dir * step, behavior: 'smooth' });
    
    // Update states after a short delay to allow scroll to complete
    setTimeout(updateArrowStates, 100);
  };

  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-image">
          <img src={buildingImg} alt="United Brothers Company headquarters building" />
        </div>
      </section>

      {/* Leaders */}
      <section className="about-leaders section">
        <div className="container">
          <SectionTag label="★ LEADERS" />
          
          <div className="leaders-container">
            <div className="leaders-block">
              <h2 className="about-leaders-heading">Who Were the Founders</h2>
              <p className="about-leaders-subtitle">
              Shaping the legacy with passion, purpose, <br />and pioneering vision.
              </p>
              <div className="leaders-grid">
                {founders.map((l) => (
                  <div key={l.id} className="leader-card">
                    <div className="leader-image-wrapper">
                      <img src={l.image} alt={l.name} className="leader-image" />
                    </div>
                    <div className="leader-info">
                      <h3 className="leader-name">{l.name}</h3>
                      <p className="leader-role">/ {l.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="leaders-block">
              <h2 className="about-leaders-heading">Who Are the Leaders</h2>
              <p className="about-leaders-subtitle">
              Steering the legacy with vision, integrity, <br />and forward thinking.
              </p>
              <div className="leaders-grid">
                {leaders.map((l) => (
                  <div key={l.id} className="leader-card">
                    <div className="leader-image-wrapper">
                      <img src={l.image} alt={l.name} className="leader-image" />
                    </div>
                    <div className="leader-info">
                      <h3 className="leader-name">{l.name}</h3>
                      <p className="leader-role">/ {l.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="about-story section">
        <div className="container">
          <div className="story-content-grid">
            <div className="story-left">
              <h2 className="story-heading">
                <span className="story-heading-line1">Our Founding Story:</span>
                <br />
                <span className="story-heading-line2">A Legacy of Values</span>
              </h2>
            </div>
            <div className="story-right">
              <p className="story-text">
                The United Brothers Company (UBC) carries forward the vision of two remarkable leaders:
                Mr. Jameel Khan, the grandfather, and Mr. Taher Khan, the father. For over eight decades,
                through the parent company Char Bhai (Four Brothers), they successfully managed businesses in
                sectors like tobacco, real estate, and technology, all while upholding exceptional values.<br />
                Their lifelong principle was simple yet profound: "Never differ in weight. Never cut down on
                quality. Always give what you would prefer for yourself and your family because customers are our family."
              </p>
              <p className="story-text story-text-muted">
                While it may have sounded unusual that entrepreneurs in the tobacco industry ventured into the
                Food FMCG, their reason was pure and sincere: to provide authentic, unadulterated food products.
                As the family grew, like-minded brothers united under this philosophy, and thus, the
                United Brothers Company, the successor to Four Brothers, was founded to dedicate itself to
                serving people with purity and honesty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="about-vision section">
        <div className="container">
          <span className="vision-badge" aria-label="Vision">
            <svg
              className="vision-eye-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="white"
              />
            </svg>
            VISION
          </span>

          <div className="vision-grid">
            <div className="vision-left">
              <h2 className="vision-heading">
                <span className="vision-heading-line1">The Thought</span>
                <br />
                <span className="vision-heading-line2">Behind Starting UBC</span>
              </h2>
            </div>

            <div className="vision-right">
              <p className="vision-text lead">
                United Brothers Company was founded post-COVID, in 2021, with a clear purpose: to sell pure food.
                The pandemic was a turning point; it reminded us that good food means good health, and health can
                only be maintained with uncompromised quality.
              </p>
              <p className="vision-text muted">
                Observing how earlier generations were stronger and healthier, we realized that their secret is simple:
                they consumed unadulterated, natural food. This understanding shaped UBC’s foundation. Though our FMCG
                food journey seems new, we have experience in handling FMCG food products through exports since the early
                2000s. What’s new is our renewed commitment to deliver purity at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission section">
        <div className="container">
          <span className="mission-badge" aria-label="Mission">
            <svg
              className="mission-eye-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="white"
              />
            </svg>
            MISSION
          </span>

          <div className="mission-grid">
            <div className="mission-left">
              <h2 className="mission-heading">
                <span className="mission-heading-line1">Our Goal for</span>
                <br />
                <span className="mission-heading-line2">the Coming Years</span>
              </h2>
            </div>

            <div className="mission-right">
              <p className="mission-text lead">
                Looking ahead, our mission is to earn and safeguard<br />customer trust. We believe quality and price
                go hand in<br />hand: with quality comes price.
              </p>
              <p className="mission-text muted">
                While our products may cost slightly more than competitors’, they are never exorbitantly priced.
                Instead, they promise far superior quality, consistency, and safety, a value that customers will
                experience with every purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure & Facilities */}
      <section className="about-infra section">
        <div className="container">
          <span className="infra-badge" aria-label="Leaders">
            <svg
              className="leaders-star-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#2C36A6"
              />
            </svg>
            INFRASTRUCTURE
          </span>

          <div className="infra-grid">
            <div className="infra-left">
              <h2 className="infra-heading">
                <span className="infra-heading-line1">Infrastructure</span>
                <br />
                <span className="infra-heading-line2">and Facilities</span>
              </h2>
            </div>

            <div className="infra-right">
              <div className="infra-item">
                <div className="infra-idx">(01)</div>
                <h3 className="infra-title">Manufacturing Facility</h3>
                <p className="infra-text">
                  Over 50,000 sq. ft. of production space equipped with advanced technology,
                  providing the scale and precision necessary{' '}
                  <span className="infra-text-muted">
                    to meet global demand while maintaining our high standards of excellence.
                  </span>
                </p>
                <div className="infra-divider" />
              </div>

              <div className="infra-item">
                <div className="infra-idx">(02)</div>
                <h3 className="infra-title">In-House Laboratory</h3>
                <p className="infra-text">
                  A dedicated, state-of-the-art facility focused on rigorous quality control and food
                  safety protocols,{' '}
                  <span className="infra-text-muted">
                    ensuring every batch consistently meets and exceeds both regulatory and customer expectations.
                  </span>
                </p>
                <div className="infra-divider" />
              </div>

              <div className="infra-item">
                <div className="infra-idx">(03)</div>
                <h3 className="infra-title">Office Space</h3>
                <p className="infra-text">
                  A vibrant and inspiring 7,500 sq. ft. workspace, designed to foster creativity and teamwork.
                  <span className="infra-text-muted">
                    {' '}
                    Co-located with our factory, this space facilitates seamless collaboration between our production
                    and corporate teams.
                  </span>
                </p>
                <div className="infra-divider" />
              </div>

              <div className="infra-item">
                <div className="infra-idx">(04)</div>
                <h3 className="infra-title">UB House (Upcoming HQ)</h3>
                <p className="infra-text">
                  Our future headquarters will serve as a corporate office, a creative hub with an in-house
                  studio for product shoots, and a center for employee well-being,
                  <span className="infra-text-muted">
                    {' '}
                    reflecting our belief that great work happens in great vibes.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="about-cert section">
        <div className="container">
          <div className="cert-grid">
            <div className="cert-left">
              <span className="cert-badge" aria-label="Certification">
                ★ CERTIFICATION
              </span>
              <h2 className="cert-heading">
                <span className="cert-heading-line1">Our Commitment</span>
                <br />
                <span className="cert-heading-line2">to Quality</span>
              </h2>
              <p className="cert-subtitle">A promise of purity, safety, and trust.</p>
            </div>

            <div className="cert-right">
              <p className="cert-intro">
                This page reflects United Brothers Company’s (UBC) unwavering commitment to quality and consumer trust.
              </p>
              <p className="cert-intro muted">
                Every product is pure, safe, and of the highest standard. For us, quality is not a buzzword — it’s our foundation.
              </p>

              <div className="cert-list">
                {CERTS.map((c, i) => (
                  <div key={c.id} className="cert-item">
                    <div className="cert-logo">
                      <img src={c.logo} alt={`${c.title} food safety certification logo`} />
                    </div>
                    <div className="cert-info">
                      <h3 className="cert-title">{c.title}</h3>
                      <p className="cert-desc">{c.desc}</p>
                    </div>
                    {i < CERTS.length - 1 && <div className="cert-divider" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Initiatives */}
      <section className="about-sustain section">
        <div className="container">
          <span className="sustain-badge" aria-label="Leaders">
            <svg
              className="leaders-star-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#2C36A6"
              />
            </svg>
            SUSTAINABILITY
          </span>

          <div className="sustain-grid">
            <div className="sustain-left">
              <h2 className="sustain-heading">
                <span className="sustain-heading-line1">Sustainability</span>
                <br />
                <span className="sustain-heading-line2">Initiatives</span>
              </h2>
              <p className="sustain-subtitle">
                UBC is committed to serving not just its customers, but also the planet.
              </p>
            </div>

            <div className="sustain-right">
              <div className="sustain-item">
                <div className="sustain-idx">(01)</div>
                <h3 className="sustain-title">Ethical Sourcing</h3>
                <p className="sustain-text">
                  Partnering with farmers and suppliers who follow sustainable and ethical methods.
                </p>
                <div className="sustain-divider" />
              </div>

              <div className="sustain-item">
                <div className="sustain-idx">(02)</div>
                <h3 className="sustain-title">Waste Management</h3>
                <p className="sustain-text">
                  Reducing food waste and recycling by-products wherever possible.
                </p>
                <div className="sustain-divider" />
              </div>

              <div className="sustain-item">
                <div className="sustain-idx">(03)</div>
                <h3 className="sustain-title">Community Engagement</h3>
                <p className="sustain-text">
                  Creating employment and supporting farmer communities to build sustainable livelihoods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media & News */}
      <section className="about-news section">
        <div className="container">
          <div className="news-head">
            <div className="news-left">
              <span className="news-badge">★ NEWS</span>
              <h2 className="news-title">Media & News</h2>
              <p className="news-subtitle">
                From new launches to community initiatives, stay connected
                <br className="hide-sm" />
                with everything happening at United Brothers Company.
              </p>
            </div>

            <div className="news-ctas">
              <button className="btn btn-light">View all</button>
              <div className="news-arrows">
                <button
                  className="btn icon-btn prev"
                  aria-label="Previous"
                  onClick={() => scrollByStep(-1)}
                >
                  <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollLeft ? '#111827' : '#6B7280' }}>
                    {/* shaft */}
                    <line x1="32" y1="20" x2="10" y2="20" />
                    {/* head */}
                    <polyline points="18 12 10 20 18 28" />
                  </svg>
                </button>
                <button
                  className="btn icon-btn next"
                  aria-label="Next"
                  onClick={() => scrollByStep(1)}
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
          </div>

          <div
            className="news-row no-user-scroll"
            ref={rowRef}
            tabIndex={-1}
          >
            {NEWS.map((n) => (
              <article key={n.id} className="news-card">
                <div className="news-media">
                  <img src={n.image} alt={n.title} />
                </div>
                <h3 className="news-card-title">{n.title}</h3>
                <div className="news-tags">
                  <span className="pill">{n.tag}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// Export StaticAbout for DynamicAbout fallback
export { StaticAbout };

// Default export uses DynamicAbout (CMS) with static fallback
export default function About() {
  return <DynamicAbout />;
}
