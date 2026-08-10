'use client';

import { openChat } from './chat-store';

/** Any element can open the assistant; this just wires the click. */
export function OpenChatButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={openChat} className={className}>
      {children}
    </button>
  );
}
