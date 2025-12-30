import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseInlineFormatting } from "../admin/components/BrandPageEditor/InlineFontEditor";
import { getFooterConfig } from "../admin/services/footerService";
import { resolveImageUrl } from "../utils/imageUtils";
import logo from "../assets/Logo.png";
import "./Footer.css";

export default function DynamicFooter({ footerData, previewMode = false }) {
  const navigate = useNavigate();
  const [config, setConfig] = useState(footerData || null);
  const [loading, setLoading] = useState(!footerData);
  const [logoUrl, setLogoUrl] = useState(logo); // Initialize with default logo
  const [logoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    if (!footerData && !previewMode) {
      loadFooterConfig();
    } else if (footerData) {
      // Just set the config - logo resolution will be handled by the second useEffect
      setConfig(footerData);
    }
  }, [footerData, previewMode]);

  // Resolve logo URL when config changes - handles both preview mode and normal mode
  useEffect(() => {
    const resolveLogo = async () => {
      if (!config) {
        setLogoUrl(logo);
        setLogoLoading(false);
        return;
      }

      if (!config.logo?.url) {
        // No logo in config, use default
        setLogoUrl(logo);
        setLogoLoading(false);
        return;
      }

      const logoUrlValue = config.logo.url;
      setLogoLoading(true);

      // If it's already a valid URL or public path, use it directly
      if (
        logoUrlValue.startsWith("data:") ||
        logoUrlValue.startsWith("http://") ||
        logoUrlValue.startsWith("https://") ||
        logoUrlValue.startsWith("/")
      ) {
        setLogoUrl(logoUrlValue);
        setLogoLoading(false);
        return;
      }

      // Otherwise, it's an image ID - resolve it
      try {
        const resolved = await resolveImageUrl(logoUrlValue);

        if (
          resolved &&
          (resolved.startsWith("data:image") || resolved.startsWith("data:"))
        ) {
          setLogoUrl(resolved);
          setLogoLoading(false);
          return;
        }

        // Resolution failed or returned null (possibly corrupted image)
        if (!resolved) {
          console.error(
            "Logo image resolution returned null. The image data in Firestore may be corrupted."
          );
          console.error(
            "Please re-upload the logo image in Footer Management. Image ID:",
            logoUrlValue
          );
          setLogoUrl(logo);
          setLogoLoading(false);
          return;
        }

        // Resolution returned invalid data - try to get it directly from imageService as fallback
        try {
          const { getImageById } = await import(
            "../admin/services/imageService"
          );
          const directResolved = await getImageById(logoUrlValue);

          if (
            directResolved &&
            (directResolved.startsWith("data:image") ||
              directResolved.startsWith("data:"))
          ) {
            setLogoUrl(directResolved);
            setLogoLoading(false);
            return;
          }
          setLogoUrl(logo);
        } catch (directError) {
          console.error("Direct fetch error:", directError.message);
          setLogoUrl(logo);
        } finally {
          setLogoLoading(false);
        }
      } catch (error) {
        console.error("Error resolving logo URL:", error.message);
        // Try direct fetch as fallback
        try {
          const { getImageById } = await import(
            "../admin/services/imageService"
          );
          const directResolved = await getImageById(logoUrlValue);
          if (
            directResolved &&
            (directResolved.startsWith("data:image") ||
              directResolved.startsWith("data:"))
          ) {
            setLogoUrl(directResolved);
            setLogoLoading(false);
            return;
          }
          setLogoUrl(logo);
        } catch (directError) {
          console.error("Fallback fetch error:", directError.message);
          setLogoUrl(logo);
        } finally {
          setLogoLoading(false);
        }
      }
    };

    resolveLogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.logo?.url, JSON.stringify(config?.logo)]);

  const loadFooterConfig = async () => {
    try {
      setLoading(true);
      const data = await getFooterConfig();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Error loading footer config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = useCallback(
    (path, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      navigate(path, { replace: false });
    },
    [navigate]
  );

  if (loading && !config) {
    return (
      <footer
        className="footer"
        style={{ backgroundColor: "#333494", minHeight: "574px" }}
      >
        <div className="container">
          <div className="footer-top">
            <div className="footer-logo-section">
              <img
                src={logo}
                alt="UBC Logo"
                className="footer-logo"
                style={{
                  width: "203px",
                  height: "78.65px",
                  filter: "none", // Override CSS filter that makes logo white
                }}
              />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (!config) {
    // Fallback to default footer if no config exists
    // This ensures footer always appears even if not configured in CMS
    return (
      <footer
        className="footer"
        style={{
          backgroundColor: "#333494",
          paddingTop: "72px",
          paddingBottom: "24px",
          minHeight: "574px",
        }}
      >
        <div className="container">
          {/* Top Row: Logo, Navigation, Contact */}
          <div className="footer-top">
            {/* Logo */}
            <div className="footer-logo-section">
              <img
                src={logo}
                alt="UBC Logo"
                className="footer-logo"
                style={{
                  width: "203px",
                  height: "78.65px",
                  filter: "none", // Override CSS filter that makes logo white
                }}
              />
            </div>

            {/* Nav (center column) */}
            <div className="footer-nav">
              <a href="/" onClick={(e) => handleNavigation("/", e)}>
                Home
              </a>
              <a href="/about" onClick={(e) => handleNavigation("/about", e)}>
                About
              </a>
              <a href="/brands" onClick={(e) => handleNavigation("/brands", e)}>
                Our Brands
              </a>
              <a
                href="/products"
                onClick={(e) => handleNavigation("/products", e)}
              >
                Products
              </a>
              <a
                href="/contact"
                onClick={(e) => handleNavigation("/contact", e)}
              >
                Get in touch
              </a>
            </div>

            {/* Email + Phone (right column) */}
            <div className="footer-contact">
              <div className="footer-contact-item">
                <span className="footer-label">
                  <svg
                    className="footer-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      ry="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 6L12 13L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Email
                </span>
                <a href="mailto:info@theubc.com" className="footer-value">
                  info@theubc.com
                </a>
              </div>

              <div className="footer-contact-item">
                <span className="footer-label">
                  <svg
                    className="footer-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.352 21.4008C21.1468 21.5885 20.9046 21.7309 20.6397 21.8187C20.3748 21.9065 20.0932 21.9378 19.815 21.91C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.09222 3.90347 2.12277 3.62279 2.20966 3.35879C2.29655 3.09479 2.43769 2.85329 2.62398 2.64868C2.81027 2.44407 3.03769 2.28073 3.29181 2.16931C3.54593 2.05789 3.82106 2.00074 4.1 2H7.1C7.65085 1.99522 8.18106 2.16708 8.61091 2.48851C9.04076 2.80994 9.34494 3.26345 9.47 3.78L10.9 8.64C10.9781 8.99219 10.9781 9.35781 10.9 9.71C10.8219 10.0622 10.6676 10.3928 10.45 10.68L8.68 12.45C10.0612 14.8163 11.9837 16.7388 14.35 18.12L16.12 16.35C16.4072 16.1324 16.7378 15.9781 17.09 15.9C17.4422 15.8219 17.8078 15.8219 18.16 15.9L23.02 17.33C23.5366 17.4551 23.9901 17.7592 24.3115 18.1891C24.633 18.619 24.8048 19.1492 24.8 19.7V22.7H24.8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Phone
                </span>
                <a href="tel:+919587835849" className="footer-value">
                  +91 95878 35849
                </a>
              </div>
            </div>
          </div>

          {/* Middle Row: Slogan and Addresses */}
          <div className="footer-middle">
            {/* Column 1: Slogan under logo */}
            <div className="footer-left-section">
              <h3 className="footer-slogan">
                Crafting purity,
                <br />
                <span style={{ whiteSpace: "nowrap" }}>preserving taste.</span>
              </h3>

              <div className="footer-social">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Corporate Office */}
            <div className="footer-address-item">
              <h4 className="footer-address-heading">Corporate Office</h4>
              <p className="footer-address-text">
                H.No. 8-2-334/60 &amp; 61,
                <br />
                Road No. 5, Banjara Hills,
                <br />
                Hyderabad-500034,
                <br />
                Telangana.
              </p>
            </div>

            {/* Column 3: Main Office */}
            <div className="footer-address-item">
              <h4 className="footer-address-heading footer-main-office-heading">
                Main Office
              </h4>
              <p className="footer-address-text footer-main-office">
                Sy. No 810 to 812 &amp; 820, 821,
                <br />
                Village &amp; Mandal :<br />
                Gummadidala-502313, District:
                <br />
                Sangareddy- Telangana.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <span className="footer-developer">
                Designed & Developed by{" "}
                <a
                  href="https://www.wikiwakywoo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-developer-link"
                >
                  WikiWakyWoo
                </a>
              </span>
            </div>
            <div className="footer-bottom-middle">
              <span className="footer-copyright">
                All Rights Reserved, United Brothers Company (UBC)
              </span>
            </div>
            <div className="footer-bottom-right">
              <div className="footer-legal">
                <a href="/privacy" className="footer-legal-link">
                  Privacy policy
                </a>
                <a href="/cookies" className="footer-legal-link">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const sloganText =
    config.slogan?.text || "Crafting purity,\npreserving taste.";
  const sloganLines = sloganText.split("\n");

  // Get responsive dimensions based on viewport (will be handled by CSS media queries)
  // The CSS file handles responsive breakpoints, we just set base desktop values
  const desktopDims = config.dimensions?.desktop || {};

  return (
    <footer
      className="footer"
      style={{
        backgroundColor: config.backgroundColor || "#333494",
        paddingTop: `${desktopDims.paddingTop || 72}px`,
        paddingBottom: `${desktopDims.paddingBottom || 24}px`,
        minHeight: `${desktopDims.minHeight || 574}px`,
      }}
    >
      <div className="container">
        {/* Top Row: Logo, Navigation, Contact */}
        <div className="footer-top">
          {/* Logo */}
          <div className="footer-logo-section">
            {logoLoading ? (
              <div
                style={{
                  width: `${config.logo?.width || 203}px`,
                  height: `${config.logo?.height || 78.65}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                }}
              >
                <span style={{ color: "#FFFFFF", fontSize: "12px" }}>
                  Loading...
                </span>
              </div>
            ) : (
              (() => {
                // Capture logo in local scope for ESLint
                const defaultLogo = logo;
                
                // Ensure we always have a valid image source
                const imageSrc =
                  logoUrl &&
                  (logoUrl.startsWith("data:") ||
                    logoUrl.startsWith("http://") ||
                    logoUrl.startsWith("https://"))
                    ? logoUrl
                    : defaultLogo || "";

                // Don't render if we don't have a valid src
                if (!imageSrc) {
                  console.error("No valid logo source available");
                  return (
                    <div
                      style={{
                        width: `${config.logo?.width || 203}px`,
                        height: `${config.logo?.height || 78.65}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "12px",
                        backgroundColor: "transparent",
                      }}
                    >
                      No Logo
                    </div>
                  );
                }

                return (
                  <img
                    key={`${imageSrc}-${config?.logo?.url || "no-url"}`}
                    src={imageSrc}
                    alt={config.logo?.alt || "UBC Logo"}
                    className="footer-logo"
                    style={{
                      width: `${config.logo?.width || 203}px`,
                      height: `${config.logo?.height || 78.65}px`,
                      display: "block",
                      backgroundColor: "transparent",
                      minWidth: `${config.logo?.width || 203}px`,
                      minHeight: `${config.logo?.height || 78.65}px`,
                      objectFit: "contain",
                      filter: "none", // Override CSS filter that makes logo white
                    }}
                    onError={(e) => {
                      console.error(
                        "Logo image failed to load. Current src:",
                        e.target.src
                      );
                      console.error("logoUrl state:", logoUrl);
                      console.error("config.logo?.url:", config.logo?.url);

                      // If image fails to load, fallback to default logo
                      const defaultLogoSrc =
                        typeof defaultLogo === "string" ? defaultLogo : defaultLogo;

                      // Prevent infinite loop - only retry once
                      if (!e.target.dataset.retried) {
                        e.target.dataset.retried = "true";
                        e.target.src = defaultLogoSrc;
                        setLogoUrl(defaultLogo);
                      } else {
                        // Already retried, hide the broken image
                        console.error("Default logo also failed, hiding image");
                        e.target.style.display = "none";
                        // Show a placeholder text instead
                        const placeholder = document.createElement("div");
                        placeholder.style.cssText = `
                      width: ${config.logo?.width || 203}px;
                      height: ${config.logo?.height || 78.65}px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: #FFFFFF;
                      font-size: 12px;
                      background: transparent;
                    `;
                        placeholder.textContent = "Logo";
                        e.target.parentNode?.appendChild(placeholder);
                      }
                    }}
                    onLoad={(e) => {
                      setLogoLoading(false);
                      // Remove retry flag on successful load
                      if (e.target.dataset.retried) {
                        delete e.target.dataset.retried;
                      }
                    }}
                  />
                );
              })()
            )}
          </div>

          {/* Nav (center column) */}
          <div className="footer-nav">
            {config.navigationLinks && config.navigationLinks.length > 0 ? (
              config.navigationLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  onClick={(e) => handleNavigation(link.path, e)}
                >
                  {link.label}
                </a>
              ))
            ) : (
              <>
                <a href="/" onClick={(e) => handleNavigation("/", e)}>
                  Home
                </a>
                <a href="/about" onClick={(e) => handleNavigation("/about", e)}>
                  About
                </a>
                <a
                  href="/brands"
                  onClick={(e) => handleNavigation("/brands", e)}
                >
                  Our Brands
                </a>
                <a
                  href="/products"
                  onClick={(e) => handleNavigation("/products", e)}
                >
                  Products
                </a>
                <a
                  href="/contact"
                  onClick={(e) => handleNavigation("/contact", e)}
                >
                  Get in touch
                </a>
              </>
            )}
          </div>

          {/* Email + Phone (right column) */}
          <div className="footer-contact">
            {config.contact?.email && (
              <div className="footer-contact-item">
                <span className="footer-label">
                  <svg
                    className="footer-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      ry="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 6L12 13L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {config.contact.email.label || "Email"}
                </span>
                <a
                  href={
                    config.contact.email.href ||
                    `mailto:${config.contact.email.value}`
                  }
                  className="footer-value"
                >
                  {config.contact.email.value}
                </a>
              </div>
            )}

            {config.contact?.phone && (
              <div className="footer-contact-item">
                <span className="footer-label">
                  <svg
                    className="footer-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.352 21.4008C21.1468 21.5885 20.9046 21.7309 20.6397 21.8187C20.3748 21.9065 20.0932 21.9378 19.815 21.91C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.09222 3.90347 2.12277 3.62279 2.20966 3.35879C2.29655 3.09479 2.43769 2.85329 2.62398 2.64868C2.81027 2.44407 3.03769 2.28073 3.29181 2.16931C3.54593 2.05789 3.82106 2.00074 4.1 2H7.1C7.65085 1.99522 8.18106 2.16708 8.61091 2.48851C9.04076 2.80994 9.34494 3.26345 9.47 3.78L10.9 8.64C10.9781 8.99219 10.9781 9.35781 10.9 9.71C10.8219 10.0622 10.6676 10.3928 10.45 10.68L8.68 12.45C10.0612 14.8163 11.9837 16.7388 14.35 18.12L16.12 16.35C16.4072 16.1324 16.7378 15.9781 17.09 15.9C17.4422 15.8219 17.8078 15.8219 18.16 15.9L23.02 17.33C23.5366 17.4551 23.9901 17.7592 24.3115 18.1891C24.633 18.619 24.8048 19.1492 24.8 19.7V22.7H24.8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {config.contact.phone.label || "Phone"}
                </span>
                <a
                  href={
                    config.contact.phone.href ||
                    `tel:${config.contact.phone.value?.replace(/\s/g, "")}`
                  }
                  className="footer-value"
                >
                  {config.contact.phone.value}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Middle Row: Slogan and Addresses */}
        <div className="footer-middle">
          {/* Column 1: Slogan under logo */}
          <div className="footer-left-section">
            <h3
              className="footer-slogan"
              style={{
                fontFamily: config.slogan?.fontFamily || "Inter",
                fontSize: `${config.slogan?.fontSize || 48}px`,
                fontWeight: config.slogan?.fontWeight || 500,
                color: config.slogan?.color || "#FFFFFF",
                lineHeight: `${config.slogan?.lineHeight || 106}%`,
                letterSpacing: `${config.slogan?.letterSpacing || -0.05}em`,
                textTransform: config.slogan?.textTransform || "lowercase",
              }}
            >
              {sloganLines.map((line, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <br />}
                  <span
                    style={{ whiteSpace: index === 1 ? "nowrap" : "normal" }}
                  >
                    {parseInlineFormatting(line)}
                  </span>
                </React.Fragment>
              ))}
            </h3>

            <div className="footer-social">
              {config.socialMedia && config.socialMedia.length > 0 ? (
                config.socialMedia.map((social, index) => (
                  <a
                    key={social.id || index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    {social.icon === "linkedin" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {social.icon === "instagram" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {social.icon === "facebook" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {social.icon === "twitter" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {social.icon === "youtube" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {social.icon === "pinterest" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.395.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {social.icon === "tiktok" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.1 6.1 0 00-1-.05A6.34 6.34 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {![
                      "linkedin",
                      "instagram",
                      "facebook",
                      "twitter",
                      "youtube",
                      "pinterest",
                      "tiktok",
                    ].includes(social.icon) && (
                      <span>{social.name || "Social"}</span>
                    )}
                  </a>
                ))
              ) : (
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Address columns */}
          {config.addresses &&
            config.addresses.length > 0 &&
            config.addresses.map((address, index) => (
              <div key={address.id || index} className="footer-address-item">
                <h4
                  className={
                    index === config.addresses.length - 1
                      ? "footer-address-heading footer-main-office-heading"
                      : "footer-address-heading"
                  }
                  style={{
                    fontFamily: address.fontFamily || "Inter",
                    fontSize: `${address.fontSize || 12}px`,
                    fontWeight: address.fontWeight || 400,
                    color: address.color || "#FFFFFF",
                  }}
                >
                  {parseInlineFormatting(address.heading || "")}
                </h4>
                <p
                  className={
                    index === config.addresses.length - 1
                      ? "footer-address-text footer-main-office"
                      : "footer-address-text"
                  }
                  style={{
                    fontFamily: address.fontFamily || "Inter",
                    fontSize: `${address.fontSize || 12}px`,
                    fontWeight: address.fontWeight || 400,
                    color: address.color || "#C9D2FF",
                    lineHeight: `${address.lineHeight || 140}%`,
                  }}
                >
                  {address.text?.split("\n").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {lineIndex > 0 && <br />}
                      {parseInlineFormatting(line)}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            {config.bottomBar?.developedBy && (
              <span
                className="footer-developer"
                style={{
                  fontFamily:
                    config.bottomBar.developedBy.fontFamily || "Inter",
                  fontSize: `${
                    config.bottomBar.developedBy.fontSize || 10.6
                  }px`,
                  fontWeight: config.bottomBar.developedBy.fontWeight || 400,
                  color:
                    config.bottomBar.developedBy.color ||
                    "rgba(255, 255, 255, 0.6)",
                  lineHeight: `${
                    config.bottomBar.developedBy.lineHeight || 17.5
                  }px`,
                }}
              >
                {config.bottomBar.developedBy.text || "Designed & Developed by"}{" "}
                {config.bottomBar.developedBy.company && (
                  <a
                    href={config.bottomBar.developedBy.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-developer-link"
                  >
                    {config.bottomBar.developedBy.company}
                  </a>
                )}
              </span>
            )}
          </div>
          <div className="footer-bottom-middle">
            {config.bottomBar?.copyright && (
              <span
                className="footer-copyright"
                style={{
                  fontFamily: config.bottomBar.copyright.fontFamily || "Inter",
                  fontSize: `${config.bottomBar.copyright.fontSize || 10.6}px`,
                  fontWeight: config.bottomBar.copyright.fontWeight || 400,
                  color:
                    config.bottomBar.copyright.color ||
                    "rgba(255, 255, 255, 0.6)",
                  lineHeight: `${
                    config.bottomBar.copyright.lineHeight || 17.5
                  }px`,
                }}
              >
                {parseInlineFormatting(
                  config.bottomBar.copyright.text ||
                    "All Rights Reserved, United Brothers Company (UBC)"
                )}
              </span>
            )}
          </div>
          <div className="footer-bottom-right">
            {config.bottomBar?.legalLinks &&
              config.bottomBar.legalLinks.length > 0 && (
                <div className="footer-legal">
                  {config.bottomBar.legalLinks.map((link, index) => (
                    <a
                      key={link.id || index}
                      href={link.url}
                      className="footer-legal-link"
                      onClick={(e) => {
                        if (link.url.startsWith("/")) {
                          handleNavigation(link.url, e);
                        }
                      }}
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </footer>
  );
}
