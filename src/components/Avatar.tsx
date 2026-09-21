function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({
  name,
  color = "#7c3aed",
  size = 32,
  ring = false,
}: {
  name: string;
  color?: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white select-none ${
        ring ? "ring-2 ring-surface" : ""
      }`}
      style={{ width: size, height: size, fontSize: size * 0.38, backgroundColor: color }}
      title={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
