import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDB } from '../contexts/DBContext';

const DashboardHome = () => {
  const { internships, applications, getAllUsers } = useDB();
  const users = getAllUsers();
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-muted">System Overview</p>
      </div>
      <div className="grid-3 mb-6">
        <div className="card glass">
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{users.length}</p>
        </div>
        <div className="card glass">
          <h3>Internship Posts</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{internships.length}</p>
        </div>
        <div className="card glass">
          <h3>Total Applications</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{applications.length}</p>
        </div>
      </div>
    </div>
  );
};

const ApproveInternships = () => {
  const { internships, updateInternship } = useDB();
  const pending = internships.filter(i => i.status === 'pending');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Approve Internship Posts</h1>
        <p className="text-muted">Review and approve new postings from companies.</p>
      </div>
      <div className="grid-2">
        {pending.length === 0 && <p>No pending approvals.</p>}
        {pending.map(i => (
          <div key={i.id} className="card glass">
            <h3>{i.title}</h3>
            <p className="text-muted">Company: {i.companyName}</p>
            <p style={{ margin: '1rem 0' }}>{i.description}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={() => updateInternship(i.id, { status: 'approved' })}>Approve</button>
              <button className="btn btn-danger" onClick={() => updateInternship(i.id, { status: 'rejected' })}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const { getAllUsers, deleteUser } = useDB();
  const users = getAllUsers();

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to remove this user?')) deleteUser(id);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
      </div>
      <div className="card glass">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(u.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SystemReports = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Reports</h1>
      </div>
      <div className="card glass">
        <h3>Analytics Report</h3>
        <p className="text-muted" style={{ marginTop: '1rem' }}>Export system activity to CSV or PDF.</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>Download Report</button>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardHome />} />
      <Route path="approvals" element={<ApproveInternships />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="reports" element={<SystemReports />} />
    </Routes>
  );
}
