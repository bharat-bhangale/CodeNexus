'use client';

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with Monaco Editor and react-resizable-panels
const AppLayout = dynamic(
  () => import('@/components/layout/AppLayout'),
  { ssr: false }
);

export default function Home() {
  return <AppLayout />;
}
