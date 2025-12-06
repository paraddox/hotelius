/**
 * Base Email Template
 *
 * This is the shared wrapper component for all email templates.
 * It provides consistent branding, styling, and structure across
 * all transactional emails.
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface BaseTemplateProps {
  children: React.ReactNode;
  previewText?: string;
  hotelLogo?: string;
  hotelName?: string;
}

export function BaseTemplate({
  children,
  previewText = 'Hotelius - Luxury Boutique Hotel Reservations',
  hotelLogo,
  hotelName,
}: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      {previewText && (
        <div
          style={{
            display: 'none',
            overflow: 'hidden',
            lineHeight: '1px',
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          {previewText}
        </div>
      )}
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header with branding */}
          <Section style={styles.header}>
            <Row>
              <Column align="center">
                {hotelLogo ? (
                  <Img
                    src={hotelLogo}
                    alt={hotelName || 'Hotel Logo'}
                    width="120"
                    height="40"
                    style={styles.logo}
                  />
                ) : (
                  <Text style={styles.logoText}>Hotelius</Text>
                )}
              </Column>
            </Row>
          </Section>

          {/* Main content */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Hr style={styles.divider} />

            <Row style={styles.footerRow}>
              <Column align="center">
                <Text style={styles.footerText}>
                  Hotelius - Luxury Boutique Hotel Reservations
                </Text>
                <Text style={styles.footerLinks}>
                  <Link href="https://hotelius.com" style={styles.link}>
                    Website
                  </Link>
                  {' • '}
                  <Link href="https://hotelius.com/help" style={styles.link}>
                    Help Center
                  </Link>
                  {' • '}
                  <Link href="https://hotelius.com/contact" style={styles.link}>
                    Contact Us
                  </Link>
                </Text>
                <Text style={styles.footerSmall}>
                  You received this email because you made a reservation through
                  Hotelius.
                </Text>
                <Text style={styles.footerSmall}>
                  © {new Date().getFullYear()} Hotelius. All rights reserved.
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Luxury boutique hotel styling with warm earth tones
const styles = {
  body: {
    backgroundColor: '#f8f6f3',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    maxWidth: '600px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#8b6f47',
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  logo: {
    display: 'block',
    margin: '0 auto',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '1px',
  },
  content: {
    padding: '40px 32px',
  },
  footer: {
    backgroundColor: '#f8f6f3',
    padding: '32px 24px',
  },
  divider: {
    borderColor: '#e5e0d8',
    margin: '0 0 24px 0',
  },
  footerRow: {
    paddingTop: '16px',
  },
  footerText: {
    color: '#6b5d4f',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 8px 0',
    textAlign: 'center' as const,
  },
  footerLinks: {
    color: '#6b5d4f',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
  link: {
    color: '#8b6f47',
    textDecoration: 'none',
  },
  footerSmall: {
    color: '#9b8b7b',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '4px 0',
    textAlign: 'center' as const,
  },
};

export default BaseTemplate;
