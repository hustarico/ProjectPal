import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as usersApi from '../api/users';
import * as skillsApi from '../api/skills';

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('BEGINNER');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    skillsApi.listSkills()
      .then(res => setAllSkills(
        (res.data || []).slice().sort((a, b) => a.name.localeCompare(b.name))
      ))
      .catch(() => {});
  }, []);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  const avatarUrl = user?.profilePictureUrl
    ? `http://localhost:8080${user.profilePictureUrl}`
    : null;

  const userSkills = user?.skills || [];

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    setError('');
    setMessage('');
    try {
      await usersApi.addSkill(Number(selectedSkill), selectedLevel);
      await refreshUser();
      setMessage('Skill added!');
      setSelectedSkill('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await usersApi.removeSkill(skillId);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove skill.');
    }
  };

  const levelBadgeColor = (level) => {
    switch (level) {
      case 'BEGINNER': return '#dbeafe';
      case 'INTERMEDIATE': return '#fef3c7';
      case 'ADVANCED': return '#dcfce7';
      case 'PROFESSIONAL': return '#f3e8ff';
      default: return '#f1f5f9';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </button>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
        </div>
        <div className="profile-info">
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p>{user?.email}</p>
          <p>{user?.bio || 'No bio yet'}</p>
          <p style={{ marginTop: 4 }}>
            Availability: <strong>{user?.availabilityStatus || 'AVAILABLE'}</strong>
            {user?.averageRating != null && (
              <span style={{ marginLeft: 16 }}>Rating: ⭐ {user.averageRating.toFixed(1)}</span>
            )}
          </p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2>Skills</h2>
          </div>
          {userSkills.length > 0 ? (
            <div className="skills-list">
              {userSkills.map(skill => (
                <span key={skill.id} className="skill-tag" style={{ background: levelBadgeColor(skill.experienceLevel) }}>
                  {skill.skillName} ({skill.experienceLevel})
                  <button className="remove-skill" onClick={() => handleRemoveSkill(skill.skillId)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: 14 }}>No skills added yet.</p>
          )}

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Select skill...</option>
                {allSkills
                  .filter(s => !userSkills.some(us => us.skillId === s.id))
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))
                }
              </select>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="PROFESSIONAL">Professional</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={handleAddSkill}>
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Account</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              Role: <strong>{user?.role}</strong>
            </p>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              Member since: <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</strong>
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Link to="/profile/edit" className="btn btn-secondary btn-sm">Edit Profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
