'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  GitBranch,
  Lightbulb,
  MessageSquareText,
  MousePointer2,
  Sparkles,
  Waypoints,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/app/AppProviders';

const features = [
  {
    icon: <Zap size={22} />,
    title: 'Intent Mode',
    description:
      'Tell CodeNexus what you are trying to change, then let the editor translate intent into focused edits, review paths, and next actions.',
  },
  {
    icon: <MessageSquareText size={22} />,
    title: 'Explain My Code',
    description:
      'Highlight any file, function, or pattern and get a direct explanation that stays grounded in your active project context.',
  },
  {
    icon: <Brain size={22} />,
    title: 'Decision Memory',
    description:
      'Preserve architecture decisions, tradeoffs, and repeated patterns so every session starts with the context you already earned.',
  },
];

const steps = [
  {
    icon: <MousePointer2 size={20} />,
    title: 'Select your context',
    description: 'Open a project, select code, or point CodeNexus at the flow you want to understand.',
  },
  {
    icon: <Lightbulb size={20} />,
    title: 'State the intent',
    description: 'Ask for a fix, explanation, review, or decision without rebuilding the prompt from scratch.',
  },
  {
    icon: <GitBranch size={20} />,
    title: 'Ship with memory',
    description: 'Keep changes, reasoning, and project patterns connected across the workspace.',
  },
];

const stats = [
  { value: 3, suffix: '', label: 'AI-native modes' },
  { value: 1, suffix: '', label: 'workspace memory' },
  { value: 24, suffix: '/7', label: 'context-aware assistance' },
];

