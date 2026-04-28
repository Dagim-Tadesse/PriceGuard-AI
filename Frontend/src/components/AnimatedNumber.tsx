import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, duration = 900, format }: { value: number; duration?: number; format?: (n: number) => string }) {
  const [n, setN] = useState(0);
  const start = useRef<number | null>(null);
  const from = useRef(0);
  useEffect(() => {
    from.current = n;
    start.current = null;
    let raf = 0;
    const tick = (ts: number) => {
      if (start.current == null) start.current = ts;
      const t = Math.min(1, (ts - start.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(from.current + (value - from.current) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const display = format ? format(n) : Math.round(n).toLocaleString();
  return <>{display}</>;
}