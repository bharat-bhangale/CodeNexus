'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { fetchProjects, createProject, deleteProject } from '@/services/projectApi';
import { logoutUser } from '@/services/authApi';
import {
  Plus,
  FolderOpen,
  Clock,
  FileCode2,
  Activity,
  Settings,
  LogOut,
  Trash2,
  Loader2,
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description: string;
  template: string;
  stats: { totalFiles: number; totalLines: number; healthScore: number | null };
  updatedAt: string;
  lastOpenedAt: string | null;
}

const TEMPLATES = [
  { id: 'blank', name: 'Blank', desc: 'Empty project' },
  { id: 'react', name: 'React App', desc: 'React + JSX starter' },
  { id: 'express', name: 'Express API', desc: 'Node.js REST API' },
  { id: 'fullstack', name: 'Full Stack', desc: 'React + Express' },
];

function getHealthColor(score: number | null): string {
  if (score === null) return 'var(--text-tertiary, #71717a)';
  if (score >= 86) return 'var(--health-cyan, #22d3ee)';
  if (score >= 71) return 'var(--health-green, #22c55e)';
  if (score >= 51) return 'var(--health-amber, #f59e0b)';
  if (score >= 31) return 'var(--health-orange, #f97316)';
  return 'var(--health-red, #ef4444)';
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logoutStore = useAuthStore((s) => s.logout);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Modal state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTemplate, setNewTemplate] = useState('blank');
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createProject({ name: newName, description: newDesc, template: newTemplate });
      setShowModal(false);
      setNewName('');
      setNewDesc('');
      setNewTemplate('blank');
      await loadProjects();
    } catch {
      // Silent
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? All files will be lost.')) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      // Silent
    }
  };

  const handleOpenProject = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleLogout = async () => {
    await logoutUser(refreshToken);
    logoutStore();
    router.push('/login');
  };

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-header-logo">N</div>
          <span className="dashboard-header-title">CodeNexus</span>
        </div>
        <div className="dashboard-header-right">
          <Link href="/settings" className="dashboard-avatar-btn" title="Settings">
            <Settings size={14} />
            <span>Settings</span>
          </Link>
          <button className="dashboard-avatar-btn" onClick={handleLogout} title="Sign out">
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h1>Welcome, {firstName}</h1>
          <p>Your projects — {projects.length} total</p>
        </div>

        {loading ? (
          <div className="auth-loading" style={{ minHeight: '200px' }}>
            <Loader2 size={24} className="auth-loading-spinner" />
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* New Project Card */}
            <div className="new-project-card" onClick={() => setShowModal(true)} role="button" tabIndex={0}>
              <div className="new-project-icon">
                <Plus size={24} />
              </div>
              <span className="new-project-label">New Project</span>
            </div>

            {/* Project Cards */}
            {projects.map((project) => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => handleOpenProject(project._id)}
                role="button"
                tabIndex={0}
              >
                <div className="project-card-actions">
                  <button
                    className="project-card-action project-card-action-delete"
                    onClick={(e) => handleDeleteProject(e, project._id)}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="project-card-name">
                  <FolderOpen size={16} />
                  {project.name}
                </h3>
                <p className="project-card-desc">
                  {project.description || 'No description'}
                </p>
                <div className="project-card-stats">
                  <span className="project-card-stat">
                    <FileCode2 size={12} />
                    {project.stats.totalFiles} files
                  </span>
                  <span className="project-card-stat">
                    <Activity size={12} />
                    <span
                      className="project-card-health"
                      style={{ color: getHealthColor(project.stats.healthScore) }}
                    >
                      {project.stats.healthScore ?? '—'}
                    </span>
                  </span>
                  <span className="project-card-template">{project.template}</span>
                </div>
                <div className="project-card-time">
                  <Clock size={10} /> Last edited {timeAgo(project.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Project</h2>
            <div className="auth-form">
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-proj-name">Project Name</label>
                <input
                  id="new-proj-name"
                  className="auth-input"
                  type="text"
                  placeholder="My Awesome App"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-proj-desc">Description (optional)</label>
                <input
                  id="new-proj-desc"
                  className="auth-input"
                  type="text"
                  placeholder="A brief description..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Template</label>
                <div className="template-grid">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`template-option ${newTemplate === t.id ? 'template-option-selected' : ''}`}
                      onClick={() => setNewTemplate(t.id)}
                    >
                      <div className="template-option-name">{t.name}</div>
                      <div className="template-option-desc">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="auth-btn" onClick={handleCreateProject} disabled={creating || !newName.trim()} style={{ width: 'auto', padding: '10px 24px' }}>
                {creating ? <Loader2 size={14} className="auth-loading-spinner" /> : null}
                <span>{creating ? 'Creating...' : 'Create Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
