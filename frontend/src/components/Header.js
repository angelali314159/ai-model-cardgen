import React from 'react';
import '../styles/Header.css';

const Header = ({ activeTab, setActiveTab }) => {
  const tabs = ['Updates', 'Generate Model', 'About Us'];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo">
            <img src="/logo.png" alt="Medical AI" className="logo-image" onClick={() => setActiveTab("App")}/>
            <span className="logo-text">Medical Models</span>
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