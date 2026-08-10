'use client';

import { useEffect, useReducer } from 'react';

/**
 * Typewriter that cycles through job titles.
 *
 * Implementation notes:
 *  • A reducer, not four useStates. The phase machine (typing → pausing →
 *    deleting) is easier to reason about and impossible to leave in an
 *    inconsistent intermediate state.
 *  • Uses `Array.from()` rather than `.slice()` so multi-byte characters —
 *    Arabic ligatures in particular — are never cut in half mid-grapheme.
 *  • The visible text is `aria-hidden` and the full role list is exposed once
 *    to assistive tech: a screen reader announcing a character at a time is
 *    unusable.
 */

type Phase = 'typing' | 'pausing' | 'deleting';

interface State {
  index: number;
  charCount: number;
  phase: Phase;
}

const TYPE_MS = 65;
const DELETE_MS = 32;
const HOLD_MS = 1900;

function reducer(state: State, action: { total: number; length: number }): State {
  const { total, length } = action;

  switch (state.phase) {
    case 'typing':
      return state.charCount >= length
        ? { ...state, phase: 'pausing' }
        : { ...state, charCount: state.charCount + 1 };
    case 'pausing':
      return { ...state, phase: 'deleting' };
    case 'deleting':
      return state.charCount <= 0
        ? { index: (state.index + 1) % total, charCount: 0, phase: 'typing' }
        : { ...state, charCount: state.charCount - 1 };
  }
}

export function RoleTyper({ roles }: { roles: readonly string[] }) {
  const [state, dispatch] = useReducer(reducer, {
    index: 0,
    charCount: 0,
    phase: 'typing',
  });

  const current = roles[state.index] ?? '';
  const graphemes = Array.from(current);

  useEffect(() => {
    if (roles.length === 0) return;

    const delay =
      state.phase === 'typing' ? TYPE_MS : state.phase === 'deleting' ? DELETE_MS : HOLD_MS;

    const timer = window.setTimeout(
      () => dispatch({ total: roles.length, length: graphemes.length }),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [state, roles.length, graphemes.length]);

  return (
    <span className="inline-flex items-center">
      {/* Full list, announced once, never re-announced. */}
      <span className="sr-only">{roles.join(', ')}</span>

      <span aria-hidden="true" className="text-gradient font-semibold">
        {graphemes.slice(0, state.charCount).join('')}
      </span>

      <span
        aria-hidden="true"
        className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em] bg-[var(--accent)] animate-[var(--animate-blink)]"
      />
    </span>
  );
}
