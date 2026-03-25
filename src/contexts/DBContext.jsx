import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DBContext = createContext();

export const useDB = () => useContext(DBContext);

export const DBProvider = ({ children }) => {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  // Real-time Listeners to Firestore
  useEffect(() => {
    const unsubInternships = onSnapshot(collection(db, 'internships'), (snapshot) => {
      setInternships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubApps = onSnapshot(collection(db, 'applications'), (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCerts = onSnapshot(collection(db, 'certificates'), (snapshot) => {
      setCertificates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubInternships();
      unsubApps();
      unsubCerts();
    };
  }, []);

  // Internships
  const addInternship = async (internship) => {
    await addDoc(collection(db, 'internships'), { ...internship, createdAt: new Date().toISOString() });
  };

  const updateInternship = async (id, updates) => {
    await updateDoc(doc(db, 'internships', id), updates);
  };

  const getInternshipsByCompany = (companyId) => internships.filter(i => i.companyId === companyId);
  const getApprovedInternships = () => internships.filter(i => i.status === 'approved');

  // Applications
  const applyForInternship = async (application) => {
    await addDoc(collection(db, 'applications'), { ...application, status: 'pending', appliedAt: new Date().toISOString() });
  };

  const updateApplicationStatus = async (id, status) => {
    await updateDoc(doc(db, 'applications', id), { status });
  };

  const getApplicationsByStudent = (studentId) => applications.filter(a => a.studentId === studentId);
  const getApplicationsByInternship = (internshipId) => applications.filter(a => a.internshipId === internshipId);

  // Certificates
  const issueCertificate = async (certificate) => {
    await addDoc(collection(db, 'certificates'), { ...certificate, issuedAt: new Date().toISOString() });
  };

  const getCertificatesByStudent = (studentId) => certificates.filter(c => c.studentId === studentId);
  const getCertificatesByCompany = (companyId) => certificates.filter(c => c.companyId === companyId);

  // Users (Admin only)
  const getAllUsers = () => []; // Simplified for prototype
  const deleteUser = (id) => {}; // Simplified for prototype

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
    certificates,
    issueCertificate,
    getCertificatesByStudent,
    getCertificatesByCompany,
    getAllUsers,
    deleteUser
  };

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
};
