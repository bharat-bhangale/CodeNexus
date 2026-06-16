'use client';

import { useEffect, useRef, useState } from 'react';

interface HealthScoreCardProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 86) return 'var(--health-cyan, #22d3ee)';
  if (score >= 71) return 'var(--health-green, #22c55e)';
  if (score >= 51) return 'var(--health-amber, #f59e0b)';
  if (score >= 31) return 'var(--health-orange, #f97316)';
  return 'var(--health-red, #ef4444)';
}

function getScoreLabel(score: number): string {
  if (score >= 86) return 'Excellent';
  if (score >= 71) return 'Good';
  if (score >= 51) return 'Fair';
  if (score >= 31) return 'Needs Work';
  return 'Critical';
}

export default function HealthScoreCard({ score, label, size = 'lg' }: HealthScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef<number | null>(null);

  // Animated counter 0 → score
  useEffect(() => {
    const start = 0;
    const end = score;
    const duration = 1200;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score]);

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const sizes = {
    sm: { svgSize: 60, fontSize: '18px', labelSize: '9px', strokeWidth: 4 },
    md: { svgSize: 90, fontSize: '26px', labelSize: '10px', strokeWidth: 5 },
    lg: { svgSize: 120, fontSize: '36px', labelSize: '12px', strokeWidth: 6 },
  };
  const s = sizes[size];

  return (
    <div className={`health-score-card health-score-${size}`} id="health-score-card">
      <div className="health-score-ring" style={{ width: s.svgSize, height: s.svgSize }}>
        <svg viewBox="0 0 100 100" className="health-score-svg">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--border-subtle, #1e1e30)"
            strokeWidth={s.strokeWidth}
          />
          {/* Animated progress ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={color}
            strokeWidth={s.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            className="health-score-progress"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="health-score-value" style={{ fontSize: s.fontSize, color }}>
          {displayScore}
        </div>
      </div>
      <div className="health-score-label" style={{ fontSize: s.labelSize }}>
        {label || getScoreLabel(score)}
      </div>
    </div>
  );
}
