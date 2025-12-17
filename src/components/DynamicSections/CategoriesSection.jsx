import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Categories from '../Categories';
import './DynamicSections.css';

/**
 * Categories Section wrapper for dynamic home page
 * The Categories component is self-contained and fetches its own data from Firebase
 */
export default function CategoriesSection({ content, styles = {} }) {
  const [searchParams] = useSearchParams();
  const brandFromUrl = searchParams.get('brand') || 'All';
  const categoryFromUrl = searchParams.get('category') || null;
  const [selectedBrand, setSelectedBrand] = useState(brandFromUrl);

  // Update selectedBrand when URL param changes
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    setSelectedBrand(brandParam || 'All');
  }, [searchParams]);

  // Extract styles - only non-dimension properties
  const backgroundColor = styles?.backgroundColor;

  // Build section style - only colors, NO dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }), // Only colors allowed
  };

  // Wrap Categories component with optional styling
  return (
    <div style={sectionStyle}>
      <Categories selectedBrand={selectedBrand} initialCategory={categoryFromUrl} />
    </div>
  );
}

