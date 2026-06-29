import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext(null);

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('omnitool_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('omnitool_groups');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('omnitool_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Auto-cleanup expired messages on load and every minute ---
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setMessages(prev => {
        const filtered = prev.filter(msg => {
          const age = now - new Date(msg.timestamp).getTime();
          if (msg.starred) {
            return age < THREE_WEEKS_MS; // Starred: keep 3 weeks
          }
          return age < THREE_DAYS_MS; // Normal: keep 3 days
        });
        // Only update if something actually expired
        if (filtered.length !== prev.length) return filtered;
        return prev;
      });
    };

    cleanup(); // Run on mount
    const interval = setInterval(cleanup, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('omnitool_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('omnitool_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('omnitool_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('omnitool_messages', JSON.stringify(messages));
  }, [messages]);

  const login = (userData) => {
    const id = userData.id || Math.floor(100000000 + Math.random() * 900000000).toString();
    setUser({ ...userData, id, friends: userData.friends || [] });
  };

  const logout = () => setUser(null);

  const addFriend = (friendId) => {
    if (user && !user.friends.includes(friendId)) {
      setUser({ ...user, friends: [...user.friends, friendId] });
    }
  };

  const createGroup = (name, memberIds) => {
    const newGroup = {
      id: 'grp_' + Date.now(),
      name,
      members: [user.id, ...memberIds],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };
    setGroups([...groups, newGroup]);
    return newGroup;
  };

  const sendMessage = (chatId, chatType, text) => {
    const msg = {
      id: 'msg_' + Date.now(),
      chatId,
      chatType,
      from: user.id,
      fromName: user.name,
      text,
      timestamp: new Date().toISOString(),
      starred: false,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const toggleStarMessage = (msgId) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, starred: !m.starred } : m)
    );
  };

  const getMessages = (chatId) => {
    return messages.filter(m => m.chatId === chatId);
  };

  // Calculate remaining time for a message
  const getMessageExpiry = (msg) => {
    const age = Date.now() - new Date(msg.timestamp).getTime();
    const maxAge = msg.starred ? THREE_WEEKS_MS : THREE_DAYS_MS;
    const remaining = maxAge - age;
    if (remaining <= 0) return 'Expiring soon';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return '< 1h left';
  };

  return (
    <UserContext.Provider value={{
      user, login, logout, addFriend,
      groups, createGroup,
      messages, sendMessage, getMessages,
      toggleStarMessage, getMessageExpiry
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
