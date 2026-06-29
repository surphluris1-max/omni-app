import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { MessageCircle, Users, Plus, Send, ArrowLeft, Star, Hash } from 'lucide-react';
import './Messages.css';

const Messages = () => {
  const { user, groups, createGroup, sendMessage, getMessages, toggleStarMessage, getMessageExpiry } = useUser();
  const [activeView, setActiveView] = useState('list');
  const [activeChat, setActiveChat] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const chatEndRef = useRef(null);

  const currentMessages = activeChat ? getMessages(activeChat.id) : [];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeChat) return;
    sendMessage(activeChat.id, activeChat.type, msgText.trim());
    setMsgText('');
  };

  const openDM = (friendId) => {
    setActiveChat({ id: friendId, name: `User ${friendId.substring(0, 4)}...`, type: 'dm' });
    setActiveView('chat');
  };

  const openGroup = (group) => {
    setActiveChat({ id: group.id, name: group.name, type: 'group' });
    setActiveView('chat');
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    const group = createGroup(newGroupName.trim(), selectedMembers);
    setNewGroupName('');
    setSelectedMembers([]);
    setActiveView('list');
    openGroup(group);
  };

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- CHAT VIEW ---
  if (activeView === 'chat' && activeChat) {
    return (
      <div className="messages-page animate-fade-in">
        <div className="glass-panel chat-panel">
          <div className="chat-header">
            <button className="btn-icon back-btn" onClick={() => setActiveView('list')}>
              <ArrowLeft size={20} />
            </button>
            <div className="chat-header-info">
              <div className="chat-avatar">
                {activeChat.type === 'group' ? <Users size={18} /> : activeChat.name.charAt(0)}
              </div>
              <div>
                <h3>{activeChat.name}</h3>
                <span className="chat-type-label">{activeChat.type === 'group' ? 'Group' : 'Direct Message'}</span>
              </div>
            </div>
            <div className="chat-header-hint">
              <span className="expiry-hint">💡 Messages expire in 3 days · ⭐ Star to keep 3 weeks</span>
            </div>
          </div>

          <div className="chat-messages">
            {currentMessages.length === 0 && (
              <p className="empty-state">No messages yet. Say hello! 👋</p>
            )}
            {currentMessages.map(msg => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.from === user.id ? 'mine' : 'theirs'} ${msg.starred ? 'starred' : ''}`}
              >
                {activeChat.type === 'group' && msg.from !== user.id && (
                  <span className="bubble-sender">{msg.fromName}</span>
                )}
                <p>{msg.text}</p>
                <div className="bubble-footer">
                  <span className="bubble-expiry">{getMessageExpiry(msg)}</span>
                  <span className="bubble-time">{formatTime(msg.timestamp)}</span>
                  <button
                    className={`star-btn ${msg.starred ? 'active' : ''}`}
                    onClick={() => toggleStarMessage(msg.id)}
                    title={msg.starred ? 'Unstar (reverts to 3-day expiry)' : 'Star (keep for 3 weeks)'}
                  >
                    <Star size={12} fill={msg.starred ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              className="input-field"
              placeholder="Type a message..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-icon send-btn">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- CREATE GROUP VIEW ---
  if (activeView === 'create-group') {
    return (
      <div className="messages-page animate-fade-in">
        <div className="glass-panel create-group-panel">
          <div className="panel-header">
            <button className="btn-icon back-btn" onClick={() => setActiveView('list')}>
              <ArrowLeft size={20} />
            </button>
            <h2>Create Group</h2>
          </div>

          <form onSubmit={handleCreateGroup} className="create-group-form">
            <div className="form-group">
              <label>Group Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="E.g. Family Trip, Study Group"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Add Members</label>
              {user.friends.length === 0 ? (
                <p className="text-muted">You need to add friends first before creating a group.</p>
              ) : (
                <div className="member-select-list">
                  {user.friends.map(id => (
                    <button
                      key={id}
                      type="button"
                      className={`member-chip ${selectedMembers.includes(id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(id)}
                    >
                      <div className="pfp-placeholder small">{id.charAt(0)}</div>
                      User {id.substring(0, 4)}
                    </button>
                  ))}
                </div>
              )}
              {selectedMembers.length > 0 && (
                <p className="selected-count">{selectedMembers.length} member(s) selected</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={!newGroupName.trim() || selectedMembers.length === 0}>
              <Users size={18} /> Create Group
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LIST VIEW (default) ---
  return (
    <div className="messages-page animate-fade-in">
      <div className="messages-header">
        <div>
          <h1>Messages</h1>
          <p>Chat with friends or in groups. Messages auto-expire after 3 days.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveView('create-group')}>
          <Plus size={18} /> New Group
        </button>
      </div>

      <div className="grid-layout">
        {/* Groups */}
        <div className="glass-panel chat-list-panel">
          <h3><Hash size={20} style={{ marginRight: '8px' }} /> Groups</h3>
          <div className="chat-list">
            {groups.length === 0 ? (
              <p className="empty-state">No groups yet. Create one!</p>
            ) : (
              groups.map(group => {
                const lastMsg = getMessages(group.id).slice(-1)[0];
                return (
                  <button key={group.id} className="chat-list-item" onClick={() => openGroup(group)}>
                    <div className="chat-avatar group-avatar"><Users size={18} /></div>
                    <div className="chat-list-info">
                      <span className="chat-list-name">{group.name}</span>
                      <span className="chat-list-preview">
                        {lastMsg ? `${lastMsg.fromName}: ${lastMsg.text}` : `${group.members.length} members`}
                      </span>
                    </div>
                    {lastMsg && <span className="chat-list-time">{formatTime(lastMsg.timestamp)}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DMs */}
        <div className="glass-panel chat-list-panel">
          <h3><MessageCircle size={20} style={{ marginRight: '8px' }} /> Direct Messages</h3>
          <div className="chat-list">
            {user.friends.length === 0 ? (
              <p className="empty-state">Add friends to start chatting.</p>
            ) : (
              user.friends.map(friendId => {
                const lastMsg = getMessages(friendId).slice(-1)[0];
                return (
                  <button key={friendId} className="chat-list-item" onClick={() => openDM(friendId)}>
                    <div className="chat-avatar">{friendId.charAt(0)}</div>
                    <div className="chat-list-info">
                      <span className="chat-list-name">User {friendId.substring(0, 4)}...</span>
                      <span className="chat-list-preview">
                        {lastMsg ? lastMsg.text : 'Tap to start chatting'}
                      </span>
                    </div>
                    {lastMsg && <span className="chat-list-time">{formatTime(lastMsg.timestamp)}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
