/**
 * Booking Confirmation Email Template
 *
 * Sent when a booking is successfully confirmed.
 * Includes all booking details, hotel information, and next steps.
 */

import {
  Text,
  Section,
  Row,
  Column,
  Img,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from './BaseTemplate';

export interface BookingConfirmationEmailProps {
  // Booking details
  bookingReference: string;
  confirmationNumber?: string;

  // Guest information
  guestName: string;
  guestEmail: string;

  // Stay details
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  roomType: string;
  roomDescription?: string;

  // Hotel information
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  hotelCountry: string;
  hotelPhone?: string;
  hotelEmail?: string;
  hotelLogo?: string;
  hotelImage?: string;
  checkInTime?: string;
  checkOutTime?: string;

  // Pricing
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  priceBreakdown?: Array<{
    description: string;
    amount: number;
  }>;

  // Policies
  cancellationPolicy?: string;
  specialRequests?: string;

  // Links
  viewBookingUrl?: string;
  manageBookingUrl?: string;

  // Localization
  locale?: string;
}

export function BookingConfirmationEmail({
  bookingReference,
  confirmationNumber,
  guestName,
  checkInDate,
  checkOutDate,
  numberOfNights,
  numberOfGuests,
  roomType,
  roomDescription,
  hotelName,
  hotelAddress,
  hotelCity,
  hotelCountry,
  hotelPhone,
  hotelEmail,
  hotelLogo,
  hotelImage,
  checkInTime = '3:00 PM',
  checkOutTime = '11:00 AM',
  subtotal,
  tax,
  total,
  currency,
  priceBreakdown,
  cancellationPolicy,
  specialRequests,
  viewBookingUrl,
  manageBookingUrl,
}: BookingConfirmationEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <BaseTemplate
      previewText={`Booking Confirmed - ${hotelName} - ${bookingReference}`}
      hotelLogo={hotelLogo}
      hotelName={hotelName}
    >
      {/* Success message */}
      <Section>
        <Row>
          <Column>
            <div style={styles.successBadge}>Booking Confirmed</div>
            <Text style={styles.heading}>
              Your Reservation is Confirmed, {guestName}!
            </Text>
            <Text style={styles.paragraph}>
              We're delighted to confirm your upcoming stay at {hotelName}. Your
              booking details are below.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Hotel image */}
      {hotelImage && (
        <Section style={styles.imageSection}>
          <Row>
            <Column>
              <Img
                src={hotelImage}
                alt={hotelName}
                width="536"
                style={styles.hotelImage}
              />
            </Column>
          </Row>
        </Section>
      )}

      {/* Booking reference */}
      <Section style={styles.referenceSection}>
        <Row>
          <Column>
            <Text style={styles.referenceLabel}>Booking Reference</Text>
            <Text style={styles.referenceNumber}>{bookingReference}</Text>
            {confirmationNumber && (
              <Text style={styles.subReference}>
                Confirmation: {confirmationNumber}
              </Text>
            )}
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Stay details */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Stay Details</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.value}>{checkInDate}</Text>
            <Text style={styles.subValue}>After {checkInTime}</Text>
          </Column>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.value}>{checkOutDate}</Text>
            <Text style={styles.subValue}>Before {checkOutTime}</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Length of Stay</Text>
            <Text style={styles.value}>
              {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}
            </Text>
          </Column>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Guests</Text>
            <Text style={styles.value}>
              {numberOfGuests} {numberOfGuests === 1 ? 'Guest' : 'Guests'}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Room details */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Room Details</Text>
            <Text style={styles.roomType}>{roomType}</Text>
            {roomDescription && (
              <Text style={styles.roomDescription}>{roomDescription}</Text>
            )}
          </Column>
        </Row>
      </Section>

      {/* Special requests */}
      {specialRequests && (
        <>
          <Hr style={styles.divider} />
          <Section>
            <Row>
              <Column>
                <Text style={styles.sectionHeading}>Special Requests</Text>
                <Text style={styles.paragraph}>{specialRequests}</Text>
                <Text style={styles.note}>
                  Note: Special requests are subject to availability and cannot
                  be guaranteed.
                </Text>
              </Column>
            </Row>
          </Section>
        </>
      )}

      <Hr style={styles.divider} />

      {/* Price breakdown */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Price Summary</Text>
          </Column>
        </Row>

        {priceBreakdown ? (
          priceBreakdown.map((item, index) => (
            <Row key={index} style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>{item.description}</Text>
              </Column>
              <Column align="right">
                <Text style={styles.priceAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </Column>
            </Row>
          ))
        ) : (
          <>
            <Row style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>
                  Room ({numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'})
                </Text>
              </Column>
              <Column align="right">
                <Text style={styles.priceAmount}>{formatCurrency(subtotal)}</Text>
              </Column>
            </Row>
            <Row style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>Taxes & Fees</Text>
              </Column>
              <Column align="right">
                <Text style={styles.priceAmount}>{formatCurrency(tax)}</Text>
              </Column>
            </Row>
          </>
        )}

        <Hr style={styles.thinDivider} />

        <Row style={styles.totalRow}>
          <Column>
            <Text style={styles.totalLabel}>Total Amount</Text>
          </Column>
          <Column align="right">
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Hotel contact information */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Hotel Information</Text>
            <Text style={styles.hotelName}>{hotelName}</Text>
            <Text style={styles.address}>
              {hotelAddress}
              <br />
              {hotelCity}, {hotelCountry}
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

      {/* Cancellation policy */}
      {cancellationPolicy && (
        <>
          <Hr style={styles.divider} />
          <Section>
            <Row>
              <Column>
                <Text style={styles.sectionHeading}>Cancellation Policy</Text>
                <Text style={styles.policy}>{cancellationPolicy}</Text>
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Call to action */}
      {(viewBookingUrl || manageBookingUrl) && (
        <Section style={styles.ctaSection}>
          <Row>
            <Column align="center">
              {viewBookingUrl && (
                <Link href={viewBookingUrl} style={styles.button}>
                  View Booking Details
                </Link>
              )}
              {manageBookingUrl && (
                <Text style={styles.linkText}>
                  <Link href={manageBookingUrl} style={styles.textLink}>
                    Manage Your Booking
                  </Link>
                </Text>
              )}
            </Column>
          </Row>
        </Section>
      )}

      {/* Additional info */}
      <Section style={styles.infoSection}>
        <Row>
          <Column>
            <Text style={styles.infoText}>
              We're looking forward to welcoming you! If you have any questions
              or need assistance, please don't hesitate to contact us.
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseTemplate>
  );
}

const styles = {
  successBadge: {
    display: 'inline-block',
    backgroundColor: '#4ade80',
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
  imageSection: {
    margin: '24px 0',
  },
  hotelImage: {
    width: '100%',
    borderRadius: '8px',
    display: 'block',
  },
  referenceSection: {
    backgroundColor: '#fef3e2',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  referenceLabel: {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  referenceNumber: {
    color: '#78350f',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '2px',
  },
  subReference: {
    color: '#92400e',
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
  detailRow: {
    marginBottom: '16px',
  },
  detailLabel: {
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
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
  },
  subValue: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '4px 0 0 0',
  },
  roomType: {
    color: '#8b6f47',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  roomDescription: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  },
  note: {
    color: '#9ca3af',
    fontSize: '12px',
    fontStyle: 'italic' as const,
    margin: '8px 0 0 0',
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
  totalRow: {
    marginTop: '8px',
  },
  totalLabel: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0',
  },
  totalAmount: {
    color: '#8b6f47',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  hotelName: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  address: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 12px 0',
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
  policy: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  },
  ctaSection: {
    margin: '32px 0',
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
  linkText: {
    margin: '16px 0 0 0',
  },
  textLink: {
    color: '#8b6f47',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  infoSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '6px',
    margin: '24px 0 0 0',
  },
  infoText: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
  },
};

export default BookingConfirmationEmail;
