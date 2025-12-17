import React, { useState, useEffect, useRef } from 'react';
import '../pages/Home.css';
import { getHomeSections } from '../admin/services/homeService';
import SectionRenderer from './DynamicSections/SectionRenderer';

/**
 * Dynamic Home component that fetches sections from Firebase
 * Used for both the live website and CMS preview
 */
export default function DynamicHome({ forceRefresh = 0 }) {
  // Try to load from cache immediately
  const getCachedSections = () => {
    try {
      const cached = localStorage.getItem('ubc_home_sections');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 15 minutes old (extended for better performance)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 900000) {
          return parsed.data || [];
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return [];
  };

  const [sections, setSections] = useState(getCachedSections());
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const loadSections = async () => {
      try {
        setError(null);
        // Don't show loading spinner - use cached data immediately
        const allSections = await getHomeSections();
        
        // Cache the sections
        try {
          localStorage.setItem('ubc_home_sections', JSON.stringify({
            data: allSections,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }
        if (!isMounted) return;
        
        if (allSections && allSections.length > 0) {
          // Filter enabled sections and sort by order
          const enabled = allSections
            .filter(s => s.enabled !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          
          // Set sections IMMEDIATELY for instant rendering
          setSections(enabled);
        } else {
          // No sections found - new Firebase project is likely empty
          setSections([]);
        }
        hasLoadedRef.current = true;
      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading sections from CMS:', error);
        // Don't set error on refresh - use cached data if available
        const cachedSections = getCachedSections();
        if (cachedSections.length === 0) {
          setError(error.message || 'Failed to load home sections');
        }
        hasLoadedRef.current = true;
      }
    };

    loadSections();
    
    return () => {
      isMounted = false;
    };
  }, [forceRefresh]); // Reload when forceRefresh changes

  // Always render the main element to prevent layout shifts
  // Show content immediately if available, even if loading (prevents flickering)
  // Hide loading spinner - show content immediately from cache
  return (
    <main className="home" style={{ minHeight: '100vh', background: 'var(--ubc-bg)' }}>
      {error ? (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Error Loading Content</h2>
            <p>{error}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Please check your Firebase connection and ensure Firestore rules are configured correctly.
            </p>
          </div>
        </div>
      ) : sections.length === 0 && hasLoadedRef.current ? (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h2>No Content Found</h2>
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Your Firebase project appears to be empty. No home sections were found.
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              To add content:
            </p>
            <ol style={{ textAlign: 'left', marginTop: '1rem', color: '#666' }}>
              <li>Go to Admin Panel → Home Management</li>
              <li>Add home sections using the CMS</li>
              <li>Or migrate data from your old Firebase project</li>
            </ol>
          </div>
        </div>
      ) : sections.length > 0 ? (
        sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))
      ) : null}
    </main>
  );
}

