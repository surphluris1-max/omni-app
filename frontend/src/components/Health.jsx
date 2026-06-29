import React, { useState } from 'react';
import { Search, HeartPulse, Activity } from 'lucide-react';
import './Health.css';

const Health = () => {
  const [type, setType] = useState('plant'); // 'plant' or 'animal'
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!symptoms) return;

    setLoading(true);
    try {
      // Simulate API Call to local backend
      const response = await fetch('http://localhost:5000/api/detect-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, symptoms })
      });
      const data = await response.json();
      setResults(data.suggestions);
    } catch (e) {
      console.error(e);
      // Fallback mock if backend is not running
      setResults([
        { name: 'Mock Disease', description: 'Could not connect to AI backend. Ensure server is running.' }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="health-page animate-fade-in">
      <div className="health-header">
        <div>
          <h1>Disease Detector</h1>
          <p>AI-powered symptom checker for plants and pets.</p>
        </div>
      </div>

      <div className="grid-layout">
        <div className="glass-panel checkup-container">
          <div className="type-selector">
            <button 
              className={`type-btn ${type === 'plant' ? 'active' : ''}`}
              onClick={() => setType('plant')}
            >
              🌿 Plant
            </button>
            <button 
              className={`type-btn ${type === 'animal' ? 'active' : ''}`}
              onClick={() => setType('animal')}
            >
              🐾 Pet / Animal
            </button>
          </div>

          <form onSubmit={handleCheck} className="symptom-form">
            <div className="form-group">
              <label>Describe the symptoms:</label>
              <textarea 
                className="input-field symptom-input" 
                placeholder={`E.g., ${type === 'plant' ? 'Yellowing leaves and brown spots' : 'Lethargic and coughing'}`}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Activity className="spin" size={18} /> : <Search size={18} />}
              {loading ? 'Analyzing...' : 'Check up'}
            </button>
          </form>
        </div>

        <div className="glass-panel results-container">
          <h3><HeartPulse size={20} style={{marginRight: '8px', color: 'var(--color-danger)'}} /> Suggested Diagnoses</h3>
          
          {!results && !loading && (
            <p className="empty-state">Enter symptoms to see AI suggestions.</p>
          )}

          {results && (
            <div className="results-list">
              {results.length === 0 ? (
                <p>No clear matches found for these symptoms.</p>
              ) : (
                results.map((res, idx) => (
                  <div key={idx} className="result-item animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
                    <h4 className="disease-name">{res.name}</h4>
                    <p className="disease-desc">{res.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Health;
