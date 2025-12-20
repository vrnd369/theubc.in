import { addAboutSection, getAboutSections, updateAboutSection } from "./aboutService";
import { uploadImage } from "./imageService";

// Import all images from assets
import buildingImg from "../../assets/about us image.png";
import certFSSC from "../../assets/fssac.png";
import certFSSAI from "../../assets/fssai.png";
import certISO from "../../assets/iso.png";
import newsSoilKing from "../../assets/Genesis Creative 12.png";
import newsFSSC from "../../assets/Genesis Creative 16.png";
import newsExpo from "../../assets/Genesis Creative 14.png";
import newsMEA from "../../assets/Genesis Creative 15.png";
import jameelKhanImg from "../../assets/Frame 231.png";
import taherKhanImg from "../../assets/Frame 232.png";
import bilalKhanImg from "../../assets/Frame 234.png";
import abdurRahmanKhanImg from "../../assets/Frame 235.png";

/**
 * Convert image asset path to base64 data URL
 */
const imagePathToBase64 = async (imagePath) => {
  if (!imagePath) return null;
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("data:") ||
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://"))
  ) {
    return imagePath;
  }
  try {
    const response = await fetch(imagePath);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${imagePath}`);
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error converting image to base64: ${imagePath}`, error);
    return null;
  }
};

/**
 * Process image: convert to base64 and upload to Firestore, return image ID
 */
const processImage = async (imagePath, imageName) => {
  if (!imagePath) return null;
  if (typeof imagePath === "string" && imagePath.startsWith("data:")) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], imageName || "image.png", { type: blob.type });
      const imageId = await uploadImage(file, imageName || "image.png");
      return imageId;
    } catch (error) {
      console.error("Error uploading base64 image:", error);
      return null;
    }
  }
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
  ) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const fileName = imageName || imagePath.split("/").pop() || "image.png";
      const file = new File([blob], fileName, { type: blob.type });
      const imageId = await uploadImage(file, fileName);
      return imageId;
    } catch (error) {
      console.error("Error uploading http image:", error);
      return null;
    }
  }
  try {
    const base64DataUrl = await imagePathToBase64(imagePath);
    if (!base64DataUrl) return null;
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();
    const fileName = imageName || imagePath.split("/").pop() || "image.png";
    const file = new File([blob], fileName, { type: blob.type });
    const imageId = await uploadImage(file, fileName);
    return imageId;
  } catch (error) {
    console.error("Error processing image:", imagePath, error);
    return null;
  }
};

