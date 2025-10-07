import React from 'react';
import '../styles/AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Us</h1>
        <p>Learn more about our mission and the Medical AI Model Card Generator</p>
      </div>
      
      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            We aim to improve transparency and accountability in medical AI systems
            by providing comprehensive, standardized model cards that help healthcare
            professionals understand and trust AI-driven medical decisions.
          </p>
        </section>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>🤖 Automated Generation</h3>
              <p>Generate comprehensive model cards automatically using web scraping and AI</p>
            </div>
            <div className="feature-item">
              <h3>📊 Standardized Format</h3>
              <p>All model cards follow industry standards for medical AI documentation</p>
            </div>
            <div className="feature-item">
              <h3>🔍 Easy Discovery</h3>
              <p>Search and filter through existing model cards with powerful tools</p>
            </div>
            <div className="feature-item">
              <h3>📋 Export Options</h3>
              <p>Download model cards in various formats for integration with your systems</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;