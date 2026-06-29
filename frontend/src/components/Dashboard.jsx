import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Wind, MapPin, CheckSquare, Users } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();
  const [aqiData, setAqiData] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Fetch AQI based on Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // In a real app, we would fetch from an AQI API like OpenWeatherMap
          // fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY`)
          
          // Mocking the AQI response
          setTimeout(() => {
            setAqiData({
              aqi: 2, // 1-5 scale (Good to Very Poor)
              status: 'Fair',
              pm25: 15.5,
              location: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`
            });
          }, 1000);
        },
        (error) => {
          setLocationError("Location access denied or unavailable. Showing default AQI.");
          setAqiData({ aqi: 1, status: 'Good', pm25: 5.2, location: 'Unknown (Default)' });
        }
      );
    } else {
      setLocationError("Geolocation not supported.");
    }
  }, []);

  const getAqiColor = (aqi) => {
    switch(aqi) {
      case 1: return 'var(--color-accent)'; // Good
      case 2: return 'var(--color-warning)'; // Fair
      case 3: return 'orange'; // Moderate
      case 4: return 'var(--color-danger)'; // Poor
      case 5: return 'darkred'; // Very Poor
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name} 👋</h1>
        <p>Here's what's happening today.</p>
      </div>

      <div className="grid-layout">
        {/* AQI Widget */}
        <div className="glass-panel widget aqi-widget">
          <div className="widget-header">
            <h3><Wind size={20} /> Air Quality</h3>
            {aqiData && (
              <span className="aqi-badge" style={{ backgroundColor: getAqiColor(aqiData.aqi) }}>
                {aqiData.status}
              </span>
            )}
          </div>
          
          <div className="widget-content">
            {!aqiData && !locationError && <p className="text-muted">Fetching location & AQI data...</p>}
            {locationError && <p className="text-danger text-sm">{locationError}</p>}
            
            {aqiData && (
              <>
                <div className="aqi-main">
                  <span className="aqi-value" style={{ color: getAqiColor(aqiData.aqi) }}>{aqiData.aqi}</span>
                  <span className="aqi-scale">/ 5 AQI Level</span>
                </div>
                <div className="aqi-details">
                  <p><MapPin size={14} /> {aqiData.location}</p>
                  <p>PM2.5: {aqiData.pm25} µg/m³</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Widget */}
        <div className="glass-panel widget">
          <div className="widget-header">
            <h3><CheckSquare size={20} /> Tasks Overview</h3>
          </div>
          <div className="widget-content flex-center" style={{flexDirection: 'column', gap: '1rem'}}>
             <div className="stat-circle">
                <span className="stat-num">
                  {/* Since tasks are stored in localStorage, we can read them quickly here for a mock summary */}
                  {JSON.parse(localStorage.getItem('omnitool_tasks') || '[]').filter(t => !t.completed).length}
                </span>
                <span className="stat-label">Pending</span>
             </div>
             <p className="text-muted">Go to Tasks to manage your lists.</p>
          </div>
        </div>

        {/* Social Widget */}
        <div className="glass-panel widget">
          <div className="widget-header">
            <h3><Users size={20} /> Network</h3>
          </div>
          <div className="widget-content flex-center" style={{flexDirection: 'column', gap: '1rem'}}>
             <div className="stat-circle" style={{borderColor: 'var(--color-secondary)'}}>
                <span className="stat-num">{user.friends.length}</span>
                <span className="stat-label">Friends</span>
             </div>
             <p className="text-muted">Share lists and split bills.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
