import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as usersApi from '../api/users';
import * as skillsApi from '../api/skills';
import * as projectsApi from '../api/projects';
import { IconStarFilled } from './Icons';

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('BEGINNER');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pastProjects, setPastProjects] = useState([]);

  useEffect(() => {
    skillsApi.listSkills()
      .then(res => setAllSkills(
        (res.data || []).slice().sort((a, b) => a.name.localeCompare(b.name))
      ))
      .catch(() => {});
    projectsApi.getPastProjects()
      .then(res => setPastProjects(res.data))
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

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
        </div>
        <div className="profile-info">
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-bio">{user?.bio || 'No bio yet'}</p>
          <div className="profile-meta">
            <span className={`status-badge ${user?.availabilityStatus?.toLowerCase() || 'available'}`}>
              {user?.availabilityStatus || 'AVAILABLE'}
            </span>
            {user?.averageRating != null && (
              <span className="status-badge" style={{ background: '#fef3c7', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <IconStarFilled size={12} /> {user.averageRating.toFixed(1)}
              </span>
            )}
            <span className="status-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-text-on-light)' }}>
              {user?.role}
            </span>
          </div>
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
                <span key={skill.id} className="skill-tag">
                  {skill.skillName} ({skill.experienceLevel})
                  <button className="remove-skill" onClick={() => handleRemoveSkill(skill.skillId)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No skills added yet.</p>
          )}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            {message && <div className="success-message">{message}<button className="message-dismiss" onClick={() => setMessage('')}>&times;</button></div>}
            {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}
            <div className="form-row">
              <div className="form-group">
                <select
                  value={selectedSkill}
                  onChange={e => setSelectedSkill(e.target.value)}
                >
                  <option value="">Select skill...</option>
                  {allSkills
                    .filter(s => !userSkills.some(us => us.skillId === s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="form-group" style={{ flex: '0 0 auto', width: 140 }}>
                <select
                  value={selectedLevel}
                  onChange={e => setSelectedLevel(e.target.value)}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="PROFESSIONAL">Professional</option>
                </select>
              </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Role</span>
              <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{user?.role}</p>
            </div>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Member since</span>
              <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div style={{ marginTop: 8 }}>
              <Link to="/profile/edit" className="btn btn-secondary btn-sm">Edit Profile</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Past Projects ({pastProjects.length})</h2>
        </div>
        {pastProjects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No past projects yet. Completed or left projects will appear here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pastProjects.map(p => (
              <div key={p.id} className="search-result-item clickable" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="result-info">
                  <h4>{p.name}</h4>
                  <p>Your role: {p.role}</p>
                </div>
                <span className={`status-badge ${p.status === 'COMPLETED' ? 'completed' : p.status === 'IN_PROGRESS' ? 'in_progress' : 'open'}`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
