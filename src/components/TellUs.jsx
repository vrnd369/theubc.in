import React, { useState } from 'react';
import './TellUs.css';

export default function TellUs(){
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    requirement: 'Traders and distributors',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <section className="tell-us-section">
      <div className="container">
        <div className="tell-us-content">
          <div className="tell-us-left">
            <span className="tell-us-tag">
              <span className="tell-us-star">★</span>
              <span className="tell-us-tag-text">TELL US</span>
            </span>
            <h2 className="tell-us-heading">
              Tell Us<br/><span style={{whiteSpace: 'nowrap'}}>What You Need</span>
            </h2>
            <p className="tell-us-description">
              Whether it's bulk orders, private<br/>
              labeling, or partnerships —<br/>
              we're here to help.
            </p>
          </div>
          <div className="tell-us-right">
            <form className="tell-us-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-wrapper">
                  <label htmlFor="firstName" className="input-label">First Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jonh"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label htmlFor="lastName" className="input-label">Last Name <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label htmlFor="email" className="input-label">Email <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="John@gmail.com"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label htmlFor="requirement" className="input-label">Requirement <span style={{ color: "#dc2626" }}>*</span></label>
                  <select
                    id="requirement"
                    name="requirement"
                    value={formData.requirement}
                    onChange={handleChange}
                    required
                  >
                    <option value="Traders and distributors">Traders and distributors</option>
                    <option value="Partnership">Partnership</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label htmlFor="message" className="input-label">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                  ></textarea>
                </div>
              </div>
              <button type="submit" className="tell-us-submit-btn">Submit Form</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

