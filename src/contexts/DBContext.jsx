import React, { createContext, useContext, useState, useEffect } from 'react';

const DBContext = createContext();

export const useDB = () => useContext(DBContext);

// Mock Initial Data - Starts completely empty for the demo
const INITIAL_INTERNSHIPS = [];

export const DBProvider = ({ children }) => {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // Initialize mock data
  useEffect(() => {
    const storedInternships = localStorage.getItem('internship_postings');
    const storedApps = localStorage.getItem('internship_applications');
    
    if (!storedInternships) {
      localStorage.setItem('internship_postings', JSON.stringify(INITIAL_INTERNSHIPS));
      setInternships(INITIAL_INTERNSHIPS);
    } else {
      setInternships(JSON.parse(storedInternships));
    }
    
    if (!storedApps) {
      localStorage.setItem('internship_applications', JSON.stringify([]));
      setApplications([]);
    } else {
      setApplications(JSON.parse(storedApps));
    }
  }, []);

  // Internships
  const addInternship = (internship) => {
    const newInternship = { ...internship, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...internships, newInternship];
    setInternships(updated);
    localStorage.setItem('internship_postings', JSON.stringify(updated));
    return newInternship;
  };

  const updateInternship = (id, updates) => {
    const updated = internships.map(i => i.id === id ? { ...i, ...updates } : i);
    setInternships(updated);
    localStorage.setItem('internship_postings', JSON.stringify(updated));
  };

  const getInternshipsByCompany = (companyId) => internships.filter(i => i.companyId === companyId);
  
  const getApprovedInternships = () => internships.filter(i => i.status === 'approved');

  // Applications
  const applyForInternship = (application) => {
    const newApp = { ...application, id: Date.now().toString(), status: 'pending', appliedAt: new Date().toISOString() };
    const updated = [...applications, newApp];
    setApplications(updated);
    localStorage.setItem('internship_applications', JSON.stringify(updated));
    return newApp;
  };

  const updateApplicationStatus = (id, status) => {
    const updated = applications.map(a => a.id === id ? { ...a, status } : a);
    setApplications(updated);
    localStorage.setItem('internship_applications', JSON.stringify(updated));
  };

  const getApplicationsByStudent = (studentId) => applications.filter(a => a.studentId === studentId);
  const getApplicationsByInternship = (internshipId) => applications.filter(a => a.internshipId === internshipId);

  // Users (Admin only)
  const getAllUsers = () => JSON.parse(localStorage.getItem('internship_users') || '[]');
  const deleteUser = (id) => {
    const users = getAllUsers().filter(u => u.id !== id);
    localStorage.setItem('internship_users', JSON.stringify(users));
  };

  const value = {
    internships,
    applications,
    addInternship,
    updateInternship,
    getInternshipsByCompany,
    getApprovedInternships,
    applyForInternship,
    updateApplicationStatus,
    getApplicationsByStudent,
    getApplicationsByInternship,
    getAllUsers,
    deleteUser
  };

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
};
