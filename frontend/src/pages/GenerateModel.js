import React, { useState, useEffect, useRef } from 'react';
import ModelCard from '../components/ModelCard';
import ModelDetailPopup from '../components/ModelDetailPopup';
import GenerateModelForm from './GenerateModelForm';
import '../styles/GenerateModel.css';

const GenerateModel = () => {
  const [modelCards, setModelCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [selectedModel, setSelectedModel] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchModelCards();
  }, []);

  useEffect(() => {
    filterAndSortCards();
  }, [modelCards, searchTerm, sortBy]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(query);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchModelCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/model-cards');
      if (response.ok) {
        const data = await response.json();
        setModelCards(data);
      } else {
        console.error('Failed to fetch model cards');
      }
    } catch (error) {
      console.error('Error fetching model cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCards = () => {
    let filtered = modelCards.filter(card =>
      card.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return (a.model_name || '').localeCompare(b.model_name || '');
        case 'date':
          return new Date(b.release_date || 0) - new Date(a.release_date || 0);
        case 'developer':
          return (a.developer || '').localeCompare(b.developer || '');
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
      <header className="page-header">
        <h1 className="page-title">Medical AI Model</h1>
        <h1 className="page-title">Card Generator</h1>
        <p className="page-subtitle">
          Generate AI model cards for
        </p>
        <p className="page-subtitle">
          medical AI systems in one simple step
        </p>
      </header>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search Model Cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />

        <div className="toolbar-actions">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="alphabetical">Sort by... Alphabetical</option>
            <option value="date">Sort by... Date</option>
            <option value="developer">Sort by... Developer</option>
          </select>

          <button
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Regulatory Status</label>
            <select>
              <option>All</option>
              <option>FDA Approved</option>
              <option>CE Mark</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Clinical Risk Level</label>
            <select>
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      )}

      <section className="cards-section">
        {loading ? (
          <div className="loading">Loading model cards...</div>
        ) : filteredCards.length === 0 ? (
          <div className="empty-state">
            <h3>No model cards found</h3>
            <p>
              {searchTerm
                ? `No results for “${searchTerm}”. Try another search.`
                : 'No model cards available yet.'}
            </p>
            <button
              className="generate-btn"
              onClick={() => setShowGenerateForm(true)}
            >
              Generate Your First Model Card
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredCards.map((card, i) => (
              <ModelCard
                key={card._id || i}
                model={card}
                onLearnMore={() => setSelectedModel(card)}
              />
            ))}
          </div>
        )}
      </section>

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
