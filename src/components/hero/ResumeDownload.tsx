import { Download } from 'lucide-react';
import type { Locale } from '@/i18n/routing';

/**
 * Multilingual CV download.
 *
 * A plain <a download> rather than a JS handler: it works with middle-click,
 * "Save link as", and with JavaScript disabled, and the browser's own download
 * UI is better than anything we'd build.
 *
 * Files live at `public/cv/chiraz-kanoufi-{locale}.pdf`. Ship all four; if one
 * is missing the visitor gets a 404 rather than a silent no-op, which is the
 * failure mode you actually want to notice.
 */
export function ResumeDownload({
  locale,
  label,
  aria,
}: {
  locale: Locale;
  label: string;
  aria: string;
}) {
  const file = `/cv/chiraz-kanoufi-${locale}.pdf`;

  return (
    <a
      href={file}
      download={`Chiraz-Kanoufi-CV-${locale.toUpperCase()}.pdf`}
      aria-label={aria}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-dashed border-[var(--border-subtle)] px-5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <Download className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}
