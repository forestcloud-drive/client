'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { BackgroundImage } from '@/components/BackgroundImage';
import { Toast, ToastStateProps } from '@/components/ui/Toast';
import { SearchParamHandler } from './SeatchParamHandler';
import { Sidebar, TabType } from '@/components/home/Sidebar';
import { FileBrowser } from '@/components/home/FileBrowser';
import { ProfileView } from '@/components/home/ProfileView';
import { TrashBrowser } from '@/components/home/TrashBrowser';
import { SettingsView } from '@/components/home/SettingsView';
import { useCallback } from 'react';

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [toast, setToast] = useState<ToastStateProps | null>(null);
  const router = useRouter();

  const handleToast = useCallback((
    message: string,
    type: 'success' | 'error',
    timeout = 3000,
  ) => {
    setToast({
      message,
      type,
      id: Date.now(),
      timeout,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/auth');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    if (!token || !storedRole) {
      router.push('/auth');
    } else {
      setRole(storedRole);
    }
  }, [router]);

  const renderContent = () => {
    const contentClasses =
      'w-full h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300';

    switch (activeTab) {
      case 'home':
        return <FileBrowser onToast={handleToast} />;
      case 'profile':
        return <ProfileView onToast={handleToast} onNavigate={setActiveTab} />;
      case 'shared':
        return (
          <div className={contentClasses}>
            <h1 className="text-4xl font-extrabold mb-4 text-green-800">
              Shared with Me
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Collaborate on documents and folders shared by your team.
            </p>
          </div>
        );
      case 'trash':
        return <TrashBrowser onToast={handleToast} />;
      case 'settings':
        return <SettingsView onToast={handleToast} />;
      case 'administration':
        return (
          <div className={contentClasses}>
            <h1 className="text-4xl font-extrabold mb-4 text-green-800">
              Administration
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Manage users, roles, and system-wide configurations.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/background.jpg" />
      </Head>

      <Suspense fallback={null}>
        <SearchParamHandler onToast={setToast} />
      </Suspense>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          timeout={toast.timeout}
        />
      )}

      <main className="relative h-screen flex p-4 sm:p-6 gap-6 overflow-hidden">
        <BackgroundImage />

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={role}
          onLogout={handleLogout}
        />

        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg z-10 p-10 relative overflow-hidden transition-all duration-500">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="relative h-full flex flex-col overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </main>
    </>
  );
}
