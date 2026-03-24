import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Maintain local session persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('internship_auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (email === 'admin@system.com' && password === 'admin123') {
        const adminUser = { id: 'admin1', name: 'System Admin', email: 'admin@system.com', role: 'admin' };
        setUser(adminUser);
        localStorage.setItem('internship_auth_user', JSON.stringify(adminUser));
        return adminUser;
      }

      const q = query(collection(db, 'users'), where("email", "==", email), where("password", "==", password));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const { password: _, ...userWithoutPassword } = { id: doc.id, ...doc.data() };
        setUser(userWithoutPassword);
        localStorage.setItem('internship_auth_user', JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const register = async (userData) => {
    try {
      // --- Access Control for Company Role ---
      const AUTHORIZED_COMPANY_EMAILS = [
        'ridhampatel0510@email.com',
        'katrodiyadharm@gmail.com',
        'shahbhavya477@gmail.com'
      ];

      if (userData.role === 'company' && !AUTHORIZED_COMPANY_EMAILS.includes(userData.email)) {
        throw new Error('Unauthorized: This email is not approved for Company access.');
      }

      const q = query(collection(db, 'users'), where("email", "==", userData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Email already exists');
      }

      const newUser = {
        ...userData,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'users'), newUser);
      const { password, ...userWithoutPassword } = { id: docRef.id, ...newUser };
      
      setUser(userWithoutPassword);
      localStorage.setItem('internship_auth_user', JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('internship_auth_user');
    window.location.href = '/login'; 
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
