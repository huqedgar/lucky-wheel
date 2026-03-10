"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 300;
const EASING = "cubic-bezier(0.2, 0, 0.2, 1)";

/**
 * Pure-transform fullscreen hook (no layout shift, no flash).
 * Element stays in normal flow — only CSS `transform` is used
 * to visually translate + scale it to the center of the viewport.
 */
export function useFullscreen<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const lockRef = useRef(false);

  const open = useCallback(() => {
    const el = ref.current;
    if (!el || lockRef.current) return;
    lockRef.current = true;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 48; // 3rem

    // Uniform scale to fit inside padded viewport (contain)
    const sx = (vw - padding * 2) / rect.width;
    const sy = (vh - padding * 2) / rect.height;
    const s = Math.min(sx, sy);

    // Translate element center → viewport center
    const dx = vw / 2 - (rect.left + rect.width / 2);
    const dy = vh / 2 - (rect.top + rect.height / 2);

    // Pure visual transform — NO position/layout changes
    el.style.transformOrigin = "center center";
    el.style.transition = `transform ${DURATION}ms ${EASING}`;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    el.style.zIndex = "70";
    el.style.position = "relative";

    setIsFullscreen(true);
  }, []);

  const close = useCallback(() => {
    const el = ref.current;
    if (!el) {
      lockRef.current = false;
      setIsFullscreen(false);
      return;
    }

    setIsClosing(true);

    // Animate transform back to identity
    el.style.transition = `transform ${DURATION}ms ${EASING}`;
    el.style.transform = "none";

    const cleanup = () => {
      if (ref.current) {
        ref.current.style.transition = "";
        ref.current.style.transform = "";
        ref.current.style.transformOrigin = "";
        ref.current.style.zIndex = "";
        ref.current.style.position = "";
      }
      lockRef.current = false;
      setIsFullscreen(false);
      setIsClosing(false);
    };

    el.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, DURATION + 50);
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) close();
    else open();
  }, [isFullscreen, open, close]);

  // ESC key + scroll lock
  useEffect(() => {
    if (!isFullscreen && !isClosing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, isClosing, close]);

  const isVisible = isFullscreen || isClosing;

  return { isFullscreen, isClosing, isVisible, open, close, toggle, ref } as const;
}
