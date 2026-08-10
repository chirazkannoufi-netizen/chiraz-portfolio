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

  budget: z
    .enum(['under-500', '500-1500', '1500-5000', '5000-plus', 'not-sure'])
    .optional(),

  message: z
    .string()
    .trim()
    .min(20, { message: 'validation.messageShort' })
    .max(2000, { message: 'validation.messageLong' }),

  /**
   * Honeypot. Real users never see this field; bots fill every input they
   * find. Must be empty — cheap first line of defence before Turnstile.
   */
  website: z.literal('').optional(),

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

/** Quote payload attached to a booking, re-priced server-side. */
export const quoteRequestSchema = z.object({
  options: z.array(z.string().max(60)).max(30),
  rush: z.boolean().default(false),
});
