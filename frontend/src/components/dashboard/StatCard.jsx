import { useEffect, useRef, useState } from "react";

const DOTS = [
  [14, 14, 0.54], [38, 14, 0.36], [62, 14, 0.18], [86, 14, 0],
  [38, 38, 0.54], [62, 38, 0.36], [86, 38, 0.18],
  [62, 62, 0.54], [86, 62, 0.36],
  [86, 86, 0.54],
];

export default function StatCard({ title, value = 0, suffix = "", accentRgb = "255,69,0", icon: Icon, details = [] }) {
  const wrapRef = useRef(null);
  const [display, setDisplay] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    let raf = 0;
    const run = () => {
      setRevealed(true);
      const start = performance.now();
      const duration = 1400;
      const tick = (ts) => {
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * (Number(value) || 0)));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div
      ref={wrapRef}
      className="relative flex min-h-[132px] flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/[0.06] p-3.5 transition-colors hover:border-white/[0.12] sm:min-h-[168px] sm:gap-5 sm:rounded-3xl sm:p-6"
      style={{
        background: `radial-gradient(125% 125% at 100% 0%, rgba(${accentRgb},0.26) 0%, rgba(${accentRgb},0.07) 32%, rgba(30,31,36,0) 66%), #1E1F24`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="pr-1 text-[12px] font-medium leading-snug text-muted-foreground sm:text-[13px]">{title}</p>
          {Icon ? <Icon className="mt-2 h-4 w-4" style={{ color: `rgb(${accentRgb})` }} /> : null}
        </div>
        <svg className="h-8 w-8 shrink-0 sm:h-14 sm:w-14" viewBox="0 0 100 100" aria-hidden="true" style={{ fill: `rgb(${accentRgb})` }}>
          {DOTS.map(([cx, cy, delay], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="9"
              className="wsc-dot"
              style={{ animationDelay: `${delay}s`, animationPlayState: revealed ? "running" : "paused" }}
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex items-start">
          <span className="font-display text-[1.6rem] font-bold leading-none tracking-tight text-white tabular-nums sm:text-[2.15rem]">
            {display.toLocaleString("fr-FR")}
          </span>
          {suffix ? <span className="ml-1 text-xs text-muted-foreground">{suffix}</span> : null}
        </div>
        <dl className="flex flex-wrap gap-x-4 gap-y-1.5 sm:gap-x-5 sm:gap-y-2">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-[9px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">{d.label}</dt>
              <dd className="mt-0.5 text-[12px] font-medium text-white/90 sm:text-[13px]">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}