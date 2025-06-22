import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import './App.css';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(VITE_API_URL);

function App() {
  const [disasters, setDisasters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [apiResponse, setApiResponse] = useState('');

  const fetchDisasters = useCallback(async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/disasters`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setDisasters(data);
    } catch (error) {
      console.error("Failed to fetch disasters:", error);
      setApiResponse(`Error fetching disasters: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    fetchDisasters();

    function onConnect() {
      console.log('Connected to WebSocket server!');
      setIsConnected(true);
    }
    function onDisconnect() {
      console.log('Disconnected from WebSocket server.');
      setIsConnected(false);
    }
    function onSocialMediaAlert(alert) {
      console.log('Received alert:', alert);
      setAlerts(prevAlerts => [alert, ...prevAlerts].slice(0, 100)); // Keep last 100 alerts
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('social-media-alert', onSocialMediaAlert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('social-media-alert', onSocialMediaAlert);
    };
  }, [fetchDisasters]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse('Submitting...');
    try {
      const { title, description, tags } = formState;
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);

      const body = {
        title,
        description,
        location: description, // Using description for geocoding
        tags: tagsArray,
        lat: 40.7128, // Mock lat/lng
        lng: -74.0060
      };

      const res = await fetch(`${VITE_API_URL}/api/disasters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP error! status: ${res.status}`);

      setApiResponse(JSON.stringify(data, null, 2));
      setFormState({ title: '', description: '', tags: '' }); // Reset form
      fetchDisasters(); // Refetch disasters to show the new one
    } catch (error) {
      setApiResponse(`Error: ${error.message}`);
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Disaster Response Platform</h1>
      </header>
      <main id="root-container">
        <div className="column">
          <h2>Reported Disasters</h2>
          <div id="disasters-list" className="scroll-box">
            {disasters.length > 0 ? (
              disasters.map(d => (
                <Link to={`/disasters/${d.id}`} key={d.id} className="disaster-item-link">
                  <div className="disaster-item">
                    <h3>{d.title}</h3>
                    <p>{d.description}</p>
                    <small>Location: {d.location_name}</small>
                    <div className="tags">
                      {d.tags && d.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>No disasters reported yet. Be the first!</p>
            )}
          </div>
        </div>
        <div className="column">
          <h2>📢 Real-time Social Media Alerts</h2>
          <div className="status">
            Socket Status: {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div id="alerts" className="scroll-box">
            {alerts.length === 0 && <p>Waiting for alerts...</p>}
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.priority ? 'priority' : ''}`}>
                {alert.priority && <span className="priority-badge">PRIORITY</span>}
                <span className="user">{alert.content.user}:</span> {alert.content.text}
              </div>
            ))}
          </div>
        </div>
        <div className="column">
          <h2>🚨 Report a New Disaster</h2>
          <form id="disasterForm" onSubmit={handleSubmit}>
            <input
              type="text"
              id="title"
              placeholder="Disaster Title (e.g., 'Warehouse Fire')"
              value={formState.title}
              onChange={handleInputChange}
              required
            />
            <textarea
              id="description"
              placeholder="Description & Location (e.g., 'Massive fire at 5th and Main St')"
              value={formState.description}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              id="tags"
              placeholder="Tags (e.g., fire, downtown, hazardous)"
              value={formState.tags}
              onChange={handleInputChange}
            />
            <button type="submit">Submit Report</button>
          </form>
          <h3>API Response:</h3>
          <pre id="response">{apiResponse}</pre>
        </div>
      </main>
    </div>
  );
}

export default App;
