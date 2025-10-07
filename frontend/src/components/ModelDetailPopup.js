import React, { useState } from 'react';
import '../styles/ModelDetailPopup.css';

const ModelDetailPopup = ({ model, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(model, null, 2));
    alert('Model data copied to clipboard!');
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(model, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${model.name || 'model-card'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <div className="overview-grid">
              <div className="overview-item">
                <h4>Model Name</h4>
                <p>{model.name || 'N/A'}</p>
              </div>
              <div className="overview-item">
                <h4>Developer</h4>
                <p>{model.developer_name || model.review_name || 'N/A'}</p>
              </div>
              <div className="overview-item">
                <h4>Regulatory Organization</h4>
                <p>{model.regulatory_org || 'N/A'}</p>
              </div>
              <div className="overview-item">
                <h4>Risk Level</h4>
                <p>{model.clinical_risk_level || 'N/A'}</p>
              </div>
              <div className="overview-item">
                <h4>Intended Users</h4>
                <p>{Array.isArray(model.primary_intended_users) 
                    ? model.primary_intended_users.join(', ') 
                    : model.primary_intended_users || 'N/A'}
                </p>
              </div>
            </div>
            {model.summary && (
              <div className="summary-section">
                <h4>Summary</h4>
                <p>{model.summary}</p>
              </div>
            )}
          </div>
        );
      
      case 'clinical':
        return (
          <div className="tab-content">
            <div className="clinical-info">
              {model.clinical_impact_1 && (
                <div className="clinical-section">
                  <h4>Clinical Impact</h4>
                  <p>{model.clinical_impact_1}</p>
                </div>
              )}
              {model.clinical_impact_2 && (
                <div className="clinical-section">
                  <h4>Additional Clinical Information</h4>
                  <p>{model.clinical_impact_2}</p>
                </div>
              )}
              {model.regulatory_info && (
                <div className="clinical-section">
                  <h4>Regulatory Information</h4>
                  <p>{model.regulatory_info}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'technical':
        return (
          <div className="tab-content">
            <div className="technical-grid">
              {Object.entries(model).map(([key, value]) => {
                if (['_id', 'name', 'summary', 'clinical_impact_1', 'clinical_impact_2', 'regulatory_info'].includes(key)) {
                  return null;
                }
                return (
                  <div key={key} className="technical-item">
                    <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                    <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'raw':
        return (
          <div className="tab-content">
            <pre className="json-display">
              {JSON.stringify(model, null, 2)}
            </pre>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-container">
        <div className="popup-header">
          <h2>{model.name || 'Model Details'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="popup-tabs">
          {['overview', 'clinical', 'technical', 'raw'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="popup-content">
          {renderTabContent()}
        </div>

        <div className="popup-actions">
          <button className="action-btn copy-btn" onClick={copyToClipboard}>
            📋 Copy JSON
          </button>
          <button className="action-btn download-btn" onClick={downloadJSON}>
            💾 Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPopup;