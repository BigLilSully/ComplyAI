export default function VerificationBadge({ state = "unverified" }) {
  const config = {
    verified:   { label: "Verified",           cls: "vbadge--verified",   mark: "✓" },
    partial:    { label: "Partially verified",  cls: "vbadge--partial",    mark: "◑" },
    unverified: { label: "Not verified",        cls: "vbadge--unverified", mark: "✗" },
  };
  const { label, cls, mark } = config[state] ?? config.unverified;
  return (
    <span className={`vbadge ${cls}`} aria-label={label} title={label}>
      <span aria-hidden="true">{mark}</span>
      {label}
    </span>
  );
}
