/**
 * Welcome Hotel Email Template
 *
 * Sent when a new hotel is registered on the platform.
 * Includes getting started information, next steps, and support resources.
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

export interface WelcomeHotelEmailProps {
  // Hotel information
  hotelName: string;
  hotelId: string;
  ownerName: string;
  ownerEmail: string;

  // Account details
  setupCompleted?: boolean;
  accountStatus?: 'pending' | 'active' | 'review';

  // Links
  dashboardUrl: string;
  setupGuideUrl?: string;
  brandingSettingsUrl?: string;
  roomSetupUrl?: string;
  pricingSetupUrl?: string;
  helpCenterUrl?: string;

  // Support
  supportEmail?: string;
  onboardingCallUrl?: string;
}

export function WelcomeHotelEmail({
  hotelName,
  hotelId,
  ownerName,
  ownerEmail,
  setupCompleted = false,
  accountStatus = 'pending',
  dashboardUrl,
  setupGuideUrl,
  brandingSettingsUrl,
  roomSetupUrl,
  pricingSetupUrl,
  helpCenterUrl,
  supportEmail = 'support@hotelius.com',
  onboardingCallUrl,
}: WelcomeHotelEmailProps) {
  return (
    <BaseTemplate previewText={`Welcome to Hotelius, ${hotelName}!`}>
      {/* Welcome message */}
      <Section>
        <Row>
          <Column>
            <div style={styles.welcomeBadge}>Welcome to Hotelius</div>
            <Text style={styles.heading}>
              Welcome to the Platform, {ownerName}!
            </Text>
            <Text style={styles.paragraph}>
              Congratulations on joining Hotelius! We're thrilled to have{' '}
              {hotelName} as part of our luxury boutique hotel network. You're
              now ready to start accepting bookings and growing your business.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Account details */}
      <Section style={styles.accountSection}>
        <Row>
          <Column>
            <Text style={styles.accountHeading}>Your Account Details</Text>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>
                <Text style={styles.label}>Hotel Name</Text>
              </Column>
              <Column align="right">
                <Text style={styles.value}>{hotelName}</Text>
              </Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>
                <Text style={styles.label}>Hotel ID</Text>
              </Column>
              <Column align="right">
                <Text style={styles.valueCode}>{hotelId}</Text>
              </Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>
                <Text style={styles.label}>Account Email</Text>
              </Column>
              <Column align="right">
                <Text style={styles.value}>{ownerEmail}</Text>
              </Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>
                <Text style={styles.label}>Status</Text>
              </Column>
              <Column align="right">
                {accountStatus === 'active' ? (
                  <Text style={styles.statusActive}>Active</Text>
                ) : accountStatus === 'review' ? (
                  <Text style={styles.statusReview}>Under Review</Text>
                ) : (
                  <Text style={styles.statusPending}>Setup Pending</Text>
                )}
              </Column>
            </Row>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Getting started steps */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>
              {setupCompleted ? 'Next Steps' : 'Getting Started'}
            </Text>
            <Text style={styles.paragraph}>
              {setupCompleted
                ? "You're all set up! Here's what you can do next to maximize your presence:"
                : 'Follow these steps to complete your hotel setup and start accepting bookings:'}
            </Text>
          </Column>
        </Row>

        {/* Step 1: Brand Customization */}
        <Section style={styles.stepSection}>
          <Row>
            <Column style={styles.stepNumber}>
              <div style={styles.stepBadge}>1</div>
            </Column>
            <Column style={styles.stepContent}>
              <Text style={styles.stepTitle}>Customize Your Branding</Text>
              <Text style={styles.stepDescription}>
                Upload your hotel logo, photos, and set your brand colors to
                create a beautiful booking experience that reflects your unique
                identity.
              </Text>
              {brandingSettingsUrl && (
                <Link href={brandingSettingsUrl} style={styles.stepLink}>
                  Set Up Branding →
                </Link>
              )}
            </Column>
          </Row>
        </Section>

        {/* Step 2: Room Setup */}
        <Section style={styles.stepSection}>
          <Row>
            <Column style={styles.stepNumber}>
              <div style={styles.stepBadge}>2</div>
            </Column>
            <Column style={styles.stepContent}>
              <Text style={styles.stepTitle}>Add Your Rooms</Text>
              <Text style={styles.stepDescription}>
                Create room types, add detailed descriptions, upload stunning
                photos, and specify amenities to showcase what makes your rooms
                special.
              </Text>
              {roomSetupUrl && (
                <Link href={roomSetupUrl} style={styles.stepLink}>
                  Add Rooms →
                </Link>
              )}
            </Column>
          </Row>
        </Section>

        {/* Step 3: Pricing */}
        <Section style={styles.stepSection}>
          <Row>
            <Column style={styles.stepNumber}>
              <div style={styles.stepBadge}>3</div>
            </Column>
            <Column style={styles.stepContent}>
              <Text style={styles.stepTitle}>Configure Pricing</Text>
              <Text style={styles.stepDescription}>
                Set your base rates, seasonal pricing, special offers, and
                cancellation policies. Our dynamic pricing tools help you
                maximize revenue.
              </Text>
              {pricingSetupUrl && (
                <Link href={pricingSetupUrl} style={styles.stepLink}>
                  Set Pricing →
                </Link>
              )}
            </Column>
          </Row>
        </Section>

        {/* Step 4: Go Live */}
        <Section style={styles.stepSection}>
          <Row>
            <Column style={styles.stepNumber}>
              <div style={styles.stepBadge}>4</div>
            </Column>
            <Column style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start Accepting Bookings</Text>
              <Text style={styles.stepDescription}>
                Once your setup is complete, your hotel will be live and ready to
                accept reservations. Monitor bookings and manage your property
                from your dashboard.
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Hr style={styles.divider} />

      {/* Quick links */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Helpful Resources</Text>
          </Column>
        </Row>

        <Section style={styles.resourcesGrid}>
          <Row>
            <Column style={styles.resourceItem}>
              <Text style={styles.resourceTitle}>Dashboard</Text>
              <Text style={styles.resourceDescription}>
                Manage bookings, view analytics, and update your property
              </Text>
              <Link href={dashboardUrl} style={styles.resourceLink}>
                Open Dashboard
              </Link>
            </Column>

            {setupGuideUrl && (
              <Column style={styles.resourceItem}>
                <Text style={styles.resourceTitle}>Setup Guide</Text>
                <Text style={styles.resourceDescription}>
                  Step-by-step instructions to optimize your listing
                </Text>
                <Link href={setupGuideUrl} style={styles.resourceLink}>
                  View Guide
                </Link>
              </Column>
            )}
          </Row>

          <Row>
            {helpCenterUrl && (
              <Column style={styles.resourceItem}>
                <Text style={styles.resourceTitle}>Help Center</Text>
                <Text style={styles.resourceDescription}>
                  Browse FAQs and tutorials for common questions
                </Text>
                <Link href={helpCenterUrl} style={styles.resourceLink}>
                  Get Help
                </Link>
              </Column>
            )}

            {onboardingCallUrl && (
              <Column style={styles.resourceItem}>
                <Text style={styles.resourceTitle}>Book a Call</Text>
                <Text style={styles.resourceDescription}>
                  Schedule a personalized onboarding session with our team
                </Text>
                <Link href={onboardingCallUrl} style={styles.resourceLink}>
                  Schedule Call
                </Link>
              </Column>
            )}
          </Row>
        </Section>
      </Section>

      <Hr style={styles.divider} />

      {/* Support section */}
      <Section style={styles.supportSection}>
        <Row>
          <Column align="center">
            <Text style={styles.supportHeading}>
              Need Help Getting Started?
            </Text>
            <Text style={styles.supportText}>
              Our dedicated support team is here to help you every step of the
              way. Whether you have questions about setup, pricing, or platform
              features, we're just an email away.
            </Text>
            <Text style={styles.supportContact}>
              <Link href={`mailto:${supportEmail}`} style={styles.supportLink}>
                {supportEmail}
              </Link>
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA */}
      <Section style={styles.ctaSection}>
        <Row>
          <Column align="center">
            <Link href={dashboardUrl} style={styles.ctaButton}>
              Go to Your Dashboard
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Closing message */}
      <Section style={styles.closingSection}>
        <Row>
          <Column>
            <Text style={styles.closingText}>
              Thank you for choosing Hotelius. We're excited to help you grow
              your hotel business and deliver exceptional experiences to your
              guests!
            </Text>
            <Text style={styles.closingSignature}>
              <strong>The Hotelius Team</strong>
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseTemplate>
  );
}

