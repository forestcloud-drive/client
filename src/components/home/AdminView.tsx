import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/ui/icons/Admin';
import { UserDetailView } from './UserDetailView';
import { AddUserModal } from './AddUserModal';
import { PlusIcon } from '@/components/ui/icons/Plus';
import clsx from 'clsx';

interface User {
  userId: string;
  fullname: string;
  email: string;
  role: string;
  hasAccess: boolean;
  deletedAt: string | null;
}

interface AdminViewProps {
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminView = ({ onToast }: AdminViewProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        onToast('Failed to load users', 'error');
      }
    } catch (error) {
      onToast('An error occurred while fetching users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.userId);
      }
    };
    fetchCurrentProfile();
    fetchUsers();
  }, [onToast]);

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal! < bVal!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal! > bVal!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (selectedUserId) {
    return (
      <UserDetailView
        userId={selectedUserId}
        onBack={() => {
          setSelectedUserId(null);
          fetchUsers();
        }}
        onToast={onToast}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar pb-10 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-extrabold text-green-900 flex items-center">
          <AdminIcon className="w-8 h-8 mr-3 text-green-700" />
          User Administration
        </h1>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-green-200">
            {users.length} Total Users
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:shadow-green-200/50 hover:shadow-lg active:scale-95 shadow-md"
          >
            <PlusIcon />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/50 border-b border-white/20">
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-green-700"
                  onClick={() => requestSort('fullname')}
                >
                  User{' '}
                  {sortConfig?.key === 'fullname'
                    ? sortConfig.direction === 'asc'
                      ? '↑'
                      : '↓'
                    : ''}
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-green-700"
                  onClick={() => requestSort('role')}
                >
                  Role{' '}
                  {sortConfig?.key === 'role'
                    ? sortConfig.direction === 'asc'
                      ? '↑'
                      : '↓'
                    : ''}
                </th>
                <th
                  className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-green-700"
                  onClick={() => requestSort('hasAccess')}
                >
                  Status{' '}
                  {sortConfig?.key === 'hasAccess'
                    ? sortConfig.direction === 'asc'
                      ? '↑'
                      : '↓'
                    : ''}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedUsers.map((user) => {
                const isAdmin = user.userId === currentUserId;
                return (
                  <tr
                    key={user.userId}
                    className={clsx(
                      'transition-colors group/row',
                      isAdmin
                        ? 'bg-green-50'
                        : 'hover:bg-white/30 cursor-pointer',
                    )}
                    onClick={() => !isAdmin && setSelectedUserId(user.userId)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={clsx(
                            'w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 shadow-inner',
                            isAdmin
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700',
                          )}
                        >
                          {user.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div
                            className={clsx(
                              'font-bold flex items-center',
                              isAdmin ? 'text-green-700' : 'text-green-900',
                            )}
                          >
                            <span>{user.fullname}</span>
                            {isAdmin && (
                              <span className="text-[9px] ml-2 bg-green-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider leading-none shadow-sm">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.deletedAt ? (
                          <span className="flex items-center text-red-600 font-bold text-sm">
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                            Deleted
                          </span>
                        ) : user.hasAccess ? (
                          <span className="flex items-center text-green-600 font-bold text-sm">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600 font-bold text-sm">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[10px] text-gray-400 select-all">
                      {user.userId}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchUsers}
        onToast={onToast}
      />
    </div>
  );
};
