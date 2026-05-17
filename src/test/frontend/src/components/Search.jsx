import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as searchApi from '../api/search';
import * as skillsApi from '../api/skills';
import { IconSearch } from './Icons';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('users');
  const [results, setResults] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    skillsApi.listSkills()
      .then(res => setAllSkills(
        (res.data || []).slice().sort((a, b) => a.name.localeCompare(b.name))
      ))
      .catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setError('');
    setResults(null);

    if (mode === 'users' && !query.trim() && !selectedSkill) {
      setError('Enter a name or select a skill to search.');
      return;
    }
    if (mode === 'projects' && !query.trim()) {
      setError('Enter a project name to search.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'users') {
        if (selectedSkill) {
          res = await searchApi.advancedSearch({
            name: query.trim() || undefined,
            skillIds: selectedSkill ? [Number(selectedSkill)] : []
          });
        } else {
          res = await searchApi.searchUsersByName(query.trim());
        }
      } else {
        res = await searchApi.searchProjects(query.trim());
      }
      setResults(res.data);
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSearch = async () => {
    if (!selectedSkill) return;
    setError('');
    setResults(null);
    setLoading(true);
    try {
      const res = await searchApi.searchUsersBySkill(Number(selectedSkill));
      setResults(res.data);
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Search</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Find Users & Projects</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className={`btn btn-sm ${mode === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setMode('users'); setResults(null); }}
          >
            Users
          </button>
          <button
            className={`btn btn-sm ${mode === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setMode('projects'); setResults(null); }}
          >
            Projects
          </button>
        </div>

        <form onSubmit={handleSearch} className="form-row">
          <div className="form-group">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={mode === 'users' ? 'Search users by name...' : 'Search projects by name...'}
            />
          </div>
          {mode === 'users' && (
            <div className="form-group" style={{ flex: '0 0 auto' }}>
              <select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
              >
                <option value="">All skills</option>
                {allSkills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {mode === 'users' && selectedSkill && (
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-sm btn-secondary" onClick={handleSkillSearch} disabled={loading}>
              Search by selected skill
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}

      {results !== null && (
        <div style={{ marginTop: 20 }}>
          {results.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><IconSearch /></div>
                <p>No results found.</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              <div className="search-results">
                {results.map(item => {
                  if (mode === 'projects' || item.projectName || item.name) {
                    const project = item;
                    return (
                      <div
                        key={project.id}
                        className="search-result-item clickable"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div className="result-info">
                          <h4>{project.name || project.projectName}</h4>
                          <p>{project.description || project.projectDescription || ''}</p>
                          {project.status && (
                            <span className={`status-badge ${project.status.toLowerCase()}`} style={{ marginTop: 6 }}>
                              {project.status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  const user = item;
                  const initials = `${(user.firstName?.[0] || '')}${(user.lastName?.[0] || '')}`.toUpperCase();
                  const avatarUrl = user.profilePictureUrl
                    ? `http://localhost:8080${user.profilePictureUrl}`
                    : null;
                  return (
                    <div
                      key={user.id}
                      className="search-result-item clickable"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <div className="result-avatar">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : initials || '?'}
                      </div>
                      <div className="result-info">
                        <h4>{user.firstName} {user.lastName}</h4>
                        <p>{user.email}</p>
                        {user.bio && <p>{user.bio}</p>}
                        {user.skills && user.skills.length > 0 && (
                          <div className="skills-list" style={{ marginTop: 8 }}>
                            {user.skills.map((s, i) => (
                              <span key={i} className="skill-tag">{s.skillName} ({s.experienceLevel})</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`status-badge ${user.availabilityStatus?.toLowerCase()}`}>
                          {user.availabilityStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
