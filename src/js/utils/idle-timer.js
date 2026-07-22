export function createIdleTimer({ timeoutMs, onIdle }) {
  let timerId = null;
  const events = ["mousemove", "keydown", "touchstart", "click"];
  const reset = () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(onIdle, timeoutMs);
  };
  const start = () => {
    events.forEach((eventName) => window.addEventListener(eventName, reset, { passive: true }));
    reset();
  };
  const stop = () => {
    window.clearTimeout(timerId);
    events.forEach((eventName) => window.removeEventListener(eventName, reset));
  };
  return { start, stop, reset };
}
