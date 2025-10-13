import React from 'react';
import '../styles/ModelCard.css';

const ModelCard = ({ model, onLearnMore }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'YYYY-MM-DD') return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getCitationCount = () => {
    if (model.peer_reviewed_publications && Array.isArray(model.peer_reviewed_publications)) {
      return model.peer_reviewed_publications.length;
    }
    return 0;
  };

  const truncateSummary = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="model-card">
      {/* Model name - largest font */}
      <div className="card-title-section">
        <h3 className="model-name">{model.model_name || 'Unnamed Model'}</h3>
      </div>

      {/* Developer info */}
      <div className="developer-section">
        <p className="developer-info">
          Developed by <strong>{model.developer || 'Unknown Developer'}</strong>
        </p>
      </div>

      {/* Keywords tags in ovals */}
      {model.keywords && Array.isArray(model.keywords) && model.keywords.length > 0 && (
        <div className="tags-section">
          {model.keywords.slice(0, 4).map((keyword, index) => (
            <span key={index} className="keyword-tag">
              {keyword}
            </span>
          ))}
          {model.keywords.length > 4 && (
            <span className="keyword-tag more-tags">+{model.keywords.length - 4}</span>
          )}
        </div>
      )}

      {/* Summary preview */}
      {model.summary && (
        <div className="summary-preview">
          <p>{truncateSummary(model.summary)}</p>
        </div>
      )}

      {/* Bottom section with details and learn more */}
      <div className="card-footer">
        <div className="card-details">
          <div className="detail-row">
            <span className="detail-label">Citations:</span>
            <span className="detail-value">{getCitationCount()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Version:</span>
            <span className="detail-value">{model.version || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">{formatDate(model.release_date)}</span>
          </div>
        </div>

        <div className="learn-more-section">
          <button className="learn-more-btn" onClick={() => onLearnMore(model)}>
            <span>Learn More</span>
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;