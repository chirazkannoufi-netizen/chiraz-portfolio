import { use } from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/about/About';
import { Section } from '@/components/ui/Section';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import { ServicesGrid } from '@/components/services/ServicesGrid';
import { CostEstimator } from '@/components/services/CostEstimator';
import { BookingEmbed } from '@/components/services/BookingEmbed';
import { ContactForm } from '@/components/contact/ContactForm';
import { profile } from '@/content/profile';

/**
 * Single-page composition.
 *
 * Section order is a funnel: prove capability (work) → name the offer
 * (services) → let them price it themselves (estimator) → remove the friction
 * of asking (booking, contact). Credentials sit near the bottom because a
 * client cares what you've shipped before they care where you studied.
 */
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // `params` is a Promise in the App Router. `use()` unwraps it inside a sync
  // Server Component, which lets us keep `useTranslations` (sync-only) here.
  const { locale } = use(params);

  // Re-assert the locale so this page is statically rendered rather than
  // silently opted into dynamic rendering by the first translation read.
  setRequestLocale(locale);

  const t = useTranslations();

  return (
    <>
      {/* Structured data: makes the profile eligible for a knowledge panel and
          tells search engines this is a Person, not a generic page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            jobTitle: 'Software Engineer & Automation Specialist',
            email: `mailto:${profile.contact.email}`,
            address: {
              '@type': 'PostalAddress',
              addressLocality: profile.location.city,
              addressCountry: profile.location.countryCode,
            },
            alumniOf: {
              '@type': 'CollegeOrUniversity',
              name: 'Université Ferhat Abbas — Sétif 1',
            },
            knowsAbout: [
              ...profile.skills.languages,
              ...profile.skills.automation,
              ...profile.skills.frameworks,
            ],
            knowsLanguage: profile.spokenLanguages.map((l) => l.code),
            sameAs: [profile.contact.github, profile.contact.linkedin],
          }),
        }}
      />

      <Hero />

      <Section
        id="work"
        eyebrow={t('projects.eyebrow')}
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
      >
        <ProjectShowcase />
      </Section>

      <Section
        id="services"
        eyebrow={t('services.eyebrow')}
        title={t('services.title')}
        subtitle={t('services.subtitle')}
        className="bg-[var(--surface-sunken)]"
      >
        <ServicesGrid />
      </Section>

      <Section
        id="estimator"
        eyebrow={t('estimator.eyebrow')}
        title={t('estimator.title')}
        subtitle={t('estimator.subtitle')}
      >
        <CostEstimator />
      </Section>

      <Section
        id="about"
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        className="bg-[var(--surface-sunken)]"
      >
        <About />
      </Section>

      <Section
        id="booking"
        eyebrow={t('booking.eyebrow')}
        title={t('booking.title')}
        subtitle={t('booking.subtitle')}
      >
        <BookingEmbed />
      </Section>

      <Section
        id="contact"
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
        className="bg-[var(--surface-sunken)]"
        contentClassName="max-w-3xl"
      >
        <ContactForm />
      </Section>
    </>
  );
}