export const importLiveAboutSections = async () => {
  const sections = [];
  console.log("Processing images for import...");
  const buildingImgId = await processImage(buildingImg, "about-us-hero.png");
  const jameelKhanImgId = await processImage(jameelKhanImg, "jameel-khan.png");
  const taherKhanImgId = await processImage(taherKhanImg, "taher-khan.png");
  const bilalKhanImgId = await processImage(bilalKhanImg, "bilal-khan.png");
  const abdurRahmanKhanImgId = await processImage(abdurRahmanKhanImg, "abdur-rahman-khan.png");
  const certFSSCId = await processImage(certFSSC, "fssc-cert.png");
  const certFSSAIId = await processImage(certFSSAI, "fssai-cert.png");
  const certISOId = await processImage(certISO, "iso-cert.png");
  const newsSoilKingId = await processImage(newsSoilKing, "news-soil-king.png");
  const newsFSSCId = await processImage(newsFSSC, "news-fssc.png");
  const newsExpoId = await processImage(newsExpo, "news-expo.png");
  const newsMEAId = await processImage(newsMEA, "news-mea.png");

  sections.push({
    name: "Hero Section",
    type: "hero",
    enabled: true,
    order: 0,
    content: { image: buildingImgId },
    styles: {
      imageHeight: null,
      imageMinHeight: 500,
      backgroundColor: "#FFFFFF",
      sectionPaddingTop: null,
      sectionPaddingBottom: null,
      containerMaxWidth: null,
    },
  });

  sections.push({
    name: "Leaders Section",
    type: "leaders",
    enabled: true,
    order: 1,
    content: {
      tag: "★ LEADERS",
      foundersHeading: "Who Were the Founders",
      foundersSubtitle: "Shaping the legacy with passion, purpose, and pioneering vision.",
      leadersHeading: "Who Are the Leaders",
      leadersSubtitle: "Steering the legacy with vision, integrity, and forward thinking.",
      founders: [
        { id: 1, name: "Mr. Jameel Khan", role: "The Grandfather", image: jameelKhanImgId },
        { id: 2, name: "Mr. Taher Khan", role: "The Father", image: taherKhanImgId },
      ],
      leaders: [
        { id: 3, name: "Mr. Bilal Khan", role: "Managing Director", image: bilalKhanImgId },
        { id: 4, name: "Mr. Abdur Rahman Khan", role: "Managing Director", image: abdurRahmanKhanImgId },
      ],
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#FFFFFF",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
      imageFilter: "grayscale",
      imageHoverEffect: true,
    },
  });

  sections.push({
    name: "Founding Story Section",
    type: "story",
    enabled: true,
    order: 2,
    content: {
      headingLine1: "Our Founding Story:",
      headingLine2: "A Legacy of Values",
      paragraph1: 'The United Brothers Company (UBC) carries forward the vision of two remarkable leaders: Mr. Jameel Khan, the grandfather, and Mr. Taher Khan, the father. For over eight decades, through the parent company Char Bhai (Four Brothers), they successfully managed businesses in sectors like tobacco, real estate, and technology, all while upholding exceptional values.\nTheir lifelong principle was simple yet profound: "Never differ in weight. Never cut down on quality. Always give what you would prefer for yourself and your family because customers are our family."',
      paragraph2: "While it may have sounded unusual that entrepreneurs in the tobacco industry ventured into the Food FMCG, their reason was pure and sincere: to provide authentic, unadulterated food products. As the family grew, like-minded brothers united under this philosophy, and thus, the United Brothers Company, the successor to Four Brothers, was founded to dedicate itself to serving people with purity and honesty.",
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#f8f9fa",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
    },
  });

  sections.push({
    name: "Vision Section",
    type: "vision",
    enabled: true,
    order: 3,
    content: {
      badgeText: "VISION",
      badgeIcon: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
      headingLine1: "The Thought",
      headingLine2: "Behind Starting UBC",
      leadParagraph: "United Brothers Company was founded post-COVID, in 2021, with a clear purpose: to sell pure food. The pandemic was a turning point; it reminded us that good food means good health, and health can only be maintained with uncompromised quality.",
      mutedParagraph: "Observing how earlier generations were stronger and healthier, we realized that their secret is simple: they consumed unadulterated, natural food. This understanding shaped UBC's foundation. Though our FMCG food journey seems new, we have experience in handling FMCG food products through exports since the early 2000s. What's new is our renewed commitment to deliver purity at scale.",
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#FFFFFF",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
    },
  });

  sections.push({
    name: "Mission Section",
    type: "mission",
    enabled: true,
    order: 4,
    content: {
      badgeText: "MISSION",
      badgeIcon: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
      headingLine1: "Our Goal for",
      headingLine2: "the Coming Years",
      leadParagraph: "Looking ahead, our mission is to earn and safeguard customer trust. We believe quality and price go hand in hand: with quality comes price.",
      mutedParagraph: "While our products may cost slightly more than competitors', they are never exorbitantly priced. Instead, they promise far superior quality, consistency, and safety, a value that customers will experience with every purchase.",
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#f3f4f6",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
    },
  });

  sections.push({
    name: "Infrastructure Section",
    type: "infrastructure",
    enabled: true,
    order: 5,
    content: {
      badgeText: "INFRASTRUCTURE",
      badgeIcon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      headingLine1: "Infrastructure",
      headingLine2: "and Facilities",
      items: [
        { index: "(01)", title: "Manufacturing Facility", text: "Over 50,000 sq. ft. of production space equipped with advanced technology, providing the scale and precision necessary", mutedText: "to meet global demand while maintaining our high standards of excellence." },
        { index: "(02)", title: "In-House Laboratory", text: "A dedicated, state-of-the-art facility focused on rigorous quality control and food safety protocols,", mutedText: "ensuring every batch consistently meets and exceeds both regulatory and customer expectations." },
        { index: "(03)", title: "Office Space", text: "A vibrant and inspiring 7,500 sq. ft. workspace, designed to foster creativity and teamwork.", mutedText: "Co-located with our factory, this space facilitates seamless collaboration between our production and corporate teams." },
        { index: "(04)", title: "UB House (Upcoming HQ)", text: "Our future headquarters will serve as a corporate office, a creative hub with an in-house studio for product shoots, and a center for employee well-being,", mutedText: "reflecting our belief that great work happens in great vibes." },
      ],
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#FFFFFF",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
    },
  });

  sections.push({
    name: "Certification Section",
    type: "certification",
    enabled: true,
    order: 6,
    content: {
      badgeText: "★ CERTIFICATION",
      headingLine1: "Our Commitment",
      headingLine2: "to Quality",
      subtitle: "A promise of purity, safety, and trust.",
      intro1: "This page reflects United Brothers Company's (UBC) unwavering commitment to quality and consumer trust.",
      intro2: "Every product is pure, safe, and of the highest standard. For us, quality is not a buzzword — it's our foundation.",
      certs: [
        { id: "fssc", logo: certFSSCId, title: "FSSC 22000", desc: "The world's most respected food safety certification." },
        { id: "fssai", logo: certFSSAIId, title: "FSSAI", desc: "Licensed under India's Food Safety and Standards Authority." },
        { id: "iso", logo: certISOId, title: "ISO 22000", desc: "Meeting international food safety management benchmarks." },
      ],
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#f3f4f6",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
    },
  });

  sections.push({
    name: "Sustainability Section",
    type: "sustainability",
    enabled: true,
    order: 7,
    content: {
      badgeText: "SUSTAINABILITY",
      badgeIcon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      headingLine1: "Sustainability",
      headingLine2: "Initiatives",
      subtitle: "UBC is committed to serving not just its customers, but also the planet.",
      items: [
        { index: "(01)", title: "Ethical Sourcing", text: "Partnering with farmers and suppliers who follow sustainable and ethical methods." },
        { index: "(02)", title: "Waste Management", text: "Reducing food waste and recycling by-products wherever possible." },
        { index: "(03)", title: "Community Engagement", text: "Creating employment and supporting farmer communities to build sustainable livelihoods." },
      ],
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#FFFFFF",
      sectionPaddingTop: 80,
      sectionPaddingBottom: 80,
      containerMaxWidth: 1280,
    },
  });

  sections.push({
    name: "Media & News Section",
    type: "news",
    enabled: true,
    order: 8,
    content: {
      badgeText: "★ NEWS",
      heading: "Media & News",
      subtitle: "From new launches to community initiatives, stay connected with everything happening at United Brothers Company.",
      showViewAllButton: false,
      viewAllButtonText: "View all",
      news: [
        { id: "soil-king", image: newsSoilKingId, title: "Launch of Soil King Spices range now available pan-India", tag: "Announcements" },
        { id: "fssc-22000", image: newsFSSCId, title: "UBC achieves FSSC 22000 certification milestone", tag: "Press Releases" },
        { id: "world-food-expo", image: newsExpoId, title: "UBC at World Food Expo, Dubai.", tag: "Events" },
        { id: "middle-east", image: newsMEAId, title: "UBC expands to Middle East markets.", tag: "Press Releases" },
      ],
      textAlignment: "left",
    },
    styles: {
      backgroundColor: "#000000",
      sectionPaddingTop: 88,
      sectionPaddingBottom: 88,
      containerMaxWidth: 1280,
    },
  });

  try {
    // Get existing sections to check for duplicates
    const existingSections = await getAboutSections();
    
    // Create a map of existing sections by type for quick lookup
    const existingByType = {};
    existingSections.forEach((section) => {
      if (section.type && !existingByType[section.type]) {
        existingByType[section.type] = section;
      }
    });

    const results = [];
    let updatedCount = 0;
    let addedCount = 0;

    for (const section of sections) {
      // Check if a section of this type already exists
      const existingSection = existingByType[section.type];
      
      if (existingSection) {
        // Update existing section instead of creating duplicate
        await updateAboutSection(existingSection.id, {
          name: section.name,
          type: section.type,
          enabled: section.enabled,
          order: section.order,
          content: section.content,
          styles: section.styles,
        });
        results.push({ id: existingSection.id, name: section.name, action: "updated" });
        updatedCount++;
      } else {
        // Add new section only if it doesn't exist
        const id = await addAboutSection(section);
        results.push({ id, name: section.name, action: "added" });
        addedCount++;
        // Update the map to prevent duplicates if same type appears multiple times
        existingByType[section.type] = { id, type: section.type };
      }
    }
    
    const actionSummary = [];
    if (updatedCount > 0) {
      actionSummary.push(`${updatedCount} updated`);
    }
    if (addedCount > 0) {
      actionSummary.push(`${addedCount} added`);
    }
    
    return {
      success: true,
      message: `Successfully imported ${sections.length} sections from live About page (${actionSummary.join(", ")})`,
      sections: results,
      updatedCount,
      addedCount,
    };
  } catch (error) {
    console.error("Error importing about sections:", error);
    throw new Error(`Failed to import sections: ${error.message}`);
  }
};

export const checkExistingAboutSections = async () => {
  try {
    const existing = await getAboutSections();
    return existing.length > 0;
  } catch (error) {
    console.error("Error checking existing about sections:", error);
    return false;
  }
};

