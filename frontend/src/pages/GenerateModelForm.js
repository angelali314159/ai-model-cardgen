import React, { useState } from 'react';
import '../styles/GenerateModelForm.css';

const GenerateModelForm = ({ onModelGenerated }) => {
  const [applicationName, setApplicationName] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationName.trim()) {
      setError('Application name is required');
      return;
    }

    if (!applicationUrl.trim()) {
      setError('Application URL is required');
      return;
    }

    // Basic URL validation
    try {
      new URL(applicationUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/model-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationName: applicationName.trim(),
          applicationUrl: applicationUrl.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Model card generated successfully!');
        if (onModelGenerated) {
          onModelGenerated(data.data);
        }
        // Clear form after successful generation
        setTimeout(() => {
          handleReset();
        }, 2000);
      } else {
        setError(data.error || 'An error occurred while generating the model card');
      }
    } catch (err) {
      setError('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApplicationName('');
    setApplicationUrl('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="generate-model-page">
      <div className="page-header">
        <h1 className="page-title">Generate Model Card</h1>
        <p className="page-subtitle">
          Enter your application details to automatically generate a comprehensive AI model card
        </p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="generate-form">
          <div className="form-group">
            <label htmlFor="applicationName">
              Application Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="applicationName"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              placeholder="e.g., DermaSensor, PathAI Diagnostic Tool"
              disabled={loading}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="applicationUrl">
              Application URL <span className="required">*</span>
            </label>
            <input
              type="url"
              id="applicationUrl"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              placeholder="e.g., https://example.com, https://company.com/product"
              disabled={loading}
              className="input-field"
            />
            <small className="field-hint">
              Enter the main website or documentation URL for this AI application
            </small>
          </div>

          {error && (
            <div className="message error-message">
              <div className="message-icon">❌</div>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="message success-message">
              <div className="message-icon">✅</div>
              <p>{success}</p>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleReset} 
              className="reset-btn"
              disabled={loading}
            >
              Reset
            </button>
            <button 
              type="submit" 
              disabled={loading || !applicationName.trim() || !applicationUrl.trim()} 
              className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating Model Card...
                </>
              ) : (
                'Generate Model Card'
              )}
            </button>
          </div>
        </form>

        <div className="form-info">
          <h3>How it works:</h3>
          <ol>
            <li>Enter your AI application's name and URL</li>
            <li>Our system will scrape the website for relevant information</li>
            <li>AI will analyze the data and generate a comprehensive model card</li>
            <li>Review and download your model card when complete</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GenerateModelForm;