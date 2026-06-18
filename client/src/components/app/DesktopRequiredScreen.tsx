'use client';

import { MonitorX } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DesktopRequiredScreen() {
  return (
    <div className="cn-desktop-required flex items-center justify-center min-h-screen bg-bg-primary text-text-primary p-6">
      <motion.div 
        className="cn-desktop-required-content text-center max-w-md p-8 rounded-xl border border-border-default bg-bg-surface shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-6 text-accent-primary">
          <MonitorX size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold mb-3">Desktop Required</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          CodeNexus is a full-featured AI IDE. To provide the best coding experience with Intent Mode and side-by-side file editing, a desktop screen (at least 1024px wide) is required.
        </p>
        <Link href="/dashboard" className="cn-btn cn-btn-primary inline-flex items-center gap-2">
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
