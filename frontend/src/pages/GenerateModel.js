import React, { useState, useEffect } from 'react';
import ModelCard from '../components/ModelCard';
import ModelDetailPopup from '../components/ModelDetailPopup';
import GenerateModelForm from './GenerateModelForm';
import '../styles/GenerateModel.css';

const GenerateModel = () => {
  const [modelCards, setModelCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [selectedModel, setSelectedModel] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelCards();
  }, []);

  useEffect(() => {
    filterAndSortCards();
  }, [modelCards, searchTerm, sortBy]);

  const fetchModelCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/model-cards');
      if (response.ok) {
        const data = await response.json();
        setModelCards(data);
      }
    } catch (error) {
      console.error('Error fetching model cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCards = () => {
    let filtered = modelCards.filter(card =>
      card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.developer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.regulatory_org?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort cards
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'developer':
          return (a.developer_name || '').localeCompare(b.developer_name || '');
        default:
          return 0;
      }
    });

    setFilteredCards(filtered);
  };

  const handleModelGenerated = (newModel) => {
    setModelCards(prev => [newModel, ...prev]);
    setShowGenerateForm(false);
  };

  return (
    <div className="generate-model-page">
      <div className="page-header">
        <h1 className="page-title">Medical AI Model Card Generator</h1>
        <p className="page-subtitle">
          Generate AI model cards for medical AI systems in one simple step
        </p>
      </div>

      <div className="content-section">
        <div className="controls-bar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search model cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
            
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🔧 Filters
            </button>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="developer">Sort by Developer</option>
            </select>
          </div>

          <button 
            className="generate-new-btn"
            onClick={() => setShowGenerateForm(true)}
          >
            ➕ Generate New Model Card
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Regulatory Organization:</label>
              <select className="filter-select">
                <option value="">All Organizations</option>
                <option value="FDA">FDA</option>
                <option value="CE">CE Mark</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Risk Level:</label>
              <select className="filter-select">
                <option value="">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
          </div>
        )}

        <div className="model-cards-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading model cards...</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="empty-state">
              <h3>No model cards found</h3>
              <p>Try adjusting your search or generate a new model card</p>
              <button 
                className="generate-first-btn"
                onClick={() => setShowGenerateForm(true)}
              >
                Generate Your First Model Card
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredCards.map((card, index) => (
                <ModelCard
                  key={card._id || index}
                  model={card}
                  onLearnMore={() => setSelectedModel(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedModel && (
        <ModelDetailPopup
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}

      {showGenerateForm && (
        <GenerateModelForm
          onClose={() => setShowGenerateForm(false)}
          onModelGenerated={handleModelGenerated}
        />
      )}
    </div>
  );
};

export default GenerateModel;