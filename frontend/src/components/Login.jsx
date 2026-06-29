import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import './Login.css';

const Login = () => {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    login({ name, email, pfpUrl });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPfpUrl(reader.result); // base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="login-container flex-center">
      <div className="glass-panel login-card animate-fade-in">
        <div className="login-header">
          <h2>Welcome to OmniTool</h2>
          <p>Enter your details to get started. No password required.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Name (Required)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="E.g. Alex" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email (Optional)</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="alex@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Profile Picture (Optional)</label>
            <div className="pfp-upload-row">
              {pfpUrl && <img src={pfpUrl} alt="Preview" className="pfp-preview" />}
              <label className="file-upload-btn btn-ghost">
                {pfpUrl ? 'Change Photo' : 'Upload Photo'}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{display: 'none'}}
                />
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Generate My Unique ID & Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
