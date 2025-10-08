import React from 'react';
import '../styles/ModelCard.css';

const ModelCard = ({ model, onLearnMore }) => {
  const getRiskLevelColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="model-card">
      <div className="card-header">
        <h3 className="card-title">{model.name || 'Unnamed Model'}</h3>
        <div className="card-badges">
          {model.regulatory_org && (
            <span className="badge regulatory">
              {model.regulatory_org}
            </span>
          )}
          {model.clinical_risk_level && (
            <span 
              className="badge risk-level"
              style={{ backgroundColor: getRiskLevelColor(model.clinical_risk_level) }}
            >
              {model.clinical_risk_level} Risk
            </span>
          )}
        </div>
      </div>

      <div className="card-content">
        <div className="info-row">
          <span className="info-label">Developer:</span>
          <span className="info-value">
            {model.developer_name || model.review_name || 'Unknown'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Last Updated:</span>
          <span className="info-value">
            {formatDate(model.updated_at || model.created_at)}
          </span>
        </div>

        {model.primary_intended_users && (
          <div className="info-row">
            <span className="info-label">Intended Users:</span>
            <span className="info-value">
              {Array.isArray(model.primary_intended_users) 
                ? model.primary_intended_users.slice(0, 2).join(', ')
                : model.primary_intended_users
              }
              {Array.isArray(model.primary_intended_users) && model.primary_intended_users.length > 2 && '...'}
            </span>
          </div>
        )}

        {model.summary && (
          <div className="card-summary">
            <p>{model.summary.substring(0, 120)}...</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="card-stats">
          <span className="stat">
            📊 {Object.keys(model).length} fields
          </span>
        </div>
        <button 
          className="learn-more-btn"
          onClick={() => onLearnMore(model)}
        >
          Learn More →
        </button>
      </div>
    </div>
  );
};

export default ModelCard;