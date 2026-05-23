'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastStateProps } from '@/components/ui/Toast';

type Props = {
  onToast: (toast: ToastStateProps) => void;
};

export function SearchParamHandler({ onToast }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const temporaryPasswordUsed = searchParams.get('temporaryPasswordUsed');
    if (temporaryPasswordUsed === '1') {
      onToast({
        message: 'Temporary password used. Please change your password',
        type: 'notification',
        id: Date.now(),
        timeout: 5000,
      });
    }
    router.replace('/home');
  }, [searchParams, router, onToast]);

  return null;
}
