import React, { useRef, useEffect, useState } from 'react';
import '../Testimonials.css';
import { resolveImageUrl } from '../../utils/imageUtils';
import { parseInlineFormatting } from '../../admin/components/BrandPageEditor/InlineFontEditor';

const TestimonialCard = ({ testimonial, index, styles = {} }) => {
  const [imageUrl, setImageUrl] = useState('');
  const isFirst = index === 0;
  const isSecond = !isFirst;

  useEffect(() => {
    const loadImage = async () => {
      if (testimonial.image) {
        const url = await resolveImageUrl(testimonial.image);
        setImageUrl(url || '');
      } else {
        setImageUrl('');
      }
    };
    loadImage();
  }, [testimonial.image]);

  // Card dimensions handled by CSS - no inline styles
  return (
    <div 
      className={`t-card card ${isFirst ? 't-card-first' : ''} ${isSecond ? 't-card-second' : ''}`}
    >
      <p className="t-quote">
        {(testimonial.text || '').split('<br/>').map((line, i, arr) => (
          <React.Fragment key={i}>
            {parseInlineFormatting(line)}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      <div className="t-author">
        <div className="avatar">
          {imageUrl ? (
            <img src={imageUrl} alt={testimonial.name ? `${testimonial.name} testimonial` : 'UBC customer testimonial'} />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#E8E7ED',
              color: '#9CA3AF',
              fontSize: '12px'
            }}>
              No Image
            </div>
          )}
        </div>
        <div className="t-author-info">
          <strong className="t-name">{testimonial.name || ''}</strong>
          <div className="t-role-container">
            {testimonial.company && <span className="t-company">{testimonial.company}</span>}
            {testimonial.role && <span className="t-role-tag">{testimonial.role}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialsSection({ content, styles = {} }) {
  const scrollContainerRef = useRef(null);
  const testimonials = content?.testimonials || [];
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Extract styles - only non-dimension properties
  const backgroundColor = styles?.backgroundColor;
  const textAlignment = content?.textAlignment || 'left';
  
  // Card dimensions for scroll calculations (CSS handles visual dimensions)
  const firstCardWidth = 526; // Fixed for scroll calculation
  const secondCardWidth = 311; // Fixed for scroll calculation
  const cardGap = 24; // Fixed for scroll calculation

  // Update arrow states based on scroll position
  const updateArrowStates = () => {
    const row = scrollContainerRef.current;
    if (!row) return;

    const { scrollLeft, scrollWidth, clientWidth } = row;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Block manual horizontal scroll (allow vertical scroll)
  useEffect(() => {
    const row = scrollContainerRef.current;
    if (!row) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    row.addEventListener('wheel', onWheel, { passive: false });
    row.addEventListener('scroll', updateArrowStates);
    
    // Initial check
    updateArrowStates();

    return () => {
      row.removeEventListener('wheel', onWheel);
      row.removeEventListener('scroll', updateArrowStates);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount =
        scrollContainerRef.current.scrollLeft === 0
          ? firstCardWidth + cardGap
          : secondCardWidth + cardGap;

      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
      
      // Update states after a short delay to allow scroll to complete
      setTimeout(updateArrowStates, 100);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const scrollAmount =
        currentScroll < firstCardWidth
          ? firstCardWidth + cardGap - currentScroll
          : secondCardWidth + cardGap;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Update states after a short delay to allow scroll to complete
      setTimeout(updateArrowStates, 100);
    }
  };

  if (!content || testimonials.length === 0) {
    return null;
  }

  // Build section style - only colors, NO dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }), // Only colors allowed
  };

  // No containerStyle - dimensions handled by CSS
  const containerStyle = {};

  return (
    <section className="section testimonials" style={sectionStyle}>
      <div className="container" style={containerStyle}>
        <div className="testimonials-header">
          <div className="testimonials-title-area" style={{ textAlign: textAlignment }}>
            {content.tag && (
              <span className="testimonials-tag">
                <span className="testimonials-star">★</span> {content.tag.replace('★', '').trim()}
              </span>
            )}
            {content.heading && (
              <h2 className="testimonials-heading">
                {content.heading.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {parseInlineFormatting(line)}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
            )}
          </div>
          {testimonials.length > 1 && (
            <div className="testimonials-arrows">
              <button
                aria-label="Previous"
                className="btn icon-btn prev"
                onClick={scrollLeft}
                type="button"
              >
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollLeft ? '#111827' : '#6B7280' }}>
                  <line x1="32" y1="20" x2="10" y2="20" />
                  <polyline points="18 12 10 20 18 28" />
                </svg>
              </button>
              <button
                aria-label="Next"
                className="btn icon-btn next"
                onClick={scrollRight}
                type="button"
              >
                <svg className="arrow-icon" viewBox="0 0 40 40" aria-hidden="true" style={{ stroke: canScrollRight ? '#111827' : '#6B7280' }}>
                  <line x1="8" y1="20" x2="30" y2="20" />
                  <polyline points="22 12 30 20 22 28" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div 
          className="t-grid no-user-scroll" 
          ref={scrollContainerRef}
          style={{ gap: `${cardGap}px` }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
              styles={styles}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

