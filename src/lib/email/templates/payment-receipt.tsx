/**
 * Payment Receipt Email Template
 *
 * Sent when a payment is successfully processed.
 * Includes transaction details, payment method, and booking summary.
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

export interface PaymentReceiptEmailProps {
  // Transaction details
  transactionId: string;
  paymentIntentId: string;
  transactionDate: string;

  // Guest information
  guestName: string;
  guestEmail: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  // Payment details
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank' | 'other';
  cardBrand?: string; // 'visa', 'mastercard', 'amex', etc.
  cardLast4?: string;
  paymentStatus: 'succeeded' | 'pending' | 'failed';

  // Booking details
  bookingReference: string;
  hotelName: string;
  hotelLogo?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;

  // Amount breakdown
  subtotal: number;
  tax: number;
  fees?: number;
  discount?: number;
  total: number;

  // Links
  viewBookingUrl?: string;
  downloadReceiptUrl?: string;

  // Tax information
  taxId?: string;
  businessName?: string;
}

export function PaymentReceiptEmail({
  transactionId,
  paymentIntentId,
  transactionDate,
  guestName,
  guestEmail,
  billingAddress,
  amount,
  currency,
  paymentMethod,
  cardBrand,
  cardLast4,
  paymentStatus,
  bookingReference,
  hotelName,
  hotelLogo,
  checkInDate,
  checkOutDate,
  roomType,
  subtotal,
  tax,
  fees,
  discount,
  total,
  viewBookingUrl,
  downloadReceiptUrl,
  taxId,
  businessName,
}: PaymentReceiptEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getCardBrandDisplay = () => {
    if (!cardBrand) return 'Card';
    return cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1);
  };

  const getPaymentMethodDisplay = () => {
    if (paymentMethod === 'card' && cardLast4) {
      return `${getCardBrandDisplay()} ending in ${cardLast4}`;
    }
    return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
  };

  return (
    <BaseTemplate
      previewText={`Payment Receipt - ${formatCurrency(amount)} - ${bookingReference}`}
      hotelLogo={hotelLogo}
      hotelName={hotelName}
    >
      {/* Success message */}
      <Section>
        <Row>
          <Column>
            <div style={styles.successBadge}>Payment Successful</div>
            <Text style={styles.heading}>Payment Receipt</Text>
            <Text style={styles.paragraph}>
              Thank you for your payment, {guestName}. Your transaction has been
              processed successfully.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Receipt number */}
      <Section style={styles.receiptSection}>
        <Row>
          <Column>
            <Text style={styles.receiptLabel}>Receipt Number</Text>
            <Text style={styles.receiptNumber}>{transactionId}</Text>
            <Text style={styles.receiptDate}>{transactionDate}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Transaction summary */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Transaction Summary</Text>
          </Column>
        </Row>

        <Row style={styles.summaryRow}>
          <Column>
            <div style={styles.amountLabel}>Amount Paid</div>
            <div style={styles.amountValue}>{formatCurrency(amount)}</div>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Payment Method</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{getPaymentMethodDisplay()}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Transaction ID</Text>
          </Column>
          <Column align="right">
            <Text style={styles.valueSmall}>{paymentIntentId}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Status</Text>
          </Column>
          <Column align="right">
            <Text style={styles.statusSuccess}>
              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Billing information */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Billing Information</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Name</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{guestName}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Email</Text>
          </Column>
          <Column align="right">
            <Text style={styles.value}>{guestEmail}</Text>
          </Column>
        </Row>

        {billingAddress && (
          <Row style={styles.detailRow}>
            <Column style={styles.detailLabel}>
              <Text style={styles.label}>Address</Text>
            </Column>
            <Column align="right">
              <Text style={styles.value}>
                {[
                  billingAddress.street,
                  billingAddress.city,
                  billingAddress.state,
                  billingAddress.zipCode,
                  billingAddress.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </Column>
          </Row>
        )}
      </Section>

      <Hr style={styles.divider} />

      {/* Booking details */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Booking Details</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>
            <Text style={styles.label}>Booking Reference</Text>
          </Column>
          <Column align="right">
            <Text style={styles.valueHighlight}>{bookingReference}</Text>
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

      {/* Price breakdown */}
      <Section>
        <Row>
          <Column>
            <Text style={styles.sectionHeading}>Payment Breakdown</Text>
          </Column>
        </Row>

        <Row style={styles.priceRow}>
          <Column>
            <Text style={styles.priceLabel}>Subtotal</Text>
          </Column>
          <Column align="right">
            <Text style={styles.priceAmount}>{formatCurrency(subtotal)}</Text>
          </Column>
        </Row>

        {discount && discount > 0 && (
          <Row style={styles.priceRow}>
            <Column>
              <Text style={styles.priceLabel}>Discount</Text>
            </Column>
            <Column align="right">
              <Text style={styles.discountAmount}>
                -{formatCurrency(discount)}
              </Text>
            </Column>
          </Row>
        )}

        <Row style={styles.priceRow}>
          <Column>
            <Text style={styles.priceLabel}>Taxes & Fees</Text>
          </Column>
          <Column align="right">
            <Text style={styles.priceAmount}>
              {formatCurrency(tax + (fees || 0))}
            </Text>
          </Column>
        </Row>

        <Hr style={styles.thinDivider} />

        <Row style={styles.totalRow}>
          <Column>
            <Text style={styles.totalLabel}>Total Paid</Text>
          </Column>
          <Column align="right">
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Tax information */}
      {(taxId || businessName) && (
        <>
          <Hr style={styles.divider} />
          <Section style={styles.taxSection}>
            <Row>
              <Column>
                <Text style={styles.taxHeading}>Tax Information</Text>
                {businessName && (
                  <Text style={styles.taxText}>Business: {businessName}</Text>
                )}
                {taxId && <Text style={styles.taxText}>Tax ID: {taxId}</Text>}
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Call to action */}
      {(viewBookingUrl || downloadReceiptUrl) && (
        <>
          <Hr style={styles.divider} />
          <Section style={styles.ctaSection}>
            <Row>
              <Column align="center">
                {viewBookingUrl && (
                  <Link href={viewBookingUrl} style={styles.button}>
                    View Booking Details
                  </Link>
                )}
                {downloadReceiptUrl && (
                  <Text style={styles.linkText}>
                    <Link href={downloadReceiptUrl} style={styles.textLink}>
                      Download PDF Receipt
                    </Link>
                  </Text>
                )}
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* Footer note */}
      <Section style={styles.noteSection}>
        <Row>
          <Column>
            <Text style={styles.noteText}>
              This is an official receipt for your transaction. Please keep this
              email for your records. If you have any questions about this
              payment, please contact our support team.
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
    backgroundColor: '#10b981',
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
  receiptSection: {
    backgroundColor: '#f0f9ff',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
    textAlign: 'center' as const,
    borderLeft: '4px solid #0ea5e9',
  },
  receiptLabel: {
    color: '#075985',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  receiptNumber: {
    color: '#0c4a6e',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '1px',
  },
  receiptDate: {
    color: '#075985',
    fontSize: '14px',
    margin: '0',
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
  summaryRow: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  amountLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  amountValue: {
    color: '#059669',
    fontSize: '36px',
    fontWeight: '700',
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
  valueSmall: {
    color: '#1f2937',
    fontSize: '12px',
    fontWeight: '400',
    margin: '0',
    fontFamily: 'monospace',
  },
  valueHighlight: {
    color: '#8b6f47',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  },
  statusSuccess: {
    color: '#059669',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
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
  discountAmount: {
    color: '#059669',
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
  taxSection: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
  },
  taxHeading: {
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  taxText: {
    color: '#6b7280',
    fontSize: '13px',
    margin: '4px 0',
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
  linkText: {
    margin: '16px 0 0 0',
  },
  textLink: {
    color: '#8b6f47',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  noteSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '6px',
    margin: '24px 0 0 0',
  },
  noteText: {
    color: '#4b5563',
    fontSize: '13px',
    lineHeight: '18px',
    textAlign: 'center' as const,
    margin: '0',
  },
};

export default PaymentReceiptEmail;
