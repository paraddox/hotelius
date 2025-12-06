/**
 * Booking Cancellation Email Template
 *
 * Sent when a booking is cancelled by the guest or hotel.
 * Includes cancellation details and refund information.
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
import { BaseLayout } from './base-layout';

export interface BookingCancelledEmailProps {
  // Booking details
  bookingReference: string;
  guestName: string;

  // Stay details
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  hotelName: string;

  // Cancellation details
  cancellationDate: string;
  cancellationReason?: string;
  cancelledBy: 'guest' | 'hotel';

  // Refund information
  totalAmount: number;
  refundAmount: number;
  refundPercentage: number;
  currency: string;
  refundMethod?: string;
  refundProcessingDays?: number;

  // Hotel information
  hotelLogo?: string;
  hotelEmail?: string;
  hotelPhone?: string;

  // Links
  rebookUrl?: string;
  viewPolicyUrl?: string;
}

export function BookingCancelledEmail({
  bookingReference,
  guestName,
  checkInDate,
  checkOutDate,
  roomType,
  hotelName,
  cancellationDate,
  cancellationReason,
  cancelledBy,
  totalAmount,
  refundAmount,
  refundPercentage,
  currency,
  refundMethod = 'original payment method',
  refundProcessingDays = 7,
  hotelLogo,
  hotelEmail,
  hotelPhone,
  rebookUrl,
  viewPolicyUrl,
}: BookingCancelledEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const isFullRefund = refundPercentage === 100;
  const isPartialRefund = refundPercentage > 0 && refundPercentage < 100;
  const isNoRefund = refundPercentage === 0;

  return (
    <BaseLayout
      previewText={`Booking Cancelled - ${hotelName} - ${bookingReference}`}
      hotelLogo={hotelLogo}
      hotelName={hotelName}
      showUnsubscribe={false}
    >
      {/* Cancellation badge */}
      <Section>
        <Row>
          <Column>
            <div style={styles.cancelBadge}>Booking Cancelled</div>
            <Text style={styles.heading}>
              {cancelledBy === 'guest'
                ? 'Your Booking Has Been Cancelled'
                : 'Booking Cancellation Notice'}
            </Text>
            <Text style={styles.paragraph}>
              {cancelledBy === 'guest'
                ? `Hi ${guestName}, we've processed your cancellation request for your upcoming stay at ${hotelName}.`
                : `Hi ${guestName}, we regret to inform you that your booking at ${hotelName} has been cancelled.`}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Booking reference */}
      <Section style={styles.referenceSection}>
        <Row>
          <Column>
            <Text style={styles.referenceLabel}>Cancelled Booking</Text>
            <Text style={styles.referenceNumber}>{bookingReference}</Text>
            <Text style={styles.subReference}>
              Cancelled on {cancellationDate}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Cancellation reason */}
      {cancellationReason && (
        <>
          <Section>
            <Row>
              <Column>
                <Text style={styles.sectionHeading}>Cancellation Reason</Text>
                <div style={styles.reasonBox}>
                  <Text style={styles.reason}>{cancellationReason}</Text>
                </div>
              </Column>
            </Row>
          </Section>
          <Hr style={styles.divider} />
        </>
      )}

      {/* Cancelled booking details */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Cancelled Booking Details</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column>
            <Text style={styles.label}>Hotel</Text>
            <Text style={styles.value}>{hotelName}</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column>
            <Text style={styles.label}>Room Type</Text>
            <Text style={styles.value}>{roomType}</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailColumn}>
            <Text style={styles.label}>Check-in Date</Text>
            <Text style={styles.value}>{checkInDate}</Text>
          </Column>
          <Column style={styles.detailColumn}>
            <Text style={styles.label}>Check-out Date</Text>
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

        <div
          style={
            isFullRefund
              ? styles.refundBoxFull
              : isPartialRefund
              ? styles.refundBoxPartial
              : styles.refundBoxNone
          }
        >
          <Row style={styles.priceRow}>
            <Column>
              <Text style={styles.priceLabel}>Original Booking Amount</Text>
            </Column>
            <Column align="right">
              <Text style={styles.priceAmount}>
                {formatCurrency(totalAmount)}
              </Text>
            </Column>
          </Row>

          {!isNoRefund && (
            <>
              <Row style={styles.priceRow}>
                <Column>
                  <Text style={styles.priceLabel}>
                    Refund ({refundPercentage}%)
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={styles.priceAmount}>
                    {formatCurrency(refundAmount)}
                  </Text>
                </Column>
              </Row>

              {!isFullRefund && (
                <Row style={styles.priceRow}>
                  <Column>
                    <Text style={styles.priceLabel}>Cancellation Fee</Text>
                  </Column>
                  <Column align="right">
                    <Text style={styles.priceAmount}>
                      -{formatCurrency(totalAmount - refundAmount)}
                    </Text>
                  </Column>
                </Row>
              )}
            </>
          )}

          <Hr style={styles.thinDivider} />

          <Row>
            <Column>
              <Text style={styles.totalLabel}>Total Refund</Text>
            </Column>
            <Column align="right">
              <Text
                style={
                  isFullRefund
                    ? styles.totalAmountFull
                    : isPartialRefund
                    ? styles.totalAmountPartial
                    : styles.totalAmountNone
                }
              >
                {formatCurrency(refundAmount)}
              </Text>
            </Column>
          </Row>
        </div>

        {!isNoRefund && (
          <Text style={styles.refundNote}>
            {isFullRefund
              ? `You will receive a full refund of ${formatCurrency(
                  refundAmount
                )} to your ${refundMethod} within ${refundProcessingDays} business days.`
              : `You will receive a partial refund of ${formatCurrency(
                  refundAmount
                )} (${refundPercentage}% of the total) to your ${refundMethod} within ${refundProcessingDays} business days.`}
          </Text>
        )}

        {isNoRefund && (
          <Text style={styles.noRefundNote}>
            Unfortunately, according to our cancellation policy, this booking
            is non-refundable at this stage. No refund will be processed.
          </Text>
        )}
      </Section>

      {viewPolicyUrl && (
        <Section style={styles.policySection}>
          <Row>
            <Column align="center">
              <Link href={viewPolicyUrl} style={styles.policyLink}>
                View Cancellation Policy
              </Link>
            </Column>
          </Row>
        </Section>
      )}

      <Hr style={styles.divider} />

      {/* Contact information */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Questions or Concerns?</Text>
            <Text style={styles.paragraph}>
              If you have any questions about this cancellation or the refund
              process, please don't hesitate to contact us.
            </Text>
            {hotelPhone && (
              <Text style={styles.contact}>
                Phone:{' '}
                <Link href={`tel:${hotelPhone}`} style={styles.contactLink}>
                  {hotelPhone}
                </Link>
              </Text>
            )}
            {hotelEmail && (
              <Text style={styles.contact}>
                Email:{' '}
                <Link href={`mailto:${hotelEmail}`} style={styles.contactLink}>
                  {hotelEmail}
                </Link>
              </Text>
            )}
          </Column>
        </Row>
      </Section>

      {/* Rebook CTA */}
      {rebookUrl && cancelledBy === 'guest' && (
        <>
          <Hr style={styles.divider} />
          <Section style={styles.ctaSection}>
            <Row>
              <Column align="center">
                <Text style={styles.ctaHeading}>
                  Changed Your Mind? Book Again
                </Text>
                <Text style={styles.ctaText}>
                  We'd love to welcome you another time. Check our availability
                  and make a new reservation.
                </Text>
                <Link href={rebookUrl} style={styles.button}>
                  Book Another Stay
                </Link>
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Closing message */}
      <Section style={styles.infoSection}>
        <Row>
          <Column>
            <Text style={styles.infoText}>
              {cancelledBy === 'guest'
                ? "We're sorry to see this booking cancelled and hope to welcome you in the future."
                : 'We sincerely apologize for any inconvenience this may have caused. We hope to serve you in the future.'}
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  cancelBadge: {
    display: 'inline-block',
    backgroundColor: '#dc2626',
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
  referenceSection: {
    backgroundColor: '#fef2f2',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  referenceLabel: {
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  referenceNumber: {
    color: '#7f1d1d',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '2px',
  },
  subReference: {
    color: '#991b1b',
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '32px 0',
  },
  thinDivider: {
    borderColor: '#e5e7eb',
    margin: '16px 0',
  },
  sectionHeading: {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 16px 0',
  },
  reasonBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    padding: '16px',
  },
  reason: {
    color: '#78350f',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  },
  detailRow: {
    marginBottom: '12px',
  },
  detailColumn: {
    padding: '0 16px 0 0',
  },
  label: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  value: {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
  },
  refundBoxFull: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
  },
  refundBoxPartial: {
    backgroundColor: '#fffbeb',
    border: '2px solid #fcd34d',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
  },
  refundBoxNone: {
    backgroundColor: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
  },
  priceRow: {
    marginBottom: '12px',
  },
  priceLabel: {
    color: '#4b5563',
    fontSize: '14px',
    margin: '0',
  },
  priceAmount: {
    color: '#4b5563',
    fontSize: '14px',
    margin: '0',
  },
  totalLabel: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0',
  },
  totalAmountFull: {
    color: '#16a34a',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  totalAmountPartial: {
    color: '#f59e0b',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  totalAmountNone: {
    color: '#dc2626',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  refundNote: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '12px',
    color: '#166534',
    fontSize: '13px',
    lineHeight: '18px',
    margin: '16px 0 0 0',
  },
  noRefundNote: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    color: '#991b1b',
    fontSize: '13px',
    lineHeight: '18px',
    margin: '16px 0 0 0',
  },
  policySection: {
    marginTop: '16px',
  },
  policyLink: {
    color: '#8b6f47',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  contact: {
    color: '#4b5563',
    fontSize: '14px',
    margin: '4px 0',
  },
  contactLink: {
    color: '#8b6f47',
    textDecoration: 'none',
  },
  ctaSection: {
    backgroundColor: '#f9fafb',
    padding: '32px 24px',
    borderRadius: '8px',
  },
  ctaHeading: {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    textAlign: 'center' as const,
  },
  ctaText: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 20px 0',
    textAlign: 'center' as const,
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
  infoSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '6px',
    margin: '0',
  },
  infoText: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
    textAlign: 'center' as const,
  },
};

export default BookingCancelledEmail;
