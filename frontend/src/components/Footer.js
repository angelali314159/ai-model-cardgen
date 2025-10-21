import React from 'react';
import '../styles/Footer.css';
import MMLogo from './MM-Logo.png';
import MMText from './MedicalModelsHeader.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left side - Logo and tagline */}
          <div className="footer-left">
            <div className="footer-logo">
              <img src={MMLogo} alt="MedAI Cards" className="footer-logo-image" />
              <img src={MMText} alt="Medical Models" className="footer-logo-text" />
            </div>
            <h1 className="footer-tagline">Bring Clarity to Your Insights</h1>
          </div>

          {/* Right side - Three columns */}
          <div className="footer-right">
            {/* AI Models Column */}
            <div className="footer-column">
              <h3 className="column-heading">AI Models</h3>
              <ul className="column-links">
                <li><a href="/newest">Newest</a></li>
                <li><a href="/saved">Saved</a></li>
                <li><a href="/recent">Recently Used</a></li>
              </ul>
            </div>

            {/* Join Us Column */}
            <div className="footer-column">
              <h3 className="column-heading">Join Us</h3>
              <ul className="column-links">
                <li><a href="/add-model">Add a Model</a></li>
                <li><a href="/partners">For Partners</a></li>
                <li><a href="/contributors">Contributors</a></li>
                <li><a href="/faqs">FAQs</a></li>
              </ul>
            </div>

            {/* Team Column */}
            <div className="footer-column">
              <h3 className="column-heading">Team</h3>
              <ul className="column-links">
                <li><a href="/about">About Us</a></li>
                <li><a href="/community">Community</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <p>
            AI models should not be used alone to guide patient care, nor should they substitute for clinical judgement. 
            <a href="/disclaimer" className="disclaimer-link"> See our full disclaimer</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;