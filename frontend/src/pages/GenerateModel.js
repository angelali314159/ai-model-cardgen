import React, { useState, useEffect } from 'react';
import ModelCard from '../components/ModelCard';
import ModelDetailPopup from '../components/ModelDetailPopup';
import GenerateModelForm from './GenerateModelForm'; // Fixed import path
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
        const data = await response.json(); // Fixed: Only call json() once
        console.log('Fetched model cards successfully:', data);
        setModelCards(data);
      } else {
        console.error('Failed to fetch model cards:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching model cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCards = () => {
    // Fixed: Updated field names to match your database structure
    let filtered = modelCards.filter(card =>
      card.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.regulatory_approval_status_if_applicable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.keywords && Array.isArray(card.keywords) && 
       card.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Fixed: Updated sort fields to match database structure
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.model_name || '').localeCompare(b.model_name || '');
        case 'date':
          return new Date(b.release_date || 0) - new Date(a.release_date || 0);
        case 'developer':
          return (a.developer || '').localeCompare(b.developer || '');
        default:
          return 0;
      }
    });

    console.log('Filtered cards:', filtered); // Debug log
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
              <label>Regulatory Status:</label>
              <select className="filter-select">
                <option value="">All Status</option>
                <option value="FDA Approved">FDA Approved</option>
                <option value="CE Mark">CE Mark</option>
                <option value="Pending">Pending</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Clinical Risk Level:</label>
              <select className="filter-select">
                <option value="">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Release Stage:</label>
              <select className="filter-select">
                <option value="">All Stages</option>
                <option value="Production">Production</option>
                <option value="Beta">Beta</option>
                <option value="Alpha">Alpha</option>
                <option value="Development">Development</option>
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
              <p>
                {searchTerm 
                  ? `No model cards match "${searchTerm}". Try adjusting your search.`
                  : 'No model cards available yet. Generate your first one!'
                }
              </p>
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