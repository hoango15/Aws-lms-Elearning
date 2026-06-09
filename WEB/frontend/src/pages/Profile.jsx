import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FaUser, FaLock, FaKey, FaUpload, FaUserEdit } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  
  // Profile information states
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    
    if (!fullname) {
      setProfileError('Full name is required.');
      return;
    }

    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileMessage('Profile updated successfully.');
        updateProfileState(response.data.user);
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.put('/auth/change-password', {
        oldPassword,
        newPassword
      });

      if (response.data.success) {
        setPasswordMessage('Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in-el text-start">
      <div className="mb-5 text-center text-sm-start">
        <h2 className="text-white fw-extrabold mb-1">My Profile Settings</h2>
        <p className="text-muted mb-0">Manage your login credentials, avatar image, and personal particulars.</p>
      </div>

      <div className="row g-4">
        {/* Left Side: Avatar & Details Form */}
        <div className="col-lg-6">
          <div className="card glass-card p-4 p-md-5 h-100">
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
              <FaUserEdit className="text-primary" /> Edit Account Info
            </h5>

            {profileMessage && (
              <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success small py-2 px-3 mb-4 rounded-3">
                {profileMessage}
              </div>
            )}
            {profileError && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small py-2 px-3 mb-4 rounded-3">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              {/* Avatar Preview & Upload Area */}
              <div className="d-flex flex-column align-items-center mb-4">
                <div className="position-relative mb-3">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user?.fullname}
                      className="rounded-circle object-fit-cover border border-secondary"
                      style={{ width: '120px', height: '120px' }}
                    />
                  ) : (
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold border border-secondary" style={{ width: '120px', height: '120px', fontSize: '36px' }}>
                      {user?.fullname?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <label htmlFor="avatar-upload" className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 d-flex align-items-center justify-content-center cursor-pointer shadow-sm" style={{ width: '36px', height: '36px' }}>
                    <FaUpload size={14} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <span className="text-muted small">Allowed files: JPG, PNG, WEBP (Max 5MB)</span>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control text-muted"
                  value={user?.email || ''}
                  disabled
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Change Password Form */}
        <div className="col-lg-6">
          <div className="card glass-card p-4 p-md-5 h-100">
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
              <FaKey className="text-warning" /> Change Password
            </h5>

            {passwordMessage && (
              <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success small py-2 px-3 mb-4 rounded-3">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small py-2 px-3 mb-4 rounded-3">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-light w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
