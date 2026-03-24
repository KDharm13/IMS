import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDB } from '../contexts/DBContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock } from 'lucide-react';

const DashboardHome = () => {
  const { user } = useAuth();
  const { getApplicationsByStudent } = useDB();
  const apps = getApplicationsByStudent(user.id);
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.name}</h1>
        <p className="text-muted">Here is an overview of your internship activities.</p>
      </div>
      <div className="grid-4 mb-6">
        <div className="card glass">
          <h3>Total Applications</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{apps.length}</p>
        </div>
        <div className="card glass">
          <h3>Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>
            {apps.filter(a => a.status === 'pending').length}
          </p>
        </div>
        <div className="card glass">
          <h3>Approved</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
            {apps.filter(a => a.status === 'approved').length}
          </p>
        </div>
        <div className="card glass">
          <h3>Rejected</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
            {apps.filter(a => a.status === 'rejected').length}
          </p>
        </div>
      </div>
    </div>
  );
};

const BrowseInternships = () => {
  const { user } = useAuth();
  const { getApprovedInternships, applyForInternship, getApplicationsByStudent } = useDB();
  const internships = getApprovedInternships();
  const apps = getApplicationsByStudent(user.id);

  const hasApplied = (id) => apps.some(a => a.internshipId === id);

  const handleApply = (internship) => {
    applyForInternship({
      studentId: user.id,
      studentName: user.name,
      internshipId: internship.id,
      internshipTitle: internship.title,
      companyId: internship.companyId,
    });
    alert('Applied successfully!');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Available Internships</h1>
      </div>
      <div className="grid-2">
        {internships.map(i => (
          <div key={i.id} className="card glass">
            <h3>{i.title}</h3>
            <p className="text-muted">{i.companyName} • {i.location}</p>
            <p style={{ margin: '1rem 0' }}>{i.description}</p>
            <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Stipend: {i.stipend}</p>
            {hasApplied(i.id) ? (
              <button className="btn btn-secondary" disabled>Already Applied</button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleApply(i)}>Apply Now</button>
            )}
          </div>
        ))}
        {internships.length === 0 && <p>No internships available at the moment.</p>}
      </div>
    </div>
  );
};

const MyApplications = () => {
  const { user } = useAuth();
  const { getApplicationsByStudent } = useDB();
  const apps = getApplicationsByStudent(user.id);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
      </div>
      <div className="card glass">
        {apps.length === 0 ? <p>You haven't applied to any internships yet.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Internship</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{a.internshipTitle}</td>
                  <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${a.status}`}>
                      {a.status === 'pending' && <Clock size={12} style={{ marginRight: 4 }} />}
                      {a.status === 'approved' && <CheckCircle size={12} style={{ marginRight: 4 }} />}
                      {a.status.toUpperCase()}
                    </span>
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

const SubmitReports = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Submit Reports</h1>
        <p className="text-muted">Upload your weekly/monthly internship progress reports.</p>
      </div>
      <div className="card glass" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label className="form-label">Report Title</label>
          <input type="text" className="form-input" placeholder="e.g. Week 1 Progress" />
        </div>
        <div className="form-group">
          <label className="form-label">Description / Summary</label>
          <textarea className="form-input" rows="4" placeholder="Briefly describe what you worked on."></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">Attachment (PDF/Doc)</label>
          <input type="file" className="form-input" />
        </div>
        <button className="btn btn-primary" onClick={() => alert('Report submitted!')}>Submit Report</button>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardHome />} />
      <Route path="internships" element={<BrowseInternships />} />
      <Route path="applications" element={<MyApplications />} />
      <Route path="reports" element={<SubmitReports />} />
    </Routes>
  );
}
