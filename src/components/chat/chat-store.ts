'use client';

import { useSyncExternalStore } from 'react';

/**
 * A two-line global store for "is the chat panel open".
 *
 * The trigger lives in the Hero, the panel lives in the layout, and they have
 * no common ancestor below the root. A Context provider would force the whole
 * tree to be a Client Component; `useSyncExternalStore` keeps both ends client
 * and everything between them server-rendered.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function openChat() {
  if (isOpen) return;
  isOpen = true;
  emit();
}

export function closeChat() {
  if (!isOpen) return;
  isOpen = false;
  emit();
}

export function toggleChat() {
  isOpen = !isOpen;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useChatOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isOpen,
    // Server snapshot: always closed, so SSR and first client render agree.
    () => false,
  );
}
