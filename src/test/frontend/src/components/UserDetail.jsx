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

  const levelBadge = (level) => {
    switch (level) {
      case 'BEGINNER': return { color: '#dbeafe', text: '#2563eb' };
      case 'INTERMEDIATE': return { color: '#fef3c7', text: '#d97706' };
      case 'ADVANCED': return { color: '#dcfce7', text: '#16a34a' };
      case 'PROFESSIONAL': return { color: '#f3e8ff', text: '#7c3aed' };
      default: return { color: '#f1f5f9', text: '#64748b' };
    }
  };

  const statusClass = (s) => {
    switch (s) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'in_progress';
      case 'COMPLETED': return 'completed';
      default: return '';
    }
  };

  if (loading) return <div className="loading-screen">Loading profile...</div>;
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
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
        </div>
        <div className="profile-info">
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p>{profile.email}</p>
          {profile.bio && <p style={{ marginTop: 4 }}>{profile.bio}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`status-badge ${profile.availabilityStatus?.toLowerCase() || 'available'}`}>
              {profile.availabilityStatus || 'AVAILABLE'}
            </span>
            {profile.averageRating != null && (
              <span className="status-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                ⭐ {profile.averageRating.toFixed(1)}
              </span>
            )}
            <span className="status-badge" style={{ background: '#eef2ff', color: '#6366f1' }}>
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
            <p style={{ color: '#64748b', fontSize: 14 }}>No skills listed.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.skills.map(skill => {
                const badge = levelBadge(skill.experienceLevel);
                return (
                  <div key={skill.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: '#f8fafc', borderRadius: 8,
                    border: '1px solid #f1f5f9'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{skill.skillName}</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: badge.color, color: badge.text
                    }}>
                      {skill.experienceLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h2>Past Projects ({profile.pastProjects?.length || 0})</h2>
            </div>
            {(!profile.pastProjects || profile.pastProjects.length === 0) ? (
              <p style={{ color: '#64748b', fontSize: 14 }}>No past projects.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profile.pastProjects.map(p => (
                  <div key={p.id} className="search-result-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <div className="result-info">
                      <h4>{p.name}</h4>
                      <p>Role: {p.role}</p>
                    </div>
                    <span className={`status-badge ${statusClass(p.status)}`}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ratings.map(r => (
                  <div key={r.id} className="search-result-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${r.projectId}`)}
                  >
                    <div className="result-info">
                      <h4>From: {r.raterName}</h4>
                      <p>Score: {'⭐'.repeat(r.score)} ({r.score}/5)</p>
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
