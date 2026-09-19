import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { demoSteps } from './demo-steps';
import './guided-demo.css';

type Rect = { top: number; left: number; width: number; height: number };
const focusable =
  'iframe, button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

export default function GuidedDemo({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [tipHeight, setTipHeight] = useState(210);
  const tip = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = demoSteps[index];

  useLayoutEffect(() => {
    if (!step) return;
    let frame = 0;
    // Track position as well as size: lazy images, fonts and the embedded workspace
    // can move the target without resizing it or firing a window scroll event.
    const measure = () => {
      const bounds = document.querySelector(step.target)?.getBoundingClientRect();
      const next =
        bounds && bounds.width && bounds.height
          ? {
              top: bounds.top - 7,
              left: bounds.left - 7,
              width: bounds.width + 14,
              height: bounds.height + 14,
            }
          : null;
      setRect((previous) =>
        previous?.top === next?.top &&
        previous?.left === next?.left &&
        previous?.width === next?.width &&
        previous?.height === next?.height
          ? previous
          : next,
      );
      setViewport((previous) =>
        previous.width === window.innerWidth && previous.height === window.innerHeight
          ? previous
          : { width: window.innerWidth, height: window.innerHeight },
      );
      frame = requestAnimationFrame(measure);
    };
    const target = document.querySelector(step.target);
    const bounds = target?.getBoundingClientRect();
    if (bounds) {
      const noSideRoom = bounds.left < 370 && window.innerWidth - bounds.right < 370;
      const tipSpace = noSideRoom ? (tip.current?.offsetHeight ?? 210) + 24 : 0;
      const desiredTop = Math.max(90, (window.innerHeight - bounds.height - tipSpace) / 2);
      window.scrollTo({
        top: window.scrollY + bounds.top - desiredTop,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
    }
    measure();
    heading.current?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useLayoutEffect(() => {
    if (!tip.current) return;
    const observer = new ResizeObserver(() => setTipHeight(tip.current?.offsetHeight ?? 210));
    observer.observe(tip.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      // The source drawer owns keyboard navigation until the visitor closes it.
      if (document.querySelector('.landing-source')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const target = step ? document.querySelector(step.target) : null;
      const candidates = [
        ...(target?.matches(focusable) ? [target] : []),
        ...Array.from(target?.querySelectorAll(focusable) ?? []),
        ...Array.from(tip.current?.querySelectorAll(focusable) ?? []),
      ] as HTMLElement[];
      const elements = candidates.filter((element) => element.getClientRects().length > 0);
      if (!elements.length) return;
      const current = elements.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? current <= 0
          ? elements.length - 1
          : current - 1
        : (current + 1) % elements.length;
      event.preventDefault();
      elements[next].focus({ preventScroll: true });
    }
    window.addEventListener('keydown', keydown, true);
    return () => window.removeEventListener('keydown', keydown, true);
  }, [onClose, step]);

  if (!step) return null;
  const width = Math.min(330, viewport.width - 24);
  const margin = 12;
  const clamp = (value: number, max: number) => Math.max(margin, Math.min(value, max));
  let left = (viewport.width - width) / 2;
  let top = viewport.height - tipHeight - margin;
  if (rect) {
    const right = rect.left + rect.width;
    if (right + width + 28 <= viewport.width) {
      left = right + 16;
      top = rect.top;
    } else if (rect.left >= width + 28) {
      left = rect.left - width - 16;
      top = rect.top;
    } else {
      left = rect.left;
      top = rect.top + rect.height + 16;
      if (top + tipHeight > viewport.height - margin) top = rect.top - tipHeight - 16;
    }
  }
  left = clamp(left, viewport.width - width - margin);
  top = clamp(top, viewport.height - tipHeight - margin);
  const holeTop = Math.max(0, rect?.top ?? 0);
  const holeBottom = Math.max(0, Math.min(viewport.height, rect ? rect.top + rect.height : 0));
  const holeLeft = Math.max(0, rect?.left ?? 0);
  const holeRight = Math.max(0, Math.min(viewport.width, rect ? rect.left + rect.width : 0));
  return createPortal(
    <div className="site-tour">
      {rect && <div className="tour-spotlight" style={rect} />}
      {!rect && <div className="tour-dim" />}
      {/* Only the highlighted page element remains clickable. */}
      <div className="tour-blocker" style={{ inset: `0 0 auto 0`, height: holeTop }} />
      <div className="tour-blocker" style={{ top: holeBottom, bottom: 0, left: 0, right: 0 }} />
      <div
        className="tour-blocker"
        style={{
          top: holeTop,
          height: Math.max(0, holeBottom - holeTop),
          left: 0,
          width: holeLeft,
        }}
      />
      <div
        className="tour-blocker"
        style={{
          top: holeTop,
          height: Math.max(0, holeBottom - holeTop),
          left: holeRight,
          right: 0,
        }}
      />
      <div
        ref={tip}
        className="tour-tip"
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-hint"
        style={{ left, top, width }}
      >
        <div className="tour-tip-top">
          <span>
            {index + 1} / {demoSteps.length}
          </span>
          <button onClick={onClose} aria-label="Закрыть демо">
            <X size={18} />
          </button>
        </div>
        <div key={step.id} className="tour-tip-copy" aria-live="polite">
          <h2 id="tour-title" ref={heading} tabIndex={-1}>
            {step.title}
          </h2>
          <p id="tour-hint">{step.hint}</p>
        </div>
        <div className="tour-tip-actions">
          <button
            className="tour-back"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            <ArrowLeft size={16} />
            Назад
          </button>
          {index === demoSteps.length - 1 ? (
            <button className="tour-next" onClick={onClose}>
              Готово <ArrowRight size={16} />
            </button>
          ) : (
            <button className="tour-next" onClick={() => setIndex((i) => i + 1)}>
              Далее <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
