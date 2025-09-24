import React, { useState } from 'react';
import './ModelCardGenerator.css';

const ModelCardGenerator = () => {
  const [modelName, setModelName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!modelName.trim()) {
      setError('Model name is required');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call your backend API
      const response = await fetch('/api/model-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName: modelName.trim(),
          developerName: developerName.trim() || 'Unknown Developer'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setModelName('');
    setDeveloperName('');
    setResult(null);
    setError('');
  };

  return (
    <div className="model-card-generator">
      <header className="header">
        <h1>🚀 AI Model Card Generator</h1>
        <p>Generate comprehensive AI model cards by checking database or web scraping</p>
      </header>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-group">
          <label htmlFor="modelName">
            Model Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modelName"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., DermaSensor, Derm Foundation"
            disabled={loading}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="developerName">
            Developer Name <span className="optional">(optional)</span>
          </label>
          <input
            type="text"
            id="developerName"
            value={developerName}
            onChange={(e) => setDeveloperName(e.target.value)}
            placeholder="e.g., Google Developer, Microsoft"
            disabled={loading}
            className="input-field"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Generate Model Card'
            )}
          </button>
          
          {result && (
            <button type="button" onClick={handleReset} className="reset-btn">
              Reset
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-container">
          <h2>📊 Model Card Results</h2>
          
          {result.source === 'database' ? (
            <div className="source-info database">
              <span className="source-badge">📂 From Database</span>
              <p>Found existing model card in database</p>
            </div>
          ) : (
            <div className="source-info generated">
              <span className="source-badge">🔄 Generated</span>
              <p>New model card generated via web scraping</p>
            </div>
          )}

          <div className="model-info">
            <div className="info-header">
              <h3>{result.data.name || result.data.model_name || 'Unknown Model'}</h3>
              <div className="meta-info">
                <span>📅 {new Date(result.timestamp).toLocaleDateString()}</span>
                <span>🔧 {result.data.developer_name || result.data.review_name || 'Unknown Developer'}</span>
              </div>
            </div>

            <div className="key-fields">
              <h4>🔑 Key Information</h4>
              <div className="fields-grid">
                {result.data.summary && (
                  <div className="field">
                    <strong>Summary:</strong>
                    <p>{result.data.summary}</p>
                  </div>
                )}
                
                {result.data.regulatory_org && (
                  <div className="field">
                    <strong>Regulatory Organization:</strong>
                    <p>{result.data.regulatory_org}</p>
                  </div>
                )}
                
                {result.data.clinical_risk_level && (
                  <div className="field">
                    <strong>Clinical Risk Level:</strong>
                    <p>{result.data.clinical_risk_level}</p>
                  </div>
                )}
                
                {result.data.primary_intended_users && (
                  <div className="field">
                    <strong>Intended Users:</strong>
                    <p>{Array.isArray(result.data.primary_intended_users) 
                        ? result.data.primary_intended_users.join(', ') 
                        : result.data.primary_intended_users}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="full-data">
              <details>
                <summary>📋 View Full Model Card Data</summary>
                <pre className="json-display">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>

            <div className="actions">
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))}
                className="copy-btn"
              >
                📋 Copy JSON
              </button>
              <a 
                href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result.data, null, 2))}`}
                download={`${result.data.name || 'model-card'}.json`}
                className="download-btn"
              >
                💾 Download JSON
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelCardGenerator;