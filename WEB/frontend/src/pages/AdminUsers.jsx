import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaUser, FaSearch, FaUserTag, FaCalendarAlt } from 'react-icons/fa';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (parseInt(userId) === currentUser.id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? All their enrolled courses and learning progress will be deleted permanently.')) return;
    
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setSuccessMsg('User account deleted successfully.');
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5 fade-in-el text-start">
      <div className="row mb-5 align-items-center justify-content-between g-3">
        <div className="col-md-6 text-center text-md-start">
          <h2 className="text-white fw-extrabold mb-1">User Management Console</h2>
          <p className="text-muted mb-0">Audit system accounts, monitor roles, and manage registrations.</p>
        </div>
        
        <div className="col-md-4">
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success small py-2 px-3 mb-4 rounded-3">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small py-2 px-3 mb-4 rounded-3">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card glass-card p-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary align-middle mb-0 small">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>User</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Registered On</th>
                  <th style={{ width: '100px' }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.fullname}
                            className="rounded-circle object-fit-cover"
                            style={{ width: '32px', height: '32px' }}
                          />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                            {u.fullname.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="text-white fw-semibold">{u.fullname} {currentUser.id === u.id && <span className="text-muted small ms-1">(You)</span>}</td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 rounded-3 fw-semibold ${u.role === 'admin' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <FaCalendarAlt size={11} /> {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn btn-danger bg-opacity-15 text-danger btn-sm border-0 px-2.5 rounded-3"
                          disabled={currentUser.id === u.id}
                          title={currentUser.id === u.id ? 'You cannot delete yourself' : 'Delete user account'}
                        >
                          <FaTrash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-5">No user accounts found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
