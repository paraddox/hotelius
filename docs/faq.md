# Frequently Asked Questions (FAQ)

## Table of Contents

1. [General Questions](#general-questions)
2. [Getting Started](#getting-started)
3. [Bookings & Reservations](#bookings--reservations)
4. [Payments & Billing](#payments--billing)
5. [Room Management](#room-management)
6. [Pricing & Rate Plans](#pricing--rate-plans)
7. [Technical Questions](#technical-questions)
8. [Account & Security](#account--security)
9. [Troubleshooting](#troubleshooting)

---

## General Questions

### What is Hotelius?

Hotelius is a comprehensive hotel management platform (SaaS) designed for small to medium-sized independent hotels. It provides all the tools you need to manage reservations, rooms, pricing, payments, and guest communications from a single dashboard.

### Who is Hotelius for?

Hotelius is perfect for:
- Independent hotels and boutique properties
- Bed & breakfasts
- Guesthouses and inns
- Small hotel chains (2-10 properties)
- Vacation rental managers

### What features does Hotelius include?

Core features include:
- **Booking Engine**: Guest-facing reservation system
- **Dashboard**: Centralized management interface
- **Calendar/Tape Chart**: Visual booking overview
- **Dynamic Pricing**: Seasonal and demand-based rates
- **Payment Processing**: Integrated Stripe Connect
- **Multi-language Support**: Serve international guests
- **Email Notifications**: Automated guest communications
- **Reports & Analytics**: Business intelligence tools
- **Team Management**: Multi-user access with roles

### How much does Hotelius cost?

Pricing plans:
- **Starter**: $49/month - Up to 10 rooms
- **Professional**: $99/month - Up to 30 rooms
- **Premium**: $199/month - Unlimited rooms

All plans include:
- Unlimited bookings
- Stripe payment processing
- Email support
- Multi-language support
- Standard reports

**Transaction Fees**: 2% platform fee on each booking (waived on Premium plan)

### Is there a free trial?

Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.

### Can I cancel my subscription anytime?

Yes, you can cancel your subscription at any time from Dashboard > Settings > Billing. Your service will continue until the end of your current billing period.

---

## Getting Started

### How do I set up my hotel?

1. **Sign Up**: Create your account at hotelius.com/signup
2. **Basic Information**: Enter your hotel name, address, and contact details
3. **Room Types**: Define your room categories (Deluxe, Standard, etc.)
4. **Add Rooms**: Create physical room inventory
5. **Set Pricing**: Configure base rates and seasonal pricing
6. **Payment Setup**: Connect your Stripe account
7. **Go Live**: Start accepting bookings!

### How long does setup take?

Most hotels complete initial setup in 30-60 minutes. You can start accepting bookings immediately after connecting your payment account.

### Do I need technical knowledge to use Hotelius?

No! Hotelius is designed to be user-friendly and intuitive. If you can use email or social media, you can use Hotelius. We also provide:
- Video tutorials
- Step-by-step guides
- Live chat support
- Onboarding assistance

### Can I import data from my old system?

Yes, we can help you import:
- Room inventory
- Guest data (with consent)
- Historical bookings
- Rate plans

Contact support@hotelius.com to schedule a data import.

### How do I add my hotel staff?

1. Go to **Dashboard > Settings > Team**
2. Click **"Invite Team Member"**
3. Enter their email address
4. Select their role (Owner or Staff)
5. They'll receive an invitation email

---

## Bookings & Reservations

### How do guests make bookings?

Guests can book through:
1. **Your Booking Engine**: Hosted at your custom URL
2. **Direct Integration**: Embedded on your website
3. **Manual Entry**: You create bookings on their behalf

### Can guests modify their bookings?

Currently, booking modifications must be processed by hotel staff through the dashboard. Guest self-service modifications are coming in a future update.

### How do I handle cancellations?

1. Open the booking in **Dashboard > Bookings**
2. Click **"Cancel Booking"**
3. Review your cancellation policy
4. Process refund if applicable (automatic via Stripe)
5. Guest receives cancellation confirmation email

### What happens if I get double-booked?

Hotelius uses database-level exclusion constraints to prevent double bookings. It's technically impossible for two confirmed bookings to overlap for the same room. If you see a conflict, it may be:
- A pending booking (not yet confirmed)
- Two different rooms of the same type

### Can I create bookings for walk-in guests?

Yes! Use the "New Booking" button in Dashboard > Bookings or click directly on the calendar to create an immediate reservation.

### How do I handle group bookings?

For group bookings spanning multiple rooms:
1. Create individual bookings for each room
2. Add a note/reference linking them (e.g., "Jones Wedding Group")
3. Use the same guest contact information
4. Apply group discounts via rate plans

### What is a "soft hold"?

A soft hold is a temporary reservation created when a guest starts checkout but hasn't completed payment. The room is locked for 15 minutes, preventing others from booking it. If payment isn't completed within 15 minutes, the hold automatically expires and the room becomes available again.

---

## Payments & Billing

### How do I get paid for bookings?

Payments are processed through Stripe Connect:
1. Guest pays via credit card during booking
2. Payment is authorized (not immediately charged)
3. Upon confirmation, payment is captured
4. Funds are deposited to your bank account per your payout schedule
5. Platform fee (2%) is automatically deducted

### When do I receive payouts?

Default payout schedule:
- **Daily**: Funds from confirmed bookings (recommended)
- **Weekly**: Every Monday
- **Monthly**: First of each month

Configure in **Dashboard > Settings > Payments > Payout Schedule**

First payout may take 7-14 days for Stripe verification.

### What payment methods are accepted?

- Visa
- Mastercard
- American Express
- Discover
- Debit cards
- Digital wallets (Apple Pay, Google Pay)

International cards are automatically supported.

### Are there transaction fees?

**Stripe Processing Fee**: ~2.9% + $0.30 per transaction (standard Stripe rates)

**Platform Fee**: 2% of booking value (waived on Premium plan)

Example for a $200 booking:
- Stripe fee: $6.10
- Platform fee: $4.00
- Your net revenue: $189.90

### How do refunds work?

Refunds are processed through Stripe:
1. Cancel the booking in your dashboard
2. Select refund amount (full or partial)
3. Confirm refund
4. Funds return to guest's original payment method within 5-10 business days
5. Platform fees are refunded; Stripe fees are not

### What if I don't have a business bank account?

Stripe Connect requires a business bank account for most regions. However:
- Sole proprietors can use personal accounts in many countries
- Contact Stripe support for specific requirements in your region

### Is my financial data secure?

Yes! Security measures include:
- **PCI DSS Compliance**: Stripe handles all card data
- **Encryption**: All data encrypted in transit and at rest
- **No Card Storage**: Hotelius never sees or stores card numbers
- **Fraud Detection**: Stripe's machine learning fraud prevention

---

## Room Management

### What's the difference between Room Types and Rooms?

- **Room Type**: A category or class of room (e.g., "Deluxe Suite")
  - Defines amenities, pricing, and occupancy
  - What guests see and select when booking

- **Room**: A physical unit (e.g., "Room 101")
  - Assigned to a Room Type
  - Actual inventory available for booking
  - Can be temporarily disabled for maintenance

### How many rooms can I add?

- **Starter Plan**: Up to 10 rooms
- **Professional Plan**: Up to 30 rooms
- **Premium Plan**: Unlimited rooms

Contact us for enterprise pricing if you have 100+ rooms.

### Can I temporarily disable a room?

Yes! Set room status to "Maintenance" in **Dashboard > Rooms**:
- Room becomes unavailable for new bookings
- Existing bookings are preserved
- Re-enable by changing status back to "Active"

### How do I add photos to rooms?

1. Go to **Dashboard > Room Types**
2. Select the room type
3. Click **"Upload Photos"**
4. Drag and drop images (or click to browse)
5. Set display order and cover photo
6. Save changes

**Photo Requirements**:
- Format: JPG or PNG
- Minimum size: 1200x800px
- Maximum size: 5MB per image
- Recommended: 1920x1280px for best quality

### Can I have rooms with different prices in the same type?

Not directly. Room Types have unified pricing. If you need different prices:
1. Create separate Room Types (e.g., "Deluxe Ocean View" vs "Deluxe City View")
2. Use Rate Plans for temporary price variations
3. Apply discounts at booking time

---

## Pricing & Rate Plans

### What's the difference between Base Price and Rate Plans?

- **Base Price**: Default price per night set on the Room Type
  - Used when no Rate Plan applies
  - Your fallback pricing

- **Rate Plans**: Override base price for specific dates
  - Seasonal pricing (summer, winter)
  - Event pricing (holidays, festivals)
  - Priority-based (multiple plans can overlap)

### How does the priority system work?

When multiple Rate Plans cover the same date, the one with the highest priority wins.

**Example**:
```
Base Price: $150 (implicit priority: 0)
Plan A "Year-round 2025": $180 (priority: 5)
Plan B "Summer Special": $220 (priority: 10)

June 15: Plan B wins ($220) - highest priority
October 15: Plan A wins ($180) - higher than base
```

### Can I offer discounts?

Yes, several ways:
1. **Length of Stay Discounts**: Automatic 5% for 3+ nights, 15% for 7+ nights
2. **Rate Plans**: Create discounted rate plans for off-season
3. **Manual Adjustment**: Apply discount when creating manual bookings
4. **Promo Codes**: Coming in a future update

### How do I implement seasonal pricing?

1. Go to **Dashboard > Rates**
2. Click **"New Rate Plan"**
3. Configure:
   - Name: "Summer 2025"
   - Room Type: Select applicable type
   - Dates: June 1 - August 31, 2025
   - Price: Higher summer rate
   - Priority: 10 (higher than base)
4. Save

Repeat for each season (winter, spring, fall).

### Can I set minimum stay requirements?

Yes! Rate Plans support minimum stay:
1. Create or edit a Rate Plan
2. Set **"Minimum Stay Days"** field
3. Guests must book at least this many nights

Common use cases:
- Weekend stays (Friday-Sunday): 2-night minimum
- Holiday periods: 3-night minimum
- Peak season: 5-night minimum

### How do I price for different guest counts?

Currently, Room Type pricing is per room, not per guest. To accommodate different guest counts:
1. Set occupancy limits (max adults, max children)
2. Price assumes maximum occupancy
3. Consider creating different room types for different configurations

Per-guest pricing is planned for a future update.

---

## Technical Questions

### What browsers are supported?

Hotelius works on all modern browsers:
- **Chrome** (recommended): Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

Internet Explorer is not supported.

### Is there a mobile app?

Currently, Hotelius is web-based and fully responsive on mobile browsers. Native iOS and Android apps are in development for Q2 2026.

The dashboard is optimized for:
- Desktop/Laptop (best experience)
- Tablet (full functionality)
- Mobile phone (key features available)

### Can I embed the booking engine on my website?

Yes! Two integration methods:

**1. Iframe Embed**:
```html
<iframe
  src="https://booking.hotelius.com/your-hotel-slug"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>
```

**2. Direct Link**:
Link to your booking page: `https://booking.hotelius.com/your-hotel-slug`

### Does Hotelius integrate with channel managers?

API integrations are available for:
- Custom integrations via REST API
- Webhook events for real-time updates

Pre-built channel manager integrations (Expedia, Booking.com) are planned for 2026.

### Can I customize the booking engine design?

Yes, limited customization is available:
- Upload your logo
- Set brand colors (primary, secondary)
- Add cover photo
- Customize policy text

Advanced white-labeling (custom domain, full CSS control) is available on the Premium plan.

### Is there an API?

Yes! The Hotelius API allows you to:
- Check availability
- Calculate pricing
- Create bookings
- Retrieve booking data

See [API Reference Documentation](./api-reference.md) for details.

### How is data backed up?

Your data is automatically backed up:
- **Continuous**: Real-time replication across multiple servers
- **Daily Snapshots**: Full database backups retained for 30 days
- **Point-in-Time Recovery**: Restore to any moment within the last 7 days

Hosted on Supabase infrastructure with 99.9% uptime SLA.

---

## Account & Security

### How do I change my password?

1. Go to **Dashboard > Settings > Security**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password (minimum 8 characters)
5. Confirm new password
6. Save changes

### I forgot my password. How do I reset it?

1. Go to the login page
2. Click **"Forgot Password?"**
3. Enter your email address
4. Check email for reset link (expires in 1 hour)
5. Click link and set new password

### Can I have multiple user accounts?

Yes! Invite team members from **Dashboard > Settings > Team**.

**User Roles**:
- **Owner**: Full access to all features including billing
- **Staff**: Access to bookings, rooms, calendar (no settings/billing)

Each user needs a unique email address.

### How secure is my data?

Security measures:
- **Encryption**: TLS 1.3 for data in transit, AES-256 for data at rest
- **Authentication**: Secure password hashing (bcrypt)
- **Row-Level Security**: Database prevents cross-hotel data access
- **Regular Audits**: Quarterly security assessments
- **GDPR Compliant**: EU data protection standards
- **SOC 2 Type II**: Certified (in progress)

### What happens to my data if I cancel?

Upon cancellation:
- **30-Day Grace Period**: Data retained for 30 days
- **Export Option**: Download all data as CSV before cancellation
- **Permanent Deletion**: After 30 days, data is permanently deleted

To request an export before cancelling, contact support@hotelius.com.

### Can I export my data?

Yes! Export options:
- **Bookings**: Dashboard > Bookings > Export to CSV
- **Reports**: Dashboard > Reports > Download
- **Full Export**: Contact support for complete database export

### Is Hotelius GDPR compliant?

Yes! We comply with GDPR requirements:
- Data processing agreement available
- Guest data encryption
- Right to be forgotten (delete guest data)
- Data portability (export data)
- Privacy policy and terms clearly stated

See our [Privacy Policy](https://hotelius.com/privacy) for details.

---

## Troubleshooting

### I can't log in. What should I do?

Common solutions:
1. **Verify email address**: Ensure you're using the correct email
2. **Reset password**: Use "Forgot Password" link
3. **Clear browser cache**: Try incognito/private mode
4. **Check browser**: Use a supported browser
5. **Contact support**: If issues persist

### Bookings aren't showing in my calendar

Possible causes:
1. **Date range**: Expand calendar view or navigate to correct dates
2. **Room type filter**: Check if filtering is active
3. **Booking status**: Ensure you're viewing confirmed bookings
4. **Browser cache**: Refresh the page (Ctrl+F5 or Cmd+Shift+R)

### Payment setup is stuck on "Pending"

This usually means Stripe needs additional information:
1. Check email for requests from Stripe
2. Log in to your Stripe dashboard
3. Complete any required verification steps
4. Most accounts verify within 24 hours

Contact Stripe support if pending for more than 48 hours.

### Emails aren't being sent

Check these settings:
1. **Notification settings**: Dashboard > Settings > Notifications
2. **Email verification**: Verify your sender email is confirmed
3. **Spam folder**: Check if emails are going to spam
4. **Email service status**: Check status.hotelius.com

If issues persist, contact support@hotelius.com.

### My photos won't upload

Solutions:
1. **Check file size**: Maximum 5MB per image
2. **Check format**: Use JPG or PNG only
3. **Try different image**: Test with a different photo
4. **Browser issues**: Try a different browser
5. **Compress image**: Use TinyPNG or similar tool to reduce size

### The calendar is loading slowly

Performance tips:
1. **Reduce date range**: View 7 or 14 days instead of 30
2. **Filter by room type**: Show only specific room types
3. **Clear browser cache**: Old cached data may slow loading
4. **Check internet speed**: Slow connection affects load time

For persistent issues, contact support.

### I'm seeing an error message

Common errors and solutions:

**"Session expired"**
- Log out and log back in
- Clear cookies and cache

**"Permission denied"**
- Check your user role (some features require Owner access)
- Ask hotel owner to update your permissions

**"Room unavailable"**
- Another booking was created simultaneously
- Check calendar for conflicting bookings
- Room may be in maintenance status

**"Payment failed"**
- Guest's card was declined
- Ask guest to try a different payment method
- Check Stripe dashboard for specific error

---

## Still Have Questions?

### Contact Support

- **Email**: support@hotelius.com (response within 24 hours)
- **Live Chat**: Available in dashboard (Monday-Friday, 9 AM - 6 PM EST)
- **Phone**: +1-800-HOTELIUS (emergency support only)

### Additional Resources

- **Help Center**: https://help.hotelius.com
- **Video Tutorials**: Dashboard > Help > Tutorials
- **Blog**: https://hotelius.com/blog
- **Community Forum**: https://community.hotelius.com

### Feature Requests

Have an idea to improve Hotelius? Submit feature requests:
- Dashboard > Help > Feedback
- Email: product@hotelius.com
- Community Forum: Feature Request category

We review all submissions and prioritize based on user demand.

---

## Glossary

Quick reference for common terms:

- **ADR**: Average Daily Rate - total room revenue ÷ rooms sold
- **Base Price**: Default nightly rate on a Room Type
- **Exclusion Constraint**: Database rule preventing double bookings
- **Occupancy Rate**: Percentage of rooms occupied
- **Rate Plan**: Pricing override for specific dates
- **RevPAR**: Revenue Per Available Room - total revenue ÷ total available rooms
- **RLS**: Row Level Security - database access control
- **Room Type**: Category of accommodation (e.g., Deluxe Suite)
- **Soft Hold**: Temporary reservation during checkout
- **Tape Chart**: Visual calendar grid showing all bookings

---

**Last Updated**: December 2025

For the most current information, visit our [Help Center](https://help.hotelius.com) or check the [Release Notes](https://hotelius.com/releases) in your dashboard.
