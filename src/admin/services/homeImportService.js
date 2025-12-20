import { addHomeSection } from './homeService';
import heroVideo from '../../assets/trac.mp4';
import icon1 from '../../assets/Frame 208.png';
import icon2 from '../../assets/Frame 209.png';
import icon3 from '../../assets/Frame 210.png';
import soilKingLogo from '../../assets/Soil King.png';
import sunDropLogo from '../../assets/Sun Drop.png';
import avatar1 from '../../assets/Testimonial 1.png';
import avatar2 from '../../assets/Testimonial 2.png';
import avatar3 from '../../assets/Testimonial 3.png';
import avatar4 from '../../assets/Testimonial 4.png';
import logo from '../../assets/Logo1.png';
import bgImage from '../../assets/ov.png';

/**
 * Import all sections from the live website into the CMS
 * This extracts data from the current React components and converts them to CMS format
 */
export const importLiveWebsiteSections = async () => {
  const sections = [];

  // 1. Hero Section
  sections.push({
    name: 'Hero Section',
    type: 'hero',
    enabled: true,
    order: 0,
    content: {
      videoUrl: heroVideo, // This will be the imported video path
      heading: 'Crafting purity,\npreserving taste.',
      description: 'Built on trust. Driven by quality. Committed to you. These are the values behind every product We create, from the first harvest to the final pack. We are dedicated to bringing you everyday essentials that are pure, reliable, and crafted with care, making better choices for your home, your health, and the planet we share.',
      textAlignment: 'left',
      primaryButton: {
        text: 'Explore Products',
        link: '#products'
      },
      secondaryButton: {
        text: 'Get in contact',
        link: '/contact'
      }
    },
    styles: {}
  });

  // 2. Brands Section (Text + Image)
  sections.push({
    name: 'About Us Section',
    type: 'text-image',
    enabled: true,
    order: 1,
    content: {
      tag: '★ ABOUT US',
      heading: 'A Promise of Purity,\nfrom Our Fields to Your Home.',
      paragraph1: 'The United Brothers Company has been a trusted name in the FMCG industry, offering pure and authentic products for homes nationwide.',
      paragraph2: 'Our purpose is to deliver essentials that you can rely on, created with a commitment to quality and a legacy of taste.',
      textAlignment: 'left',
      image: '', // No image in current component
      button: {
        text: 'Know More',
        link: '/about'
      }
    },
    styles: {
      buttonBackgroundColor: '#323790',
      buttonTextColor: '#FFFFFF',
      buttonFontSize: 16,
      buttonFontWeight: '500'
    }
  });

  // 3. Why Section (Feature Cards)
  sections.push({
    name: 'Why Section',
    type: 'feature-cards',
    enabled: true,
    order: 2,
    content: {
      tag: '★ WHY',
      heading: 'Why United\nBrothers Company?',
      subtitle: 'The best products come from a combination of\nunwavering commitment and genuine care.',
      textAlignment: 'left',
      cards: [
        {
          icon: icon1,
          title: 'Commitment\nto Quality',
          description: 'We follow strict sourcing and production standards, ensuring top quality—certified by FSSAI, ISO, and HACCP.',
          link: ''
        },
        {
          icon: icon2,
          title: 'Legacy\nof Taste',
          description: "For generations, we've been preserving the authentic flavors of traditional Indian food, from our aromatic basmati rice to our flavorful masalas.",
          link: ''
        },
        {
          icon: icon3,
          title: 'Trusted\nby Millions',
          description: 'Our commitment to purity and taste has established us as a trusted household name worldwide.',
          link: ''
        }
      ]
    },
    styles: {}
  });

  // 4. Brands Carousel
  sections.push({
    name: 'Brands Carousel',
    type: 'carousel',
    enabled: true,
    order: 3,
    content: {
      tag: '★ OUR BRANDS',
      heading: 'Brands that Carry\nour Promise',
      description: 'Rooted in authenticity, our brands deliver\ntaste, tradition, and trust to millions',
      textAlignment: 'left',
      items: [
        {
          image: soilKingLogo,
          brandName: 'SOIL KING',
          title: 'Our Legacy\nin Every Brand',
          description: 'With Soil King, we celebrate tradition and taste\n— delivering carefully crafted products that\nfamilies trust every day.',
          link: '/brands',
          buttonColor: '#008562',
          buttonText: 'Learn more'
        },
        {
          image: sunDropLogo,
          brandName: 'SUN DROP',
          title: 'The Fresh Start\nYou Deserve',
          description: 'With Sun Drop, every product carries the\nwarmth of the sun and the richness of earth\n— created to uplift your meals and your day.',
          link: '/brands',
          buttonColor: '#FFC107',
          buttonText: 'Learn more'
        }
      ]
    },
    styles: {}
  });

  // 5. Categories Section (simplified - full import would be complex)
  sections.push({
    name: 'Categories Section',
    type: 'categories',
    enabled: true,
    order: 4,
    content: {
      tag: '★ CATEGORIES',
      heading: 'Explore our finest products\ncrafted for everyday flavor',
      textAlignment: 'left',
      categories: [] // Categories are complex, can be added manually
    },
    styles: {}
  });

  // 6. Overview Section
  sections.push({
    name: 'Overview Section',
    type: 'overview',
    enabled: true,
    order: 5,
    content: {
      tag: '★ OVERVIEW',
      heading: 'Where Tradition Meets Modern Taste',
      paragraph1: 'At UBC, we believe food should be both\nauthentic and effortless. Our products are\nsourced with care, processed with precision,\nand packed to preserve freshness.',
      paragraph2: 'From aromatic Basmati rice to vibrant spices\nand ready mixes, Soil King is your trusted\npartner in creating meals that feel homemade,\nevery single time.',
      image: logo,
      backgroundImage: bgImage,
      buttonText: 'Get in touch',
      buttonLink: '/contact',
      textAlignment: 'left'
    },
    styles: {}
  });

  // 7. Testimonials Section
  sections.push({
    name: 'Testimonials Section',
    type: 'testimonials',
    enabled: true,
    order: 6,
    content: {
      tag: '★ TESTIMONIALS',
      heading: 'Because Quality Speaks for Itself',
      textAlignment: 'left',
      testimonials: [
        {
          text: 'The Basmati rice from Soil King has<br/>become a staple in my home. The aroma<br/>and texture are unmatched.',
          name: 'Anita Reddy',
          company: 'Moove',
          role: 'Chef',
          image: avatar1
        },
        {
          text: 'As a chef, I value consistency.<br/>The spices from UBC bring<br/>authentic flavors  to every dish<br/>I prepare.',
          name: 'Rahul Jain',
          company: '',
          role: 'Chef',
          image: avatar2
        },
        {
          text: 'I appreciate how convenient<br/>the ready-to-use pastes are.<br/>They save me time without compromising on taste.',
          name: 'Aishwarya',
          company: '',
          role: 'Home Cook',
          image: avatar3
        },
        {
          text: 'Soil King products perfect<br/>balance between tradition and<br/>modern convenience. Truly impressive!',
          name: 'Anita Reddy',
          company: 'Moove',
          role: 'Chef',
          image: avatar4
        }
      ]
    },
    styles: {}
  });

  // 8. Tell Us Section
  sections.push({
    name: 'Tell Us Section',
    type: 'tell-us',
    enabled: true,
    order: 7,
    content: {
      tag: '★ TELL US',
      heading: 'Tell Us\nWhat You Need',
      description: 'Whether it\'s bulk orders, private\nlabeling, or partnerships —\nwe\'re here to help.',
      textAlignment: 'left',
      formFields: [
        { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Jonh' },
        { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Smith' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'John@gmail.com' },
        { 
          name: 'requirement', 
          label: 'Requirement', 
          type: 'select', 
          options: ['Bulk Orders', 'Private Labeling', 'Partnerships', 'General Inquiry'],
          defaultValue: 'Bulk Orders'
        },
        { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message here...' }
      ],
      submitButtonText: 'Submit Form'
    },
    styles: {}
  });

  // Add all sections to Firebase
  try {
    const results = [];
    for (const section of sections) {
      const id = await addHomeSection(section);
      results.push({ id, name: section.name });
    }
    return {
      success: true,
      message: `Successfully imported ${sections.length} sections from live website`,
      sections: results
    };
  } catch (error) {
    console.error('Error importing sections:', error);
    throw new Error(`Failed to import sections: ${error.message}`);
  }
};

/**
 * Check if sections already exist in the database
 */
export const checkExistingSections = async () => {
  try {
    const { getHomeSections } = await import('./homeService');
    const existing = await getHomeSections();
    return existing.length > 0;
  } catch (error) {
    console.error('Error checking existing sections:', error);
    return false;
  }
};

