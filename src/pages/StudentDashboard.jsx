import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDB } from '../contexts/DBContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, Award } from 'lucide-react';

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
  const { user } = useAuth();
  const { getApplicationsByStudent, submitReport, getReportsByStudent } = useDB();
  
  const apps = getApplicationsByStudent(user.id).filter(a => a.status === 'approved');
  const pastReports = getReportsByStudent(user.id);
  
  const [formData, setFormData] = useState({ title: '', description: '', internshipId: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.internshipId) return alert('Please select an internship');
    
    const selectedApp = apps.find(a => a.internshipId === formData.internshipId);
    
    submitReport({
      studentId: user.id,
      studentName: user.name,
      companyId: selectedApp.companyId,
      internshipId: selectedApp.internshipId,
      internshipTitle: selectedApp.internshipTitle,
      title: formData.title,
      description: formData.description
    });
    
    alert('Report submitted successfully!');
    setFormData({ title: '', description: '', internshipId: '' });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Submit Reports</h1>
        <p className="text-muted">Upload your weekly/monthly internship progress reports.</p>
      </div>
      
      <div className="card glass" style={{ maxWidth: 600, marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Internship</label>
            <select 
              className="form-input" 
              value={formData.internshipId}
              onChange={e => setFormData({...formData, internshipId: e.target.value})}
              required
            >
              <option value="">-- Choose Internship --</option>
              {apps.map(a => (
                <option key={a.id} value={a.internshipId}>{a.internshipTitle}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Report Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Week 1 Progress" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description / Summary</label>
            <textarea 
              className="form-input" 
              rows="4" 
              placeholder="Briefly describe what you worked on."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={apps.length === 0}>
            Submit Report
          </button>
        </form>
      </div>

      <h2 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Past Reports</h2>
      <div className="card glass">
        {pastReports.length === 0 ? <p>No reports submitted yet.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th>Internship</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {pastReports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td>{r.internshipTitle}</td>
                  <td><strong style={{ color: 'var(--primary)' }}>{r.title}</strong><br/><span style={{ fontSize: '0.85rem' }} className="text-muted">{r.description}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const MyCertificates = () => {
  const { user } = useAuth();
  const { getCertificatesByStudent } = useDB();
  const certs = getCertificatesByStudent(user.id);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Certificates</h1>
        <p className="text-muted">Certificates earned from your internships.</p>
      </div>
      <div className="grid-2">
        {certs.length === 0 ? <p>You haven't earned any certificates yet.</p> : (
          certs.map(c => (
            <div key={c.id} className="card glass" style={{ border: '2px solid var(--primary)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Award size={48} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Certificate of Completion</h2>
              <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>{c.studentName}</h3>
              <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
                For successfully completing the internship requirement as<br/>
                <strong>{c.internshipTitle}</strong><br/>
                at <strong>{c.companyName}</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>Grade</span>
                  <strong>{c.grade}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>Issued On</span>
                  <strong>{new Date(c.issuedAt).toLocaleDateString()}</strong>
                </div>
              </div>
              {c.remarks && (
                <div style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>
                  "{c.remarks}"
                </div>
              )}
            </div>
          ))
        )}
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
      <Route path="certificates" element={<MyCertificates />} />
    </Routes>
  );
}
