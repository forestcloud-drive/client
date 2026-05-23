import React, { useEffect, useState } from 'react';
import { DeleteUserModal } from './DeleteUserModal';

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
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const performAction = async (action: string, body: any = {}) => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        onToast('Action successful', 'success');
      } else {
        const data = await res.json();
        onToast(data.message || 'Action failed', 'error');
      }
    } catch (e) {
      onToast('An error occurred', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

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

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onToast('User deleted successfully', 'success');
        onBack();
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (e) {
      onToast('An error occurred', 'error');
    } finally {
      setIsActionLoading(false);
      setIsDeleteModalOpen(false);
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
              Access Control
            </span>
            <button
              onClick={() => performAction(user.hasAccess ? 'restrict-access' : 'give-access')}
              disabled={isActionLoading}
              className={`w-full py-2 rounded-lg font-bold text-sm ${user.hasAccess ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {user.hasAccess ? 'Restrict Access' : 'Give Access'}
            </button>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30 space-y-3">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block">Role Management</span>
            <select
              value={user.role}
              onChange={(e) => performAction('role', { role: e.target.value })}
              className="w-full bg-white/50 border-2 border-gray-300 rounded-lg px-3 py-2 font-bold text-gray-900 text-sm focus:border-green-600 outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">
              Danger Zone
            </span>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isActionLoading}
              className="w-full py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50"
            >
              Delete User
            </button>
          </div>

          <DeleteUserModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            isLoading={isActionLoading}
          />

          <div className="bg-white/50 p-6 rounded-2xl border border-white/30 col-span-2">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">
              Reset Password
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/50 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.38-3.468M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.31.96-1.042 2.05-2.074 3.01M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              <button
                onClick={() => performAction('password', { newPassword })}
                disabled={!newPassword || isActionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Set
              </button>
            </div>
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
