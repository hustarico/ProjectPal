import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import * as tasksApi from '../api/tasks';
import * as invitationsApi from '../api/invitations';
import * as searchApi from '../api/search';
import Chat from './Chat';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [projRes, tasksRes, membersRes] = await Promise.all([
          projectsApi.getProject(id),
          tasksApi.getProjectTasks(id),
          projectsApi.getProjectMembers(id)
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        setMembers(membersRes.data);
      } catch {
        setError('Failed to load project.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isOwner = user && project && project.ownerId === user.id;
  const myMembership = members.find(m => m.userId === user?.id);
  const isAdmin = myMembership?.memberRole === 'ADMIN';
  const canManageTasks = isOwner || isAdmin;

  const statusClass = (s) => {
    switch (s) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'in_progress';
      case 'COMPLETED': return 'completed';
      default: return '';
    }
  };

  const showError = (msg) => { setError(msg); setSuccess(''); };
  const showSuccess = (msg) => { setSuccess(msg); setError(''); };

  const handleUpdateProject = async (data) => {
    try {
      const res = await projectsApi.updateProject(id, data);
      setProject(res.data);
      showSuccess('Project updated!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update project.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project permanently?')) return;
    try {
      await projectsApi.deleteProject(id);
      navigate('/');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const description = e.target.description.value;
    const deadline = e.target.deadline.value || null;
    if (!title.trim()) return;
    try {
      const res = await tasksApi.createTask(id, { title, description, deadline });
      setTasks(prev => [...prev, res.data]);
      e.target.reset();
      showSuccess('Task created!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleAssignTask = async (taskId, assigneeId) => {
    if (!assigneeId) return;
    try {
      await tasksApi.assignTask(taskId, Number(assigneeId));
      const res = await tasksApi.getProjectTasks(id);
      setTasks(res.data);
      showSuccess('Task assigned!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign task.');
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await tasksApi.updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showSuccess('Task deleted.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  if (loading) return <div className="loading-screen">Loading project...</div>;
  if (!project) return <div className="loading-screen">Project not found.</div>;

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p>{project.description || 'No description'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`status-badge ${statusClass(project.status)}`}>
            {project.status?.replace('_', ' ')}
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}<button style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => setError('')}>×</button></div>}
      {success && <div className="success-message">{success}<button style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => setSuccess('')}>×</button></div>}

      <div className="tabs">
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          Tasks ({tasks.length})
        </button>
        <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          Members ({members.length})
        </button>
        <button className={`tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>
          Chat
        </button>
        {isOwner && (
          <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            Settings
          </button>
        )}
      </div>

      {tab === 'tasks' && (
        <TasksTab
          canManage={canManageTasks}
          members={members}
          tasks={tasks}
          todoTasks={todoTasks}
          inProgressTasks={inProgressTasks}
          doneTasks={doneTasks}
          currentUserId={user?.id}
          onCreateTask={handleCreateTask}
          onAssignTask={handleAssignTask}
          onUpdateStatus={handleUpdateStatus}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {tab === 'members' && (
        <MembersTab
          projectId={Number(id)}
          members={members}
          isOwner={isOwner}
          onMembersChange={setMembers}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}

      {tab === 'chat' && <Chat projectId={Number(id)} />}

      {tab === 'settings' && isOwner && (
        <SettingsTab project={project} onUpdate={handleUpdateProject} onDelete={handleDelete} />
      )}
    </div>
  );
}

function TasksTab({ canManage, members, tasks, todoTasks, inProgressTasks, doneTasks, currentUserId, onCreateTask, onAssignTask, onUpdateStatus, onDeleteTask }) {
  return (
    <div>
      {canManage && (
        <div className="card mb-4">
          <form onSubmit={onCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input name="title" placeholder="Task title" style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }} required />
              <input name="deadline" type="datetime-local" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <button type="submit" className="btn btn-primary btn-sm">Add Task</button>
            </div>
            <textarea
              name="description"
              placeholder="Description (optional)"
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, minHeight: 40 }}
            />
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state"><p>No tasks yet.</p></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 14, color: '#64748b' }}>TODO</h3>
          {todoTasks.length === 0 ? <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>No tasks</p> : (
            <div className="task-list">
              {todoTasks.map(task => (
                <TaskItem key={task.id} task={task} canManage={canManage} members={members} currentUserId={currentUserId}
                  onAssign={onAssignTask} onStatusChange={onUpdateStatus} onDelete={onDeleteTask} />
              ))}
            </div>
          )}
          <h3 style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>IN PROGRESS</h3>
          {inProgressTasks.length === 0 ? <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>No tasks</p> : (
            <div className="task-list">
              {inProgressTasks.map(task => (
                <TaskItem key={task.id} task={task} canManage={canManage} members={members} currentUserId={currentUserId}
                  onAssign={onAssignTask} onStatusChange={onUpdateStatus} onDelete={onDeleteTask} />
              ))}
            </div>
          )}
          <h3 style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>DONE</h3>
          {doneTasks.length === 0 ? <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>No tasks</p> : (
            <div className="task-list">
              {doneTasks.map(task => (
                <TaskItem key={task.id} task={task} canManage={canManage} members={members} currentUserId={currentUserId}
                  onAssign={onAssignTask} onStatusChange={onUpdateStatus} onDelete={onDeleteTask} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, canManage, members, currentUserId, onAssign, onStatusChange, onDelete }) {
  const [assigneeId, setAssigneeId] = useState('');

  const canEditStatus = canManage || task.assigneeId === currentUserId;
  const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'DONE';
  const nonOwnerMembers = members.filter(m => m.memberRole !== 'OWNER');

  return (
    <div className="task-item">
      <div className="task-info">
        <h4>{task.title}</h4>
        {task.description && <p>{task.description}</p>}
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
          {task.assigneeName ? `Assigned to: ${task.assigneeName}` : 'Unassigned'}
          {task.deadline && ` · Due: ${new Date(task.deadline).toLocaleDateString()}`}
        </p>
      </div>
      <div className="task-actions">
        {canEditStatus && task.status !== 'DONE' && (
          <button className="btn btn-sm btn-secondary" onClick={() => onStatusChange(task.id, nextStatus)}>
            {nextStatus === 'IN_PROGRESS' ? 'Start' : 'Complete'}
          </button>
        )}
        {canManage && !task.assigneeId && nonOwnerMembers.length > 0 && (
          <form onSubmit={(e) => { e.preventDefault(); onAssign(task.id, assigneeId); }} style={{ display: 'flex', gap: 4 }}>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 12 }}
            >
              <option value="">Assign to...</option>
              {nonOwnerMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-sm btn-secondary">Assign</button>
          </form>
        )}
        {canManage && (
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(task.id)}>×</button>
        )}
      </div>
    </div>
  );
}

function MembersTab({ projectId, members, isOwner, onMembersChange, showSuccess, showError }) {
  const [inviteModal, setInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [roleLoading, setRoleLoading] = useState(null);

  useEffect(() => {
    if (isOwner) {
      invitationsApi.getJoinRequests(projectId)
        .then(res => setJoinRequests(res.data))
        .catch(() => {});
    }
  }, [projectId, isOwner]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchApi.searchUsersByName(searchQuery.trim());
      const memberIds = new Set(members.map(m => m.userId));
      setSearchResults(res.data.filter(u => !memberIds.has(u.id)));
    } catch {
      showError('Search failed. Make sure the backend is running.');
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (receiverId) => {
    try {
      await invitationsApi.sendInvite(projectId, receiverId);
      showSuccess('Invitation sent!');
      setSearchResults(prev => prev.filter(u => u.id !== receiverId));
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send invitation.');
    }
  };

  const handleRespondJoinRequest = async (invitationId, accept) => {
    try {
      await invitationsApi.respondToInvitation(invitationId, accept);
      const updated = joinRequests.filter(jr => jr.id !== invitationId);
      setJoinRequests(updated);
      if (accept) {
        const membersRes = await projectsApi.getProjectMembers(projectId);
        onMembersChange(membersRes.data);
      }
      showSuccess(accept ? 'Join request approved! The user is now a member.' : 'Join request rejected.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to respond.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(userId);
    try {
      const res = await projectsApi.updateMemberRole(projectId, userId, newRole);
      onMembersChange(res.data);
      showSuccess(`Member role updated to ${newRole}!`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setRoleLoading(null);
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'OWNER': return { label: 'Owner', cls: 'open' };
      case 'ADMIN': return { label: 'Admin', cls: 'in_progress' };
      case 'MEMBER': return { label: 'Member', cls: 'completed' };
      default: return { label: role, cls: '' };
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Project Members ({members.length})</h2>
          {isOwner && (
            <button className="btn btn-primary btn-sm" onClick={() => setInviteModal(true)}>
              + Invite People
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map(m => {
            const rb = roleBadge(m.memberRole);
            const avatarUrl = m.profilePictureUrl
              ? `http://localhost:8080${m.profilePictureUrl}`
              : null;
            const initials = `${(m.firstName?.[0] || '')}${(m.lastName?.[0] || '')}`.toUpperCase();
            return (
              <div key={m.userId} className="search-result-item">
                <div className="result-avatar">
                  {avatarUrl ? <img src={avatarUrl} alt="" /> : initials || '?'}
                </div>
                <div className="result-info">
                  <h4>{m.firstName} {m.lastName}</h4>
                  <p>{m.email}</p>
                </div>
                <span className={`status-badge ${rb.cls}`}>{rb.label}</span>
                {isOwner && m.memberRole !== 'OWNER' && (
                  <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                    {m.memberRole === 'MEMBER' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={roleLoading === m.userId}
                        onClick={() => handleRoleChange(m.userId, 'ADMIN')}
                        title="Promote to Admin"
                      >
                        {roleLoading === m.userId ? '...' : '↑ Admin'}
                      </button>
                    )}
                    {m.memberRole === 'ADMIN' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={roleLoading === m.userId}
                        onClick={() => handleRoleChange(m.userId, 'MEMBER')}
                        title="Demote to Member"
                      >
                        {roleLoading === m.userId ? '...' : '↓ Member'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isOwner && joinRequests.length > 0 && (
        <div className="card" style={{ border: '1px solid #fef3c7', background: '#fffbeb' }}>
          <div className="card-header"><h2>Pending Join Requests ({joinRequests.length})</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {joinRequests.map(jr => (
              <div key={jr.id} className="search-result-item">
                <div className="result-info">
                  <h4>{jr.senderName}</h4>
                  <p>wants to join this project</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => handleRespondJoinRequest(jr.id, true)}>Accept</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleRespondJoinRequest(jr.id, false)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isOwner && (
        <div className="card" style={{ background: '#f8fafc' }}>
          <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
            Only the project owner can invite new members and manage roles.
          </p>
        </div>
      )}

      {inviteModal && (
        <div className="modal-overlay" onClick={() => setInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Invite People to Project</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
              Search for users by name and send them an invitation.
            </p>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users by name..."
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {!searchQuery && !searching && (
              <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 16 }}>
                Type a name above to find users
              </p>
            )}

            {searchQuery && !searching && searchResults.length === 0 && (
              <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 16 }}>
                No users found matching &quot;{searchQuery}&quot;. They may already be members.
              </p>
            )}

            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {searchResults.map(u => (
                  <div key={u.id} className="search-result-item">
                    <div className="result-info">
                      <h4>{u.firstName} {u.lastName}</h4>
                      <p>{u.email}</p>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => handleInvite(u.id)}>
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setInviteModal(false); setSearchResults([]); setSearchQuery(''); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ project, onUpdate, onDelete }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status);

  const handleSave = (e) => {
    e.preventDefault();
    const update = {};
    if (name !== project.name) update.name = name;
    if (description !== (project.description || '')) update.description = description;
    if (status !== project.status) update.status = status;
    if (Object.keys(update).length === 0) return;
    onUpdate(update);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header"><h2>Update Project</h2></div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header"><h2>Danger Zone</h2></div>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
          Deleting a project is irreversible. All data will be lost.
        </p>
        <button className="btn btn-danger" onClick={onDelete}>Delete Project</button>
      </div>
    </div>
  );
}
