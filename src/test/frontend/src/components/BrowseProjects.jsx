import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import * as invitationsApi from '../api/invitations';

export default function BrowseProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    projectsApi.browseProjects()
      .then(res => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (projectId) => {
    setActionMsg('');
    try {
      await invitationsApi.requestToJoin(projectId);
      setActionMsg('Join request sent!');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to send join request.');
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'in_progress';
      case 'COMPLETED': return 'completed';
      default: return '';
    }
  };

  if (loading) return <div className="loading-screen">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Browse Projects</h1>
          <p>Find projects to join and collaborate on</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>
          Create Project
        </button>
      </div>

      {actionMsg && (
        <div className={actionMsg.includes('sent') ? 'success-message' : 'error-message'}>
          {actionMsg}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>No open projects available right now.</p>
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div onClick={() => navigate(`/projects/${project.id}`)}>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description || 'No description'}</p>
                <div className="project-meta">
                  <span className={`status-badge ${statusClass(project.status)}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                  <span>by {project.ownerName}</span>
                </div>
              </div>
              {project.status === 'OPEN' && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={() => handleJoin(project.id)}
                >
                  Request to Join
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
