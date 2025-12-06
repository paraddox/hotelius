/**
 * Booking Cancellation Email Template
 *
 * Sent when a booking is cancelled by the guest or hotel.
 * Includes cancellation details, refund information, and rebooking options.
 */

import {
  Text,
  Section,
  Row,
  Column,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from './BaseTemplate';

export interface BookingCancellationEmailProps {
  // Booking details
  bookingReference: string;
  cancellationReference?: string;

  // Guest information
  guestName: string;

  // Stay details
  checkInDate: string;
  checkOutDate: string;
  roomType: string;

  // Hotel information
  hotelName: string;
  hotelLogo?: string;

  // Cancellation details
  cancellationDate: string;
  cancelledBy: 'guest' | 'hotel';
  cancellationReason?: string;

  // Refund information
  originalAmount: number;
  refundAmount: number;
  refundPercentage?: number;
  refundMethod?: string;
  refundProcessingDays?: number;
  currency: string;

  // Links
  rebookingUrl?: string;
  contactSupportUrl?: string;

  // Additional info
  showRebookingCta?: boolean;
  customMessage?: string;
}

export function BookingCancellationEmail({
  bookingReference,
  cancellationReference,
  guestName,
  checkInDate,
  checkOutDate,
  roomType,
  hotelName,
  hotelLogo,
  cancellationDate,
  cancelledBy,
  cancellationReason,
  originalAmount,
  refundAmount,
  refundPercentage,
  refundMethod = 'original payment method',
  refundProcessingDays = 5-7,
  currency,
  rebookingUrl,
  contactSupportUrl,
  showRebookingCta = true,
  customMessage,
}: BookingCancellationEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const hasRefund = refundAmount > 0;
  const isPartialRefund = hasRefund && refundAmount < originalAmount;

  return (
    <BaseTemplate
      previewText={`Booking Cancelled - ${bookingReference}`}
      hotelLogo={hotelLogo}
      hotelName={hotelName}
    >
      {/* Cancellation notice */}
      <Section>
        <Row>
          <Column>
            <div style={styles.cancelledBadge}>Booking Cancelled</div>
            <Text style={styles.heading}>
              Your Booking Has Been Cancelled
            </Text>
            <Text style={styles.paragraph}>
              Dear {guestName}, we're writing to confirm that your reservation at{' '}
              {hotelName} has been cancelled.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Custom message from hotel */}
      {customMessage && (
        <Section style={styles.messageBox}>
          <Row>
            <Column>
              <Text style={styles.messageText}>{customMessage}</Text>
            </Column>
          </Row>
        </Section>
      )}

      {/* Cancellation details */}
      <Section style={styles.detailsSection}>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Cancellation Details</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Original Booking Reference</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{bookingReference}</Text>
          </Column>
        </Row>
        {cancellationReference && (
          <Row style={styles.detailRow}>
            <Column style={styles.detailLabel}>
              <Text style={styles.label}>Cancellation Reference</Text>
            </Column>
            <Column align="right">
              <Text style={styles.value}>{cancellationReference}</Text>
            </Column>
          </Row>
        )}
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Cancellation Date</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{cancellationDate}</Text>
          </Column>
        </Row>
        {cancellationReason && (
          <Row style={styles.detailRow}>
            <Column style={styles.detailLabel}>
              <Text style={styles.label}>Reason</Text>
            </Column>
            <Column align="right">
              <Text style={styles.value}>{cancellationReason}</Text>
            </Column>
          </Row>
        )}
      </Section>

      <Hr style={styles.divider} />

      {/* Original booking details */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Original Booking</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Hotel</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{hotelName}</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Room Type</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{roomType}</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Check-in</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{checkInDate}</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Check-out</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{checkOutDate}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Refund information */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Refund Information</Text>
          </Column>
        </Row>

        <Row style={styles.refundRow}>
          <Column>
            <Text style={styles.refundLabel}>Original Amount</Text>
          </Column>
          <Column align="right">
            <Text style={styles.refundAmount}>
              {formatCurrency(originalAmount)}
            </Text>
          </Column>
        </Row>

        {hasRefund ? (
          <>
            <Row style={styles.refundRow}>
              <Column>
                <Text style={styles.refundLabel}>
                  Refund Amount
                  {refundPercentage && ` (${refundPercentage}%)`}
                </Text>
              </Column>
              <Column align="right">
                <Text style={styles.refundAmountSuccess}>
                  {formatCurrency(refundAmount)}
                </Text>
              </Column>
            </Row>

            {isPartialRefund && (
              <Row style={styles.refundRow}>
                <Column>
                  <Text style={styles.refundLabel}>Cancellation Fee</Text>
                </Column>
                <Column align="right">
                  <Text style={styles.refundAmount}>
                    {formatCurrency(originalAmount - refundAmount)}
                  </Text>
                </Column>
              </Row>
            )}

            <Section style={styles.refundInfoBox}>
              <Row>
                <Column>
                  <Text style={styles.refundInfoText}>
                    Your refund of {formatCurrency(refundAmount)} will be
                    processed to your {refundMethod} within {refundProcessingDays}{' '}
                    business days.
                  </Text>
                </Column>
              </Row>
            </Section>
          </>
        ) : (
          <Section style={styles.noRefundBox}>
            <Row>
              <Column>
                <Text style={styles.noRefundText}>
                  Unfortunately, this booking is non-refundable according to the
                  cancellation policy that was accepted at the time of booking.
                </Text>
              </Column>
            </Row>
          </Section>
        )}
      </Section>

      {/* Rebooking CTA */}
      {showRebookingCta && rebookingUrl && (
        <>
          <Hr style={styles.divider} />
          <Section>
            <Row>
              <Column>
                <Text style={styles.sectionHeading}>
                  Ready to Plan Your Next Stay?
                </Text>
                <Text style={styles.paragraph}>
                  We'd love to welcome you in the future. Browse our available
                  dates and find the perfect time for your visit.
                </Text>
              </Column>
            </Row>
            <Row>
              <Column align="center" style={styles.ctaSection}>
                <Link href={rebookingUrl} style={styles.button}>
                  Book Another Stay
                </Link>
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Support contact */}
      {contactSupportUrl && (
        <>
          <Hr style={styles.divider} />
          <Section style={styles.supportSection}>
            <Row>
              <Column>
                <Text style={styles.supportHeading}>Need Help?</Text>
                <Text style={styles.supportText}>
                  If you have any questions about this cancellation or your
                  refund, our support team is here to help.
                </Text>
                <Text style={styles.supportLink}>
                  <Link href={contactSupportUrl} style={styles.link}>
                    Contact Support
                  </Link>
                </Text>
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Closing message */}
      <Section style={styles.closingSection}>
        <Row>
          <Column>
            <Text style={styles.closingText}>
              We're sorry your plans changed and hope to host you in the future.
              Thank you for choosing {hotelName}.
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseTemplate>
  );
}

const styles = {
  cancelledBadge: {
    display: 'inline-block',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '16px',
  },
  heading: {
    color: '#1f2937',
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0 0 16px 0',
  },
  paragraph: {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  messageBox: {
    backgroundColor: '#fef3c7',
    padding: '20px',
    borderRadius: '6px',
    borderLeft: '4px solid #f59e0b',
    margin: '24px 0',
  },
  messageText: {
    color: '#92400e',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0',
  },
  detailsSection: {
    margin: '24px 0',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '32px 0',
  },
  sectionHeading: {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 16px 0',
  },
  detailRow: {
    marginBottom: '12px',
  },
  detailLabel: {
    padding: '0',
  },
  label: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0',
  },
  value: {
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0',
  },
  refundRow: {
    marginBottom: '12px',
  },
  refundLabel: {
    color: '#4b5563',
    fontSize: '15px',
    margin: '0',
  },
  refundAmount: {
    color: '#4b5563',
    fontSize: '15px',
    fontWeight: '500',
    margin: '0',
  },
  refundAmountSuccess: {
    color: '#059669',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0',
  },
  refundInfoBox: {
    backgroundColor: '#f0fdf4',
    padding: '16px',
    borderRadius: '6px',
    marginTop: '16px',
  },
  refundInfoText: {
    color: '#065f46',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  },
  noRefundBox: {
    backgroundColor: '#fef2f2',
    padding: '16px',
    borderRadius: '6px',
    marginTop: '16px',
  },
  noRefundText: {
    color: '#991b1b',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  },
  ctaSection: {
    margin: '24px 0',
  },
  button: {
    backgroundColor: '#8b6f47',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-block',
  },
  supportSection: {
    textAlign: 'center' as const,
  },
  supportHeading: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  supportText: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 12px 0',
  },
  supportLink: {
    margin: '0',
  },
  link: {
    color: '#8b6f47',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  closingSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '6px',
    margin: '24px 0 0 0',
  },
  closingText: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center' as const,
    margin: '0',
  },
};

export default BookingCancellationEmail;
