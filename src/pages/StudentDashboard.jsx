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
              backgroundColor: '#201b45', 
              color: 'white',
              padding: '4rem 5rem 6rem 10rem',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '520px',
              fontFamily: '"Outfit", sans-serif'
            }}>
              {/* Vertical Stripes (Left) */}
              <div style={{ position: 'absolute', left: '0', top: 0, bottom: 0, width: '30px', backgroundColor: '#201b45' }}></div>
              <div style={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '40px', backgroundColor: '#1C5D99', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', left: '70px', top: 0, bottom: 0, width: '30px', backgroundColor: '#2E7DCD', zIndex: 1 }}></div>

              {/* Horizontal Stripes (Bottom) */}
              <div style={{ position: 'absolute', left: '30px', bottom: '30px', right: 0, height: '24px', backgroundColor: '#1C5D99', zIndex: 0 }}></div>
              <div style={{ position: 'absolute', left: '30px', bottom: '26px', right: 0, height: '4px', backgroundColor: '#D9B04D', zIndex: 0 }}></div>

              {/* Ribbon Badge */}
              <div style={{ position: 'absolute', top: '3rem', right: '4rem', zIndex: 2 }}>
                <svg width="100" height="130" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Back Ribbons */}
                  <path d="M30 60 V120 L40 105 L50 120 V60 Z" fill="#1C5D99"/>
                  <path d="M50 60 V120 L60 105 L70 120 V60 Z" fill="#1C5D99"/>
                  {/* Gold Ribbon Borders */}
                  <path d="M30 60 V120 L40 105 L50 120 V60 Z" stroke="#D9B04D" strokeWidth="4"/>
                  <path d="M50 60 V120 L60 105 L70 120 V60 Z" stroke="#D9B04D" strokeWidth="4"/>
                  
                  {/* Main Outer Seal */}
                  <path d="M50 5 L57 12 L67 10 L71 19 L80 21 L81 31 L89 36 L86 45 L93 52 L86 59 L89 68 L81 73 L80 83 L71 85 L67 94 L57 92 L50 99 L43 92 L33 94 L29 85 L20 83 L19 73 L11 68 L14 59 L7 52 L14 45 L11 36 L19 31 L20 21 L29 19 L33 10 L43 12 Z" fill="#D9B04D"/>
                  
                  {/* Inner Rings */}
                  <circle cx="50" cy="52" r="34" fill="#1A1838"/>
                  <circle cx="50" cy="52" r="30" fill="#1C5D99"/>
                  <circle cx="50" cy="52" r="25" fill="#2E7DCD"/>
                  <circle cx="50" cy="52" r="21" stroke="#A7CFF5" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>

              {/* Content Wrapper */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Title Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h1 style={{ color: '#D9B04D', fontSize: '4rem', letterSpacing: '4px', margin: 0, fontWeight: '800', lineHeight: '1.2' }}>CERTIFICATE</h1>
                  <h2 style={{ fontSize: '1.4rem', margin: '0', letterSpacing: '2px', color: '#FFFFFF', fontWeight: '600', textTransform: 'uppercase' }}>OF PROJECT</h2>
                </div>

                {/* Presented To */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ color: '#b2b1bf', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>This certificate is presented to</p>
                  <div style={{ 
                    fontFamily: '"Great Vibes", cursive', 
                    fontSize: '4.5rem', 
                    lineHeight: '1.2',
                    color: '#FFFFFF',
                    margin: '0.5rem 0 1rem 0',
                    display: 'inline-block'
                  }}>
                    {c.studentName}
                  </div>
                </div>

                {/* Body Text */}
                <div style={{ maxWidth: '85%', color: '#b2b1bf', fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '3rem' }}>
                  This certificate acknowledges the active participation of<br/>
                  [{c.studentName}] in the "[{c.internshipTitle}]" project held by {c.companyName}.<br/>
                  Your enthusiastic engagement highlights your strong<br/>
                  dedication to acquiring knowledge and your important<br/>
                  role in ensuring the achievement of the project's objectives.
                  {c.remarks && <><br/><br/>Additional Remarks: <em>"{c.remarks}"</em></>}
                </div>

                {/* Footer Signatures */}
                <div style={{ display: 'flex', gap: '8rem', marginTop: 'auto', marginBottom: '1rem' }}>
                  <div style={{ width: '180px' }}>
                    <div style={{ borderBottom: '1px solid #b2b1bf', marginBottom: '0.5rem', height: '40px' }}></div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#D9B04D', fontSize: '0.95rem' }}>{c.companyName}</p>
                    <p style={{ margin: 0, color: '#b2b1bf', fontSize: '0.85rem' }}>Head Of Event</p>
                  </div>
                  <div style={{ width: '180px' }}>
                    <div style={{ borderBottom: '1px solid #b2b1bf', marginBottom: '0.5rem', height: '40px' }}></div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#D9B04D', fontSize: '0.95rem' }}>System Admin</p>
                    <p style={{ margin: 0, color: '#b2b1bf', fontSize: '0.85rem' }}>Event Organizer</p>
                  </div>
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
