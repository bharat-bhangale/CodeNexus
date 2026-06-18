'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DesktopRequiredScreen from '@/components/app/DesktopRequiredScreen';

const AppLayout = dynamic(
  () => import('@/components/layout/AppLayout'),
  { ssr: false }
);

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);

  return (
    <ProtectedRoute>
      <div className="cn-mobile-blocker">
        <DesktopRequiredScreen />
      </div>
      <div className="cn-desktop-workspace">
        <AppLayout />
      </div>
    </ProtectedRoute>
  );
}