const heroItems: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: index * 0.2,
      ease: 'easeOut',
    },
  }),
};

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { showToast } = useToast();
  const primaryHref = isAuthenticated ? '/dashboard' : '/register';

  const handleDemoClick = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    showToast({
      title: 'Demo path opened',
      description: 'Scroll through the flow to see how CodeNexus thinks with your code.',
      variant: 'info',
    });
  };

  return (
    <main className="landing-page">
      <div className="landing-ambient" aria-hidden="true" />
      <LandingNav primaryHref={primaryHref} />

      <section className="landing-hero" id="top">
        <FloatingCode />
        <div className="landing-shell landing-hero-content">
          <motion.div
            className="landing-eyebrow"
            variants={heroItems}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <Sparkles size={14} />
            <span>Intent-first AI development</span>
          </motion.div>

          <motion.h1
            variants={heroItems}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            The AI Code Editor That Thinks With You
          </motion.h1>

          <motion.p
            className="landing-hero-copy"
            variants={heroItems}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            CodeNexus brings intent-aware editing, instant code explanations, and durable decision memory into one focused workspace.
          </motion.p>

          <motion.div
            className="landing-hero-actions"
            variants={heroItems}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <Link className="landing-btn landing-btn-primary" href={primaryHref}>
              <span>Get Started - It&apos;s Free</span>
              <ArrowRight size={18} />
            </Link>
            <button className="landing-btn landing-btn-secondary" onClick={handleDemoClick}>
              <CirclePlay size={18} />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          <motion.div
            className="landing-trust-row"
            variants={heroItems}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <span><CheckCircle2 size={14} /> Local project context</span>
            <span><CheckCircle2 size={14} /> Monaco-powered editing</span>
            <span><CheckCircle2 size={14} /> Memory for decisions</span>
          </motion.div>
        </div>
      </section>

      <RevealSection className="landing-section landing-features" id="features">
        <SectionHeader
          eyebrow="Core Features"
          title="Built for the moments where context usually disappears"
          description="Every feature is designed around how developers actually work: intent, explanation, memory, and momentum."
        />
        <motion.div
          className="landing-feature-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {features.map((feature) => (
            <motion.article
              className="landing-feature-card"
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: 'easeOut' },
                },
              }}
            >
              <div className="landing-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </RevealSection>

      <RevealSection className="landing-section landing-work" id="how-it-works">
        <SectionHeader
          eyebrow="How It Works"
          title="From vague intent to usable code context"
          description="A calmer workflow for complex changes, reviews, explanations, and recurring architectural choices."
        />
        <div className="landing-workflow">
          {steps.map((step, index) => (
            <motion.div
              className="landing-work-step"
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.12, duration: 0.45 }}
            >
              <div className="landing-step-number">0{index + 1}</div>
              <div className="landing-step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && <ChevronRight className="landing-step-arrow" size={20} />}
            </motion.div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="landing-section landing-stats" id="stats">
        <div className="landing-stats-copy">
          <p className="landing-section-eyebrow">Why It Feels Different</p>
          <h2>Less prompt rebuilding. More project-aware progress.</h2>
        </div>
        <div className="landing-stats-grid">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </RevealSection>

      <RevealSection className="landing-section landing-final-cta">
        <div className="landing-cta-panel">
          <p className="landing-section-eyebrow">Ready When You Are</p>
          <h2>Start building smarter</h2>
          <p>Bring intent, explanations, and decision memory into your next coding session.</p>
          <Link className="landing-btn landing-btn-light" href={primaryHref}>
            <span>Get Started - It&apos;s Free</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </RevealSection>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer-inner">
          <Link href="#top" className="landing-brand">
            <span className="landing-logo-mark">N</span>
            <span>CodeNexus</span>
          </Link>
          <nav className="landing-footer-links" aria-label="Footer">
            <Link href="#features">Features</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="/login">Sign in</Link>
          </nav>
          <p>Copyright 2026 CodeNexus. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function LandingNav({ primaryHref }: { primaryHref: string }) {
  return (
    <header className="landing-nav">
      <div className="landing-shell landing-nav-inner">
        <Link href="#top" className="landing-brand" aria-label="CodeNexus home">
          <span className="landing-logo-mark">N</span>
          <span>CodeNexus</span>
        </Link>
        <nav className="landing-nav-links" aria-label="Landing">
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">Workflow</Link>
          <Link href="/login">Sign in</Link>
        </nav>
        <Link className="landing-nav-cta" href={primaryHref}>
          Open App
        </Link>
      </div>
    </header>
  );
}

function FloatingCode() {
  return (
    <div className="landing-code-stage" aria-hidden="true">
      <motion.div
        className="landing-code-card landing-code-card-primary"
        initial={{ opacity: 0, y: 32, rotate: -2 }}
        animate={{ opacity: 1, y: [0, -12, 0], rotate: -2 }}
        transition={{
          opacity: { duration: 0.7, delay: 0.7 },
          y: { repeat: Infinity, duration: 7, ease: 'easeInOut' },
        }}
      >
        <div className="landing-code-header">
          <span />
          <span />
          <span />
          <strong>intent.ts</strong>
        </div>
        <pre>{`intent("simplify auth flow")
  .explainTradeoffs()
  .rememberDecision({
    reason: "reduce onboarding friction",
    scope: "client + api"
  });`}</pre>
      </motion.div>

      <motion.div
        className="landing-code-card landing-code-card-secondary"
        initial={{ opacity: 0, y: 24, rotate: 3 }}
        animate={{ opacity: 1, y: [0, 10, 0], rotate: 3 }}
        transition={{
          opacity: { duration: 0.7, delay: 1 },
          y: { repeat: Infinity, duration: 8, ease: 'easeInOut' },
        }}
      >
        <div className="landing-code-pill">
          <Waypoints size={14} />
          <span>Decision Memory synced</span>
        </div>
      </motion.div>
    </div>
  );
}

function RevealSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="landing-shell">{children}</div>
    </motion.section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="landing-section-header">
      <p className="landing-section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function StatCard({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => setDisplayValue(String(latest)));
    return unsubscribe;
  }, [rounded]);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [count, isInView, value]);

  return (
    <div className="landing-stat-card" ref={ref}>
      <div className="landing-stat-value">
        {displayValue}
        {suffix}
      </div>
      <p>{label}</p>
    </div>
  );
}
