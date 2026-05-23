import React, { useState } from 'react';
import { PlusIcon } from '@/components/ui/icons/Plus';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export const AddUserModal = ({ isOpen, onClose, onSuccess, onToast }: AddUserModalProps) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [hasAccess, setHasAccess] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !email || !password) {
      onToast('Please fill all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname,
          email,
          password,
          role,
          hasAccess,
          mustChangePassword
        })
      });

      if (res.ok) {
        onToast('User created successfully', 'success');
        onSuccess();
        onClose();
        // Reset form
        setFullname('');
        setEmail('');
        setPassword('');
        setRole('user');
        setHasAccess(true);
        setMustChangePassword(true);
      } else {
        const data = await res.json();
        onToast(data.message || 'Failed to create user', 'error');
      }
    } catch (error) {
      onToast('An error occurred while creating user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white/90 backdrop-blur-2xl border border-white/20 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-green-900 flex items-center">
              <PlusIcon className="w-6 h-6 mr-2 text-green-600" />
              Add New User
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                  placeholder="John Doe"
                  autoComplete="off"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                  placeholder="john@example.com"
                  autoComplete="off"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-semibold text-green-900"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border-2 border-white/30 rounded-xl focus:border-green-600 outline-none transition-all font-bold text-green-900 appearance-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col justify-end space-y-2 pb-1">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={hasAccess}
                    onChange={(e) => setHasAccess(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded border-2 mr-2 flex items-center justify-center transition-all ${hasAccess ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                    {hasAccess && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-green-800 transition-colors">Active Access</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded border-2 mr-2 flex items-center justify-center transition-all ${mustChangePassword ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                    {mustChangePassword && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-green-800 transition-colors">Must Change Pwd</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
