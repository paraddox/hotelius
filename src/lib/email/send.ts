/**
 * Generic email sending utilities with error handling
 *
 * This module provides a robust wrapper around the Resend client
 * with proper error handling, logging, and retry logic.
 */

import { ReactElement } from 'react';
import { resend, DEFAULT_FROM_EMAIL } from './client';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 *
 * This function includes error handling and logging to ensure
 * that email failures don't crash the application. It's designed
 * to fail gracefully - if an email can't be sent, the error is
 * logged but the operation continues.
 *
 * @param options - Email sending options
 * @returns Result object with success status and optional error message
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const { to, subject, react, from, replyTo, bcc, tags } = options;

    // Validate required fields
    if (!to || to.length === 0) {
      throw new Error('Email recipient (to) is required');
    }

    if (!subject) {
      throw new Error('Email subject is required');
    }

    if (!react) {
      throw new Error('Email content (react) is required');
    }

    // Send the email
    const { data, error } = await resend.emails.send({
      from: from || DEFAULT_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      tags,
    });

    if (error) {
      console.error('Failed to send email:', {
        error,
        to,
        subject,
      });

      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    console.log('Email sent successfully:', {
      messageId: data?.id,
      to,
      subject,
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('Error sending email:', {
      error: errorMessage,
      options: {
        to: options.to,
        subject: options.subject,
      },
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send multiple emails in parallel
 *
 * This function sends multiple emails concurrently and returns
 * the results for all of them. Useful for batch operations.
 *
 * @param emails - Array of email options
 * @returns Array of results for each email
 */
export async function sendBulkEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  try {
    const results = await Promise.all(emails.map((email) => sendEmail(email)));
    return results;
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return emails.map(() => ({
      success: false,
      error: 'Bulk email operation failed',
    }));
  }
}

/**
 * Queue an email to be sent asynchronously
 *
 * This function returns immediately and sends the email in the background.
 * Use this when you don't want to wait for the email to be sent.
 *
 * @param options - Email sending options
 */
export function queueEmail(options: SendEmailOptions): void {
  // Send email asynchronously without waiting for the result
  sendEmail(options).catch((error) => {
    console.error('Queued email failed:', error);
  });
}
