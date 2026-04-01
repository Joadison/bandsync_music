"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoScroll(containerRef: React.RefObject<HTMLElement>) {
  const [scrolling, setScrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1); // velocidade atual (1x, 1.5x, 2x...)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // velocidades disponíveis
  const speedOptions = [0.5, 1, 1.5, 2, 2.5, 3];

  const updateProgress = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
  }, [containerRef]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScrolling(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setScrolling(true);

    intervalRef.current = setInterval(() => {
      const el = containerRef.current;
      if (!el) return;

      // velocidade base = 1.2, multiplicada pelo speed
      el.scrollTop += 1.2 * speed;

      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setProgress(pct);

      if (el.scrollTop >= max - 5 && max > 0) stop();
    }, 45);
  }, [containerRef, stop, speed]);

  const toggle = useCallback(() => {
    scrolling ? stop() : start();
  }, [scrolling, start, stop]);

  const reset = useCallback(() => {
    stop();
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setProgress(0);
  }, [containerRef, stop]);

  // se mudar a velocidade enquanto estiver rodando, reinicia com a nova velocidade
  useEffect(() => {
    if (scrolling) {
      start();
    }
  }, [speed, scrolling, start]);

  useEffect(() => () => stop(), [stop]);

  return {
    scrolling,
    progress,
    speed,
    setSpeed,
    speedOptions,
    toggle,
    reset,
    updateProgress,
  };
}