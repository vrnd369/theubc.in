import React, { useState, useEffect } from 'react';
import '../Overview.css';
import './DynamicSections.css';
import { resolveImageUrl } from '../../utils/imageUtils';
import { parseInlineFormatting } from '../../admin/components/BrandPageEditor/InlineFontEditor';

export default function OverviewSection({ content, styles = {} }) {
  // Extract content with defaults
  const tag = content?.tag || '★ OVERVIEW';
  const heading = content?.heading || 'Where Tradition Meets Modern Taste';
  const logoRef = content?.image || content?.logo || '';
  const paragraph1 = content?.paragraph1 || '';
  const paragraph2 = content?.paragraph2 || '';
  const buttonText = content?.buttonText || 'Get in touch';
  const buttonLink = content?.buttonLink || content?.button?.link || '/contact';
  const backgroundImageRef = content?.backgroundImage || '';
  
  // Resolve image IDs to URLs
  const [logo, setLogo] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  
  useEffect(() => {
    const loadImages = async () => {
      if (logoRef) {
        const logoUrl = await resolveImageUrl(logoRef);
        setLogo(logoUrl || '');
      } else {
        setLogo('');
      }
      
      if (backgroundImageRef) {
        const bgUrl = await resolveImageUrl(backgroundImageRef);
        setBackgroundImage(bgUrl || '');
      } else {
        setBackgroundImage('');
      }
    };
    
    loadImages();
  }, [logoRef, backgroundImageRef]);
  
  // Extract styles - only non-dimension properties
  const backgroundTransparency = styles?.backgroundTransparency !== undefined ? styles.backgroundTransparency : 0.9;
  const backgroundColor = styles?.backgroundColor;
  const textAlignment = content?.textAlignment || 'left';
  
  // Build inline styles - only colors and backgrounds, NO dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }), // Only colors allowed
  };
  
  const backgroundStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
  };
  
  // No containerStyle - dimensions handled by CSS
  const containerStyle = {};
  
  const contentStyle = {
    background: `rgba(255, 255, 255, ${backgroundTransparency})`, // Only background color
  };

  return (
    <section className="overview section" style={sectionStyle}>
      {backgroundImage && (
        <div
          className="overview-bg"
          style={backgroundStyle}
        ></div>
      )}
      <div className="container" style={containerStyle}>
        <div className="overview-content" style={{ ...contentStyle, textAlign: textAlignment }}>
          {/* Tag with small star */}
          {tag && (
            <span className="overview-tag">
              <span className="tell-us-star">★</span>
              {tag.replace('★', '').trim()}
            </span>
          )}

          {heading && (
            <h2 className="overview-heading">
              {heading.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {parseInlineFormatting(line)}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
          )}

          {logo && (
            <div className="overview-logo">
              <img 
                src={logo} 
                alt="UBC United Brothers Company logo" 
                // Dimensions handled by CSS - no inline styles
              />
            </div>
          )}

          {paragraph1 && (
            <p className="overview-text">
              {paragraph1.split('\n').map((line, index, arr) => (
                <React.Fragment key={index}>
                  {parseInlineFormatting(line)}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}

          {paragraph2 && (
            <p className="overview-text">
              {paragraph2.split('\n').map((line, index, arr) => (
                <React.Fragment key={index}>
                  {parseInlineFormatting(line)}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}

          {buttonText && (
            <a className="overview-btn" href={buttonLink}>
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

