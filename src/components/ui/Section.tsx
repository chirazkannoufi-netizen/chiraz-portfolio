import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

/**
 * Standard section shell: consistent rhythm, a numbered eyebrow, and a
 * heading that is always an <h2> so the document outline stays valid.
 */
export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  contentClassName,
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      id={id}
      // Labelled by its own heading so screen-reader users can navigate by
      // landmark and hear what each region is.
      aria-labelledby={title ? `${id}-heading` : undefined}
      className={cn('mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28', className)}
    >
      {(eyebrow || title) && (
        <Reveal className="mb-12 max-w-2xl">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              id={`${id}-heading`}
              className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-pretty text-base leading-relaxed text-[var(--text-secondary)]">
              {subtitle}
            </p>
          )}
        </Reveal>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
