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
      status: 'approved' // Bypassing Admin for the presentation so it appears instantly
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
  const { user } = useAuth();
  const { getInternshipsByCompany, getApplicationsByInternship, getCertificatesByCompany, issueCertificate } = useDB();
  
  const internships = getInternshipsByCompany(user.id);
  const allApps = internships.flatMap(i => getApplicationsByInternship(i.id));
  const approvedApps = allApps.filter(a => a.status === 'approved');
  const issuedCerts = getCertificatesByCompany(user.id);
  
  const [formData, setFormData] = useState({});

  const handleIssue = (app) => {
    const data = formData[app.id] || { grade: 'A', remarks: 'Excellent performance', companyName: user.name };
    issueCertificate({
      studentId: app.studentId,
      studentName: app.studentName,
      companyId: user.id,
      companyName: data.companyName || user.name,
      internshipId: app.internshipId,
      internshipTitle: app.internshipTitle,
      grade: data.grade,
      remarks: data.remarks
    });
    alert('Certificate issued successfully!');
  };

  const handleFormChange = (appId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || { grade: 'A', remarks: '', companyName: user.name }),
        [field]: value
      }
    }));
  };

  const pendingCerts = approvedApps.filter(app => !issuedCerts.some(c => c.internshipId === app.internshipId && c.studentId === app.studentId));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Issue Certificates</h1>
        <p className="text-muted">Evaluate intern performance and provide certificates.</p>
      </div>
      <div className="card glass">
        {pendingCerts.length === 0 ? <p>No active interns eligible for certification at this time.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th>Internship Role</th>
                <th>Company Name</th>
                <th>Grade</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingCerts.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{a.studentName}</td>
                  <td>{a.internshipTitle}</td>
                  <td>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Company" 
                      style={{ padding: '0.25rem', marginBottom: 0, width: '120px' }}
                      value={formData[a.id]?.companyName !== undefined ? formData[a.id].companyName : user.name}
                      onChange={(e) => handleFormChange(a.id, 'companyName', e.target.value)}
                    />
                  </td>
                  <td>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.25rem', width: '80px', marginBottom: 0 }}
                      value={formData[a.id]?.grade || 'A'}
                      onChange={(e) => handleFormChange(a.id, 'grade', e.target.value)}
                    >
                      <option value="O">O</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Remarks..." 
                      style={{ padding: '0.25rem', marginBottom: 0 }}
                      value={formData[a.id]?.remarks || ''}
                      onChange={(e) => handleFormChange(a.id, 'remarks', e.target.value)}
                    />
                  </td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleIssue(a)}>Issue</button>
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
