import React, { useEffect, useState } from 'react';

interface UserDetail {
  userId: string;
  fullname: string;
  email: string;
  role: string;
  hasAccess: boolean;
  deletedAt: string | null;
}

interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export const UserDetailView = ({
  userId,
  onBack,
  onToast,
}: UserDetailViewProps) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullname, setEditFullname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setEditFullname(data.fullname);
          setEditEmail(data.email);
        } else {
          onToast('Failed to fetch user details', 'error');
        }
      } catch (error) {
        onToast('An error occurred while fetching user details', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, onToast]);

  const handleUpdate = async () => {
    if (!editFullname.trim() || !editEmail.trim()) {
      onToast('Full name and email are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: editFullname,
          email: editEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsEditing(false);
        onToast('User updated successfully', 'success');
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to update user', 'error');
      }
    } catch (error) {
      onToast('An error occurred while updating user', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-lg font-medium">User not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-green-700 hover:text-green-900 font-bold transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Users
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative">
        <button
          onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-green-100 text-green-700 transition-colors"
          title={isEditing ? 'Cancel' : 'Edit Profile'}
        >
          {isEditing ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-green-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-green-200 shrink-0">
            {user.fullname[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3 pr-10">
                <input
                  type="text"
                  value={editFullname}
                  onChange={(e) => setEditFullname(e.target.value)}
                  className="w-full text-2xl font-extrabold text-green-900 bg-white/50 border-b-2 border-green-600 outline-none px-2 py-1 rounded"
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-green-700 font-medium bg-white/50 border-b-2 border-green-600 outline-none px-2 py-1 rounded"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold text-green-900">
                  {user.fullname}
                </h1>
                <p className="text-green-700 font-medium">{user.email}</p>
              </>
            )}
            {user.deletedAt && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded border border-red-200">
                Account Deleted
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">
              User ID
            </span>
            <code className="text-sm font-mono text-gray-700 break-all bg-gray-100/50 p-2 rounded-lg block select-all">
              {user.userId}
            </code>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">
              Account Role
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">
              Status
            </span>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${user.hasAccess ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              />
              <span
                className={`text-sm font-bold ${user.hasAccess ? 'text-green-700' : 'text-red-700'}`}
              >
                {user.hasAccess ? 'Access Granted' : 'Access Restricted'}
              </span>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">
              Data Protection
            </span>
            <p className="text-sm text-gray-500 font-medium italic">
              User data is managed according to the system&apos;s privacy
              policy.
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-200 disabled:opacity-50"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
