/**
 * Resend client configuration
 *
 * This module initializes and exports the Resend email client
 * for sending transactional emails throughout the application.
 */

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Default sender email address
 * Update this to your verified domain in Resend
 */
export const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'Hotelius <noreply@hotelius.com>';

/**
 * Support email address for customer inquiries
 */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@hotelius.com';
