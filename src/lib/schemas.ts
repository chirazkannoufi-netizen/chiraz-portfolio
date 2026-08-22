import { z } from 'zod';
import { locales } from '@/i18n/routing';

/**
 * Contact form contract — shared by React Hook Form on the client and the
 * route handler on the server. One schema, two consumers: the client gets
 * instant feedback, the server re-validates because client validation is a
 * UX affordance, not a security boundary.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'validation.nameShort' })
    .max(80, { message: 'validation.nameLong' }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'validation.emailInvalid' })
    .max(160),

  company: z.string().trim().max(120).optional().or(z.literal('')),

  /**
   * Optional — and it has to behave that way.
   *
   * The <select> renders a disabled placeholder as its first option, so an
   * untouched dropdown submits `''`, which a bare `.optional()` enum rejects.
   * That failure had nowhere to surface (the budget field renders no error
   * slot), so the submit button silently did nothing for every visitor who
   * left this alone. The placeholder is therefore a legal value here; the
   * route turns it into `null` before the lead is delivered.
   */
  budget: z
    .enum(['under-500', '500-1500', '1500-5000', '5000-plus', 'not-sure'])
    .or(z.literal(''))
    .optional(),

  message: z
    .string()
    .trim()
    .min(20, { message: 'validation.messageShort' })
    .max(2000, { message: 'validation.messageLong' }),

  /**
   * Honeypot. Real users never see this field; bots fill every input they
   * find.
   *
   * Deliberately permissive: `z.literal('')` would reject a filled honeypot
   * here, and the 422 that follows names `website` in its issue list — which
   * hands a bot the exact field to drop on its next attempt. The route lets
   * a filled honeypot through validation and answers 200 instead, so the bot
   * records a success and never learns it was caught. The bound only stops
   * someone using the field to push a megabyte through the parser.
   */
  website: z.string().max(200).optional(),

  locale: z.enum(locales),

  /** Cloudflare Turnstile token, verified server-side against Cloudflare. */
  turnstileToken: z.string().min(1, { message: 'validation.captchaRequired' }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Client-side variant: the token is injected by the widget at submit time. */
export const contactFormSchema = contactSchema.omit({
  turnstileToken: true,
  locale: true,
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Chat request contract. Bounds the payload so nobody can burn the OpenAI
 * budget by POSTing a 5 MB conversation.
 *
 * Intentionally loose on message *shape*: the AI SDK owns that contract and
 * re-validates it in `convertToModelMessages`. Our job is only to cap size.
 */
export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(30),
  locale: z.enum(locales).optional(),
});
