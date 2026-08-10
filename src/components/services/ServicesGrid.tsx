import { useTranslations } from 'next-intl';
import { Bot, Check, Gauge, Plug, Workflow } from 'lucide-react';

import { Reveal } from '@/components/ui/Reveal';

const SERVICES = [
  { key: 'automation', icon: Workflow },
  { key: 'web', icon: Bot },
  { key: 'api', icon: Plug },
  { key: 'audit', icon: Gauge },
] as const;

/** Service cards. Pure server-rendered content — no client JS at all. */
export function ServicesGrid() {
  const t = useTranslations('services');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {SERVICES.map(({ key, icon: Icon }, index) => {
        const features = t.raw(`items.${key}.features`) as string[];

        return (
          <Reveal key={key} as="article" delay={index * 70}>
            <div className="surface-card group h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--glow)]">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--surface-sunken)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-contrast)]">
                <Icon className="size-5" aria-hidden="true" />
              </span>

              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t(`items.${key}.description`)}
              </p>

              <ul className="mt-4 space-y-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
