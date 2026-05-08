import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const WARNING_BEFORE = 60 * 1000;

export function useInactivity({ onExpire, onWarn }) {
  const expireTimer = useRef(null);
  const warnTimer = useRef(null);
  const onExpireRef = useRef(onExpire);
  const onWarnRef = useRef(onWarn);

  // Keep refs up to date without causing re-renders
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { onWarnRef.current = onWarn; }, [onWarn]);

  useEffect(() => {
    const reset = () => {
      clearTimeout(expireTimer.current);
      clearTimeout(warnTimer.current);

      warnTimer.current = setTimeout(() => {
        onWarnRef.current?.();
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

      expireTimer.current = setTimeout(() => {
        onExpireRef.current?.();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(expireTimer.current);
      clearTimeout(warnTimer.current);
    };
  }, []); // empty deps — only runs once on mount
}