const styles = {
  welcomeBadge: {
    display: 'inline-block',
    backgroundColor: '#8b6f47',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '16px',
  },
  heading: {
    color: '#1f2937',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '36px',
    margin: '0 0 16px 0',
  },
  paragraph: {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  accountSection: {
    backgroundColor: '#f8f6f3',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
  },
  accountHeading: {
    color: '#1f2937',
    fontSize: '18px',
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
  valueCode: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '400',
    margin: '0',
    fontFamily: 'monospace',
  },
  statusActive: {
    color: '#059669',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  },
  statusReview: {
    color: '#f59e0b',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  },
  statusPending: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '32px 0',
  },
  sectionHeading: {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 16px 0',
  },
  stepSection: {
    marginBottom: '24px',
  },
  stepNumber: {
    width: '40px',
    paddingRight: '16px',
    verticalAlign: 'top' as const,
  },
  stepBadge: {
    width: '40px',
    height: '40px',
    backgroundColor: '#8b6f47',
    color: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
  },
  stepContent: {
    paddingLeft: '0',
  },
  stepTitle: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  stepDescription: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 12px 0',
  },
  stepLink: {
    color: '#8b6f47',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  resourcesGrid: {
    margin: '16px 0',
  },
  resourceItem: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  resourceTitle: {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  resourceDescription: {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 12px 0',
  },
  resourceLink: {
    color: '#8b6f47',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  supportSection: {
    backgroundColor: '#fef3e2',
    padding: '32px 24px',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  supportHeading: {
    color: '#78350f',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },
  supportText: {
    color: '#92400e',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0 0 16px 0',
  },
  supportContact: {
    margin: '0',
  },
  supportLink: {
    color: '#8b6f47',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  ctaSection: {
    margin: '32px 0',
  },
  ctaButton: {
    backgroundColor: '#8b6f47',
    color: '#ffffff',
    padding: '16px 40px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-block',
  },
  closingSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
    marginTop: '24px',
  },
  closingText: {
    color: '#4b5563',
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0 0 16px 0',
  },
  closingSignature: {
    color: '#1f2937',
    fontSize: '15px',
    margin: '0',
  },
};

export default WelcomeHotelEmail;
