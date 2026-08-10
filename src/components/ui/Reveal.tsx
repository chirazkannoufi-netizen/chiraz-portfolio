'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper.
 *
 * Deliberately not Framer Motion: this runs on nearly every section, and an
 * IntersectionObserver flipping one data attribute lets the compositor handle
 * the animation entirely off the main thread. The observer disconnects after
 * the first intersection — re-animating on scroll-back is a distraction.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in ms. Keep under ~300 or the page feels sluggish. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old browser, some test runners): show the
    // content rather than leaving it invisible forever.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Fire slightly before the element reaches the viewport edge so the
      // animation is already running when it becomes visible.
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn('reveal', className)}
    >
      {children}
    </Tag>
  );
}
