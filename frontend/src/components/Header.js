import React from 'react';
import '../styles/Header.css';
import MMLogo from './MM-Logo.png';
import MMText from './MedicalModelsHeader.png';


const Header = ({ activeTab, setActiveTab }) => {
  const tabs = ['Updates', 'Generate Model', 'About Us'];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo">
            <img src={MMLogo} alt="Medical AI" className="logo-image" onClick={() => setActiveTab("App")}/>
            <img src={MMText} alt="Medical Models" className="logo-text" onClick={() => setActiveTab("App")}/>
          </div>
        </div>
        
        <nav className="navigation">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;