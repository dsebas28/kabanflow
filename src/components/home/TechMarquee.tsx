const TECH = ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Socket.io", "Auth.js", "dnd-kit", "Three.js", "Framer Motion", "Tailwind CSS"];

export default function TechMarquee() {
  return (
    <div
      className="marquee overflow-hidden border-y border-border py-6"
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}
      aria-label="Tecnologías usadas en el proyecto"
    >
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {TECH.map((name) => (
              <li key={name} className="flex items-center">
                <span className="font-serif-ed px-8 text-2xl font-medium italic tracking-tight text-ink-faint sm:text-3xl">{name}</span>
                <span className="h-1.5 w-1.5 rotate-45 bg-[var(--mark)]" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
