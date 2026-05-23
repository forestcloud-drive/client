import React, { useState, useEffect } from 'react';

interface SettingsViewProps {
  onToast: (msg: string, type: 'success' | 'error') => void;
  onLogout: () => void;
}

export const SettingsView = ({ onToast, onLogout }: SettingsViewProps) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFullname(data.fullname);
          setEmail(data.email);
        }
      } catch (error) {
        onToast('Failed to load profile data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [onToast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !email.trim()) return;

    setIsUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullname, email })
      });

      if (res.ok) {
        const data = await res.json();
        setFullname(data.fullname);
        setEmail(data.email);
        onToast('Profile updated successfully', 'success');
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      onToast('An error occurred', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onToast('Passwords do not match', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (res.ok) {
        onToast('Password changed successfully. Please login again.', 'success');
        setTimeout(() => {
          onLogout();
        }, 1500);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      onToast('An error occurred', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar pb-10">
      <h1 className="text-3xl font-extrabold text-green-900 mb-2">Account Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Information
          </h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-200 disabled:opacity-50 mt-4"
            >
              {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security
          </h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                placeholder="••••••••"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl font-bold hover:bg-green-50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
