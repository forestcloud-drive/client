'use client';

import React, { useState, useEffect } from 'react';
import { BackgroundImage } from './BackgroundImage';

export const DeviceGate = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check for mobile by screen width or common user agent patterns
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);

      setIsMobile(width < 768 || isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
        <BackgroundImage />
        <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-sm animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-6">📱</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Mobile App Coming Soon
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6 font-medium">
            ForestCloud for mobile is currently in{' '}
            <span className="font-bold">development</span>. For the best
            experience, please visit us from a{' '}
            <span className="font-bold">desktop computer</span>.
          </p>
          <div className="py-3 px-4 bg-green-100 text-green-800 rounded-xl font-bold text-sm inline-block">
            🌿 We are growing!
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
