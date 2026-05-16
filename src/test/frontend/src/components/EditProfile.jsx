import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as usersApi from '../api/users';

export default function EditProfile() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    availabilityStatus: user?.availabilityStatus || 'AVAILABLE'
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePwChange = (field) => (e) =>
    setPasswordForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        availabilityStatus: form.availabilityStatus
      };
      await usersApi.updateProfile(updateData);
      if (profilePicFile) {
        await usersApi.uploadProfilePicture(profilePicFile);
      }
      await refreshUser();
      setMessage('Profile updated!');
      setProfilePicFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const { oldPassword, newPassword, confirmNewPassword } = passwordForm;
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    setChangingPw(true);
    try {
      await usersApi.changePassword({ oldPassword, newPassword, confirmNewPassword });
      setMessage('Password changed!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Edit Profile</h1>
          <p>Update your personal information</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile')}>
            Cancel
          </button>
        </div>
      </div>

      {message && <div className="success-message">{message}<button className="message-dismiss" onClick={() => setMessage('')}>&times;</button></div>}
      {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}

      <div className="two-col">
        <div>
          <div className="card">
            <div className="card-header"><h2>Profile Info</h2></div>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={form.firstName} onChange={handleChange('firstName')} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={form.lastName} onChange={handleChange('lastName')} />
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={handleChange('bio')}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Availability</label>
                <select
                  value={form.availabilityStatus}
                  onChange={handleChange('availabilityStatus')}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={e => setProfilePicFile(e.target.files[0])}
                />
                <p className="form-hint">Max 5 MB. JPEG, PNG, GIF, or WebP.</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header"><h2>Change Password</h2></div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={handlePwChange('oldPassword')}
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePwChange('newPassword')}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePwChange('confirmNewPassword')}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={changingPw}>
                {changingPw ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
