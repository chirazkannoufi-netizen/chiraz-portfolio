'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Bot, MessageSquare, RotateCcw, Send, Square, X } from 'lucide-react';

import { greetings } from '@/lib/ai/system-prompt';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';
import { closeChat, toggleChat, useChatOpen } from './chat-store';

/**
 * ============================================================================
 *  CV CHATBOT AGENT — client shell
 * ============================================================================
 *
 *  Notes on the interesting parts:
 *
 *  • The locale is sent with the request body, not baked into a prop the
 *    server can't see. `/api/chat` rebuilds the system prompt per request, so
 *    switching language mid-conversation actually changes how the agent
 *    answers rather than just changing the UI chrome.
 *
 *  • Message rendering walks `parts`, not a `content` string. That is the
 *    AI SDK's model, and it means adding tool calls or citations later is a
 *    new `case` in the switch rather than a rewrite.
 *
 *  • The panel is a real dialog: `role="dialog"`, `aria-modal`, Escape to
 *    close, focus moved in on open and restored on close. A floating div that
 *    traps sighted users only is not a modal.
 */

const SUGGESTION_KEYS = ['experience', 'automation', 'stack', 'hire'] as const;

export function ChatWidget({ locale }: { locale: Locale }) {
  const t = useTranslations('chat');
  const open = useChatOpen();

  const [input, setInput] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // Merged into the POST body so the server can localise the system prompt.
      body: { locale },
    }),
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  /** Autoscroll to the newest content while a reply streams in. */
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  /** Focus management + Escape, i.e. the parts that make it a real dialog. */
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeChat();
        return;
      }

      // Minimal focus trap: Tab cycles within the panel while it's open.
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, textarea, a[href]',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleChat}
        aria-label={open ? t('close') : t('open')}
        aria-expanded={open}
        className="fixed bottom-5 end-5 z-50 grid size-14 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg shadow-[var(--glow)] transition-transform hover:scale-105 active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <MessageSquare className="size-6" aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass fixed bottom-24 end-5 z-50 flex h-[min(34rem,calc(100dvh-9rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t('title')}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{t('subtitle')}</p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  aria-label={t('clear')}
                  title={t('clear')}
                  className="grid size-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={closeChat}
                aria-label={t('close')}
                className="grid size-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            {/* Transcript. `aria-live` announces streamed replies without
                stealing focus from the input. */}
            <div
              ref={scrollRef}
              aria-live="polite"
              aria-atomic="false"
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-es-sm bg-[var(--surface-sunken)] px-4 py-3 text-sm leading-relaxed">
                    {greetings[locale]}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTION_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => submit(t(`suggestions.${key}`))}
                        className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {t(`suggestions.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isUser
                          ? 'rounded-ee-sm bg-[var(--accent)] text-[var(--accent-contrast)]'
                          : 'rounded-es-sm bg-[var(--surface-sunken)]',
                      )}
                    >
                      {message.parts.map((part, index) =>
                        part.type === 'text' ? (
                          <span key={index}>{part.text}</span>
                        ) : null,
                      )}
                    </div>
                  </div>
                );
              })}

              {status === 'submitted' && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-es-sm bg-[var(--surface-sunken)] px-4 py-3">
                    <span className="sr-only">{t('thinking')}</span>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        style={{ animationDelay: `${delay}ms` }}
                        className="size-1.5 animate-bounce rounded-full bg-[var(--text-muted)]"
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-red-500">
                  {t('error')}
                </p>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit(input);
              }}
              className="border-t border-[var(--border-subtle)] p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t('placeholder')}
                  aria-label={t('placeholder')}
                  maxLength={500}
                  className="min-w-0 flex-1 rounded-xl bg-[var(--surface-sunken)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--text-muted)]"
                />
                {isBusy ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label={t('stop')}
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-sunken)] text-[var(--text-secondary)]"
                  >
                    <Square className="size-4 fill-current" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label={t('send')}
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] transition-opacity disabled:opacity-40"
                  >
                    {/* Flip in RTL so "send" points the way the text runs. */}
                    <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[10px] leading-tight text-[var(--text-muted)]">
                {t('disclaimer')}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
