import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';

export default function CreateProject() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await projectsApi.createProject({ name, description });
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Create Project</h1>
          <p>Start a new collaboration</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div className="error-message">{error}<button className="message-dismiss" onClick={() => setError('')}>&times;</button></div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Awesome Project"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
