import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as usersApi from '../api/users';
import * as ratingsApi from '../api/ratings';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profRes, ratRes] = await Promise.all([
          usersApi.getUserProfile(userId),
          ratingsApi.getUserRatings(userId)
        ]);
        setProfile(profRes.data);
        setRatings(ratRes.data);
      } catch {
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading profile...</div>;
  if (error) return <div className="loading-screen">{error}</div>;
  if (!profile) return <div className="loading-screen">User not found.</div>;

  const initials = `${(profile.firstName?.[0] || '')}${(profile.lastName?.[0] || '')}`.toUpperCase();
  const avatarUrl = profile.profilePictureUrl
    ? `http://localhost:8080${profile.profilePictureUrl}`
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User Profile</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
        </div>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
        </div>
        <div className="profile-info">
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p className="profile-email">{profile.email}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-meta">
            <span className={`status-badge ${profile.availabilityStatus?.toLowerCase() || 'available'}`}>
              {profile.availabilityStatus || 'AVAILABLE'}
            </span>
            {profile.averageRating != null && (
              <span className="status-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                {'\u2B50'} {profile.averageRating.toFixed(1)}
              </span>
            )}
            <span className="status-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-text-on-light)' }}>
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2>Skills ({profile.skills?.length || 0})</h2>
          </div>
          {(!profile.skills || profile.skills.length === 0) ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No skills listed.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.skills.map(skill => (
                <div key={skill.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'var(--surface-alt)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-light)'
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{skill.skillName}</span>
                  <span className={`status-badge ${skill.experienceLevel.toLowerCase()}`}>
                    {skill.experienceLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h2>Past Projects ({profile.pastProjects?.length || 0})</h2>
            </div>
            {(!profile.pastProjects || profile.pastProjects.length === 0) ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No past projects.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {profile.pastProjects.map(p => (
                  <div key={p.id} className="search-result-item clickable"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <div className="result-info">
                      <h4>{p.name}</h4>
                      <p>Role: {p.role}</p>
                    </div>
                    <span className={`status-badge ${p.status === 'COMPLETED' ? 'completed' : p.status === 'IN_PROGRESS' ? 'in_progress' : 'open'}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {ratings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2>Ratings ({ratings.length})</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ratings.map(r => (
                  <div key={r.id} className="search-result-item clickable"
                    onClick={() => navigate(`/projects/${r.projectId}`)}
                  >
                    <div className="result-info">
                      <h4>From: {r.raterName}</h4>
                      <p>{'\u2B50'.repeat(r.score)} ({r.score}/5)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
