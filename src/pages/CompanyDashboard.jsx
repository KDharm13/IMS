import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDB } from '../contexts/DBContext';
import { useAuth } from '../contexts/AuthContext';

const DashboardHome = () => {
  const { user } = useAuth();
  const { getInternshipsByCompany } = useDB();
  const internships = getInternshipsByCompany(user.id);
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Company Dashboard</h1>
        <p className="text-muted">{user.name}</p>
      </div>
      <div className="grid-3 mb-6">
        <div className="card glass">
          <h3>Total Postings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{internships.length}</p>
        </div>
        <div className="card glass">
          <h3>Active Interns</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>0</p>
        </div>
      </div>
    </div>
  );
};

const ManagePostings = () => {
  const { user } = useAuth();
  const { getInternshipsByCompany, addInternship } = useDB();
  const internships = getInternshipsByCompany(user.id);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ title: '', description: '', location: '', stipend: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addInternship({
      ...formData,
      companyId: user.id,
      companyName: user.name,
      status: 'pending' // Admin must approve
    });
    setShowForm(false);
    setFormData({ title: '', description: '', location: '', stipend: '' });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1 className="page-title">Manage Postings</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Post New Internship'}
        </button>
      </div>

      {showForm && (
        <div className="card glass" style={{ marginBottom: '2rem' }}>
          <h3>New Internship Notice</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input required className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea required className="form-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input required className="form-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Stipend</label>
                <input required className="form-input" placeholder="e.g. Unpaid, $500/mo" value={formData.stipend} onChange={e => setFormData({...formData, stipend: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit for Approval</button>
          </form>
        </div>
      )}

      <div className="grid-2">
        {internships.map(i => (
          <div key={i.id} className="card glass">
            <h3>{i.title}</h3>
            <p className="text-muted">{i.location} • {i.stipend}</p>
            <div style={{ marginTop: '1rem' }}>
              <span className={`badge badge-${i.status}`}>Status: {i.status.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewApplicants = () => {
  const { user } = useAuth();
  const { getInternshipsByCompany, getApplicationsByInternship, updateApplicationStatus } = useDB();
  const internships = getInternshipsByCompany(user.id);
  const allApps = internships.flatMap(i => getApplicationsByInternship(i.id));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Review Applicants</h1>
      </div>
      <div className="card glass">
        {allApps.length === 0 ? <p>No applications yet.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th>Internship Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allApps.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{a.studentName}</td>
                  <td>{a.internshipTitle}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span></td>
                  <td>
                    {a.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={() => updateApplicationStatus(a.id, 'approved')} style={{ color: 'green' }}>Accept</button>
                        <button className="btn btn-secondary" onClick={() => updateApplicationStatus(a.id, 'rejected')} style={{ color: 'red' }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const IssueCertificates = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Issue Certificates</h1>
        <p className="text-muted">Evaluate intern performance and provide certificates.</p>
      </div>
      <div className="card glass">
        <p>No active interns eligible for certification at this time.</p>
      </div>
    </div>
  );
};

export default function CompanyDashboard() {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardHome />} />
      <Route path="postings" element={<ManagePostings />} />
      <Route path="applications" element={<ReviewApplicants />} />
      <Route path="certificates" element={<IssueCertificates />} />
    </Routes>
  );
}
