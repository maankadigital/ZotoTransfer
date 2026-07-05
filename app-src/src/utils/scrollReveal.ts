/**
 * Scroll Reveal — lightweight IntersectionObserver runner.
 * Call initScrollReveal() once after the DOM is ready.
 * Automatically re-observes new elements (e.g. after React renders).
 */
export function initScrollReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Read optional data-delay attribute (ms)
          const delay = (entry.target as HTMLElement).dataset.delay;
          if (delay) {
            (entry.target as HTMLElement).style.transitionDelay = `${delay}ms`;
          }
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );

  const observe = () => {
    document.querySelectorAll(selectors).forEach((el) => {
      if (!el.classList.contains('is-visible')) observer.observe(el);
    });
  };

  // Initial scan
  observe();

  // Re-scan on DOM mutations (React route changes)
  const mutationObserver = new MutationObserver(observe);
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
  };
}
