import React, { useState } from 'react';
import '../styles/ModelDetailPopup.css';

const ModelDetailPopup = ({ model, onClose }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality - save to localStorage or send to backend
    console.log(`Model ${isFavorited ? 'unfavorited' : 'favorited'}:`, model.model_name);
  };

  // Create tags from relevant fields
  const createTags = () => {
    const tags = [];
    
    if (model.clinical_risk_level) tags.push(model.clinical_risk_level);
    if (model.regulatory_approval_status_if_applicable) tags.push(model.regulatory_approval_status_if_applicable);
    if (model.release_stage) tags.push(model.release_stage);
    if (model.model_type) tags.push(model.model_type);
    if (model.keywords && Array.isArray(model.keywords)) {
      tags.push(...model.keywords.slice(0, 3)); // Limit to first 3 keywords
    }
    
    return tags.filter(tag => tag && tag !== 'N/A');
  };

  // Fields to exclude from the detail list (already shown in header/tags/summary)
  const excludedFields = [
    'model_name', 
    'developer', 
    'summary', 
    'clinical_risk_level', 
    'regulatory_approval_status_if_applicable', 
    'release_stage', 
    'model_type',
    'keywords'
  ];

  const renderDetailFields = () => {
    return Object.entries(model)
      .filter(([key, value]) => !excludedFields.includes(key) && value && value !== 'N/A')
      .map(([key, value]) => {
        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
        
        return (
          <div key={key} className="detail-row">
            <div className="detail-key">{displayKey}</div>
            <div className="detail-value">{displayValue}</div>
          </div>
        );
      });
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-container">
        {/* Header with close and favorite buttons */}
        <div className="popup-header">
          <div className="header-buttons">
            <button 
              className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={toggleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? '★' : '☆'}
            </button>
            <button className="close-btn" onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        <div className="popup-content">
          {/* Model name */}
          <div className="model-title">
            <h1>{model.model_name || 'Unnamed Model'}</h1>
          </div>

          {/* Developer info */}
          <div className="developer-info">
            <p>Developed by <strong>{model.developer || 'Unknown Developer'}</strong></p>
          </div>

          {/* Tags */}
          <div className="tags-section">
            {createTags().map((tag, index) => (
              <span key={index} className="tag-bubble">
                {tag}
              </span>
            ))}
          </div>

          {/* Summary */}
          {model.summary && (
            <div className="summary-section">
              <h3>Summary</h3>
              <p>{model.summary}</p>
            </div>
          )}

          {/* Detail fields */}
          <div className="details-section">
            {renderDetailFields()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPopup;