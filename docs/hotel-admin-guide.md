# Hotel Administrator Guide

Welcome to Hotelius, your comprehensive hotel management platform. This guide will help you navigate all the features and capabilities of the hotel administration dashboard.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Room Type Management](#room-type-management)
4. [Room Management](#room-management)
5. [Rate Plan Configuration](#rate-plan-configuration)
6. [Booking Management](#booking-management)
7. [Calendar & Tape Chart](#calendar--tape-chart)
8. [Settings Configuration](#settings-configuration)
9. [Payment Setup (Stripe Connect)](#payment-setup-stripe-connect)
10. [Reports & Analytics](#reports--analytics)

---

## Getting Started

### Accessing Your Dashboard

1. Navigate to your dashboard at `/dashboard`
2. Sign in with your hotel administrator credentials
3. You'll land on the main dashboard overview page

### User Roles

The system supports different user roles:
- **Hotel Owner**: Full access to all features and settings
- **Hotel Staff**: Access to bookings, room management, and daily operations
- **Guest**: Limited access to their own bookings only

---

## Dashboard Overview

The dashboard home page provides a quick snapshot of your hotel's performance.

### Key Metrics

The dashboard displays four primary metrics:

1. **Total Bookings**: The number of active bookings for your property
2. **Occupancy Rate**: Percentage of occupied rooms (calculated in real-time)
3. **Revenue (Month)**: Total revenue generated this month
4. **Avg. Daily Rate**: Average nightly rate across all bookings

### Recent Activity

- View your most recent bookings
- Quick access to booking details
- Status indicators for pending, confirmed, and checked-in guests

### Quick Actions

- Create new bookings
- View today's arrivals and departures
- Access calendar view
- Generate reports

---

## Room Type Management

Room types define the categories of accommodations you offer (e.g., Deluxe Suite, Standard Room, Presidential Suite).

### Viewing Room Types

Navigate to **Dashboard > Room Types** to see all your room type definitions.

### Creating a Room Type

1. Click **"Add Room Type"** button
2. Fill in the required information:
   - **Name**: The display name for this room type (supports multiple languages)
   - **Description**: Detailed description of the room type (multi-language support)
   - **Base Price**: Default nightly rate in cents (e.g., 15000 for $150.00)
   - **Occupancy**:
     - Maximum adults
     - Maximum children
   - **Amenities**: Select applicable amenities (WiFi, TV, Mini Bar, etc.)
3. Click **"Save"**

### Multi-Language Support

For name and description fields:
- Enter translations for each language your hotel supports
- The booking engine will display the appropriate language based on the guest's preference
- Minimum requirement: English translation

### Editing Room Types

1. Click on any room type from the list
2. Modify the fields as needed
3. Click **"Save Changes"**

### Best Practices

- Use clear, descriptive names
- Include high-quality photos (recommended: 1200x800px minimum)
- Highlight unique amenities in the description
- Set realistic occupancy limits
- Keep base prices aligned with your lowest season rates (use Rate Plans for seasonal pricing)

---

## Room Management

Rooms represent the actual physical units available for booking.

### Viewing Rooms

Navigate to **Dashboard > Rooms** to see all physical rooms in your property.

### Creating a Room

1. Click **"Add Room"** button
2. Fill in the details:
   - **Room Type**: Select the category this room belongs to
   - **Room Number**: Unique identifier (e.g., "101", "2A", "Hemingway Suite")
   - **Floor**: Optional floor number
   - **Status**:
     - Active: Available for booking
     - Maintenance: Temporarily unavailable
     - Inactive: Permanently removed from inventory
3. Click **"Save"**

### Room Status Management

You can change room status at any time:

- **Active**: The room appears in availability searches
- **Maintenance**: Blocks the room from new bookings while preserving existing reservations
- **Inactive**: Removes the room from all availability calculations

### Bulk Operations

For properties with many rooms:
1. You can create multiple rooms of the same type
2. Use sequential room numbers for efficiency
3. Filter by room type to manage related rooms together

---

## Rate Plan Configuration

Rate plans allow you to implement dynamic pricing based on dates, seasons, and demand.

### Understanding Rate Plans

- **Base Price**: Set on the Room Type (used when no rate plan applies)
- **Rate Plans**: Override the base price for specific date ranges
- **Priority System**: Multiple rate plans can overlap; the highest priority wins

### Viewing Rate Plans

Navigate to **Dashboard > Rates** to see all configured rate plans.

### Creating a Rate Plan

1. Click **"Add Rate Plan"** button
2. Configure the plan:
   - **Name**: Descriptive name (e.g., "Summer 2025", "Holiday Premium")
   - **Room Type**: Which room category this applies to
   - **Date Range**:
     - Start date (inclusive)
     - End date (exclusive)
   - **Price per Night**: Rate in cents (overrides base price)
   - **Priority**: Higher numbers take precedence (default: 0)
   - **Minimum Stay**: Optional minimum nights requirement
3. Click **"Save"**

### Priority System Example

```
Room Type: Deluxe Suite
Base Price: $150/night (Priority: implicit 0)

Rate Plan A: "Year-round Base"
- Dates: Jan 1, 2025 - Dec 31, 2025
- Price: $180/night
- Priority: 5

Rate Plan B: "Summer Peak"
- Dates: Jun 1, 2025 - Aug 31, 2025
- Price: $220/night
- Priority: 10

Rate Plan C: "4th of July Weekend"
- Dates: Jul 3, 2025 - Jul 6, 2025
- Price: $280/night
- Priority: 20

Result:
- Jan-May: $180 (Plan A wins)
- Jun-Aug (except Jul 3-6): $220 (Plan B wins)
- Jul 3-6: $280 (Plan C wins, highest priority)
- Sep-Dec: $180 (Plan A wins)
```

### Best Practices

- Start with a year-round base rate plan (Priority: 5)
- Layer seasonal pricing on top (Priority: 10)
- Use high-priority plans (20+) for special events
- Set minimum stay requirements for peak periods
- Review and update rates quarterly

### Editing Rate Plans

1. Click on any rate plan from the list
2. Modify dates, pricing, or priority
3. Changes apply immediately to new bookings
4. Existing bookings retain their original price

---

## Booking Management

Manage all reservations from the Bookings section.

### Viewing Bookings

Navigate to **Dashboard > Bookings** to see all reservations.

### Booking List Features

- **Filters**:
  - Status (Pending, Confirmed, Checked In, Checked Out, Cancelled)
  - Date range
  - Guest name search
  - Room number
- **Sorting**: Click column headers to sort
- **Pagination**: Navigate through large booking lists

### Booking Details

Click on any booking to view:

- **Guest Information**:
  - Name, email, phone
  - Special requests
  - Number of guests

- **Reservation Details**:
  - Check-in / Check-out dates
  - Room type and number
  - Number of nights
  - Total price breakdown

- **Payment Information**:
  - Payment status (Paid, Pending, Refunded)
  - Payment method
  - Transaction ID

- **Booking Status**:
  - Pending: Awaiting confirmation or payment
  - Confirmed: Reservation is guaranteed
  - Checked In: Guest has arrived
  - Checked Out: Stay completed
  - Cancelled: Reservation cancelled

### Updating Booking Status

1. Open the booking details
2. Click **"Update Status"**
3. Select new status from dropdown
4. Confirm the change

**Status Transitions**:
```
Pending → Confirmed → Checked In → Checked Out
   ↓
Cancelled (available from Pending or Confirmed)
```

### Manual Booking Creation

To create a booking on behalf of a guest:

1. Click **"New Booking"** button
2. Select dates and room type
3. Enter guest information
4. Choose payment method (Pay at Hotel / Pre-paid)
5. Confirm and save

### Cancellation Policy

When cancelling a booking:
1. Check your hotel's cancellation policy (Dashboard > Settings > Policies)
2. Determine if refund is applicable
3. Update booking status to "Cancelled"
4. Process refund if applicable (through Stripe Connect)

---

## Calendar & Tape Chart

The Calendar view provides a visual representation of all bookings across your property.

### Accessing the Calendar

Navigate to **Dashboard > Calendar** to open the tape chart.

### Understanding the Tape Chart

The tape chart displays:
- **Y-Axis (Rows)**: Individual rooms grouped by room type
- **X-Axis (Columns)**: Dates (configurable: 7, 14, or 30 days)
- **Colored Bars**: Bookings spanning multiple days

### Navigation Controls

- **Date Range**:
  - Previous/Next: Move backward/forward by the view period
  - Today: Jump to current date
  - This Month: View the entire current month

- **View Period**: Toggle between 7, 14, or 30-day views

- **Room Type Filter**: Show all rooms or filter by specific room type

### Booking Bars

Each booking appears as a colored bar:

- **Color Coding**:
  - Green: Confirmed booking
  - Blue: Checked-in (guest currently staying)
  - Orange: Pending (awaiting confirmation)
  - Gray: Checked-out (completed stay)
  - Red: Cancelled

- **Information Displayed**:
  - Guest name
  - Number of nights
  - Hover for detailed tooltip

### Statistics Bar

The calendar displays real-time metrics:
- Total Rooms
- Occupied Rooms
- Available Rooms
- Occupancy Rate (%)

### Calendar Interactions

- **Click on a Booking**: Opens booking detail modal
- **Click on Empty Cell**: Quick-create a new booking for that room and date
- **Horizontal Scroll**: View additional dates beyond the current view

### Use Cases

1. **Check-In Management**: Quickly see today's arrivals
2. **Housekeeping**: Identify checkout rooms for cleaning
3. **Overbooking Prevention**: Visual identification of availability gaps
4. **Revenue Optimization**: Spot empty rooms and adjust pricing

---

## Settings Configuration

Customize your hotel's operational settings.

### General Settings

**Dashboard > Settings > General**

- **Hotel Name**: Your property's official name
- **Description**: Multi-language property descriptions
- **Address**: Full physical address
- **Contact Information**: Phone and email
- **Currency**: Default currency (USD, EUR, GBP, etc.)
- **Timezone**: Local timezone for check-in/out times

### Branding Settings

**Dashboard > Settings > Branding**

- **Logo Upload**: Your hotel logo (recommended: PNG, 400x200px)
- **Cover Photo**: Hero image for booking engine
- **Brand Colors**: Primary and secondary colors for booking engine
- **Favicon**: Browser tab icon

### Policies Settings

**Dashboard > Settings > Policies**

- **Check-In Time**: Default check-in time (e.g., 3:00 PM)
- **Check-Out Time**: Default check-out time (e.g., 11:00 AM)
- **Cancellation Policy**: Free cancellation period (e.g., 24 hours before arrival)
- **Children Policy**: Age limits and pricing for children
- **Pet Policy**: Pet-friendly settings and fees
- **Smoking Policy**: Smoking allowed/prohibited

### Team Management

**Dashboard > Settings > Team**

Manage staff access:

1. **Add Team Member**:
   - Email address
   - Role (Owner, Staff)
   - Name
   - Send invitation

2. **Manage Existing Members**:
   - View all team members
   - Change roles
   - Revoke access

### Notification Settings

Configure email notifications for:
- New bookings
- Cancellations
- Payment received
- Pre-arrival reminders
- Post-departure follow-ups

---

## Payment Setup (Stripe Connect)

Stripe Connect enables you to receive payments directly from guests.

### Why Stripe Connect?

- **Secure Payment Processing**: Industry-leading security
- **Global Coverage**: Accept payments from guests worldwide
- **Direct Deposits**: Funds deposited to your bank account
- **Dashboard Integration**: Manage everything from one place

### Setting Up Stripe Connect

**Dashboard > Settings > Payments**

#### First-Time Setup

1. Click **"Connect Stripe Account"**
2. You'll be redirected to Stripe's onboarding
3. Provide required information:
   - Business type (Individual or Company)
   - Business details
   - Bank account information
   - Identity verification documents
4. Complete Stripe's verification process
5. Return to your Hotelius dashboard

#### Verification Timeline

- **Instant**: Most accounts activate immediately
- **Under Review**: Some accounts require 1-2 business days
- **Additional Information**: Stripe may request additional documents

### Account Status

Your payment settings page shows:

- **Connection Status**: Connected, Pending, Not Connected
- **Account Type**: Express Connected Account
- **Capabilities**:
  - Card payments
  - Transfers
- **Payouts**: Enabled/Disabled

### Managing Your Stripe Account

From the Payments settings page:

1. **View Balance**: See available and pending funds
2. **Payout Schedule**: Configure automatic payout frequency
3. **View Transactions**: Recent payment activity
4. **Stripe Dashboard**: Direct link to full Stripe dashboard

### Payment Flow

When a guest books:

1. Guest enters payment information
2. Payment is authorized (not charged)
3. Booking status changes to "Confirmed"
4. Funds are captured and transferred to your Stripe account
5. You receive an email notification
6. Funds appear in your Stripe balance
7. Automatic payout to your bank account (per your payout schedule)

### Platform Fees

Hotelius charges a small platform fee on each booking:
- **Application Fee**: 2% of booking value
- **Stripe Processing Fee**: ~2.9% + $0.30 (standard Stripe rates)

Example:
```
Booking Total: $200.00
Stripe Fee: $6.10
Platform Fee: $4.00
Your Net Revenue: $189.90
```

### Refunds

To process a refund:

1. Open the booking in Dashboard > Bookings
2. Click **"Refund"** button
3. Enter refund amount (partial or full)
4. Confirm refund
5. Funds are returned to guest's original payment method
6. Stripe fees are not refunded

### Troubleshooting

**Account Under Review**:
- Check email for requests from Stripe
- Provide requested documentation promptly
- Contact Stripe support if delayed beyond 48 hours

**Payments Not Showing**:
- Verify account is fully activated
- Check that capabilities are enabled
- Ensure proper webhook configuration

**Payout Delays**:
- First payout may take 7-14 days (standard Stripe verification)
- Subsequent payouts follow your configured schedule
- Check Stripe dashboard for payout status

### Support

For payment issues:
- **Stripe Support**: Available 24/7 via Stripe Dashboard
- **Hotelius Support**: Email support@hotelius.com
- **Help Documentation**: Dashboard > Help > Payments

---

## Reports & Analytics

Access business intelligence and performance metrics.

### Reports Overview

**Dashboard > Reports**

Available reports:
1. Occupancy Report
2. Revenue Report
3. Booking Source Report
4. Guest Demographics

### Occupancy Report

**Dashboard > Reports > Occupancy**

Metrics:
- Occupancy rate by day, week, month
- Available room nights
- Occupied room nights
- Revenue per available room (RevPAR)

Filters:
- Date range selector
- Room type filter
- Comparison with previous period

### Revenue Report

**Dashboard > Reports > Revenue**

Metrics:
- Total revenue by period
- Average daily rate (ADR)
- Revenue by room type
- Revenue trends (chart visualization)

Breakdown:
- Room revenue
- Service fees
- Taxes collected
- Net revenue

### Exporting Reports

1. Select desired date range
2. Apply filters
3. Click **"Export to CSV"**
4. Open in Excel or Google Sheets for further analysis

### Analytics Dashboard

**Dashboard > Analytics**

Real-time analytics:
- Booking conversion rate
- Average booking lead time
- Cancellation rate
- Guest retention rate
- Review score average

Charts and Visualizations:
- Revenue trend line
- Occupancy heat map
- Booking source pie chart
- Seasonal performance comparison

### Key Performance Indicators (KPIs)

Track these essential metrics:

1. **Occupancy Rate**:
   - Formula: (Occupied Room Nights / Available Room Nights) × 100
   - Target: 70-80% for healthy performance

2. **Average Daily Rate (ADR)**:
   - Formula: Total Room Revenue / Number of Rooms Sold
   - Monitor for pricing optimization

3. **Revenue Per Available Room (RevPAR)**:
   - Formula: Total Room Revenue / Total Available Rooms
   - Industry-standard profitability metric

4. **Booking Lead Time**:
   - Average days between booking and check-in
   - Helps with forecasting and marketing timing

5. **Cancellation Rate**:
   - Percentage of bookings cancelled
   - Monitor for policy adjustments

---

## Best Practices & Tips

### Daily Operations Checklist

**Morning**:
- [ ] Review today's arrivals in calendar
- [ ] Check new bookings from overnight
- [ ] Verify room status for check-ins
- [ ] Review housekeeping schedule

**Afternoon**:
- [ ] Process check-ins
- [ ] Update booking statuses
- [ ] Respond to guest inquiries

**Evening**:
- [ ] Review tomorrow's arrivals
- [ ] Check late bookings
- [ ] Prepare daily performance report

### Optimization Tips

1. **Dynamic Pricing**:
   - Review rate plans monthly
   - Adjust for local events and seasons
   - Monitor competitor pricing

2. **Inventory Management**:
   - Mark rooms under maintenance promptly
   - Keep room descriptions up to date
   - Refresh photos annually

3. **Guest Communication**:
   - Respond to special requests
   - Send pre-arrival information
   - Follow up post-stay for reviews

4. **Revenue Maximization**:
   - Use minimum stay requirements for peak periods
   - Create package deals for off-peak seasons
   - Offer early booking discounts

### Common Workflows

**Guest Checking In**:
1. Navigate to Dashboard > Calendar
2. Locate today's date
3. Find guest's booking (green bar)
4. Click booking to open details
5. Verify guest information
6. Click "Update Status" → "Checked In"
7. Guest receives confirmation email

**Processing a Walk-In**:
1. Dashboard > Bookings > New Booking
2. Select available room from calendar
3. Enter guest information
4. Choose "Pay at Hotel" payment method
5. Create booking
6. Immediately update status to "Checked In"

**Handling a Cancellation**:
1. Open booking details
2. Review cancellation policy
3. Click "Cancel Booking"
4. Process refund if applicable
5. Update booking status to "Cancelled"
6. Cancellation email sent automatically

---

## Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts:

- **Ctrl/Cmd + K**: Quick search (bookings, rooms, guests)
- **G then D**: Go to Dashboard
- **G then B**: Go to Bookings
- **G then C**: Go to Calendar
- **N**: New booking (from bookings page)
- **?**: Show all shortcuts

---

## Getting Help

### Support Resources

- **Help Center**: Dashboard > Help
- **Email Support**: support@hotelius.com
- **Live Chat**: Available Monday-Friday, 9 AM - 6 PM EST
- **Video Tutorials**: Dashboard > Help > Tutorials

### Feature Requests

We're constantly improving Hotelius. Submit feature requests:
1. Dashboard > Help > Feedback
2. Describe your requested feature
3. Explain use case
4. Our team reviews all submissions

### Emergency Support

For urgent issues affecting bookings or payments:
- **Emergency Hotline**: +1-800-HOTELIUS
- **Priority Support**: Available 24/7 for critical issues

---

## Appendix: Glossary

**ADR (Average Daily Rate)**: Total room revenue divided by number of rooms sold

**Booking Engine**: The public-facing interface where guests make reservations

**Exclusion Constraint**: Database rule preventing double-booking of rooms

**Occupancy Rate**: Percentage of rooms occupied over a period

**Rate Plan**: Pricing rule for specific dates and room types

**RevPAR (Revenue Per Available Room)**: Total room revenue divided by total available rooms

**Room Type**: Category or class of accommodation (e.g., Deluxe Suite)

**RLS (Row Level Security)**: Database security ensuring hotels only access their own data

**Soft Hold**: Temporary reservation during checkout process

**Tape Chart**: Visual calendar showing all bookings across all rooms

**Tenant**: A hotel property within the multi-tenant system

---

## Version History

- **v1.0** (December 2025): Initial release
  - Core booking management
  - Stripe Connect integration
  - Calendar tape chart
  - Multi-language support
  - Reports and analytics

---

For the latest updates and announcements, visit the [Hotelius Blog](https://hotelius.com/blog) or check the release notes in your dashboard.
