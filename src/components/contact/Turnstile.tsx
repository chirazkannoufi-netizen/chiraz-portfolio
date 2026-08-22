'use client';

import { useEffect, useId, useRef } from 'react';
import { useLocale } from 'next-intl';

/**
 * Cloudflare Turnstile widget.
 *
 * Explicit rendering (`render=explicit`) rather than Cloudflare's automatic
 * mode: automatic scans the DOM on load, which races React's mount and
 * intermittently renders nothing in a client-side-navigated app.
 *
 * The token this produces is meaningless on its own — `lib/turnstile.ts`
 * verifies it against Cloudflare on the server before any lead is accepted.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';

export function Turnstile({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const reactId = useId();
  const locale = useLocale();

  // Latest-callback refs: the widget is rendered once, but the parent's
  // handlers are re-created each render. Without this the widget would call a
  // stale closure after the first verification.
  //
  // The sync happens in an effect, not during render: a render can be
  // discarded under concurrent rendering, and mutating a ref there would
  // either be lost or leak a value from a render that never committed. The
  // initial values come from `useRef` itself, so the widget is never wired to
  // an undefined handler, and Turnstile only invokes these callbacks after a
  // user interaction or a network round-trip — long after commit.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !containerRef.current) return;

    function renderWidget() {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey!,
        theme: 'auto',
        language: locale,
        callback: (token) => onVerifyRef.current(token),
        'expired-callback': () => onExpireRef.current(),
        'error-callback': () => onExpireRef.current(),
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      window.onTurnstileLoad = renderWidget;

      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [locale]);

  return <div ref={containerRef} id={`turnstile-${reactId}`} className="min-h-[65px]" />;
}
