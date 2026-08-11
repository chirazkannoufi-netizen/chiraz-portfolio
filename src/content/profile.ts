/**
 * ============================================================================
 *  VERIFIED PROFILE — SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 *  Every fact below is transcribed from Chiraz's actual CV. This file is the
 *  ONLY place these facts live: the hero, the timeline, the SEO/JSON-LD and —
 *  critically — the AI agent's system prompt are all generated from it.
 *
 *  ⚠️  Rule: if a claim is not in this file, the AI agent is instructed to say
 *  it does not know. That is what prevents a recruiter-facing chatbot from
 *  hallucinating a credential. Never add an unverified fact here.
 *
 *  Locale-specific prose (bios, project narratives) lives in /messages/*.json.
 *  This file holds only language-neutral, factual data.
 */

export const profile = {
  name: 'Chiraz Lina Kannoufi',
  shortName: 'Chiraz',
  /** Latin transliteration used for hreflang-independent structured data. */
  arabicName: 'شيراز لينا قنوفي',

  location: {
    city: 'Sétif',
    postalCode: '19500',
    country: 'Algeria',
    countryCode: 'DZ',
    /** Remote-first: this is the market she sells into, not where she sits. */
    servesRemote: true,
  },

  contact: {
    email: 'Chirazkannoufi@gmail.com',
    phone: '+213 796 31 45 63',
    github: 'https://github.com/chirazlina',
    linkedin: 'https://www.linkedin.com/in/chiraz-kanoufi',
  },

  /**
   * ⚠️ VERIFIED CREDENTIAL — do not inflate.
   * The CV states a Licence (Bac+3 / B.Sc.), NOT a Master's degree.
   * Academic degrees only — professional certificates live in `certificates`.
   */
  education: [
    {
      id: 'licence-cs',
      degree: 'Licence en Informatique — B.Sc. Computer Science',
      specialisation: 'Software Engineering',
      institution: 'Université Ferhat Abbas — Sétif 1',
      start: '2022',
      end: '2025',
      coursework: [
        'Algorithms & Data Structures',
        'Object-Oriented Programming',
        'Software Engineering',
        'Relational Databases (SQL)',
        'Computer Networks',
      ],
    },
    {
      id: 'bac',
      degree: 'Baccalauréat — Experimental Sciences (×2, both "Mention Bien")',
      specialisation: 'Experimental Sciences',
      institution: 'Algeria',
      start: '2021',
      end: '2022',
      coursework: [],
    },
  ],

  /** Professional certificates — distinct from the academic `education` above. */
  certificates: [
    {
      id: 'huawei-ai',
      degree: 'Huawei Talent Certificate — Search & Artificial Intelligence',
      specialisation: 'CRA Training Program',
      institution: 'Huawei',
      start: '2025',
      end: '2025',
      coursework: [
        'Information retrieval algorithms',
        'Machine learning fundamentals',
        'Decision-oriented data processing',
      ],
    },
  ],

  /**
   * Reverse-chronological. `metricKey` points at a translation key so the
   * headline number can be phrased naturally in each of the four languages.
   */
  experience: [
    {
      id: 'ranli',
      company: 'Ranli',
      location: 'El Eulma, Algeria',
      start: '2026-03',
      end: null, // null = current
      stack: ['Google Apps Script', 'JavaScript', 'Python', 'REST APIs', 'Webhooks', 'Shopify'],
      /** Headline impact metric, rendered as a stat tile. */
      metric: { value: 90, unit: '%', direction: 'down' as const },
    },
    {
      id: 'daxshop',
      company: 'Dax.shop',
      location: 'El Eulma, Algeria',
      start: '2025-08',
      end: '2025-12',
      stack: ['JavaScript', 'Google Sheets API', 'Data Modelling', 'Automation'],
      metric: null,
    },
    {
      id: 'consulting',
      company: 'German SMEs & Forever Living (USA)',
      location: 'Gulf region — remote',
      start: '2023-07',
      end: '2024-02',
      stack: ['Snapchat Marketing API', 'CRM Automation', 'Analytics'],
      metric: null,
    },
  ],

  /**
   * Grouped for the skills matrix. Order = descending confidence, which is
   * also the order the AI agent will mention them in.
   */
  skills: {
    languages: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML5 / CSS3'],
    frameworks: ['Next.js', 'React', 'Node.js', 'REST APIs'],
    automation: ['n8n', 'Google Apps Script', 'Webhooks', 'API Integration', 'ETL pipelines'],
    data: ['PostgreSQL', 'Supabase', 'Google Cloud Suite', 'Serverless'],
    design: ['Figma', 'Canva', 'Git / GitHub', 'VS Code'],
    platforms: ['Shopify', 'Meta Business Suite', 'Ecomanager'],
    systems: ['Troubleshooting', 'System maintenance', 'Web security (WAF)'],
  },

  /** CEFR-style self-assessment, straight from the CV. */
  spokenLanguages: [
    { code: 'ar', level: 'native' as const },
    { code: 'fr', level: 'fluent' as const },
    { code: 'en', level: 'advanced' as const },
    { code: 'de', level: 'basic' as const }, // B1 preparation
  ],

  availability: {
    status: 'open' as const,
    /** Drives the "Available for work" pulse dot in the navbar. */
    weeklyHours: 20,
    responseTimeHours: 24,
  },
} as const;

export type Profile = typeof profile;
