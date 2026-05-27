'use client';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ErrorIcon } from '@/components/ui/icons/Error';
import { SuccessIcon } from '@/components/ui/icons/Success';
import { NotificationIcon } from '@/components/ui/icons/Notification';

type ToastType = 'error' | 'success' | 'notification';

export interface ToastStateProps {
  id: number;
  message: string;
  type?: ToastType;
  timeout?: number;
}

interface ToastProps extends Omit<ToastStateProps, 'id'> {
  onClose: () => void;
}

export const Toast = ({
  message,
  type = 'notification',
  onClose,
  timeout = 3000,
}: ToastProps) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);

    timerRef.current = setTimeout(() => {
      handleClose();
    }, timeout);

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeout]);

  // Icons (simple SVGs)
  const icons = {
    error: <ErrorIcon />,
    success: <SuccessIcon />,
    notification: <NotificationIcon />,
  };

  return (
    <div
      onClick={handleClose}
      className={clsx(
        'fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center max-w-xl w-[90vw] rounded-lg shadow-lg px-6 py-4 transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white/60',
        'text-gray-600 text-lg font-semibold bg-white/50',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6',
      )}
      role="alert"
    >
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};
