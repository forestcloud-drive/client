import React from 'react';
import { HomeIcon } from '@/components/ui/icons/Home';
import { SharedIcon } from '@/components/ui/icons/Shared';
import { TrashIcon } from '@/components/ui/icons/Trash';
import { SettingsIcon } from '@/components/ui/icons/Settings';
import { AdminIcon } from '@/components/ui/icons/Admin';
import { LogoutIcon } from '@/components/ui/icons/Logout';
import { UserRoles } from '@/enums/user-roles.enum';
import clsx from 'clsx';

export type TabType =
  | 'home'
  | 'shared'
  | 'trash'
  | 'settings'
  | 'administration'
  | 'profile';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: string | null;
  onLogout: () => void;
}

export const Sidebar = ({
  activeTab,
  setActiveTab,
  userRole,
  onLogout,
}: SidebarProps) => {
  const isAdmin = userRole === UserRoles.ADMIN || userRole === UserRoles.OWNER;

  const menuItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'shared', label: 'Shared', icon: <SharedIcon /> },
    { id: 'trash', label: 'Trash', icon: <TrashIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  if (isAdmin) {
    menuItems.push({
      id: 'administration',
      label: 'Administration',
      icon: <AdminIcon />,
    });
  }

  return (
    <div className="w-64 h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col p-4 z-20 transition-all duration-300">
      <div className="mb-8 px-4 py-2">
        <h2 className="text-2xl font-bold text-green-800 tracking-tight">
          ForestCloud
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={clsx(
              'w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group',
              activeTab === item.id
                ? 'bg-green-600 text-white shadow-md scale-105'
                : 'text-gray-600 hover:bg-green-100 hover:text-green-800 hover:scale-[1.02] cursor-pointer',
            )}
          >
            <span
              className={clsx(
                'transition-colors duration-200',
                activeTab === item.id
                  ? 'text-white'
                  : 'text-gray-500 group-hover:text-green-800',
              )}
            >
              {item.icon}
            </span>
            <span className="font-semibold">{item.label}</span>

            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-green-100">
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center justify-between hover:bg-green-50 p-2 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-xs border-2 border-green-600/20 group-hover:border-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
              {userRole?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Role
              </span>
              <span className="text-sm font-bold text-green-800 capitalize">
                {userRole}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            title="Log Out"
            className="p-2 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
