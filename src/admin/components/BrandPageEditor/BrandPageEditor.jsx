import React, { useState, useEffect, useRef } from "react";
import {
  addBrandPage,
  updateBrandPage,
  brandPageExists,
} from "../../services/brandPageService";
import { getCategories } from "../../services/productService";
import ImageSelector from "../ImageSelector/ImageSelector";
import { renderSectionStyling } from "./renderSectionStyling";
import { renderFontStyling } from "./renderFontStyling";
import InlineFontEditor, { parseInlineFormatting } from "./InlineFontEditor";
import EyebrowTextEditor from "./EyebrowTextEditor";
import { resolveImageUrl } from "../../../utils/imageUtils";
import { getDefaultDimensions, getSectionStyles } from "./dimensionUtils";
import { detectDevice } from "./deviceBreakpoints";
import "../../../pages/Brands.css";
import "./BrandPageEditor.css";
import "./BrandPageEditorWithPreview.css";

export default function BrandPageEditor({
  page,
  brands,
  onSave,
  onCancel,
  showPreview = false,
}) {
  // Ensure onCancel is a function
  const handleCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
  };
  const [formData, setFormData] = useState({
    brandId: "",
    brandName: "",
    enabled: true,
    order: 0,
    hero: {},
    about: {},
    standFor: {},
    why: {},
    products: { title: "", items: [] },
    styles: {
      hero: {},
      about: {},
      standFor: {},
      why: {},
      products: {},
    },
    dimensions: {
      hero: {
        desktop: getDefaultDimensions("hero", "desktop"),
        tablet: getDefaultDimensions("hero", "tablet"),
        mobile: getDefaultDimensions("hero", "mobile"),
      },
      about: {
        desktop: getDefaultDimensions("about", "desktop"),
        tablet: getDefaultDimensions("about", "tablet"),
        mobile: getDefaultDimensions("about", "mobile"),
      },
      standFor: {
        desktop: getDefaultDimensions("standFor", "desktop"),
        tablet: getDefaultDimensions("standFor", "tablet"),
        mobile: getDefaultDimensions("standFor", "mobile"),
      },
      why: {
        desktop: getDefaultDimensions("why", "desktop"),
        tablet: getDefaultDimensions("why", "tablet"),
        mobile: getDefaultDimensions("why", "mobile"),
      },
      products: {
        desktop: getDefaultDimensions("products", "desktop"),
        tablet: getDefaultDimensions("products", "tablet"),
        mobile: getDefaultDimensions("products", "mobile"),
      },
    },
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(null); // Track which section is being saved
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [device, setDevice] = useState("desktop");
  const rowRef = useRef(null);

  useEffect(() => {
    if (page) {
      setFormData({
        brandId: page.brandId || "",
        brandName: page.brandName || "",
        enabled: page.enabled !== false,
        order: page.order || 0,
        hero: page.hero || {},
        about: page.about || {},
        standFor: page.standFor || {},
        why: page.why || {},
        products: page.products || { title: "", items: [] },
        styles: page.styles || {
          hero: {},
          about: {},
          standFor: {},
          why: {},
          products: {},
        },
        dimensions: page.dimensions || {
          hero: {
            desktop: getDefaultDimensions("hero", "desktop"),
            tablet: getDefaultDimensions("hero", "tablet"),
            mobile: getDefaultDimensions("hero", "mobile"),
          },
          about: {
            desktop: getDefaultDimensions("about", "desktop"),
            tablet: getDefaultDimensions("about", "tablet"),
            mobile: getDefaultDimensions("about", "mobile"),
          },
          standFor: {
            desktop: getDefaultDimensions("standFor", "desktop"),
            tablet: getDefaultDimensions("standFor", "tablet"),
            mobile: getDefaultDimensions("standFor", "mobile"),
          },
          why: {
            desktop: getDefaultDimensions("why", "desktop"),
            tablet: getDefaultDimensions("why", "tablet"),
            mobile: getDefaultDimensions("why", "mobile"),
          },
          products: {
            desktop: getDefaultDimensions("products", "desktop"),
            tablet: getDefaultDimensions("products", "tablet"),
            mobile: getDefaultDimensions("products", "mobile"),
          },
        },
      });
    }
  }, [page]);

  useEffect(() => {
    if (formData.brandId) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.brandId]);

  // Load images for preview
  useEffect(() => {
    if (showPreview) {
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, showPreview]);

  // Detect device breakpoint for preview
  useEffect(() => {
    const updateDevice = () => {
      setDevice(detectDevice(window.innerWidth));
    };
    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const allCategories = await getCategories();
      // Find brand by brandId to get document ID
      const brand = brands.find(
        (b) =>
          (b.brandId || b.id) === formData.brandId || b.id === formData.brandId
      );
      if (brand) {
        const brandCategories = allCategories.filter(
          (c) => c.brandId === brand.id
        );
        setCategories(brandCategories);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadImages = async () => {
    const urls = {};

    // Hero images
    if (formData.hero?.backgroundImage1) {
      const url = await resolveImageUrl(formData.hero.backgroundImage1);
      if (url) urls["hero-bg1"] = url;
    }
    if (formData.hero?.backgroundImage2) {
      const url = await resolveImageUrl(formData.hero.backgroundImage2);
      if (url) urls["hero-bg2"] = url;
    }

    // Section background images
    if (formData.about?.styles?.backgroundImage) {
      const url = await resolveImageUrl(formData.about.styles.backgroundImage);
      if (url) urls["about-bg"] = url;
    }
    if (formData.standFor?.styles?.backgroundImage) {
      const url = await resolveImageUrl(
        formData.standFor.styles.backgroundImage
      );
      if (url) urls["standFor-bg"] = url;
    }
    if (formData.why?.styles?.backgroundImage) {
      const url = await resolveImageUrl(formData.why.styles.backgroundImage);
      if (url) urls["why-bg"] = url;
    }
    if (formData.products?.styles?.backgroundImage) {
      const url = await resolveImageUrl(
        formData.products.styles.backgroundImage
      );
      if (url) urls["products-bg"] = url;
    }

    // Product images
    if (formData.products?.items) {
      for (let i = 0; i < formData.products.items.length; i++) {
        const item = formData.products.items[i];
        if (item.image) {
          const url = await resolveImageUrl(item.image);
          if (url) urls[`product-${i}`] = url;
        }
      }
    }

    setImageUrls(urls);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSectionChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  const handleStyleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      styles: {
        ...(prev.styles || {}),
        [section]: {
          ...(prev.styles?.[section] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSectionStyleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        styles: {
          ...(prev[section]?.styles || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleParagraphChange = (section, index, value) => {
    setFormData((prev) => {
      const paragraphs = [...(prev[section]?.paragraphs || [])];
      paragraphs[index] = value;
      return {
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          paragraphs,
        },
      };
    });
  };

  const handleAddParagraph = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        paragraphs: [...(prev[section]?.paragraphs || []), ""],
      },
    }));
  };

  const handleRemoveParagraph = (section, index) => {
    setFormData((prev) => {
      const paragraphs = [...(prev[section]?.paragraphs || [])];
      paragraphs.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          paragraphs,
        },
      };
    });
  };

  const handleProductItemChange = (index, field, value) => {
    setFormData((prev) => {
      const items = [...(prev.products?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        products: {
          ...(prev.products || {}),
          items,
        },
      };
    });
  };

  const handleAddProductItem = () => {
    setFormData((prev) => ({
      ...prev,
      products: {
        ...(prev.products || {}),
        items: [
          ...(prev.products?.items || []),
          {
            id: "",
            image: "",
            title: "",
            blurb: "",
            cta: "Know More",
            href: `/products?brand=${formData.brandId}`,
          },
        ],
      },
    }));
  };

  const handleRemoveProductItem = (index) => {
    setFormData((prev) => {
      const items = [...(prev.products?.items || [])];
      items.splice(index, 1);
      return {
        ...prev,
        products: {
          ...(prev.products || {}),
          items,
        },
      };
    });
  };

  const handleAutoPopulateProducts = () => {
    if (categories.length === 0) {
      alert(
        "No categories found for this brand. Create categories in Product Management first."
      );
      return;
    }

    const productItems = categories.map((cat) => ({
      id: cat.id || cat.categoryId,
      image: cat.image || "",
      title: cat.title || "",
      blurb: cat.subtitle || "",
      cta: "Know More",
      href:
        cat.href ||
        `/products?brand=${formData.brandId}&category=${cat.chip || cat.id}`,
    }));

    setFormData((prev) => ({
      ...prev,
      products: {
        ...(prev.products || {}),
        items: productItems,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.brandId) newErrors.brandId = "Brand is required";
    if (!formData.brandName) newErrors.brandName = "Brand name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionCancel = (sectionName) => {
    if (!page) return;

    // Reset the section data back to original page data
    if (sectionName === "hero") {
      setFormData((prev) => ({
        ...prev,
        hero: page.hero || {},
        styles: {
          ...prev.styles,
          hero: page.styles?.hero || {},
        },
        dimensions: {
          ...prev.dimensions,
          hero: page.dimensions?.hero || {
            desktop: getDefaultDimensions("hero", "desktop"),
            tablet: getDefaultDimensions("hero", "tablet"),
            mobile: getDefaultDimensions("hero", "mobile"),
          },
        },
      }));
    } else if (sectionName === "about") {
      setFormData((prev) => ({
        ...prev,
        about: page.about || {},
        styles: {
          ...prev.styles,
          about: page.styles?.about || {},
        },
        dimensions: {
          ...prev.dimensions,
          about: page.dimensions?.about || {
            desktop: getDefaultDimensions("about", "desktop"),
            tablet: getDefaultDimensions("about", "tablet"),
            mobile: getDefaultDimensions("about", "mobile"),
          },
        },
      }));
    } else if (sectionName === "standFor") {
      setFormData((prev) => ({
        ...prev,
        standFor: page.standFor || {},
        styles: {
          ...prev.styles,
          standFor: page.styles?.standFor || {},
        },
        dimensions: {
          ...prev.dimensions,
          standFor: page.dimensions?.standFor || {
            desktop: getDefaultDimensions("standFor", "desktop"),
            tablet: getDefaultDimensions("standFor", "tablet"),
            mobile: getDefaultDimensions("standFor", "mobile"),
          },
        },
      }));
    } else if (sectionName === "why") {
      setFormData((prev) => ({
        ...prev,
        why: page.why || {},
        styles: {
          ...prev.styles,
          why: page.styles?.why || {},
        },
        dimensions: {
          ...prev.dimensions,
          why: page.dimensions?.why || {
            desktop: getDefaultDimensions("why", "desktop"),
            tablet: getDefaultDimensions("why", "tablet"),
            mobile: getDefaultDimensions("why", "mobile"),
          },
        },
      }));
    } else if (sectionName === "products") {
      setFormData((prev) => ({
        ...prev,
        products: page.products || { title: "", items: [] },
        styles: {
          ...prev.styles,
          products: page.styles?.products || {},
        },
        dimensions: {
          ...prev.dimensions,
          products: page.dimensions?.products || {
            desktop: getDefaultDimensions("products", "desktop"),
            tablet: getDefaultDimensions("products", "tablet"),
            mobile: getDefaultDimensions("products", "mobile"),
          },
        },
      }));
    }
  };

  const handleSectionSave = async (sectionName) => {
    if (!page || !page.id) {
      setErrors({
        submit: "Please save the page first before saving individual sections.",
      });
      return;
    }

    try {
      setSavingSection(sectionName);

      // Update only the specific section
      const updates = {
        [sectionName]: formData[sectionName],
        styles: formData.styles,
        dimensions: formData.dimensions,
      };

      await updateBrandPage(page.id, updates);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error saving ${sectionName} section:`, error);
      setErrors({
        submit: `Failed to save ${sectionName} section: ${error.message}`,
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);

      // Check if updating or creating
      const isUpdate = page && page.id;

      if (isUpdate) {
        await updateBrandPage(page.id, formData);
      } else {
        // Check if page already exists for this brand
        const exists = await brandPageExists(formData.brandId);
        if (exists) {
          setErrors({
            brandId:
              "A brand page already exists for this brand. Please edit the existing page instead.",
          });
          setSaving(false);
          return;
        }
        await addBrandPage(formData);
      }

      onSave();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving brand page:", error);
      setErrors({ submit: `Failed to save: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Render preview panel
  const renderPreview = () => {
    if (!showPreview) return null;

    // Get dimension-based styles for current device
    const heroDims = getSectionStyles(formData.dimensions, "hero", device);
    const aboutDims = getSectionStyles(formData.dimensions, "about", device);
    const standForDims = getSectionStyles(
      formData.dimensions,
      "standFor",
      device
    );
    const whyDims = getSectionStyles(formData.dimensions, "why", device);
    const productsDims = getSectionStyles(
      formData.dimensions,
      "products",
      device
    );

    return (
      <div className="editor-preview-panel">
        <div className="preview-header">
          <h3>Live Preview</h3>
        </div>
        <div className="preview-content">
          <main className="brand-page">
            {/* Hero Section Preview */}
            {formData.hero && (
              <section
                className="brand-hero"
                style={{
                  backgroundColor:
                    formData.styles?.hero?.backgroundColor || "#f5f6f8",
                  ...heroDims,
                  // Use dimension defaults only
                  height: heroDims.height,
                  maxHeight: heroDims.maxHeight,
                }}
              >
                {imageUrls["hero-bg1"] && (
                  <div
                    className="brand-hero__bg-image"
                    style={{
                      backgroundImage: `url("${imageUrls["hero-bg1"]}")`,
                      backgroundSize:
                        formData.styles?.hero?.bgImage1Size || "cover",
                      backgroundPosition:
                        formData.styles?.hero?.bgImage1Position ||
                        "center center",
                      backgroundRepeat:
                        formData.styles?.hero?.bgImage1Repeat || "no-repeat",
                      width: formData.styles?.hero?.bgImage1Width
                        ? `${formData.styles.hero.bgImage1Width}%`
                        : "100%",
                    }}
                  />
                )}
                {imageUrls["hero-bg2"] && (
                  <div
                    className="brand-hero__fg-image"
                    style={{
                      backgroundImage: `url("${imageUrls["hero-bg2"]}")`,
                      backgroundSize:
                        formData.styles?.hero?.bgImage2Size || "cover",
                      backgroundPosition:
                        formData.styles?.hero?.bgImage2Position ||
                        "center center",
                      backgroundRepeat:
                        formData.styles?.hero?.bgImage2Repeat || "no-repeat",
                      width: formData.styles?.hero?.bgImage2Width
                        ? `${formData.styles.hero.bgImage2Width}%`
                        : "80%",
                      height: formData.styles?.hero?.bgImage2Height
                        ? `${formData.styles.hero.bgImage2Height}%`
                        : "120%",
                    }}
                  />
                )}
                <div className="brand-hero__overlay" />
                <div className="container brand-hero__inner">
                  <h1
                    className="brand-hero__title"
                    style={{
                      textAlign: formData.styles?.hero?.titleAlign || "center",
                      fontSize: heroDims.titleFontSize || undefined,
                      fontFamily:
                        formData.styles?.hero?.heroTitleFontFamily || undefined,
                      color:
                        formData.styles?.hero?.heroTitleColor ||
                        formData.styles?.hero?.titleColor ||
                        "#111827",
                      fontWeight:
                        formData.styles?.hero?.heroTitleFontWeight || undefined,
                      fontStyle:
                        formData.styles?.hero?.heroTitleFontStyle || undefined,
                      lineHeight:
                        formData.styles?.hero?.heroTitleLineHeight || undefined,
                      letterSpacing: formData.styles?.hero
                        ?.heroTitleLetterSpacing
                        ? `${formData.styles.hero.heroTitleLetterSpacing}em`
                        : undefined,
                      textTransform:
                        formData.styles?.hero?.heroTitleTextTransform ||
                        undefined,
                      textDecoration:
                        formData.styles?.hero?.heroTitleTextDecoration ||
                        undefined,
                      textShadow:
                        formData.styles?.hero?.heroTitleTextShadow || undefined,
                    }}
                  >
                    {(formData.hero.title || "Brand Title")
                      .split("\n")
                      .map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {parseInlineFormatting(line)}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                  </h1>
                  {formData.hero.leadText && (
                    <p
                      className="brand-hero__lead"
                      style={{
                        textAlign:
                          formData.styles?.hero?.leadTextAlign || "center",
                        fontSize: heroDims.leadFontSize || undefined,
                        fontFamily:
                          formData.styles?.hero?.heroLeadTextFontFamily ||
                          undefined,
                        color:
                          formData.styles?.hero?.heroLeadTextColor ||
                          formData.styles?.hero?.leadTextColor ||
                          "#374151",
                        fontWeight:
                          formData.styles?.hero?.heroLeadTextFontWeight ||
                          undefined,
                        fontStyle:
                          formData.styles?.hero?.heroLeadTextFontStyle ||
                          undefined,
                        lineHeight:
                          formData.styles?.hero?.heroLeadTextLineHeight ||
                          undefined,
                        letterSpacing: formData.styles?.hero
                          ?.heroLeadTextLetterSpacing
                          ? `${formData.styles.hero.heroLeadTextLetterSpacing}em`
                          : undefined,
                        textTransform:
                          formData.styles?.hero?.heroLeadTextTextTransform ||
                          undefined,
                        textDecoration:
                          formData.styles?.hero?.heroLeadTextTextDecoration ||
                          undefined,
                        textShadow:
                          formData.styles?.hero?.heroLeadTextTextShadow ||
                          undefined,
                      }}
                    >
                      {formData.hero.leadText.split("\n").map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i <
                            formData.hero.leadText.split("\n").length - 1 && (
                            <br />
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                  {formData.hero.ctaText && (
                    <div
                      className="hero-cta-wrapper"
                      data-align={
                        formData.styles?.hero?.ctaButtonAlign || "center"
                      }
                    >
                      <a
                        href={formData.hero.ctaLink || "#"}
                        className="btn btn-primary"
                        style={{
                          backgroundColor:
                            formData.styles?.hero?.ctaButtonBgColor ||
                            "#323790",
                          color:
                            formData.styles?.hero?.ctaButtonTextColor ||
                            "#FFFFFF",
                          padding:
                            formData.styles?.hero?.buttonPadding || undefined,
                          fontSize: formData.styles?.hero?.buttonFontSize
                            ? `${formData.styles.hero.buttonFontSize}px`
                            : undefined,
                        }}
                      >
                        {formData.hero.ctaText}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* About Section Preview */}
            {formData.about && (
              <section
                className="brand-section brand-about"
                style={{
                  backgroundColor:
                    formData.about?.styles?.backgroundColor ||
                    formData.styles?.about?.backgroundColor ||
                    "#f5f6f8",
                  backgroundImage: imageUrls["about-bg"]
                    ? `url("${imageUrls["about-bg"]}")`
                    : undefined,
                  backgroundSize:
                    formData.about?.styles?.backgroundSize || "cover",
                  backgroundPosition:
                    formData.about?.styles?.backgroundPosition ||
                    "center center",
                  backgroundRepeat:
                    formData.about?.styles?.backgroundRepeat || "no-repeat",
                  ...aboutDims,
                  // Override with styles if provided (backward compatibility)
                  paddingTop: formData.styles?.about?.paddingTop
                    ? `${formData.styles.about.paddingTop}px`
                    : aboutDims.paddingTop || "140px",
                  paddingBottom: formData.styles?.about?.paddingBottom
                    ? `${formData.styles.about.paddingBottom}px`
                    : aboutDims.paddingBottom || "140px",
                }}
              >
                <div className="container">
                  {formData.about.eyebrow && (
                    <div className="eyebrow">{formData.about.eyebrow}</div>
                  )}
                  <div className="brand-grid">
                    {formData.about.title && (
                      <h2 className="brand-title">
                        {parseInlineFormatting(formData.about.title)}
                      </h2>
                    )}
                    {formData.about.paragraphs &&
                      formData.about.paragraphs.length > 0 && (
                        <div className="brand-copy">
                          {formData.about.paragraphs.map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </section>
            )}

            {/* Stand For Section Preview */}
            {formData.standFor && (
              <section
                className="brand-section brand-standfor"
                style={{
                  backgroundColor:
                    formData.standFor?.styles?.backgroundColor ||
                    formData.styles?.standFor?.backgroundColor ||
                    "#ffffff",
                  backgroundImage: imageUrls["standFor-bg"]
                    ? `url("${imageUrls["standFor-bg"]}")`
                    : undefined,
                  backgroundSize:
                    formData.standFor?.styles?.backgroundSize || "cover",
                  backgroundPosition:
                    formData.standFor?.styles?.backgroundPosition ||
                    "center center",
                  backgroundRepeat:
                    formData.standFor?.styles?.backgroundRepeat || "no-repeat",
                  ...standForDims,
                  // Override with styles if provided (backward compatibility)
                  paddingTop: formData.styles?.standFor?.paddingTop
                    ? `${formData.styles.standFor.paddingTop}px`
                    : standForDims.paddingTop || "140px",
                  paddingBottom: formData.styles?.standFor?.paddingBottom
                    ? `${formData.styles.standFor.paddingBottom}px`
                    : standForDims.paddingBottom || "140px",
                }}
              >
                <div className="container">
                  {formData.standFor.eyebrow && (
                    <div className="eyebrow">{formData.standFor.eyebrow}</div>
                  )}
                  <div className="brand-grid">
                    {formData.standFor.title && (
                      <h2 className="brand-title">
                        {parseInlineFormatting(formData.standFor.title)}
                      </h2>
                    )}
                    {formData.standFor.paragraphs &&
                      formData.standFor.paragraphs.length > 0 && (
                        <div className="brand-copy">
                          {formData.standFor.paragraphs.map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </section>
            )}

            {/* Why Section Preview */}
            {formData.why && (
              <section
                className="brand-section brand-why"
                style={{
                  backgroundColor:
                    formData.why?.styles?.backgroundColor ||
                    formData.styles?.why?.backgroundColor ||
                    "#f5f6f8",
                  backgroundImage: imageUrls["why-bg"]
                    ? `url("${imageUrls["why-bg"]}")`
                    : undefined,
                  backgroundSize:
                    formData.why?.styles?.backgroundSize || "cover",
                  backgroundPosition:
                    formData.why?.styles?.backgroundPosition || "center center",
                  backgroundRepeat:
                    formData.why?.styles?.backgroundRepeat || "no-repeat",
                  ...whyDims,
                  // Override with styles if provided (backward compatibility)
                  paddingTop: formData.styles?.why?.paddingTop
                    ? `${formData.styles.why.paddingTop}px`
                    : whyDims.paddingTop || "140px",
                  paddingBottom: formData.styles?.why?.paddingBottom
                    ? `${formData.styles.why.paddingBottom}px`
                    : whyDims.paddingBottom || "140px",
                }}
              >
                <div className="container">
                  {formData.why.eyebrow && (
                    <div className="eyebrow">{formData.why.eyebrow}</div>
                  )}
                  <div className="brand-grid">
                    {formData.why.title && (
                      <h2 className="brand-title">
                        {parseInlineFormatting(formData.why.title)}
                      </h2>
                    )}
                    {formData.why.paragraphs &&
                      formData.why.paragraphs.length > 0 && (
                        <div className="brand-copy">
                          {formData.why.paragraphs.map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                          {formData.why.ctaText && (
                            <a
                              href={formData.why.ctaLink || "#"}
                              className="btn btn-primary"
                            >
                              {formData.why.ctaText}
                            </a>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </section>
            )}

            {/* Products Section Preview */}
            {formData.products &&
              formData.products.items &&
              formData.products.items.length > 0 && (
                <section
                  className="brand-section brand-products"
                  style={{
                    backgroundColor:
                      formData.products?.styles?.backgroundColor ||
                      formData.styles?.products?.backgroundColor ||
                      "#f5f6f8",
                    backgroundImage: imageUrls["products-bg"]
                      ? `url("${imageUrls["products-bg"]}")`
                      : undefined,
                    backgroundSize:
                      formData.products?.styles?.backgroundSize || "cover",
                    backgroundPosition:
                      formData.products?.styles?.backgroundPosition ||
                      "center center",
                    backgroundRepeat:
                      formData.products?.styles?.backgroundRepeat ||
                      "no-repeat",
                    ...productsDims,
                    // Override with styles if provided (backward compatibility)
                    paddingTop: formData.styles?.products?.paddingTop
                      ? `${formData.styles.products.paddingTop}px`
                      : productsDims.paddingTop || "140px",
                    paddingBottom: formData.styles?.products?.paddingBottom
                      ? `${formData.styles.products.paddingBottom}px`
                      : productsDims.paddingBottom || "140px",
                  }}
                >
                  <div className="container">
                    {formData.products.title && (
                      <h2 className="prod-title">{formData.products.title}</h2>
                    )}
                    <div className="brand-prod-row" ref={rowRef}>
                      {formData.products.items.map((item, index) => (
                        <article
                          key={item.id || index}
                          className="brand-prod-card"
                        >
                          {imageUrls[`product-${index}`] && (
                            <div className="brand-prod-media">
                              <img
                                src={imageUrls[`product-${index}`]}
                                alt={item.title || "UBC food product"}
                              />
                            </div>
                          )}
                          <div className="brand-prod-body">
                            <h3 className="brand-prod-name">{item.title}</h3>
                            <p className="brand-prod-blurb">{item.blurb}</p>
                            {item.cta && (
                              <a href={item.href || "#"} className="chip-link">
                                {item.cta}
                              </a>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}
          </main>
        </div>
      </div>
    );
  };

  return (
    <div className={showPreview ? "editor-with-preview-container" : ""}>
      <div
        className="brand-page-editor admin-card"
        style={
          showPreview
            ? {
                flex: "0 0 50%",
                overflowY: "auto",
                maxHeight: "calc(100vh - 80px)",
                padding: "24px",
              }
            : {}
        }
      >
        <div className="editor-header">
          <h2 className="admin-heading-2">
            {page?.id ? "Edit Brand Page" : "Create New Brand Page"}
          </h2>
          <button 
            type="button"
            onClick={handleCancel}
            className="editor-close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editor-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="form-group">
              <label className="admin-label">
                Brand <span className="required">*</span>
              </label>
              <p className="form-hint">
                Select the brand this page belongs to. This cannot be changed
                after the page is created.
              </p>
              <select
                value={formData.brandId}
                onChange={(e) => {
                  const selectedBrand = brands.find(
                    (b) =>
                      (b.brandId || b.id) === e.target.value ||
                      b.id === e.target.value
                  );
                  handleChange("brandId", e.target.value);
                  if (selectedBrand) {
                    handleChange("brandName", selectedBrand.name);
                  }
                }}
                className={`admin-select ${
                  errors.brandId ? "input-error" : ""
                }`}
                disabled={!!page?.id}
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.brandId || brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <span className="error-message">{errors.brandId}</span>
              )}
              {formData.brandId && (
                <p className="form-hint">
                  Page URL: <code>/brands/{formData.brandId}</code>
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="admin-label">
                <input
                  type="checkbox"
                  checked={formData.enabled !== false}
                  onChange={(e) => handleChange("enabled", e.target.checked)}
                />
                <span style={{ marginLeft: "8px" }}>
                  Enabled (visible on website)
                </span>
              </label>
              <p className="form-hint">
                When enabled, this brand page will be visible on the website.
                Uncheck to hide it temporarily.
              </p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="form-section">
            <h3 className="section-title">Hero Section</h3>

            <div className="form-group">
              <label className="admin-label">Background Image 1</label>
              <p className="form-hint">
                Main background image displayed behind the hero content.
                Recommended size: 1920x1080px or larger.
              </p>
              <ImageSelector
                value={formData.hero?.backgroundImage1 || ""}
                onChange={(url) =>
                  handleSectionChange("hero", "backgroundImage1", url)
                }
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Background Image 2</label>
              <p className="form-hint">
                Secondary foreground image layered over Background Image 1. Used
                for visual depth and branding.
              </p>
              <ImageSelector
                value={formData.hero?.backgroundImage2 || ""}
                onChange={(url) =>
                  handleSectionChange("hero", "backgroundImage2", url)
                }
              />
            </div>

            <div className="form-group">
              <InlineFontEditor
                label="Title"
                value={formData.hero?.title || ""}
                onChange={(value) =>
                  handleSectionChange("hero", "title", value)
                }
                placeholder="Rooted in Goodness, Growing with Trust"
                helpText="Select text and use formatting options to style individual words or lines"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Lead Text</label>
              <p className="form-hint">
                Subtitle text displayed below the main title. Supports line
                breaks for multi-line text.
              </p>
              <textarea
                value={formData.hero?.leadText || ""}
                onChange={(e) =>
                  handleSectionChange("hero", "leadText", e.target.value)
                }
                className="admin-input"
                rows="3"
                placeholder="From fertile soils to your family's table..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">CTA Button Text</label>
                <p className="form-hint">
                  Text displayed on the call-to-action button (e.g., "Explore
                  Products", "Shop Now").
                </p>
                <input
                  type="text"
                  value={formData.hero?.ctaText || ""}
                  onChange={(e) =>
                    handleSectionChange("hero", "ctaText", e.target.value)
                  }
                  className="admin-input"
                  placeholder="Explore Products"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">CTA Button Link</label>
                <p className="form-hint">
                  URL where the button links to (e.g.,
                  "/products?brand=soil-king" or external URL).
                </p>
                <input
                  type="text"
                  value={formData.hero?.ctaLink || ""}
                  onChange={(e) =>
                    handleSectionChange("hero", "ctaLink", e.target.value)
                  }
                  className="admin-input"
                  placeholder="/products?brand=soil-king"
                />
              </div>
            </div>

            {/* Hero Styling */}
            <div
              className="form-section"
              style={{
                marginTop: "24px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <h4
                className="section-subtitle"
                style={{ fontSize: "16px", marginBottom: "16px" }}
              >
                Hero Section Styling
              </h4>

              <div className="form-group">
                <label className="admin-label">Section Background Color</label>
                <p className="form-hint">
                  Background color for the entire hero section. Use the color
                  picker or enter a hex code.
                </p>
                <div className="form-row">
                  <input
                    type="color"
                    value={formData.styles?.hero?.backgroundColor || "#f5f6f8"}
                    onChange={(e) =>
                      handleStyleChange(
                        "hero",
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    style={{ height: "40px", width: "80px", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={formData.styles?.hero?.backgroundColor || "#f5f6f8"}
                    onChange={(e) =>
                      handleStyleChange(
                        "hero",
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="#f5f6f8"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="admin-label">Title Text Alignment</label>
                <select
                  value={formData.styles?.hero?.titleAlign || "center"}
                  onChange={(e) =>
                    handleStyleChange("hero", "titleAlign", e.target.value)
                  }
                  className="admin-select"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="admin-label">
                  Title Font Size (px) - Device Specific
                </label>
                <p className="form-hint">
                  Set different font sizes for desktop, tablet, and mobile
                  devices. Font sizes will automatically adjust based on screen
                  size.
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label" style={{ fontSize: "12px" }}>
                      Desktop (≥1024px)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.dimensions?.hero?.desktop?.titleFontSize ?? ""
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            hero: {
                              ...prev.dimensions.hero,
                              desktop: {
                                ...prev.dimensions.hero.desktop,
                                titleFontSize: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            },
                          },
                        }));
                      }}
                      className="admin-input"
                      placeholder="68"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label" style={{ fontSize: "12px" }}>
                      Tablet (768-1023px)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.dimensions?.hero?.tablet?.titleFontSize ?? ""
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            hero: {
                              ...prev.dimensions.hero,
                              tablet: {
                                ...prev.dimensions.hero.tablet,
                                titleFontSize: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            },
                          },
                        }));
                      }}
                      className="admin-input"
                      placeholder="56"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label" style={{ fontSize: "12px" }}>
                      Mobile (≤767px)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.dimensions?.hero?.mobile?.titleFontSize ?? ""
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            hero: {
                              ...prev.dimensions.hero,
                              mobile: {
                                ...prev.dimensions.hero.mobile,
                                titleFontSize: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            },
                          },
                        }));
                      }}
                      className="admin-input"
                      placeholder="36"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Title Max Width (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.hero?.titleMaxWidth || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "hero",
                        "titleMaxWidth",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="auto"
                  />
                </div>
              </div>

              {renderFontStyling(
                "heroTitle",
                "Hero Title",
                formData.styles?.hero || {},
                (field, value) => handleStyleChange("hero", field, value),
                true // Hide font size - use device-specific controls instead
              )}

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="admin-label">Lead Text Alignment</label>
                <select
                  value={formData.styles?.hero?.leadTextAlign || "center"}
                  onChange={(e) =>
                    handleStyleChange("hero", "leadTextAlign", e.target.value)
                  }
                  className="admin-select"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="admin-label">
                  Lead Text Font Size (px) - Device Specific
                </label>
                <p className="form-hint">
                  Set different font sizes for desktop, tablet, and mobile
                  devices.
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label" style={{ fontSize: "12px" }}>
                      Desktop (≥1024px)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.dimensions?.hero?.desktop?.leadFontSize ?? ""
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            hero: {
                              ...prev.dimensions.hero,
                              desktop: {
                                ...prev.dimensions.hero.desktop,
                                leadFontSize: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            },
                          },
                        }));
                      }}
                      className="admin-input"
                      placeholder="18"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label" style={{ fontSize: "12px" }}>
                      Tablet (768-1023px)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.dimensions?.hero?.tablet?.leadFontSize ?? ""
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            hero: {
                              ...prev.dimensions.hero,
                              tablet: {
                                ...prev.dimensions.hero.tablet,
                                leadFontSize: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            },
                          },
                        }));
                      }}
                      className="admin-input"
                      placeholder="16"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label" style={{ fontSize: "12px" }}>
                      Mobile (≤767px)
                    </label>
                    <input
                      type="number"
                      value={
                        formData.dimensions?.hero?.mobile?.leadFontSize ?? ""
                      }
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            hero: {
                              ...prev.dimensions.hero,
                              mobile: {
                                ...prev.dimensions.hero.mobile,
                                leadFontSize: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            },
                          },
                        }));
                      }}
                      className="admin-input"
                      placeholder="14"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">
                    Lead Text Max Width (px)
                  </label>
                  <input
                    type="number"
                    value={formData.styles?.hero?.leadTextMaxWidth || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "hero",
                        "leadTextMaxWidth",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="820"
                  />
                </div>
              </div>

              {renderFontStyling(
                "heroLeadText",
                "Hero Lead Text",
                formData.styles?.hero || {},
                (field, value) => handleStyleChange("hero", field, value),
                true // Hide font size - use device-specific controls instead
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Button Padding (px)</label>
                  <input
                    type="text"
                    value={formData.styles?.hero?.buttonPadding || ""}
                    onChange={(e) =>
                      handleStyleChange("hero", "buttonPadding", e.target.value)
                    }
                    className="admin-input"
                    placeholder="12px 24px"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Button Font Size (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.hero?.buttonFontSize || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "hero",
                        "buttonFontSize",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="16"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="admin-label">Button Alignment</label>
                <p className="form-hint">
                  Control the alignment of the CTA button for all devices. This
                  setting applies to desktop, tablet, and mobile views.
                </p>
                <select
                  value={formData.styles?.hero?.ctaButtonAlign || "center"}
                  onChange={(e) =>
                    handleStyleChange("hero", "ctaButtonAlign", e.target.value)
                  }
                  className="admin-select"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            {/* Hero Section Save/Cancel Buttons */}
            <div className="section-save-container">
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleSectionSave("hero")}
                  className="admin-btn admin-btn-primary"
                  disabled={savingSection === "hero" || !page?.id}
                >
                  {savingSection === "hero" ? (
                    <>
                      <span
                        className="admin-spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></span>
                      Saving Hero Section...
                    </>
                  ) : (
                    "💾 Save Hero Section"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionCancel("hero")}
                  className="admin-btn admin-btn-secondary"
                  disabled={!page || savingSection === "hero"}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
              {!page?.id && (
                <p
                  className="form-hint"
                  style={{ marginTop: "8px", color: "#f59e0b" }}
                >
                  Save the page first to enable section-level saving.
                </p>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="form-section">
            <h3 className="section-title">About Section</h3>

            <EyebrowTextEditor
              value={formData.about?.eyebrow || ""}
              onChange={(value) =>
                handleSectionChange("about", "eyebrow", value)
              }
              placeholder="★ About Soil King"
            />

            <div className="form-group">
              <InlineFontEditor
                label="Title"
                value={formData.about?.title || ""}
                onChange={(value) =>
                  handleSectionChange("about", "title", value)
                }
                placeholder="Rooted in Goodness."
                helpText="Select text and use formatting options to style individual words"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Paragraphs</label>
              {(formData.about?.paragraphs || []).map((para, index) => (
                <div key={index} className="array-item">
                  <textarea
                    value={para}
                    onChange={(e) =>
                      handleParagraphChange("about", index, e.target.value)
                    }
                    className="admin-input"
                    rows="2"
                    placeholder="Paragraph text..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph("about", index)}
                    className="admin-btn admin-btn-danger"
                    style={{ marginTop: "8px" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddParagraph("about")}
                className="admin-btn admin-btn-secondary"
                style={{ marginTop: "8px" }}
              >
                + Add Paragraph
              </button>
            </div>

            {/* About Styling */}
            {renderSectionStyling(
              "about",
              "About",
              formData.styles,
              handleStyleChange,
              handleSectionStyleChange,
              "#f5f6f8"
            )}

            {/* About Section Save/Cancel Buttons */}
            <div className="section-save-container">
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleSectionSave("about")}
                  className="admin-btn admin-btn-primary"
                  disabled={savingSection === "about" || !page?.id}
                >
                  {savingSection === "about" ? (
                    <>
                      <span
                        className="admin-spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></span>
                      Saving About Section...
                    </>
                  ) : (
                    "💾 Save About Section"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionCancel("about")}
                  className="admin-btn admin-btn-secondary"
                  disabled={!page || savingSection === "about"}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
              {!page?.id && (
                <p
                  className="form-hint"
                  style={{ marginTop: "8px", color: "#f59e0b" }}
                >
                  Save the page first to enable section-level saving.
                </p>
              )}
            </div>
          </div>

          {/* Stand For Section */}
          <div className="form-section">
            <h3 className="section-title">What We Stand For Section</h3>

            <EyebrowTextEditor
              value={formData.standFor?.eyebrow || ""}
              onChange={(value) =>
                handleSectionChange("standFor", "eyebrow", value)
              }
              placeholder="★ What We Stand For"
            />

            <div className="form-group">
              <label className="admin-label">Title</label>
              <InlineFontEditor
                label="Title"
                value={formData.standFor?.title || ""}
                onChange={(value) =>
                  handleSectionChange("standFor", "title", value)
                }
                placeholder="From Soil to Shelf, With Sincerity."
                helpText="Select text and use formatting options to style individual words"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Paragraphs</label>
              {(formData.standFor?.paragraphs || []).map((para, index) => (
                <div key={index} className="array-item">
                  <textarea
                    value={para}
                    onChange={(e) =>
                      handleParagraphChange("standFor", index, e.target.value)
                    }
                    className="admin-input"
                    rows="2"
                    placeholder="Paragraph text..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph("standFor", index)}
                    className="admin-btn admin-btn-danger"
                    style={{ marginTop: "8px" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddParagraph("standFor")}
                className="admin-btn admin-btn-secondary"
                style={{ marginTop: "8px" }}
              >
                + Add Paragraph
              </button>
            </div>

            {/* StandFor Styling */}
            {renderSectionStyling(
              "standFor",
              "What We Stand For",
              formData.styles,
              handleStyleChange,
              handleSectionStyleChange,
              "#ffffff"
            )}

            {/* Stand For Section Save/Cancel Buttons */}
            <div className="section-save-container">
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleSectionSave("standFor")}
                  className="admin-btn admin-btn-primary"
                  disabled={savingSection === "standFor" || !page?.id}
                >
                  {savingSection === "standFor" ? (
                    <>
                      <span
                        className="admin-spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></span>
                      Saving Stand For Section...
                    </>
                  ) : (
                    "💾 Save Stand For Section"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionCancel("standFor")}
                  className="admin-btn admin-btn-secondary"
                  disabled={!page || savingSection === "standFor"}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
              {!page?.id && (
                <p
                  className="form-hint"
                  style={{ marginTop: "8px", color: "#f59e0b" }}
                >
                  Save the page first to enable section-level saving.
                </p>
              )}
            </div>
          </div>

          {/* Why Section */}
          <div className="form-section">
            <h3 className="section-title">Why Section</h3>

            <EyebrowTextEditor
              value={formData.why?.eyebrow || ""}
              onChange={(value) => handleSectionChange("why", "eyebrow", value)}
              placeholder="★ Why Soil King"
            />

            <div className="form-group">
              <label className="admin-label">Title</label>
              <p className="form-hint">
                Main heading for the "Why" section explaining why customers
                should choose this brand.
              </p>
              <InlineFontEditor
                label="Title"
                value={formData.why?.title || ""}
                onChange={(value) => handleSectionChange("why", "title", value)}
                placeholder="Because What's Real, Stays Real."
                helpText="Select text and use formatting options to style individual words"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Paragraphs</label>
              <p className="form-hint">
                Add paragraphs explaining why customers should choose this
                brand. Supports multiple paragraphs.
              </p>
              {(formData.why?.paragraphs || []).map((para, index) => (
                <div key={index} className="array-item">
                  <textarea
                    value={para}
                    onChange={(e) =>
                      handleParagraphChange("why", index, e.target.value)
                    }
                    className="admin-input"
                    rows="2"
                    placeholder="Paragraph text..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph("why", index)}
                    className="admin-btn admin-btn-danger"
                    style={{ marginTop: "8px" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddParagraph("why")}
                className="admin-btn admin-btn-secondary"
                style={{ marginTop: "8px" }}
              >
                + Add Paragraph
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="admin-label">CTA Button Text</label>
                <p className="form-hint">
                  Text for the call-to-action button at the bottom of the Why
                  section.
                </p>
                <input
                  type="text"
                  value={formData.why?.ctaText || ""}
                  onChange={(e) =>
                    handleSectionChange("why", "ctaText", e.target.value)
                  }
                  className="admin-input"
                  placeholder="Explore Our Products"
                />
              </div>
              <div className="form-group">
                <label className="admin-label">CTA Button Link</label>
                <p className="form-hint">
                  URL destination for the CTA button (e.g.,
                  "/products?brand=soil-king").
                </p>
                <input
                  type="text"
                  value={formData.why?.ctaLink || ""}
                  onChange={(e) =>
                    handleSectionChange("why", "ctaLink", e.target.value)
                  }
                  className="admin-input"
                  placeholder="/products?brand=soil-king"
                />
              </div>
            </div>

            {/* Why Styling */}
            <div>
              {renderSectionStyling(
                "why",
                "Why",
                formData.styles,
                handleStyleChange,
                handleSectionStyleChange,
                "#f5f6f8"
              )}

              <div
                className="form-section"
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <h4
                  className="section-subtitle"
                  style={{ fontSize: "16px", marginBottom: "16px" }}
                >
                  Why Section CTA Button Styling
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label">Button Padding (px)</label>
                    <input
                      type="text"
                      value={formData.styles?.why?.buttonPadding || ""}
                      onChange={(e) =>
                        handleStyleChange(
                          "why",
                          "buttonPadding",
                          e.target.value
                        )
                      }
                      className="admin-input"
                      placeholder="12px 24px"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Button Font Size (px)</label>
                    <input
                      type="number"
                      value={formData.styles?.why?.buttonFontSize || ""}
                      onChange={(e) =>
                        handleStyleChange(
                          "why",
                          "buttonFontSize",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="admin-input"
                      placeholder="16"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="admin-label">
                      Button Background Color
                    </label>
                    <div className="form-row">
                      <input
                        type="color"
                        value={formData.styles?.why?.buttonBgColor || "#323790"}
                        onChange={(e) =>
                          handleStyleChange(
                            "why",
                            "buttonBgColor",
                            e.target.value
                          )
                        }
                        style={{
                          height: "40px",
                          width: "80px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={formData.styles?.why?.buttonBgColor || "#323790"}
                        onChange={(e) =>
                          handleStyleChange(
                            "why",
                            "buttonBgColor",
                            e.target.value
                          )
                        }
                        className="admin-input"
                        placeholder="#323790"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Button Text Color</label>
                    <div className="form-row">
                      <input
                        type="color"
                        value={
                          formData.styles?.why?.buttonTextColor || "#FFFFFF"
                        }
                        onChange={(e) =>
                          handleStyleChange(
                            "why",
                            "buttonTextColor",
                            e.target.value
                          )
                        }
                        style={{
                          height: "40px",
                          width: "80px",
                          cursor: "pointer",
                        }}
                      />
                      <input
                        type="text"
                        value={
                          formData.styles?.why?.buttonTextColor || "#FFFFFF"
                        }
                        onChange={(e) =>
                          handleStyleChange(
                            "why",
                            "buttonTextColor",
                            e.target.value
                          )
                        }
                        className="admin-input"
                        placeholder="#FFFFFF"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Section Save/Cancel Buttons */}
            <div className="section-save-container">
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleSectionSave("why")}
                  className="admin-btn admin-btn-primary"
                  disabled={savingSection === "why" || !page?.id}
                >
                  {savingSection === "why" ? (
                    <>
                      <span
                        className="admin-spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></span>
                      Saving Why Section...
                    </>
                  ) : (
                    "💾 Save Why Section"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionCancel("why")}
                  className="admin-btn admin-btn-secondary"
                  disabled={!page || savingSection === "why"}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
              {!page?.id && (
                <p
                  className="form-hint"
                  style={{ marginTop: "8px", color: "#f59e0b" }}
                >
                  Save the page first to enable section-level saving.
                </p>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="form-section">
            <h3 className="section-title">Products Section</h3>

            <div className="form-group">
              <label className="admin-label">Section Title</label>
              <p className="form-hint">
                Main heading for the products section. If left empty, it will
                default to "Explore [Brand Name] Products".
              </p>
              <input
                type="text"
                value={formData.products?.title || ""}
                onChange={(e) =>
                  handleSectionChange("products", "title", e.target.value)
                }
                className="admin-input"
                placeholder="Explore Soil Kings Products"
              />
            </div>

            <div className="form-group">
              <label className="admin-label">Product Cards</label>
              <p className="form-hint">
                Manage product cards displayed in the products section. Use
                "Auto-populate" to automatically add cards from existing
                categories, or manually add/edit cards.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "12px",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={handleAutoPopulateProducts}
                  className="admin-btn admin-btn-secondary"
                  disabled={loadingCategories || categories.length === 0}
                >
                  {loadingCategories
                    ? "Loading..."
                    : "🔄 Auto-populate from Categories"}
                </button>
                <button
                  type="button"
                  onClick={handleAddProductItem}
                  className="admin-btn admin-btn-secondary"
                >
                  + Add Product Card
                </button>
              </div>
              {categories.length > 0 && (
                <p className="form-hint">
                  Found {categories.length} categor
                  {categories.length === 1 ? "y" : "ies"} for this brand. Click
                  "Auto-populate" to use them.
                </p>
              )}
            </div>

            <div className="products-list">
              {(formData.products?.items || []).map((item, index) => (
                <div key={index} className="product-item-card">
                  <div className="product-item-header">
                    <h4>Product Card {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveProductItem(index)}
                      className="admin-btn admin-btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Image</label>
                    <p className="form-hint" style={{ fontSize: "12px" }}>
                      Product category image displayed on the card.
                    </p>
                    <ImageSelector
                      value={item.image || ""}
                      onChange={(url) =>
                        handleProductItemChange(index, "image", url)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Title</label>
                    <p className="form-hint" style={{ fontSize: "12px" }}>
                      Product category name (e.g., "Masalas", "Spices").
                    </p>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) =>
                        handleProductItemChange(index, "title", e.target.value)
                      }
                      className="admin-input"
                      placeholder="Masalas"
                    />
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Blurb</label>
                    <p className="form-hint" style={{ fontSize: "12px" }}>
                      Short description or tagline for the product category.
                    </p>
                    <input
                      type="text"
                      value={item.blurb || ""}
                      onChange={(e) =>
                        handleProductItemChange(index, "blurb", e.target.value)
                      }
                      className="admin-input"
                      placeholder="Authentic blends for every dish"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="admin-label">CTA Text</label>
                      <p className="form-hint" style={{ fontSize: "12px" }}>
                        Text for the "Know More" link button on the product
                        card.
                      </p>
                      <input
                        type="text"
                        value={item.cta || ""}
                        onChange={(e) =>
                          handleProductItemChange(index, "cta", e.target.value)
                        }
                        className="admin-input"
                        placeholder="Know More"
                      />
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Link</label>
                      <p className="form-hint" style={{ fontSize: "12px" }}>
                        URL where the CTA button links to (e.g.,
                        "/products?brand=soil-king&category=masalas").
                      </p>
                      <input
                        type="text"
                        value={item.href || ""}
                        onChange={(e) =>
                          handleProductItemChange(index, "href", e.target.value)
                        }
                        className="admin-input"
                        placeholder="/products?brand=soil-king"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products Styling */}
            <div
              className="form-section"
              style={{
                marginTop: "24px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <h4
                className="section-subtitle"
                style={{ fontSize: "16px", marginBottom: "16px" }}
              >
                Products Section Styling
              </h4>

              <div className="form-group">
                <label className="admin-label">Section Background Color</label>
                <div className="form-row">
                  <input
                    type="color"
                    value={
                      formData.styles?.products?.backgroundColor || "#f5f6f8"
                    }
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    style={{ height: "40px", width: "80px", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={
                      formData.styles?.products?.backgroundColor || "#f5f6f8"
                    }
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="#f5f6f8"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <h5
                style={{
                  fontSize: "14px",
                  marginTop: "20px",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Section Title Styling
              </h5>
              <div className="form-group">
                <label className="admin-label">Title Text Alignment</label>
                <select
                  value={formData.styles?.products?.titleAlign || "left"}
                  onChange={(e) =>
                    handleStyleChange("products", "titleAlign", e.target.value)
                  }
                  className="admin-select"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Title Font Size (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.products?.titleFontSize || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "titleFontSize",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="44"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Title Width (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.products?.titleWidth || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "titleWidth",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="auto"
                  />
                </div>
              </div>

              <h5
                style={{
                  fontSize: "14px",
                  marginTop: "20px",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Product Card Styling
              </h5>
              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Card Width (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.products?.cardWidth || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "cardWidth",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="auto"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Card Gap (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.products?.cardGap || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "cardGap",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="24"
                  />
                </div>
              </div>

              <h5
                style={{
                  fontSize: "14px",
                  marginTop: "20px",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Product Image Styling
              </h5>
              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">Image Width (px or %)</label>
                  <input
                    type="text"
                    value={formData.styles?.products?.imageWidth || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "imageWidth",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="100%"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">Image Height (px or %)</label>
                  <input
                    type="text"
                    value={formData.styles?.products?.imageHeight || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "imageHeight",
                        e.target.value
                      )
                    }
                    className="admin-input"
                    placeholder="auto"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">
                    Image Border Radius (px)
                  </label>
                  <input
                    type="number"
                    value={formData.styles?.products?.imageBorderRadius || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "imageBorderRadius",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="8"
                  />
                </div>
              </div>

              <h5
                style={{
                  fontSize: "14px",
                  marginTop: "20px",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Product Text Styling
              </h5>
              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">
                    Product Title Font Size (px)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.styles?.products?.productTitleFontSize || ""
                    }
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "productTitleFontSize",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="20"
                  />
                </div>
                <div className="form-group">
                  <label className="admin-label">
                    Product Blurb Font Size (px)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.styles?.products?.productBlurbFontSize || ""
                    }
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "productBlurbFontSize",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="14"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="admin-label">CTA Link Font Size (px)</label>
                  <input
                    type="number"
                    value={formData.styles?.products?.ctaFontSize || ""}
                    onChange={(e) =>
                      handleStyleChange(
                        "products",
                        "ctaFontSize",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="admin-input"
                    placeholder="14"
                  />
                </div>
              </div>
            </div>

            {/* Products Section Save/Cancel Buttons */}
            <div className="section-save-container">
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleSectionSave("products")}
                  className="admin-btn admin-btn-primary"
                  disabled={savingSection === "products" || !page?.id}
                >
                  {savingSection === "products" ? (
                    <>
                      <span
                        className="admin-spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></span>
                      Saving Products Section...
                    </>
                  ) : (
                    "💾 Save Products Section"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionCancel("products")}
                  className="admin-btn admin-btn-secondary"
                  disabled={!page || savingSection === "products"}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
              {!page?.id && (
                <p
                  className="form-hint"
                  style={{ marginTop: "8px", color: "#f59e0b" }}
                >
                  Save the page first to enable section-level saving.
                </p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="admin-alert admin-alert-error">{errors.submit}</div>
          )}

          <div className="editor-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="admin-btn admin-btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="admin-spinner"
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "8px",
                    }}
                  ></span>
                  Saving...
                </>
              ) : page?.id ? (
                "Update Brand Page"
              ) : (
                "Create Brand Page"
              )}
            </button>
          </div>
        </form>
      </div>
      {renderPreview()}
    </div>
  );
}
