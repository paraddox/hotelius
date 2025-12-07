/**
 * Resend client configuration
 *
 * This module initializes and exports the Resend email client
 * for sending transactional emails throughout the application.
 */

import { Resend } from 'resend';

/**
 * Lazy-initialized Resend instance to avoid build-time errors
 * when RESEND_API_KEY is not yet available
 */
let resendInstance: Resend | null = null;

/**
 * Get the Resend instance, initializing it if needed
 * Throws an error if RESEND_API_KEY is not defined at runtime
 */
function getResend(): Resend {
  if (resendInstance) {
    return resendInstance;
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }

  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
}

/**
 * Resend client (lazy-initialized)
 * Use this for sending emails
 */
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return getResend()[prop as keyof Resend];
  },
});

/**
 * Default sender email address
 * Update this to your verified domain in Resend
 */
export const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'Hotelius <noreply@hotelius.com>';

/**
 * Support email address for customer inquiries
 */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@hotelius.com';
