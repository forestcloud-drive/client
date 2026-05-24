import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';

interface User {
  userId: string;
  fullname: string;
  email: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (userIds: string[]) => void;
  isLoading: boolean;
  itemTitle: string;
}

export const ShareModal = ({
  isOpen,
  onClose,
  onShare,
  isLoading,
  itemTitle,
}: ShareModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem('token');

          // Fetch current profile to get currentUserId
          const profileRes = await fetch('/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setCurrentUserId(profileData.userId);
          }

          // Fetch all users
          const usersRes = await fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData.users || []);
          }
        } catch (error) {
          console.error('Failed to fetch data for sharing', error);
        } finally {
          setIsFetching(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.userId !== currentUserId &&
      (u.fullname.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())),
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Semi-transparent overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-green-900 mb-1">Share Item</h2>
          <p className="text-sm text-gray-500 font-medium">
            Sharing:{' '}
            <span className="text-green-600 font-bold">{itemTitle}</span>
          </p>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-green-600 rounded-xl outline-none transition-all text-sm font-semibold text-green-900"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.userId}
                onClick={() => toggleUser(user.userId)}
                className={clsx(
                  'flex items-center p-3 rounded-2xl cursor-pointer transition-all border-2',
                  selectedUserIds.includes(user.userId)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100',
                )}
              >
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 transition-colors',
                    selectedUserIds.includes(user.userId)
                      ? 'bg-green-600 text-white'
                      : 'bg-green-200 text-green-700',
                  )}
                >
                  {user.fullname[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-green-900 truncate text-sm">
                    {user.fullname}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
                <div
                  className={clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    selectedUserIds.includes(user.userId)
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300',
                  )}
                >
                  {selectedUserIds.includes(user.userId) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onShare(selectedUserIds)}
            disabled={isLoading || selectedUserIds.length === 0}
            className="flex-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sharing...
              </>
            ) : (
              `Share with ${selectedUserIds.length} ${selectedUserIds.length === 1 ? 'user' : 'users'}`
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
