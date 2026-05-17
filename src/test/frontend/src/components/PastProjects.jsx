import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import { IconFileText } from './Icons';

export default function PastProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi.getPastProjects()
      .then(res => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading past projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Past Projects</h1>
          <p>Projects you have completed or left</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconFileText /></div>
            <p>No past projects yet. Completed or left projects will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <div
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <h3>{p.name}</h3>
              <p className="project-description">Your role: {p.role}</p>
              <div className="project-meta">
                <span className={`status-badge ${p.status === 'COMPLETED' ? 'completed' : p.status === 'IN_PROGRESS' ? 'in_progress' : 'open'}`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
