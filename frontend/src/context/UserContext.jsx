import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('omnitool_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('omnitool_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('omnitool_user');
    }
  }, [user]);

  const login = (userData) => {
    // Generate a 9-digit ID if not present
    const id = userData.id || Math.floor(100000000 + Math.random() * 900000000).toString();
    setUser({ ...userData, id, friends: userData.friends || [] });
  };

  const logout = () => setUser(null);

  const addFriend = (friendId) => {
    if (user && !user.friends.includes(friendId)) {
      setUser({ ...user, friends: [...user.friends, friendId] });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, addFriend }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
