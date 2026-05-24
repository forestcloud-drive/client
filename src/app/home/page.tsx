'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { BackgroundImage } from '@/components/BackgroundImage';
import { Toast, ToastStateProps } from '@/components/ui/Toast';
import { SearchParamHandler } from './SeatchParamHandler';
import { Sidebar, TabType } from '@/components/home/Sidebar';
import { FileBrowser } from '@/components/home/FileBrowser';
import { SharedBrowser } from '@/components/home/SharedBrowser';
import { ProfileView } from '@/components/home/ProfileView';
import { TrashBrowser } from '@/components/home/TrashBrowser';
import { SettingsView } from '@/components/home/SettingsView';
import { AdminView } from '@/components/home/AdminView';
import { useCallback } from 'react';

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [toast, setToast] = useState<ToastStateProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') as TabType;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleToast = useCallback(
    (message: string, type: 'success' | 'error', timeout = 3000) => {
      setToast({
        message,
        type,
        id: Date.now(),
        timeout,
      });
    },
    [],
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/auth');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');

      if (!token || !storedRole) {
        router.push('/auth');
        return;
      }

      setRole(storedRole);

      try {
        const res = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setHasAccess(data.hasAccess);

          // If user has no access, force them to profile tab and show message
          if (!data.hasAccess) {
            setActiveTab('profile');
            handleToast(
              "Unfortunately you don't have access. Contact one of the administrators, or wait for the access",
              'error',
              10000,
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile for access check', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    const contentClasses =
      'w-full h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300';

    if (!hasAccess) {
      return <ProfileView onToast={handleToast} onNavigate={setActiveTab} />;
    }

    switch (activeTab) {
      case 'home':
        return <FileBrowser onToast={handleToast} />;
      case 'profile':
        return <ProfileView onToast={handleToast} onNavigate={setActiveTab} />;
      case 'shared':
        return <SharedBrowser onToast={handleToast} />;
      case 'trash':
        return <TrashBrowser onToast={handleToast} />;
      case 'settings':
        return <SettingsView onToast={handleToast} onLogout={handleLogout} />;
      case 'administration':
        return <AdminView onToast={handleToast} />;
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
          hasAccess={hasAccess}
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
