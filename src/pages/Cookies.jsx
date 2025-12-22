import React, { useEffect, useState } from 'react';
import { getCookiesPolicy } from '../admin/services/cookiesPolicyService';
import './PrivacyPolicy.css'; // Reuse the same styles

export default function Cookies() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Cookies Policy - UBC | United Brothers Company';
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const data = await getCookiesPolicy();
      setPolicy(data);
    } catch (error) {
      console.error('Error loading cookies policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="privacy-policy-page">
        <div className="container">
          <div className="privacy-policy-content">
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!policy) {
    return (
      <main className="privacy-policy-page">
        <div className="container">
          <div className="privacy-policy-content">
            <div style={{ textAlign: 'center', padding: '40px' }}>Failed to load cookies policy.</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="privacy-policy-page">
      <div className="container">
        <div className="privacy-policy-content">
          <span className="tag">
            <span className="privacy-tag-star">{policy.tagStar || '★'}</span>
            <span className="privacy-tag-text">{policy.tagText || 'COOKIES POLICY'}</span>
          </span>

          <div className="privacy-policy-text">
            {policy.sections
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((section) => (
                <section key={section.id} className="privacy-section">
                  <h2>{section.title}</h2>
                  {section.content && <p>{section.content}</p>}
                  {section.listItems && section.listItems.length > 0 && (
                    <ul>
                      {section.listItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item.text }} />
                      ))}
                    </ul>
                  )}
                  {section.additionalContent && <p>{section.additionalContent}</p>}
                  {section.subsections && section.subsections.length > 0 && (
                    <>
                      {section.subsections
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((subsection, subIndex) => (
                          <div key={subsection.id || subIndex}>
                            <h3>{subsection.title}</h3>
                            {subsection.content && <p>{subsection.content}</p>}
                            {subsection.listItems && subsection.listItems.length > 0 && (
                              <ul>
                                {subsection.listItems.map((item, itemIndex) => (
                                  <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item.text }} />
                                ))}
                              </ul>
                            )}
                            {subsection.additionalContent && <p>{subsection.additionalContent}</p>}
                          </div>
                        ))}
                    </>
                  )}
                  {section.contactInfo && (
                    <div className="privacy-contact-info">
                      {section.contactInfo.email && (
                        <p><strong>Email:</strong> {section.contactInfo.email}</p>
                      )}
                      {section.contactInfo.phone && (
                        <p><strong>Phone:</strong> {section.contactInfo.phone}</p>
                      )}
                      {section.contactInfo.address && (
                        <p><strong>Address:</strong> {section.contactInfo.address}</p>
                      )}
                      {section.contactInfo.contactPageLink && (
                        <p>
                          You can also visit our{' '}
                          <a 
                            href={section.contactInfo.contactPageLink} 
                            style={{ color: '#323790', textDecoration: 'underline' }}
                          >
                            contact page
                          </a>{' '}
                          for more ways to reach us.
                        </p>
                      )}
                    </div>
                  )}
                </section>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}

