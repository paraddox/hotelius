/**
 * Booking Reminder Email Template
 *
 * Sent 1 day before check-in to remind guests about their upcoming stay
 * and provide important arrival information.
 */

import {
  Text,
  Section,
  Row,
  Column,
  Hr,
  Link,
  Img,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

export interface BookingReminderEmailProps {
  // Booking details
  bookingReference: string;
  guestName: string;

  // Stay details
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  roomType: string;

  // Hotel information
  hotelName: string;
  hotelAddress: string;
  hotelCity: string;
  hotelCountry: string;
  hotelPhone?: string;
  hotelEmail?: string;
  hotelLogo?: string;
  hotelImage?: string;

  // Check-in details
  checkInTime: string;
  checkOutTime: string;
  checkInInstructions?: string;

  // Location
  mapUrl?: string;
  directionsUrl?: string;
  latitude?: number;
  longitude?: number;

  // Parking
  parkingInfo?: string;

  // Contact
  viewBookingUrl?: string;

  // Special notes
  specialRequests?: string;
}

export function BookingReminderEmail({
  bookingReference,
  guestName,
  checkInDate,
  checkOutDate,
  numberOfNights,
  numberOfGuests,
  roomType,
  hotelName,
  hotelAddress,
  hotelCity,
  hotelCountry,
  hotelPhone,
  hotelEmail,
  hotelLogo,
  hotelImage,
  checkInTime,
  checkOutTime,
  checkInInstructions,
  mapUrl,
  directionsUrl,
  parkingInfo,
  viewBookingUrl,
  specialRequests,
}: BookingReminderEmailProps) {
  return (
    <BaseLayout
      previewText={`Tomorrow: Your stay at ${hotelName} - ${bookingReference}`}
      hotelLogo={hotelLogo}
      hotelName={hotelName}
      showUnsubscribe={false}
    >
      {/* Reminder badge */}
      <Section>
        <Row>
          <Column>
            <div style={styles.reminderBadge}>Check-in Tomorrow</div>
            <Text style={styles.heading}>
              We're Looking Forward to Welcoming You, {guestName}!
            </Text>
            <Text style={styles.paragraph}>
              Your stay at {hotelName} begins tomorrow. Here's everything you
              need to know for a smooth arrival.
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
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Check-in information */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Check-in Information</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailColumn}>
            <Text style={styles.label}>Check-in Date & Time</Text>
            <Text style={styles.value}>{checkInDate}</Text>
            <Text style={styles.subValue}>From {checkInTime} onwards</Text>
          </Column>
          <Column style={styles.detailColumn}>
            <Text style={styles.label}>Check-out Time</Text>
            <Text style={styles.value}>{checkOutDate}</Text>
            <Text style={styles.subValue}>Before {checkOutTime}</Text>
          </Column>
        </Row>
      </Section>

      {/* Check-in instructions */}
      {checkInInstructions && (
        <>
          <Hr style={styles.divider} />
          <Section>
            <Row>
              <Column>
                <Text style={styles.sectionHeading}>
                  Arrival Instructions
                </Text>
                <div style={styles.instructionsBox}>
                  <Text style={styles.instructions}>{checkInInstructions}</Text>
                </div>
              </Column>
            </Row>
          </Section>
        </>
      )}

      <Hr style={styles.divider} />

      {/* Your reservation */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Your Reservation</Text>
          </Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailColumn}>
            <Text style={styles.label}>Room Type</Text>
            <Text style={styles.value}>{roomType}</Text>
          </Column>
          <Column style={styles.detailColumn}>
            <Text style={styles.label}>Guests</Text>
            <Text style={styles.value}>
              {numberOfGuests} {numberOfGuests === 1 ? 'Guest' : 'Guests'}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>
              {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}
            </Text>
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
                <Text style={styles.sectionHeading}>Your Special Requests</Text>
                <Text style={styles.paragraph}>{specialRequests}</Text>
                <Text style={styles.note}>
                  We've noted your requests and will do our best to accommodate
                  them, subject to availability.
                </Text>
              </Column>
            </Row>
          </Section>
        </>
      )}

      <Hr style={styles.divider} />

      {/* Hotel location & directions */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Location & Directions</Text>
            <Text style={styles.hotelName}>{hotelName}</Text>
            <Text style={styles.address}>
              {hotelAddress}
              <br />
              {hotelCity}, {hotelCountry}
            </Text>

            {directionsUrl && (
              <Link href={directionsUrl} style={styles.directionsButton}>
                Get Directions
              </Link>
            )}

            {mapUrl && (
              <div style={styles.mapContainer}>
                <Img
                  src={mapUrl}
                  alt="Hotel location map"
                  width="536"
                  style={styles.mapImage}
                />
              </div>
            )}
          </Column>
        </Row>
      </Section>

      {/* Parking information */}
      {parkingInfo && (
        <>
          <Hr style={styles.divider} />
          <Section>
            <Row>
              <Column>
                <Text style={styles.sectionHeading}>Parking Information</Text>
                <Text style={styles.paragraph}>{parkingInfo}</Text>
              </Column>
            </Row>
          </Section>
        </>
      )}

      <Hr style={styles.divider} />

      {/* Contact information */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Need Help?</Text>
            <Text style={styles.paragraph}>
              If you have any questions or need to make changes to your
              reservation, please don't hesitate to contact us.
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

      {/* Call to action */}
      {viewBookingUrl && (
        <Section style={styles.ctaSection}>
          <Row>
            <Column align="center">
              <Link href={viewBookingUrl} style={styles.button}>
                View Booking Details
              </Link>
            </Column>
          </Row>
        </Section>
      )}

      {/* Closing message */}
      <Section style={styles.infoSection}>
        <Row>
          <Column>
            <Text style={styles.infoText}>
              We can't wait to welcome you tomorrow! Have a safe journey and
              we'll see you soon.
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseLayout>
  );
}

const styles = {
  reminderBadge: {
    display: 'inline-block',
    backgroundColor: '#f59e0b',
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
    backgroundColor: '#fff7ed',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  referenceLabel: {
    color: '#9a3412',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  referenceNumber: {
    color: '#7c2d12',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '2px',
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
    marginBottom: '16px',
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
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
  },
  subValue: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '4px 0 0 0',
  },
  instructionsBox: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '8px',
    padding: '16px',
  },
  instructions: {
    color: '#166534',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
    whiteSpace: 'pre-line' as const,
  },
  note: {
    color: '#9ca3af',
    fontSize: '12px',
    fontStyle: 'italic' as const,
    margin: '8px 0 0 0',
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
    margin: '0 0 16px 0',
  },
  directionsButton: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  mapContainer: {
    marginTop: '16px',
  },
  mapImage: {
    width: '100%',
    borderRadius: '8px',
    display: 'block',
    border: '1px solid #e5e7eb',
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
    textAlign: 'center' as const,
  },
};

export default BookingReminderEmail;
