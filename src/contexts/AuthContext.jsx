import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('internship_auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate network request
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('internship_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('internship_auth_user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          // Check for hardcoded admin if none exists
          if (email === 'admin@system.com' && password === 'admin123') {
            const adminUser = { id: 'admin1', name: 'System Admin', email: 'admin@system.com', role: 'admin' };
            setUser(adminUser);
            localStorage.setItem('internship_auth_user', JSON.stringify(adminUser));
            resolve(adminUser);
          } else {
            reject(new Error('Invalid email or password'));
          }
        }
      }, 500);
    });
  };

  const register = (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('internship_users') || '[]');
        if (users.some(u => u.email === userData.email)) {
          reject(new Error('Email already exists'));
          return;
        }

        const newUser = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('internship_users', JSON.stringify(updatedUsers));
        
        // Auto-login after register
        const { password, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('internship_auth_user', JSON.stringify(userWithoutPassword));
        resolve(userWithoutPassword);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('internship_auth_user');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
