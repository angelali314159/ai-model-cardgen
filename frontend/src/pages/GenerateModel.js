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

  const DUMMY_MODEL = {
    _id: { $oid: '68ec5e8f71d521bcb67c0da1' },
    model_name: 'Model Name',
    developer: 'Developer Name',
    inquiries_or_to_report_an_issue: 'Contact Information',
    release_stage: 'Release Stage',
    release_date: 'YYYY-MM-DD',
    version: '1.0',
    regulatory_approval_status_if_applicable: 'Approval Status',
    global_availability: 'Availability Information',
    summary: 'Short summary of the model',
    keywords: ['Keyword1', 'Keyword2', 'Keyword3'],
    intended_use_and_workflow: 'Intended use and workflow description',
    primary_intended_users: 'Primary intended users description',
    necessary_knowledge_expertise: 'Required knowledge or expertise',
    how_to_use: 'Instructions on how to use the model',
    targeted_patient_population: 'Description of targeted patient population',
    patient_consent_or_disclosure_required_or_suggested: 'Consent or disclosure requirements',
    developer_supplied_warnings: 'Warnings from the developer',
    model_limitations: 'Known model limitations',
    skin_type_representation_and_equity: 'Description of skin type representation',
    clinical_risk_level: 'Clinical risk level',
    ai_system_facts: 'Facts about the AI system',
    model_type: 'Type of model',
    interaction_with_other_systems: 'Interaction details with other systems',
    outcomes_and_output: 'Expected outcomes and outputs',
    type_and_value_of_solution_output: 'Description of output type and value',
    explanation_for_how_an_output_is_generated: 'Explanation of output generation',
    foundation_models_used_in_application_if_applicable: 'Foundation models used',
    input_data_source: 'Source of input data',
    output_input_data_type: 'Description of input/output data types',
    development_data_characterization: 'Development data characteristics',
    training_data: 'Description of training data',
    exclusion_inclusion_criteria: 'Inclusion and exclusion criteria',
    demographic_representativeness: 'Demographic representativeness description',
    dataset_doi_if_applicable: 'Dataset DOI',
    dataset_transparency: 'Dataset transparency information',
    validation_test_dataset: 'Validation and test dataset information',
    timeline_of_data_collection: 'Timeline of data collection',
    skin_tone_diversity: 'Information on skin tone diversity',
    did_the_data_collection_process_undergo_ethical_review: 'Yes/No',
    ethical_review_board_oversight: 'Details of ethical review board oversight',
    irb_approval: 'IRB approval details',
    relevance_of_training_data_to_intended_population: 'Relevance explanation',
    bias_mitigation_approaches: 'Bias mitigation methods',
    ongoing_maintenance: 'Ongoing maintenance practices',
    security_and_compliance_environment_practices_or_accreditations_if_applicable: 'Security and compliance information',
    transparency_intelligibility_and_accountability_mechanisms_if_applicable: 'Transparency and accountability mechanisms',
    transparency_information: 'Transparency information',
    funding_source_of_the_technical_implementation: 'Funding source information',
    third_party_information_if_applicable: 'Third-party involvement information',
    usefulness_efficacy_goal_of_metrics: 'Goal of usefulness or efficacy metrics',
    usefulness_efficacy_result: 'Results of usefulness or efficacy testing',
    usefulness_efficacy_interpretation: 'Interpretation of efficacy results',
    usefulness_efficacy_test_type: 'Type of efficacy test used',
    usefulness_efficacy_testing_data_description: 'Description of data used for efficacy testing',
    usefulness_efficacy_validation_process_and_justification: 'Efficacy validation process and justification',
    usefulness_efficacy_auroc_accuracy_etc: 'Performance metrics (AUROC, accuracy, etc.)',
    fairness_equity_goal_of_metrics: 'Goal of fairness or equity metrics',
    fairness_equity_result: 'Results of fairness or equity testing',
    fairness_equity_interpretation: 'Interpretation of fairness results',
    fairness_equity_test_type: 'Type of fairness test used',
    fairness_equity_testing_data_description: 'Description of data used for fairness testing',
    fairness_equity_validation_process_and_justification: 'Fairness validation process and justification',
    safety_reliability_goal_of_metrics: 'Goal of safety or reliability metrics',
    safety_reliability_result: 'Results of safety or reliability testing',
    safety_reliability_interpretation: 'Interpretation of safety results',
    safety_reliability_test_type: 'Type of safety test used',
    safety_reliability_testing_data_description: 'Description of data used for safety testing',
    safety_reliability_validation_process_and_justification: 'Safety validation process and justification',
    evaluation_references_if_available: 'Evaluation references',
    clinical_trial_if_available: 'Clinical trial details',
    peer_reviewed_publications: ['Publication Title 1', 'Publication Title 2'],
    reimbursement_status_if_applicable: 'Reimbursement status',
    stakeholders_consulted_during_design_of_solution: 'List of stakeholders consulted'
  };

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
        setFilteredCards(data);
      } else {
        console.error('Failed to fetch model cards');
        // Use dummy model when API returns non-OK
        setModelCards([DUMMY_MODEL]);
        setFilteredCards([DUMMY_MODEL]);
      }
    } catch (error) {
      console.error('Error fetching model cards:', error);
      // Network or other error: show dummy model
      setModelCards([DUMMY_MODEL]);
      setFilteredCards([DUMMY_MODEL]);
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
