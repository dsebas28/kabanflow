/** Wordmark for the editorial marketing pages only — the signed-in app keeps its own <Logo/>. */
export default function Masthead({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`font-serif-ed inline-flex items-baseline gap-[0.09em] font-semibold tracking-tight text-ink ${className}`} style={{ fontSize: size }}>
      Kanban Flow
      <span aria-hidden="true" className="text-[0.55em] text-[var(--mark)]">
        ●
      </span>
    </span>
  );
}
