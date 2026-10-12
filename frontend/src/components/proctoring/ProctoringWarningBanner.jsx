export default function ProctoringWarningBanner({ warning, onDismiss }) {
  if (!warning) return null;

  const bandStyles = {
    WARNING: { bg: '#fff8e6', border: '#f5d78e', text: '#8a6100' },
    REVIEW_REQUIRED: { bg: '#fff1e6', border: '#f3b98a', text: '#8a4600' },
    REJECTION_CANDIDATE: { bg: '#f8d7da', border: '#f1aeb5', text: '#842029' },
  };
  const style = bandStyles[warning.band] || bandStyles.WARNING;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100,
        width: '90%',
        maxWidth: 420,
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.text,
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{warning.message}</p>
        <button
          onClick={onDismiss}
          style={{
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: style.text, opacity: 0.6, padding: 0, lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
