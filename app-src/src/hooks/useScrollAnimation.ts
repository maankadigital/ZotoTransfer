import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;   // 0–1, fraction of element visible to trigger
  rootMargin?: string;  // e.g. '0px 0px -80px 0px'
  once?: boolean;       // only animate once (default true)
}

/**
 * Returns a ref to attach to an element and a boolean `visible`.
 * When the element enters the viewport, `visible` becomes true.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
) {
  const { threshold = 0.12, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}

/**
 * Returns a className string for the animated element.
 * Pass `delay` (ms) to stagger multiple items.
 */
export function animClass(
  visible: boolean,
  variant: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-up' = 'fade-up',
  delay = 0
): string {
  const base = 'transition-all ease-out';
  const duration = 'duration-700';
  const delayClass = delay ? `delay-[${delay}ms]` : '';

  const hidden: Record<typeof variant, string> = {
    'fade-up':    'opacity-0 translate-y-10',
    'fade-in':    'opacity-0',
    'fade-left':  'opacity-0 -translate-x-10',
    'fade-right': 'opacity-0 translate-x-10',
    'scale-up':   'opacity-0 scale-95',
  };

  const shown = 'opacity-100 translate-y-0 translate-x-0 scale-100';

  return `${base} ${duration} ${delayClass} ${visible ? shown : hidden[variant]}`;
}
