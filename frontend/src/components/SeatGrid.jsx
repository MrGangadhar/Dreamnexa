/**
 * SeatGrid — the platform's signature visual.
 * Renders contest capacity as a literal exam-hall seating chart instead
 * of a generic progress bar: each cell is a seat, filled cells are
 * taken participants, the highlighted cell is "you" if you've joined.
 */
export default function SeatGrid({ filled, total, joinedByMe = false, cellSize = 22 }) {
  const cols = Math.min(total, 10) || 1;
  const cells = Array.from({ length: total }, (_, i) => {
    if (i < filled - (joinedByMe ? 1 : 0)) return 'filled';
    if (joinedByMe && i === filled - 1) return 'mine';
    return 'empty';
  });

  return (
    <div>
      <div
        className="seat-grid"
        style={{ '--cols': cols, maxWidth: cols * (cellSize + 6) }}
      >
        {cells.map((state, i) => (
          <div key={i} className={`seat-cell ${state !== 'empty' ? state : ''}`} title={`Seat ${i + 1}`} />
        ))}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
        <span><span style={{ display: 'inline-block', width: 9, height: 9, background: 'var(--seat-ink)', borderRadius: 2, marginRight: 5 }} />filled</span>
        {joinedByMe && <span><span style={{ display: 'inline-block', width: 9, height: 9, background: 'var(--rubric-red)', borderRadius: 2, marginRight: 5 }} />you</span>}
        <span><span style={{ display: 'inline-block', width: 9, height: 9, background: 'var(--seat-empty)', border: '1px solid var(--line)', borderRadius: 2, marginRight: 5 }} />open</span>
      </div>
    </div>
  );
}
