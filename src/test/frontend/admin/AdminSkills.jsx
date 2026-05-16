import { useState, useEffect } from 'react';
import * as adminApi from './admin';
import * as skillsApi from '../src/api/skills';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSkills = async () => {
    try {
      const res = await skillsApi.listSkills();
      setSkills(res.data);
    } catch {
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!skillName.trim()) {
      setError('Skill name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await skillsApi.createSkill(skillName.trim());
      setSkills(prev => [...prev, res.data]);
      setSkillName('');
      setMessage(`Skill "${res.data.name}" created.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId, name) => {
    if (!window.confirm(`Delete skill "${name}"? This cannot be undone.`)) return;
    setDeletingId(skillId);
    setError('');
    setMessage('');
    try {
      await adminApi.deleteSkill(skillId);
      setSkills(prev => prev.filter(s => s.id !== skillId));
      setMessage(`Skill "${name}" deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete skill.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading skills...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Skills</h1>
          <p>Add and manage skills</p>
        </div>
      </div>

      {message && <div className="success-message">{message}<button className="message-dismiss" onClick={() => setMessage('')}>&times;</button></div>}
      {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}

      <div className="admin-card">
        <div className="card-header">
          <h2>Add New Skill</h2>
        </div>
        <form className="admin-skill-form" onSubmit={handleAddSkill}>
          <input
            type="text"
            value={skillName}
            onChange={e => setSkillName(e.target.value)}
            placeholder="Enter skill name (e.g. Kubernetes)"
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Skill'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2>All Skills ({skills.length})</h2>
        </div>
        {skills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#9733;</div>
            <p>No skills defined yet.</p>
          </div>
        ) : (
          <div className="admin-skill-grid">
            {skills.map(skill => (
              <span key={skill.id} className="admin-skill-item">
                {skill.name}
                <button
                  className="delete-skill-btn"
                  onClick={() => handleDeleteSkill(skill.id, skill.name)}
                  disabled={deletingId === skill.id}
                  title={`Delete ${skill.name}`}
                >
                  {deletingId === skill.id ? '\u23F3' : '\u00D7'}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
