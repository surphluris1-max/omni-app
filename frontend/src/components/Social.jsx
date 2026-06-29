import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Users, UserPlus, Copy, CheckCircle } from 'lucide-react';
import './Social.css';

const Social = () => {
  const { user, addFriend } = useUser();
  const [friendId, setFriendId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendId.trim()) return;
    
    addFriend(friendId);
    setFriendId('');
    alert(`Friend request sent / added ID: ${friendId}`);
  };

  // Use current origin so the link works on any deployment, not just localhost
  const shareLink = `${window.location.origin}/add/${user.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="social-page animate-fade-in">
      <div className="social-header">
        <div>
          <h1>Friends & Family</h1>
          <p>Share lists and split bills seamlessly.</p>
        </div>
      </div>

      <div className="grid-layout">
        <div className="glass-panel add-friend-container">
          <h3><UserPlus size={20} style={{marginRight: '8px'}} /> Add a Friend</h3>
          <p className="text-muted">No phone numbers or emails needed. Just use their 9-digit ID or share your link.</p>
          
          <form onSubmit={handleAddFriend} className="add-friend-form">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter 9-digit ID"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>

          <div className="divider"><span>OR</span></div>

          <div className="share-link-box">
            <span className="share-label">Your Share Link:</span>
            <div className="link-wrapper">
              <input type="text" readOnly value={shareLink} className="input-field link-input" />
              <button className="btn-icon" onClick={handleCopy} title="Copy Link">
                {copied ? <CheckCircle size={18} color="var(--color-accent)"/> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel friends-list-container">
          <h3><Users size={20} style={{marginRight: '8px'}} /> My Friends</h3>
          <div className="friends-list">
            {user.friends.length === 0 ? (
              <p className="empty-state">You haven't added any friends yet.</p>
            ) : (
              user.friends.map(id => (
                <div key={id} className="friend-item">
                  <div className="pfp-placeholder">{id.charAt(0)}</div>
                  <div className="friend-details">
                    <span className="friend-name">User {id.substring(0,4)}...</span>
                    <span className="friend-id">ID: {id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;
