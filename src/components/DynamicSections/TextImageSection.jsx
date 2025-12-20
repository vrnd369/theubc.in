import React from 'react';
import { Link } from 'react-router-dom';
import '../BrandsSection.css';
import './DynamicSections.css';
import { parseInlineFormatting } from '../../admin/components/BrandPageEditor/InlineFontEditor';

export default function TextImageSection({ content, styles = {} }) {
  const textAlignment = content?.textAlignment || 'left';

  // Extract styles - only non-dimension properties
  const backgroundColor = styles?.backgroundColor;

  // Build section style - only colors, NO dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }), // Only colors allowed
  };

  // No containerStyle - dimensions handled by CSS
  const containerStyle = {};

  // Build heading style with font formatting
  const headingStyle = {
    ...(styles?.headingFontFamily && { fontFamily: styles.headingFontFamily }),
    ...(styles?.headingColor && { color: styles.headingColor }),
    ...(styles?.headingFontSize && { fontSize: `${styles.headingFontSize}px` }),
    ...(styles?.headingFontWeight && { fontWeight: styles.headingFontWeight }),
    ...(styles?.headingFontStyle && { fontStyle: styles.headingFontStyle }),
    ...(styles?.headingTextTransform && { textTransform: styles.headingTextTransform }),
    ...(styles?.headingLineHeight && { lineHeight: styles.headingLineHeight }),
    ...(styles?.headingLetterSpacing && { letterSpacing: `${styles.headingLetterSpacing}em` }),
    // Hardcoded dimensions - not editable by users
    maxWidth: '700px',
    marginBottom: '24px',
  };

  // Build paragraph1 style with font formatting
  const paragraph1Style = {
    ...(styles?.paragraph1FontFamily && { fontFamily: styles.paragraph1FontFamily }),
    ...(styles?.paragraph1Color && { color: styles.paragraph1Color }),
    ...(styles?.paragraph1FontSize && { fontSize: `${styles.paragraph1FontSize}px` }),
    ...(styles?.paragraph1FontWeight && { fontWeight: styles.paragraph1FontWeight }),
    ...(styles?.paragraph1FontStyle && { fontStyle: styles.paragraph1FontStyle }),
    ...(styles?.paragraph1TextTransform && { textTransform: styles.paragraph1TextTransform }),
    ...(styles?.paragraph1LineHeight && { lineHeight: styles.paragraph1LineHeight }),
    ...(styles?.paragraph1LetterSpacing && { letterSpacing: `${styles.paragraph1LetterSpacing}em` }),
    ...(styles?.paragraph1MaxWidth && { maxWidth: `${styles.paragraph1MaxWidth}px` }),
    ...(styles?.paragraph1MarginBottom && { marginBottom: `${styles.paragraph1MarginBottom}px` }),
  };

  // Build paragraph2 style with font formatting
  const paragraph2Style = {
    ...(styles?.paragraph2FontFamily && { fontFamily: styles.paragraph2FontFamily }),
    ...(styles?.paragraph2Color && { color: styles.paragraph2Color }),
    ...(styles?.paragraph2FontSize && { fontSize: `${styles.paragraph2FontSize}px` }),
    ...(styles?.paragraph2FontWeight && { fontWeight: styles.paragraph2FontWeight }),
    ...(styles?.paragraph2FontStyle && { fontStyle: styles.paragraph2FontStyle }),
    ...(styles?.paragraph2TextTransform && { textTransform: styles.paragraph2TextTransform }),
    ...(styles?.paragraph2LineHeight && { lineHeight: styles.paragraph2LineHeight }),
    ...(styles?.paragraph2LetterSpacing && { letterSpacing: `${styles.paragraph2LetterSpacing}em` }),
    ...(styles?.paragraph2MaxWidth && { maxWidth: `${styles.paragraph2MaxWidth}px` }),
    ...(styles?.paragraph2MarginBottom && { marginBottom: `${styles.paragraph2MarginBottom}px` }),
  };

  return (
    <section className="promise-section section" style={sectionStyle}>
      <div className="container" style={containerStyle}>
        <div className="promise-content">
          <div className="promise-left">
            {content?.tag && (
              <span className="tag promise-tag">{content.tag}</span>
            )}
            {content?.heading && (
              <h2 
                className="promise-heading"
                style={headingStyle}
              >
                {content.heading.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {parseInlineFormatting(line)}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
            )}
          </div>

          <div className="promise-right" style={{ textAlign: textAlignment }}>
            {content?.paragraph1 && (
              <p 
                className="lead promise-p1" 
                style={paragraph1Style}
              >
                {content.paragraph1.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {parseInlineFormatting(line)}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            )}
            {content?.paragraph2 && (
              <p 
                className="lead promise-p2" 
                style={paragraph2Style}
              >
                {content.paragraph2.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {parseInlineFormatting(line)}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            )}
            {content?.button?.text && content?.button?.link && (
              <Link
                to={content.button.link}
                className="promise-button"
                style={{
                  display: 'inline-block',
                  marginTop: '24px',
                  padding: '12px 24px',
                  backgroundColor: styles?.buttonBackgroundColor || '#323790',
                  color: styles?.buttonTextColor || '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: styles?.buttonFontSize || '16px',
                  fontWeight: styles?.buttonFontWeight || '500',
                  fontFamily: styles?.buttonFontFamily || 'inherit',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {content.button.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

