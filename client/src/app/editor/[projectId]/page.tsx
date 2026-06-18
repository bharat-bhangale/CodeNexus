'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const AppLayout = dynamic(
  () => import('@/components/layout/AppLayout'),
  { ssr: false }
);

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);

  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}
