import { useState, useEffect } from 'react';
import * as skillsApi from '../src/api/skills';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        <div className="card-body">
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
          {skills.length === 0 ? (
            <div className="empty-state"><p>No skills defined yet.</p></div>
          ) : (
            <div className="admin-skill-grid">
              {skills.map(skill => (
                <span key={skill.id} className="skill-tag">{skill.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
