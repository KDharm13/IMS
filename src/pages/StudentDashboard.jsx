import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDB } from '../contexts/DBContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, Award } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

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
  
  const [formData, setFormData] = useState({ title: '', description: '', internshipId: '', file: null });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.internshipId) return alert('Please select an internship');
    
    setUploading(true);
    const selectedApp = apps.find(a => a.internshipId === formData.internshipId);
    
    let fileUrl = '';
    let fileName = '';

    if (formData.file) {
      try {
        const fileRef = ref(storage, `reports/${user.id}/${Date.now()}_${formData.file.name}`);
        await uploadBytes(fileRef, formData.file);
        fileUrl = await getDownloadURL(fileRef);
        fileName = formData.file.name;
      } catch (err) {
        console.error("Error uploading file:", err);
        alert("Failed to upload file. Ensure your File is small enough and Firebase Storage is set up.");
        setUploading(false);
        return;
      }
    }

    submitReport({
      studentId: user.id,
      studentName: user.name,
      companyId: selectedApp.companyId,
      internshipId: selectedApp.internshipId,
      internshipTitle: selectedApp.internshipTitle,
      title: formData.title,
      description: formData.description,
      fileUrl,
      fileName
    });
    
    setUploading(false);
    alert('Report submitted successfully!');
    setFormData({ title: '', description: '', internshipId: '', file: null });
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
          <div className="form-group">
            <label className="form-label">Upload Document (Optional)</label>
            <input 
              type="file" 
              className="form-input" 
              onChange={e => setFormData({...formData, file: e.target.files[0]})}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={apps.length === 0 || uploading}>
            {uploading ? 'Uploading...' : 'Submit Report'}
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
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{r.title}</strong><br/>
                    <span style={{ fontSize: '0.85rem' }} className="text-muted">{r.description}</span>
                    {r.fileUrl && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.85rem' }}>
                          Download {r.fileName || 'Attached File'}
                        </a>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {certs.length === 0 ? <p>You haven't earned any certificates yet.</p> : (
          certs.map(c => (
            <div key={c.id} style={{ 
              position: 'relative', 
              backgroundColor: '#1E1B4B', 
              color: 'white',
              padding: '3rem 4rem 3rem 6rem',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '400px'
            }}>
              {/* Left Stripes */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px', backgroundColor: '#1E40AF' }}></div>
              <div style={{ position: 'absolute', left: '40px', top: 0, bottom: 0, width: '15px', backgroundColor: '#3B82F6', opacity: 0.9 }}></div>

              {/* Ribbon */}
              <div style={{ position: 'absolute', top: '2.5rem', right: '3rem', textAlign: 'center' }}>
                <Award size={72} style={{ color: '#FBBF24', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }} fill="#FBBF24" />
              </div>

              {/* Title Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ color: '#FBBF24', fontFamily: 'sans-serif', fontSize: '2.5rem', letterSpacing: '4px', margin: 0, fontWeight: '900' }}>CERTIFICATE</h1>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'sans-serif', margin: '0.25rem 0 0 0', letterSpacing: '2px', color: '#F3F4F6' }}>OF COMPLETION</h2>
              </div>

              {/* Presented To */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '1rem' }}>This certificate is presented to</p>
                <div style={{ 
                  fontFamily: '"Georgia", "Times New Roman", serif', 
                  fontStyle: 'italic', 
                  fontSize: '3.5rem', 
                  lineHeight: '1.2',
                  color: '#FFFFFF',
                  marginBottom: '1rem',
                  display: 'inline-block'
                }}>
                  {c.studentName}
                </div>
              </div>

              {/* Body Text */}
              <div style={{ maxWidth: '85%', color: '#D1D5DB', fontSize: '1rem', lineHeight: '1.6', marginBottom: '3rem' }}>
                This certificate acknowledges the active participation of {c.studentName} as a <strong>{c.internshipTitle}</strong> at <strong>{c.companyName}</strong>.
                Your enthusiastic engagement highlights your strong dedication to acquiring knowledge and your important role in ensuring the achievement of the project's objectives.
                <br/><br/>
                Grade achieved: <strong style={{color: '#FBBF24'}}>{c.grade}</strong>
                {c.remarks && <span> &nbsp;|&nbsp; Remarks: <em>"{c.remarks}"</em></span>}
              </div>

              {/* Footer Signatures */}
              <div style={{ display: 'flex', gap: '5rem', marginTop: 'auto' }}>
                <div style={{ borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '0.5rem', minWidth: '150px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#FBBF24', fontSize: '0.95rem' }}>{c.companyName}</p>
                  <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.85rem' }}>Organization</p>
                </div>
                <div style={{ borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '0.5rem', minWidth: '150px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#FBBF24', fontSize: '0.95rem' }}>{new Date(c.issuedAt).toLocaleDateString()}</p>
                  <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.85rem' }}>Date Issued</p>
                </div>
              </div>
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
