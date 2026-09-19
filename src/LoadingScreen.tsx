import './loading-screen.css';

export default function LoadingScreen({
  label = 'Открываем Polis',
  embedded = false,
}: {
  label?: string;
  embedded?: boolean;
}) {
  return (
    <div
      className={`polis-loading${embedded ? ' polis-loading-embedded' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="polis-loading-content">
        <span className="polis-loading-brand" aria-hidden="true">
          polis<span>.</span>
        </span>
        <div className="polis-loading-scene" aria-hidden="true">
          <span className="polis-loading-frame" />
          <span className="polis-loading-paper polis-loading-paper-one" />
          <span className="polis-loading-paper polis-loading-paper-two" />
          <span className="polis-loading-paper polis-loading-paper-three" />
        </div>
        <p className="polis-loading-label">{label}</p>
      </div>
    </div>
  );
}
