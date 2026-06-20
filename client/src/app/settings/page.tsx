'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { updateMe, changePassword } from '@/services/authApi';
import {
  ArrowLeft,
  Monitor,
  Cpu,
  User,
  Key,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Editor prefs
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [fontSize, setFontSize] = useState(user?.preferences?.fontSize || 14);
  const [tabSize, setTabSize] = useState(user?.preferences?.tabSize || 2);
  const [wordWrap, setWordWrap] = useState(user?.preferences?.wordWrap ?? true);
  const [minimap, setMinimap] = useState(user?.preferences?.minimap ?? true);
  const [autoSave, setAutoSave] = useState(user?.preferences?.autoSave ?? true);

  // AI config
  const [aiProvider, setAiProvider] = useState(user?.aiConfig?.provider || 'google');
  const [aiModel, setAiModel] = useState(user?.aiConfig?.model || 'gpt-4o');
  const [aiKey, setAiKey] = useState('');
  const [temperature, setTemperature] = useState(user?.aiConfig?.temperature || 0.3);

  // Account
  const [fullName, setFullName] = useState(user?.fullName || '');

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Status
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');

  const showMsg = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSaveEditor = async () => {
    try {
      const updated = await updateMe({
        preferences: { theme, fontSize, tabSize, wordWrap, minimap, autoSave },
      });
      setUser(updated);
      showMsg('Editor settings saved');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveAI = async () => {
    try {
      const updates: Record<string, any> = { provider: aiProvider, model: aiModel, temperature };
      if (aiKey) updates.apiKey = aiKey;
      const updated = await updateMe({ aiConfig: updates });
      setUser(updated);
      showMsg('AI settings saved');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveAccount = async () => {
    try {
      const updated = await updateMe({ fullName });
      setUser(updated);
      showMsg('Account updated');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (newPw !== confirmPw) {
      setError('Passwords do not match');
      return;
    }
    try {
      const data = await changePassword(currentPw, newPw);
      // Update tokens
      if (user) {
        setAuth(user, data.accessToken, data.refreshToken);
      }
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showMsg('Password changed. All other sessions invalidated.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="settings-page">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-header-logo">N</div>
          <span className="dashboard-header-title">Settings</span>
        </div>
      </header>

      <div className="settings-content">
        <Link href="/dashboard" className="settings-back">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <h1 className="settings-title">Settings</h1>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
        {saveMsg && <div className="settings-save-msg"><Check size={12} /> {saveMsg}</div>}

        {/* Editor Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title"><Monitor size={16} /> Editor</h3>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Theme</div>
            </div>
            <select className="settings-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Font Size</div>
            <select className="settings-select" value={fontSize} onChange={(e) => setFontSize(+e.target.value)}>
              {[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Tab Size</div>
            <select className="settings-select" value={tabSize} onChange={(e) => setTabSize(+e.target.value)}>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Word Wrap</div>
            <button
              className={`settings-toggle ${wordWrap ? 'settings-toggle-active' : ''}`}
              onClick={() => setWordWrap(!wordWrap)}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Minimap</div>
            <button
              className={`settings-toggle ${minimap ? 'settings-toggle-active' : ''}`}
              onClick={() => setMinimap(!minimap)}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Auto Save</div>
            <button
              className={`settings-toggle ${autoSave ? 'settings-toggle-active' : ''}`}
              onClick={() => setAutoSave(!autoSave)}
            />
          </div>

          <button className="auth-btn" style={{ marginTop: 12 }} onClick={handleSaveEditor}>
            Save Editor Settings
          </button>
        </div>

        {/* AI Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title"><Cpu size={16} /> AI Configuration</h3>

          <div className="settings-row">
            <div className="settings-row-label">Provider</div>
            <select
              id="ai-provider"
              className="settings-select"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
            >
              <option value="google">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Model</div>
            <input
              className="settings-input"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="gemini-2.5-flash"
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">API Key</div>
              <div className="settings-row-desc">Encrypted at rest. Never visible after saving.</div>
            </div>
            <input
              className="settings-input"
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="AIza..."
              style={{ width: 200 }}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Temperature</div>
            <input
              className="settings-input"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(+e.target.value)}
              style={{ width: 80 }}
            />
          </div>

          <button className="auth-btn" style={{ marginTop: 12 }} onClick={handleSaveAI}>
            Save AI Settings
          </button>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <h3 className="settings-section-title"><User size={16} /> Account</h3>

          <div className="settings-row">
            <div className="settings-row-label">Full Name</div>
            <input
              className="settings-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-label">Email</div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</span>
          </div>

          <button className="auth-btn" style={{ marginTop: 12 }} onClick={handleSaveAccount}>
            Save Account
          </button>
        </div>

        {/* Change Password */}
        <div className="settings-section">
          <h3 className="settings-section-title"><Key size={16} /> Change Password</h3>

          <div className="auth-field" style={{ marginBottom: 12 }}>
            <label className="auth-label">Current Password</label>
            <input className="auth-input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="auth-field" style={{ marginBottom: 12 }}>
            <label className="auth-label">New Password</label>
            <input className="auth-input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div className="auth-field" style={{ marginBottom: 12 }}>
            <label className="auth-label">Confirm New Password</label>
            <input className="auth-input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>

          <button className="auth-btn" onClick={handleChangePassword} disabled={!currentPw || !newPw}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
