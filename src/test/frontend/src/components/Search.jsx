import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as searchApi from '../api/search';
import * as skillsApi from '../api/skills';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('users');
  const [results, setResults] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSkills = async () => {
    if (allSkills.length === 0) {
      try {
        const res = await skillsApi.listSkills();
        setAllSkills(res.data);
      } catch {}
    }
  };

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
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={mode === 'users' ? 'Search users by name...' : 'Search projects by name...'}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}
          />
          {mode === 'users' && (
            <select
              value={selectedSkill}
              onChange={e => { setSelectedSkill(e.target.value); loadSkills(); }}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}
            >
              <option value="">All skills</option>
              {allSkills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {results !== null && (
        <div style={{ marginTop: 16 }}>
          {results.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <p>No results found.</p>
              </div>
            </div>
          ) : (
            <div className="search-results">
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map(item => {
                if (mode === 'projects' || item.projectName || item.name) {
                  const project = item;
                  return (
                    <div
                      key={project.id}
                      className="search-result-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="result-info">
                        <h4>{project.name || project.projectName}</h4>
                        <p>{project.description || project.projectDescription || ''}</p>
                        {project.status && (
                          <span className={`status-badge ${project.status.toLowerCase()}`} style={{ marginTop: 4 }}>
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
                  <div key={user.id} className="search-result-item">
                    <div className="result-avatar">
                      {avatarUrl ? <img src={avatarUrl} alt="" /> : initials || '?'}
                    </div>
                    <div className="result-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p>{user.email}</p>
                      {user.bio && <p>{user.bio}</p>}
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
          )}
        </div>
      )}
    </div>
  );
}
