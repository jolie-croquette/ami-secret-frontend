/**
 * Illustrations vectorielles du thème « camp d'été ».
 * Tout est dessiné en SVG — aucun emoji, aucune icône générique.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

export function PineTree({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <rect x="28" y="58" width="8" height="16" rx="2" fill="#5c4326" />
      <path d="M32 4 L50 30 H38 L52 50 H12 L26 30 H14 Z" fill="#2f5d50" />
      <path d="M32 4 L50 30 H38 L52 50 H32 Z" fill="#1e3d34" />
    </svg>
  );
}

export function Campfire({ title, className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {title && <title>{title}</title>}
      {/* bûches */}
      <rect x="16" y="58" width="48" height="9" rx="4" transform="rotate(-12 16 58)" fill="#5c4326" />
      <rect x="16" y="58" width="48" height="9" rx="4" transform="rotate(12 64 58)" fill="#6b4e2e" />
      {/* flamme */}
      <g className="origin-bottom animate-flicker">
        <path d="M40 14 C52 28 50 40 40 52 C30 40 28 28 40 14 Z" fill="#e07a3f" />
        <path d="M40 24 C47 33 46 41 40 50 C34 41 33 33 40 24 Z" fill="#f2c14e" />
      </g>
    </svg>
  );
}

export function Pennants({ title, className = '', ...props }: IconProps) {
  const flags = [
    { x: 0, c: '#e07a3f' },
    { x: 40, c: '#2f5d50' },
    { x: 80, c: '#3b7a99' },
    { x: 120, c: '#f2c14e' },
    { x: 160, c: '#b23a48' },
  ];
  return (
    <svg viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {title && <title>{title}</title>}
      <path d="M0 6 Q100 18 200 6" stroke="#5c4326" strokeWidth="2" fill="none" />
      {flags.map((f, i) => (
        <path
          key={i}
          d={`M${f.x + 4} 8 L${f.x + 36} 8 L${f.x + 20} 34 Z`}
          fill={f.c}
          className="origin-top animate-sway"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </svg>
  );
}

export function MeritBadge({
  title,
  label,
  tone = '#2f5d50',
  className = '',
  ...props
}: IconProps & { label?: string; tone?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <path
        d="M50 4 L61 13 L75 11 L80 24 L93 31 L88 45 L93 59 L80 66 L75 79 L61 77 L50 86 L39 77 L25 79 L20 66 L7 59 L12 45 L7 31 L20 24 L25 11 L39 13 Z"
        fill={tone}
      />
      <circle cx="50" cy="45" r="30" fill="#f7f0df" />
      <circle cx="50" cy="45" r="30" fill="none" stroke={tone} strokeWidth="2" strokeDasharray="4 4" />
      {label && (
        <text
          x="50"
          y="52"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontWeight="700"
          fontSize="26"
          fill={tone}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export function Tent({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title && <title>{title}</title>}
      <path d="M40 6 L74 56 H6 Z" fill="#3b7a99" />
      <path d="M40 6 L74 56 H40 Z" fill="#2c5d76" />
      <path d="M40 22 L54 56 H26 Z" fill="#f7f0df" />
      <path d="M40 22 L40 56" stroke="#5c4326" strokeWidth="2" />
    </svg>
  );
}

export function Compass({ title, className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {title && <title>{title}</title>}
      <circle cx="32" cy="32" r="28" fill="#f7f0df" stroke="#5c4326" strokeWidth="3" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#2f5d50" strokeWidth="1" strokeDasharray="3 5" />
      <path d="M32 14 L38 32 L32 50 L26 32 Z" fill="#b23a48" />
      <path d="M32 14 L38 32 L32 32 Z" fill="#e07a3f" />
      <circle cx="32" cy="32" r="3" fill="#2b2118" />
    </svg>
  );
}

/** Bande décorative pleine largeur : collines + sapins en silhouette. */
export function CampScene({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 120 Q300 60 600 110 T1200 100 V200 H0 Z" fill="#6b8f71" fillOpacity="0.5" />
      <path d="M0 150 Q300 110 600 150 T1200 140 V200 H0 Z" fill="#2f5d50" />
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 40 + i * 85;
        const h = 40 + (i % 3) * 14;
        return (
          <g key={i}>
            <path d={`M${x} ${150 - h} L${x + 22} 156 H${x - 22} Z`} fill="#1e3d34" />
            <path d={`M${x} ${150 - h + 14} L${x + 28} 162 H${x - 28} Z`} fill="#1e3d34" />
          </g>
        );
      })}
    </svg>
  );
}
