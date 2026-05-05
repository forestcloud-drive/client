import React, { useEffect, useState } from 'react';

interface UserProfile {
  userId: string;
  fullname: string;
  email: string;
  role: string;
  hasAccess: boolean;
}

export const ProfileView = ({ 
  onToast,
  onNavigate
}: { 
  onToast: (msg: string, type: 'success' | 'error') => void;
  onNavigate: (tab: any) => void;
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
          setProfile(data);
        } else {
          onToast('Failed to fetch profile', 'error');
        }
      } catch (error) {
        onToast('An error occurred while fetching profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [onToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-lg font-medium">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-green-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-green-200">
            {profile.fullname[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-green-900">{profile.fullname}</h1>
            <p className="text-green-700 font-medium">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">User ID</span>
            <code className="text-sm font-mono text-gray-700 break-all bg-gray-100/50 p-2 rounded-lg block">
              {profile.userId}
            </code>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">Account Role</span>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold uppercase tracking-wide">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${profile.hasAccess ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-sm font-bold ${profile.hasAccess ? 'text-green-700' : 'text-red-700'}`}>
                {profile.hasAccess ? 'Access Granted' : 'Access Restricted'}
              </span>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30 flex items-center justify-center">
            <button 
              onClick={() => onNavigate('settings')}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-200"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
