import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import SectionTag from '../../../components/SectionTag';
import probgImage from '../../../assets/probg1.png';
import { resolveImageUrl } from '../../../utils/imageUtils';
import '../../../pages/ProductDetail.css';
import './ProductPreview.css';
import { RiceIcon, ClockIcon, SteamIcon, IsoIcon, LeafIcon, LightbulbIcon, TripleLayerIcon } from '../../../components/icons/RiceIcons';

export default function ProductPreview({ formData, brands, categories }) {
  // State for resolved image URLs
  const [resolvedImages, setResolvedImages] = useState({
    productImage: null,
    whyChooseBackground: null,
    pillarIcons: {}
  });

  // Transform formData to match ProductDetail component structure
  const product = {
    id: formData.id || 'preview',
    title: formData.title || 'Product Title',
    titleSub: formData.titleSub || '',
    category: formData.category || 'Product',
    description: formData.description || '',
    description2: formData.description2 || '',
    image: formData.image || '',
    sizes: formData.sizes || [],
    nutrition: formData.nutrition || [],
    benefits: formData.benefits || [],
    whyChooseTitle: formData.whyChooseTitle || '',
    whyChooseTitleAlign: formData.whyChooseTitleAlign || 'left',
    whyChooseBackground: formData.whyChooseBackground || probgImage,
    uspTag: formData.uspTag || '★ USP',
    uspTitle: formData.uspTitle || '',
    uspTitleAlign: formData.uspTitleAlign || 'left',
    titleAlign: formData.titleAlign || 'left',
    titleSubAlign: formData.titleSubAlign || 'left',
    descriptionAlign: formData.descriptionAlign || 'left',
    description2Align: formData.description2Align || 'left',
    titleFontSize: formData.titleFontSize,
    titleWidth: formData.titleWidth,
    titleSubFontSize: formData.titleSubFontSize,
    titleSubWidth: formData.titleSubWidth,
    descriptionFontSize: formData.descriptionFontSize,
    descriptionWidth: formData.descriptionWidth,
    pillars: formData.pillars || [],
    brandId: formData.brandId || '',
    categoryId: formData.categoryId || ''
  };

  // eslint-disable-next-line no-unused-vars
  const brand = brands?.find(b => b.id === product.brandId);

  // Resolve images when formData changes
  useEffect(() => {
    const resolveImages = async () => {
      const imagePromises = [];
      
      // Resolve main product image
      if (product.image) {
        imagePromises.push(
          resolveImageUrl(product.image).then(url => {
            setResolvedImages(prev => ({ ...prev, productImage: url }));
          }).catch(err => console.error('Error resolving product image:', err))
        );
      }
      
      // Resolve why choose background
      if (product.whyChooseBackground && product.whyChooseBackground !== probgImage) {
        imagePromises.push(
          resolveImageUrl(product.whyChooseBackground).then(url => {
            setResolvedImages(prev => ({ ...prev, whyChooseBackground: url }));
          }).catch(err => console.error('Error resolving why choose background:', err))
        );
      } else {
        setResolvedImages(prev => ({ ...prev, whyChooseBackground: probgImage }));
      }
      
      // Resolve pillar icons
      if (product.pillars && product.pillars.length > 0) {
        product.pillars.forEach((pillar, index) => {
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
      
      await Promise.all(imagePromises);
    };
    
    resolveImages();
  }, [product.image, product.whyChooseBackground, product.pillars]);

  const renderBenefitLines = (benefit) => {
    if (!benefit || !benefit.description) return null;
    const parts = benefit.description.split('<br/>');
    return (
      <div className="benefit-lines">
        {parts.map((part, idx) => (
          <p key={idx} className="benefit-line">{part}</p>
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
    <div className="product-preview-container">
      <div className="product-preview-wrapper">
        {/* Navbar */}
        <div className="product-preview-navbar">
          <Navbar />
        </div>

        {/* Product Detail Preview */}
        <main className="product-detail">
          <section className="product-detail-section">
            <div className="container">
              <div className="product-detail-grid">
                {/* Left: Product Image */}
                <div className="product-image-wrapper">
                  <div className="product-image-card">
                    {resolvedImages.productImage ? (
                      <img src={resolvedImages.productImage} alt={product.title} className="product-image" />
                    ) : product.image ? (
                      <div className="product-image-placeholder">
                        <span>Loading image...</span>
                      </div>
                    ) : (
                      <div className="product-image-placeholder">
                        <span>No Image</span>
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
                      textAlign: product.titleAlign || 'left',
                      fontSize: product.titleFontSize ? `${product.titleFontSize}px` : undefined,
                      width: product.titleWidth ? `${product.titleWidth}px` : undefined,
                    }}
                  >
                    {product.title}
                    {product.titleSub && (
                      <span 
                        className="product-title-sub" 
                        style={{ 
                          display: 'block', 
                          textAlign: product.titleSubAlign || 'left',
                          fontSize: product.titleSubFontSize ? `${product.titleSubFontSize}px` : undefined,
                          width: product.titleSubWidth ? `${product.titleSubWidth}px` : undefined,
                        }}
                      >
                        {product.titleSub}
                      </span>
                    )}
                  </h1>

                  {product.description && (
                    <p 
                      className="product-description" 
                      style={{ 
                        textAlign: product.descriptionAlign || 'left',
                        fontSize: product.descriptionFontSize ? `${product.descriptionFontSize}px` : undefined,
                        width: product.descriptionWidth ? `${product.descriptionWidth}px` : undefined,
                      }}
                    >
                      {product.description}
                    </p>
                  )}
                  {product.description2 && (
                    <p className="product-description-2" style={{ textAlign: product.description2Align || 'left' }}>
                      {product.description2}
                    </p>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <>
                      <div className="divider"></div>
                      <div className="available-sizes">
                        <h3 className="sizes-title">Available Sizes</h3>
                        <div className="sizes-list">
                          {product.sizes.map((size, index) => (
                            <button key={index} className="size-button">
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {product.nutrition && product.nutrition.length > 0 && (
                    <>
                      <div className="divider"></div>
                      <div className="nutritional-info">
                        <h3 className="nutrition-title">Nutritional Information (Per 100g)</h3>
                        <table className="nutrition-table">
                          <tbody>
                            {product.nutrition.map((item, index) => (
                              <tr key={index}>
                                <td className="nutrient">{item.nutrient}</td>
                                <td className="nutrient-val">{item.value}</td>
                                <td className="nutrient-dv">{item.dailyValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Section */}
          {product.whyChooseTitle && (
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
                    <h2 
                      className="why-choose-title" 
                      dangerouslySetInnerHTML={{
                        __html: product.whyChooseTitle
                          .replace(/{Product Name}/g, product.title)
                          .replace(/\n/g, '<br />')
                      }} 
                      style={{ textAlign: product.whyChooseTitleAlign || 'left' }}
                    />
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
          )}

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
                      <h2 
                        className="pillars-title" 
                        dangerouslySetInnerHTML={{
                          __html: (product.uspTitle || "The Four Pillars<br />of Our Quality Spice")
                            .replace(/<br\s*\/?>/gi, '<br />')
                            .replace(/\n/g, '<br />')
                        }} 
                        style={{ textAlign: product.uspTitleAlign || 'left' }}
                      />
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
                                    <img src={resolvedImages.pillarIcons[index] || pillar.icon} alt={enhancedPillar.title || `UBC quality pillar ${index + 1}`} />
                                  ) : riceIcon ? (
                                    riceIcon
                                  ) : null}
                                </div>
                              )}
                              {enhancedPillar.title && (
                                <h3 className="pillar-title">{enhancedPillar.title}</h3>
                              )}
                              {enhancedPillar.description && (
                                <p 
                                  className="pillar-description" 
                                  dangerouslySetInnerHTML={{
                                    __html: enhancedPillar.description.replace(/<br\s*\/?>/gi, '<br />')
                                  }} 
                                />
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
        </main>
      </div>
    </div>
  );
}

