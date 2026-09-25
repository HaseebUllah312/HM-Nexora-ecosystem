'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  created_at?: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);

  // Avatar specific states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const userObj = data.user || data;
          setUser(userObj);
          setFormData({ username: userObj.username || '', email: userObj.email || '' });
        } else {
          router.push('/login');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      setError('Failed to logout');
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setAvatarMessage({ type: 'error', text: 'Image must be smaller than 5MB.' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarMessage(null);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setAvatarMessage(null);

    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAvatarMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setUser(prev => prev ? { ...prev, avatar_url: data.avatar_url } : null);
        setAvatarFile(null); // Clear pending file state

        // Let the user know the page should be reloaded or the header will immediately reflect it due to fetch constraints on layout
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setAvatarMessage({ type: 'error', text: data.error || 'Failed to update profile picture' });
      }
    } catch (err) {
      setAvatarMessage({ type: 'error', text: 'A network error occurred while uploading. Please try again.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="alert alert-error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        padding: '40px',
        borderRadius: '15px',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>👤</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '15px' }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)' }} />
            ) : user.avatar_url ? (
              <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `/api/download/${user.avatar_url}?mode=inline`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(102, 126, 234, 0.5)' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: 'var(--primary)',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '2px solid var(--bg)'
            }}>
              📷
              <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleAvatarFileChange} disabled={uploadingAvatar} />
            </label>
          </div>

          {avatarFile && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAvatarUpload}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Uploading...' : 'Save Picture'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); setAvatarMessage(null); }}
                disabled={uploadingAvatar}
              >
                Cancel
              </button>
            </div>
          )}

          {avatarMessage && (
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: avatarMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
              {avatarMessage.text}
            </p>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(102, 126, 234, 0.2)', marginBottom: '30px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Account Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="btn btn-outline btn-sm"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!editMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Username</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.username}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Email</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email || 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Role</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</p>
            </div>
            {user.created_at && (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' }}>Member Since</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch('/api/profile/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                  });
                  if (res.ok) {
                    setUser(prev => prev ? { ...prev, ...formData } : null);
                    setEditMode(false);
                    alert('Profile updated successfully!');
                  } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to update profile');
                  }
                } catch (err) {
                  alert('A network error occurred');
                } finally {
                  setSaving(false);
                }
              }}
              className="btn btn-primary"
              style={{ padding: '12px 30px', cursor: 'pointer' }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>🔒 Security</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <Link href="/forgot-password" className="btn btn-outline" style={{ textAlign: 'center', padding: '12px' }}>
            Change Password
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ padding: '12px', cursor: 'pointer', color: '#ff6b6b' }}
          >
            Logout from This Device
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>⚙️ Preferences</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <span>Email notifications for announcements</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <span>Email notifications for new resources</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <span>Marketing emails and updates</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'rgba(255, 107, 107, 0.08)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(255, 107, 107, 0.2)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#ff6b6b' }}>⚠️ Danger Zone</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          className="btn btn-outline"
          style={{ padding: '12px 30px', cursor: 'pointer', color: '#ff6b6b', borderColor: '#ff6b6b' }}
        >
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
}
