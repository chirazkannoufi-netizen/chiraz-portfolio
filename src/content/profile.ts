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
 *  ⚠️  No employer or client is ever named — here or anywhere else on the
 *  site. Roles are described by what the work was, not who paid for it. The
 *  one brand that does appear is FlowTech Automation, which is Chiraz's own.
 *
 *  ⚠️  No metric appears anywhere unless it is written in the CV or in a
 *  project's own public README. Estimated, rounded and inferred numbers are
 *  treated the same as invented ones.
 *
 *  Locale-specific prose (bios, project narratives) lives in /messages/*.json.
 *  This file holds only language-neutral, factual data.
 */

export const profile = {
  name: 'Chiraz Lina Kannoufi',
  shortName: 'Chiraz',
  /** Latin transliteration used for hreflang-independent structured data. */
  arabicName: 'شيراز لينا قنوفي',

  /** Exactly as the CV states it. Used for meta, JSON-LD and the AI prompt. */
  title: 'Web & Automation Developer',

  location: {
    city: 'Sétif',
    country: 'Algeria',
    countryCode: 'DZ',
    /** Remote-first: this is the market she sells into, not where she sits. */
    servesRemote: true,
  },

  contact: {
    email: 'Chirazkannoufi@gmail.com',
    /** wa.me form: country code, no +, no spaces, no leading zero. */
    whatsapp: 'https://wa.me/213796314563',
    github: 'https://github.com/chirazkannoufi-netizen',
    linkedin: 'https://www.linkedin.com/in/chiraz-kanoufi',
    /** Her own automation brand — the only brand name allowed on the site. */
    store: 'https://payhip.com/FlowTechAutomation',
  },

  /**
   * ⚠️ VERIFIED CREDENTIAL — do not inflate.
   * The CV states a Licence (Bac+3 / B.Sc.) in Computer Systems, NOT a
   * Master's, and NOT software engineering as the specialisation.
   * Academic degrees only — professional certificates live in `certificates`.
   */
  education: [
    {
      id: 'licence-cs',
      degree: 'Licence en Informatique — spécialité Systèmes Informatiques',
      institution: 'Université Ferhat Abbas — Sétif 1',
      start: '2022',
      end: '2025',
      coursework: [
        'Human–Computer Interaction (HCI/IHM)',
        'Web development',
        'Algorithms & data structures',
        'Computer architecture',
        'Operating systems',
        'Computer networks',
        'Databases (SQL)',
        'Object-oriented programming',
        'Software engineering',
        'Cybersecurity',
      ],
    },
    {
      id: 'bac',
      degree: 'Baccalauréat — Sciences Expérimentales (Mention Bien, both sessions)',
      institution: 'Algeria',
      start: '2021',
      end: '2022',
      coursework: [],
    },
  ],

  /**
   * Professional certificates — distinct from the academic `education` above.
   * `image` is the scan of the actual certificate, so the credential is
   * verifiable rather than just asserted; `thumb` is the inline preview.
   */
  certificates: [
    {
      id: 'huawei-ai',
      degree: 'Huawei Talent Certificate — Search & Artificial Intelligence',
      institution: 'Huawei — CRA Training Program',
      start: '2025',
      end: '2025',
      coursework: [],
      image: '/certificates/huawei-search-ai.jpg',
      thumb: '/certificates/huawei-search-ai-thumb.jpg',
    },
  ],

  /**
   * Reverse-chronological by start date. Employers and clients are never
   * named — see the file header. The two current roles genuinely run in
   * parallel; that is not a data error.
   */
  experience: [
    {
      id: 'flowtech',
      start: '2026-08',
      end: null, // null = current
      stack: ['n8n', 'Google Apps Script', 'Figma', 'Payhip'],
      /**
       * Language-neutral summary for the AI agent's knowledge base. The
       * visitor-facing wording lives in messages/*.json; this exists so the
       * agent still has the facts once employer names are stripped out.
       */
      summary:
        'Runs FlowTech Automation, her own venture: designs and distributes automation scripts and digital tools for creators and e-commerce sellers, and handles the brand design, storefront UI/UX and product documentation herself.',
    },
    {
      id: 'ecommerce-automation',
      start: '2026-03',
      end: null,
      stack: ['Google Apps Script', 'JavaScript', 'REST APIs', 'Google Sheets automation'],
      summary:
        'E-commerce and automation work: builds automation scripts with Google Apps Script and REST APIs that sync inventory between an e-commerce platform, an order-management tool and Google Sheets, removing repetitive manual data tasks.',
    },
    {
      id: 'freelance-web',
      start: '2025-08',
      end: '2025-08',
      stack: ['JavaScript', 'Google Sheets automation', 'Google Apps Script'],
      summary:
        'Freelance web development and integration for an e-commerce client: structured and organised Google Sheets tracking databases, and built automated verification and monitoring scripts.',
    },
    {
      id: 'digital-consulting',
      start: '2023-07',
      end: '2024-02',
      stack: ['Content marketing', 'Graphic design', 'Canva'],
      summary:
        'Freelance digital consulting and outreach: visual content creation and social-media prospecting for an affiliate marketing and distribution project, plus direct client relationship management.',
    },
  ],

  /**
   * ⚠️ WHITELIST ONLY. Every entry below is either written in the CV or
   * demonstrably used in one of the four published projects. Nothing is
   * listed because it is adjacent, likely, or "obviously true".
   */
  skills: {
    languages: ['JavaScript', 'Python', 'Dart', 'HTML5 / CSS3'],
    frameworks: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Flutter', 'FastAPI', 'pytest'],
    automation: [
      'n8n',
      'Google Apps Script',
      'Webhooks',
      'REST APIs',
      'Google Sheets automation',
      'Telegram Bot API',
      'SMTP automation',
    ],
    ai: ['Anthropic Claude API', 'OpenAI API'],
    data: ['PostgreSQL', 'Supabase', 'SQLite'],
    design: ['Figma', 'Canva', 'Graphic design', 'Identity branding', 'HCI / UX principles'],
    commerce: ['Shopify', 'Payhip', 'Digital product sales', 'Content marketing', 'Meta Ads'],
  },

  /** CEFR-style self-assessment, straight from the CV. */
  spokenLanguages: [
    { code: 'ar', level: 'native' as const },
    { code: 'fr', level: 'fluent' as const },
    { code: 'en', level: 'advanced' as const },
    { code: 'de', level: 'basic' as const }, // B1, in preparation
  ],

  availability: {
    status: 'open' as const,
  },
} as const;

export type Profile = typeof profile;
