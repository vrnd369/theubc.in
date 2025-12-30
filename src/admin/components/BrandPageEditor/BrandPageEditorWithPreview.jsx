import React, { useState, useEffect, useRef } from "react";
import {
  addBrandPage,
  updateBrandPage,
  brandPageExists,
} from "../../services/brandPageService";
import { getCategories, getProducts } from "../../services/productService";
import ImageSelector from "../ImageSelector/ImageSelector";
import { renderSectionStyling } from "./renderSectionStyling";
import { resolveImageUrl } from "../../../utils/imageUtils";
import "../../../pages/Brands.css";
import "./BrandPageEditor.css";
import "./BrandPageEditorWithPreview.css";

/**
 * Brand Page Editor with Side-by-Side Preview
 * Shows editor on left and live preview on right
 */
export default function BrandPageEditorWithPreview({
  page,
  brands,
  onSave,
  onCancel,
}) {
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
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
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
      });
    }
  }, [page]);

  useEffect(() => {
    if (formData.brandId) {
      loadCategories();
      loadProducts();
    }
  }, [formData.brandId]);

  // Load images when formData changes
  useEffect(() => {
    loadImages();
  }, [formData]);

  const loadCategories = async () => {
    if (!formData.brandId) return;
    try {
      setLoadingCategories(true);
      const brand = brands?.find(
        (b) => (b.brandId || b.id) === formData.brandId
      );
      if (brand) {
        const brandId = brand.brandId || brand.id;
        const allCategories = await getCategories(brandId);
        const enabledCategories = allCategories.filter(
          (c) => c.enabled !== false
        );
        setCategories(enabledCategories);

        // Load category images
        enabledCategories.forEach((category, index) => {
          if (category.image) {
            resolveImageUrl(category.image)
              .then((url) => {
                if (url)
                  setImageUrls((prev) => ({
                    ...prev,
                    [`category-${index}`]: url,
                  }));
              })
              .catch(() => {});
          }
        });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    if (!formData.brandId) return;
    try {
      const brand = brands?.find(
        (b) => (b.brandId || b.id) === formData.brandId
      );
      if (brand) {
        const brandId = brand.brandId || brand.id;
        const allProducts = await getProducts(brandId);
        const enabledProducts = allProducts.filter((p) => p.enabled !== false);
        setProducts(enabledProducts);

        // Load product images
        enabledProducts.forEach((product, index) => {
          if (product.image) {
            resolveImageUrl(product.image)
              .then((url) => {
                if (url)
                  setImageUrls((prev) => ({
                    ...prev,
                    [`product-${index}`]: url,
                  }));
              })
              .catch(() => {});
          }
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadImages = async () => {
    setLoadingImages(true);
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
    setLoadingImages(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.brandId) {
      setErrors({ submit: "Please select a brand" });
      return;
    }

    try {
      setSaving(true);

      // Check if brand page already exists (for new pages)
      if (!page?.id) {
        const exists = await brandPageExists(formData.brandId);
        if (exists) {
          setErrors({
            submit: `A brand page for "${formData.brandId}" already exists. Please edit the existing page instead.`,
          });
          setSaving(false);
          return;
        }
      }

      const pageData = {
        brandId: formData.brandId,
        brandName: formData.brandName,
        enabled: formData.enabled,
        order: formData.order,
        hero: formData.hero,
        about: formData.about,
        standFor: formData.standFor,
        why: formData.why,
        products: formData.products,
        styles: formData.styles,
      };

      if (page?.id) {
        await updateBrandPage(page.id, pageData);
      } else {
        await addBrandPage(pageData);
      }

      onSave();
    } catch (err) {
      console.error("Error saving brand page:", err);
      setErrors({
        submit: err.message || "Failed to save brand page. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const slide = (dir = 1) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector(".brand-prod-card");
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const stepWidth = (card?.offsetWidth || 0) + gap;
    row.scrollBy({ left: dir * stepWidth, behavior: "smooth" });
  };

  // Render preview section
  const renderPreview = () => (
    <div className="editor-preview-panel">
      <div className="preview-header">
        <h3>Live Preview</h3>
      </div>
      <div className="preview-content">
        <main className="brand-page">
          {/* Hero Section */}
          {formData.hero && (
            <section
              className="brand-hero"
              style={{
                minHeight: formData.styles?.hero?.sectionMinHeight
                  ? `${formData.styles.hero.sectionMinHeight}px`
                  : "1200px",
                paddingTop: formData.styles?.hero?.paddingTop
                  ? `${formData.styles.hero.paddingTop}px`
                  : "240px",
                paddingBottom: formData.styles?.hero?.paddingBottom
                  ? `${formData.styles.hero.paddingBottom}px`
                  : "80px",
                backgroundColor:
                  formData.styles?.hero?.backgroundColor || "#f5f6f8",
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
                    fontSize: formData.styles?.hero?.titleFontSize
                      ? `${formData.styles.hero.titleFontSize}px`
                      : undefined,
                    color: formData.styles?.hero?.titleColor || "#111827",
                  }}
                >
                  {formData.hero.title || "Brand Title"}
                </h1>
                {formData.hero.leadText && (
                  <p
                    className="brand-hero__lead"
                    style={{
                      textAlign:
                        formData.styles?.hero?.leadTextAlign || "center",
                      fontSize: formData.styles?.hero?.leadTextFontSize
                        ? `${formData.styles.hero.leadTextFontSize}px`
                        : undefined,
                      color: formData.styles?.hero?.leadTextColor || "#374151",
                    }}
                  >
                    {formData.hero.leadText}
                  </p>
                )}
                {formData.hero.ctaText && (
                  <a
                    href={formData.hero.ctaLink || "#"}
                    className="btn btn-primary"
                    style={{
                      backgroundColor:
                        formData.styles?.hero?.ctaButtonBgColor || "#323790",
                      color:
                        formData.styles?.hero?.ctaButtonTextColor || "#FFFFFF",
                    }}
                  >
                    {formData.hero.ctaText}
                  </a>
                )}
              </div>
            </section>
          )}

          {/* About Section */}
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
                  formData.about?.styles?.backgroundPosition || "center center",
                backgroundRepeat:
                  formData.about?.styles?.backgroundRepeat || "no-repeat",
                paddingTop: formData.styles?.about?.paddingTop
                  ? `${formData.styles.about.paddingTop}px`
                  : "140px",
                paddingBottom: formData.styles?.about?.paddingBottom
                  ? `${formData.styles.about.paddingBottom}px`
                  : "140px",
              }}
            >
              <div className="container">
                {formData.about.eyebrow && (
                  <div className="eyebrow">{formData.about.eyebrow}</div>
                )}
                <div className="brand-grid">
                  {formData.about.title && (
                    <h2 className="brand-title">{formData.about.title}</h2>
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

          {/* Stand For Section */}
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
                paddingTop: formData.styles?.standFor?.paddingTop
                  ? `${formData.styles.standFor.paddingTop}px`
                  : "140px",
                paddingBottom: formData.styles?.standFor?.paddingBottom
                  ? `${formData.styles.standFor.paddingBottom}px`
                  : "140px",
              }}
            >
              <div className="container">
                {formData.standFor.eyebrow && (
                  <div className="eyebrow">{formData.standFor.eyebrow}</div>
                )}
                <div className="brand-grid">
                  {formData.standFor.title && (
                    <h2 className="brand-title">{formData.standFor.title}</h2>
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

          {/* Why Section */}
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
                backgroundSize: formData.why?.styles?.backgroundSize || "cover",
                backgroundPosition:
                  formData.why?.styles?.backgroundPosition || "center center",
                backgroundRepeat:
                  formData.why?.styles?.backgroundRepeat || "no-repeat",
                paddingTop: formData.styles?.why?.paddingTop
                  ? `${formData.styles.why.paddingTop}px`
                  : "140px",
                paddingBottom: formData.styles?.why?.paddingBottom
                  ? `${formData.styles.why.paddingBottom}px`
                  : "140px",
              }}
            >
              <div className="container">
                {formData.why.eyebrow && (
                  <div className="eyebrow">{formData.why.eyebrow}</div>
                )}
                <div className="brand-grid">
                  {formData.why.title && (
                    <h2 className="brand-title">{formData.why.title}</h2>
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

          {/* Products Section - Using actual categories and products from database */}
          {((categories && categories.length > 0) ||
            (products && products.length > 0)) && (
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
                  formData.products?.styles?.backgroundRepeat || "no-repeat",
                paddingTop: formData.styles?.products?.paddingTop
                  ? `${formData.styles.products.paddingTop}px`
                  : "140px",
                paddingBottom: formData.styles?.products?.paddingBottom
                  ? `${formData.styles.products.paddingBottom}px`
                  : "140px",
              }}
            >
              <div className="container">
                <div className="prod-head">
                  <div>
                    <h2 className="prod-title">
                      {(
                        formData.products?.title ||
                        (formData.brandName
                          ? `Explore ${formData.brandName} Products`
                          : "Explore Products")
                      )
                        .split("\n")
                        .map((line, i, arr) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < arr.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                    </h2>
                  </div>
                  <div className="prod-arrows">
                    <button
                      aria-label="Previous"
                      className="btn icon-btn prev"
                      onClick={() => slide(-1)}
                      type="button"
                    >
                      <svg
                        className="arrow-icon"
                        viewBox="0 0 40 40"
                        aria-hidden="true"
                      >
                        <line x1="32" y1="20" x2="10" y2="20" />
                        <polyline points="18 12 10 20 18 28" />
                      </svg>
                    </button>
                    <button
                      aria-label="Next"
                      className="btn icon-btn next"
                      onClick={() => slide(1)}
                      type="button"
                    >
                      <svg
                        className="arrow-icon"
                        viewBox="0 0 40 40"
                        aria-hidden="true"
                      >
                        <line x1="8" y1="20" x2="30" y2="20" />
                        <polyline points="22 12 30 20 22 28" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="brand-prod-row no-user-scroll" ref={rowRef}>
                  {/* Show categories first if available */}
                  {categories &&
                    categories.length > 0 &&
                    categories.map((category, index) => {
                      const categoryImage =
                        imageUrls[`category-${index}`] || category.image || "";
                      const categoryHref =
                        category.href ||
                        `/products?brand=${formData.brandId}${
                          category.categoryId
                            ? `&category=${category.categoryId}`
                            : ""
                        }`;
                      return (
                        <article
                          key={`category-${
                            category.id || category.categoryId || index
                          }`}
                          className="brand-prod-card"
                        >
                          <div className="brand-prod-media">
                            {categoryImage && (
                              <img
                                src={categoryImage}
                                alt={category.title || "UBC food product category"}
                                style={{
                                  width:
                                    formData.styles?.products?.imageWidth ||
                                    "100%",
                                  height:
                                    formData.styles?.products?.imageHeight ||
                                    "auto",
                                  borderRadius: formData.styles?.products
                                    ?.imageBorderRadius
                                    ? `${formData.styles.products.imageBorderRadius}px`
                                    : "8px",
                                }}
                              />
                            )}
                          </div>
                          <div className="brand-prod-body">
                            <div className="brand-prod-header">
                              <div className="brand-prod-text-container">
                                {category.title && (
                                  <h3
                                    className="brand-prod-name"
                                    style={{
                                      fontSize: formData.styles?.products
                                        ?.productTitleFontSize
                                        ? `${formData.styles.products.productTitleFontSize}px`
                                        : "20px",
                                    }}
                                  >
                                    {category.title}
                                  </h3>
                                )}
                                {category.subtitle && (
                                  <p
                                    className="brand-prod-blurb"
                                    style={{
                                      fontSize: formData.styles?.products
                                        ?.productBlurbFontSize
                                        ? `${formData.styles.products.productBlurbFontSize}px`
                                        : "14px",
                                    }}
                                  >
                                    {category.subtitle}
                                  </p>
                                )}
                              </div>
                              <a
                                href={categoryHref}
                                className="chip-link"
                                style={{
                                  fontSize: formData.styles?.products
                                    ?.ctaFontSize
                                    ? `${formData.styles.products.ctaFontSize}px`
                                    : "14px",
                                }}
                              >
                                {formData.products?.cta || "Know More"}
                              </a>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  {/* Show products from Product Management */}
                  {products &&
                    products.length > 0 &&
                    products.map((product, index) => {
                      const productImage =
                        imageUrls[`product-${index}`] || product.image || "";
                      const productHref = `/products?brand=${formData.brandId}${
                        product.categoryId
                          ? `&category=${product.categoryId}`
                          : ""
                      }${product.id ? `#product-${product.id}` : ""}`;
                      return (
                        <article
                          key={`product-${product.id || index}`}
                          className="brand-prod-card"
                        >
                          <div className="brand-prod-media">
                            {productImage && (
                              <img
                                src={productImage}
                                alt={product.name || product.title || "UBC food product"}
                                style={{
                                  width:
                                    formData.styles?.products?.imageWidth ||
                                    "100%",
                                  height:
                                    formData.styles?.products?.imageHeight ||
                                    "auto",
                                  borderRadius: formData.styles?.products
                                    ?.imageBorderRadius
                                    ? `${formData.styles.products.imageBorderRadius}px`
                                    : "8px",
                                }}
                              />
                            )}
                          </div>
                          <div className="brand-prod-body">
                            <div className="brand-prod-header">
                              <div className="brand-prod-text-container">
                                {(product.name || product.title) && (
                                  <h3
                                    className="brand-prod-name"
                                    style={{
                                      fontSize: formData.styles?.products
                                        ?.productTitleFontSize
                                        ? `${formData.styles.products.productTitleFontSize}px`
                                        : "20px",
                                    }}
                                  >
                                    {product.name || product.title}
                                  </h3>
                                )}
                                {product.description && (
                                  <p
                                    className="brand-prod-blurb"
                                    style={{
                                      fontSize: formData.styles?.products
                                        ?.productBlurbFontSize
                                        ? `${formData.styles.products.productBlurbFontSize}px`
                                        : "14px",
                                    }}
                                  >
                                    {product.description}
                                  </p>
                                )}
                              </div>
                              <a
                                href={productHref}
                                className="chip-link"
                                style={{
                                  fontSize: formData.styles?.products
                                    ?.ctaFontSize
                                    ? `${formData.styles.products.ctaFontSize}px`
                                    : "14px",
                                }}
                              >
                                {formData.products?.cta || "Know More"}
                              </a>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );

  // This is a simplified version - we'll need to import the full editor form
  // For now, let's create a wrapper that uses the existing editor
  return (
    <div className="editor-with-preview-container">
      <div className="editor-panel">
        {/* We'll render a simplified form here or import the full editor */}
        <div className="editor-form">
          <h2>{page?.id ? "Edit Brand Page" : "Create Brand Page"}</h2>
          <p>Editor form will be integrated here...</p>
        </div>
      </div>
      {renderPreview()}
    </div>
  );
}
