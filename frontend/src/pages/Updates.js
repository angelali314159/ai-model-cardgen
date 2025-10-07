import React from 'react';
import '../styles/Updates.css';

const Updates = () => {
  const updates = [
    {
      id: 1,
      date: '2024-01-15',
      title: 'New Model Cards Added',
      description: 'Added 15 new medical AI model cards to the database',
      type: 'feature'
    },
    {
      id: 2,
      date: '2024-01-10',
      title: 'Search Functionality Improved',
      description: 'Enhanced search with better filtering and sorting options',
      type: 'improvement'
    },
    {
      id: 3,
      date: '2024-01-05',
      title: 'Bug Fixes',
      description: 'Fixed various UI issues and improved performance',
      type: 'bug-fix'
    }
  ];

  return (
    <div className="updates-page">
      <div className="page-header">
        <h1>Latest Updates</h1>
        <p>Stay informed about the latest features and improvements</p>
      </div>
      
      <div className="updates-list">
        {updates.map(update => (
          <div key={update.id} className="update-item">
            <div className="update-date">{update.date}</div>
            <div className="update-content">
              <h3>{update.title}</h3>
              <p>{update.description}</p>
              <span className={`update-type ${update.type}`}>
                {update.type.replace('-', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates;