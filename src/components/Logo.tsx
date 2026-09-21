export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#7c3aed" />
      <rect x="7" y="7" width="6" height="18" rx="2" fill="#fff" />
      <rect x="15" y="7" width="6" height="11" rx="2" fill="#5eead4" />
      <rect x="23" y="7" width="2" height="6" rx="1" fill="#fff" fillOpacity="0.6" />
    </svg>
  );
}

export default function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span className="font-display font-extrabold tracking-tight" style={{ fontSize: size * 0.55 }}>
        Kanban<span className="text-brand-500">Flow</span>
      </span>
    </div>
  );
}
