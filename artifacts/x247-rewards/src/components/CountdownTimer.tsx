import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  endsAt: string;
  compact?: boolean;
}

export default function CountdownTimer({ endsAt, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (expired) {
    return (
      <span className="text-[10px] text-white/30 font-display uppercase tracking-wider">Ended</span>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {[
          { val: timeLeft.days, label: "d" },
          { val: timeLeft.hours, label: "h" },
          { val: timeLeft.minutes, label: "m" },
        ].map((unit, i) => (
          <React.Fragment key={unit.label}>
            {i > 0 && <span className="text-white/15 text-[10px]">:</span>}
            <span className="text-xs font-display font-light text-white/60 tabular-nums">
              {String(unit.val).padStart(2, "0")}
              <span className="text-[9px] text-white/30 ml-0.5">{unit.label}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {[
        { val: timeLeft.days, label: "Days" },
        { val: timeLeft.hours, label: "Hrs" },
        { val: timeLeft.minutes, label: "Min" },
        { val: timeLeft.seconds, label: "Sec" },
      ].map((unit, i) => (
        <React.Fragment key={unit.label}>
          {i > 0 && <span className="text-white/10 text-sm font-light">:</span>}
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-xl font-display font-light text-white tabular-nums leading-none">
              {String(unit.val).padStart(2, "0")}
            </span>
            <span className="text-[8px] text-white/25 font-display uppercase tracking-wider mt-1">
              {unit.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
