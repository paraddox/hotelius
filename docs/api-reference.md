# API Reference

This document provides comprehensive documentation for the Hotelius public API endpoints. These APIs enable integration with external booking platforms, channel managers, and custom applications.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [GET /api/hotels/[hotelId]/availability](#get-availability)
   - [GET /api/hotels/[hotelId]/pricing](#get-pricing)
   - [POST /api/bookings](#post-bookings)
6. [Webhook Events](#webhook-events)
7. [Code Examples](#code-examples)

---

## Overview

### Base URL

```
Production: https://app.hotelius.com/api
Staging: https://staging.hotelius.com/api
```

### API Version

Current version: **v1**

All endpoints are prefixed with the base URL. Version is currently implicit; future versions will use explicit versioning in the path.

### Content Type

All requests and responses use JSON format.

```
Content-Type: application/json
Accept: application/json
```

---

## Authentication

### API Keys

API access requires authentication via API keys. Obtain your API key from:
**Dashboard > Settings > API**

### Authentication Header

Include your API key in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Public Endpoints

The following endpoints are publicly accessible without authentication:
- `GET /api/hotels/[hotelId]/availability`
- `GET /api/hotels/[hotelId]/pricing`

These endpoints support the public booking engine and can be accessed by guest-facing applications.

### Authenticated Endpoints

Booking creation and management require authentication:
- `POST /api/bookings` - For server-side booking creation
- `GET /api/bookings` - Retrieve booking information

---

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid API key |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., room already booked) |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "error": "Error message describing the issue",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PARAMETERS` | Required parameters missing or invalid |
| `INVALID_DATE_FORMAT` | Date format is incorrect |
| `INVALID_DATE_RANGE` | Check-out must be after check-in |
| `PAST_DATE` | Check-in date cannot be in the past |
| `ROOM_UNAVAILABLE` | Selected room is not available |
| `MISSING_GUEST_INFO` | Guest information incomplete |
| `PAYMENT_FAILED` | Payment processing failed |
| `BOOKING_NOT_FOUND` | Booking ID doesn't exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Rate Limiting

### Limits

- **Public Endpoints**: 100 requests per minute per IP
- **Authenticated Endpoints**: 1,000 requests per minute per API key

### Rate Limit Headers

Response headers indicate current rate limit status:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Exceeding Limits

When rate limit is exceeded, the API returns:
- **Status**: 429 Too Many Requests
- **Header**: `Retry-After: 60` (seconds)

---

## Endpoints

### GET /api/hotels/[hotelId]/availability {#get-availability}

Check room availability for specified dates and guest count.

#### Request

**Method**: `GET`

**URL**: `/api/hotels/[hotelId]/availability`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hotelId` | string | Yes | Unique hotel identifier (UUID) |
| `checkIn` | string | Yes | Check-in date (ISO 8601: YYYY-MM-DD) |
| `checkOut` | string | Yes | Check-out date (ISO 8601: YYYY-MM-DD) |
| `guests` | integer | No | Number of guests (default: 1) |

**Example Request**:

```http
GET /api/hotels/550e8400-e29b-41d4-a716-446655440000/availability?checkIn=2025-07-15&checkOut=2025-07-18&guests=2
```

#### Response

**Status**: `200 OK`

**Body**:

```json
{
  "hotelId": "550e8400-e29b-41d4-a716-446655440000",
  "checkIn": "2025-07-15T00:00:00.000Z",
  "checkOut": "2025-07-18T00:00:00.000Z",
  "guests": 2,
  "nights": 3,
  "availableRooms": [
    {
      "id": "1",
      "roomTypeId": "deluxe",
      "name": "Deluxe Room",
      "description": "Spacious room with city views",
      "maxGuests": 2,
      "available": 5,
      "basePrice": 150
    },
    {
      "id": "2",
      "roomTypeId": "executive",
      "name": "Executive Suite",
      "description": "Luxury suite with separate living area",
      "maxGuests": 4,
      "available": 3,
      "basePrice": 280
    }
  ]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `hotelId` | string | Hotel unique identifier |
| `checkIn` | string | Check-in date (ISO 8601) |
| `checkOut` | string | Check-out date (ISO 8601) |
| `guests` | integer | Number of guests |
| `nights` | integer | Number of nights calculated |
| `availableRooms` | array | List of available room types |
| `availableRooms[].id` | string | Room type ID |
| `availableRooms[].roomTypeId` | string | Room type identifier |
| `availableRooms[].name` | string | Display name |
| `availableRooms[].description` | string | Room description |
| `availableRooms[].maxGuests` | integer | Maximum occupancy |
| `availableRooms[].available` | integer | Number of available units |
| `availableRooms[].basePrice` | number | Base price per night (USD) |

#### Error Responses

**400 Bad Request** - Missing parameters:

```json
{
  "error": "Missing required parameters: checkIn and checkOut are required"
}
```

**400 Bad Request** - Invalid date format:

```json
{
  "error": "Invalid date format"
}
```

**400 Bad Request** - Invalid date range:

```json
{
  "error": "Check-out date must be after check-in date"
}
```

**400 Bad Request** - Past date:

```json
{
  "error": "Check-in date cannot be in the past"
}
```

---

### GET /api/hotels/[hotelId]/pricing {#get-pricing}

Calculate pricing for a specific room type and date range, including dynamic rates, taxes, and fees.

#### Request

**Method**: `GET`

**URL**: `/api/hotels/[hotelId]/pricing`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hotelId` | string | Yes | Unique hotel identifier (UUID) |
| `roomTypeId` | string | Yes | Room type identifier |
| `checkIn` | string | Yes | Check-in date (ISO 8601: YYYY-MM-DD) |
| `checkOut` | string | Yes | Check-out date (ISO 8601: YYYY-MM-DD) |
| `guests` | integer | No | Number of guests (default: 1) |

**Example Request**:

```http
GET /api/hotels/550e8400-e29b-41d4-a716-446655440000/pricing?roomTypeId=1&checkIn=2025-07-15&checkOut=2025-07-18&guests=2
```

#### Response

**Status**: `200 OK`

**Body**:

```json
{
  "hotelId": "550e8400-e29b-41d4-a716-446655440000",
  "roomTypeId": "1",
  "checkIn": "2025-07-15T00:00:00.000Z",
  "checkOut": "2025-07-18T00:00:00.000Z",
  "guests": 2,
  "pricing": {
    "baseRate": 150,
    "adjustedRate": 180,
    "nights": 3,
    "subtotal": 540,
    "discounts": {
      "lengthOfStay": 27
    },
    "subtotalAfterDiscount": 513,
    "tax": 51.3,
    "serviceFee": 20,
    "total": 584.3,
    "breakdown": [
      {
        "type": "room",
        "description": "Room rate (3 nights)",
        "amount": 540
      },
      {
        "type": "discount",
        "description": "Length of stay discount",
        "amount": -27
      },
      {
        "type": "tax",
        "description": "Taxes",
        "amount": 51.3
      },
      {
        "type": "fee",
        "description": "Service fee",
        "amount": 20
      }
    ]
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `hotelId` | string | Hotel unique identifier |
| `roomTypeId` | string | Room type identifier |
| `checkIn` | string | Check-in date (ISO 8601) |
| `checkOut` | string | Check-out date (ISO 8601) |
| `guests` | integer | Number of guests |
| `pricing` | object | Pricing breakdown |
| `pricing.baseRate` | number | Base nightly rate (USD) |
| `pricing.adjustedRate` | number | Rate after seasonal adjustments (USD) |
| `pricing.nights` | integer | Number of nights |
| `pricing.subtotal` | number | Total before discounts (USD) |
| `pricing.discounts` | object | Applied discounts |
| `pricing.discounts.lengthOfStay` | number | Length of stay discount amount (USD) |
| `pricing.subtotalAfterDiscount` | number | Subtotal after discounts (USD) |
| `pricing.tax` | number | Tax amount (USD) |
| `pricing.serviceFee` | number | Service fee (USD) |
| `pricing.total` | number | Final total amount (USD) |
| `pricing.breakdown` | array | Line-item breakdown |

**Discount Rules**:

- 7+ nights: 15% discount
- 3-6 nights: 5% discount
- 1-2 nights: No discount

**Tax Rate**: 10% (configurable per hotel)

**Service Fee**: $20 flat fee (configurable per hotel)

#### Error Responses

**400 Bad Request** - Missing parameters:

```json
{
  "error": "Missing required parameters: roomTypeId, checkIn, and checkOut are required"
}
```

**400 Bad Request** - Invalid date format:

```json
{
  "error": "Invalid date format"
}
```

---

### POST /api/bookings {#post-bookings}

Create a new booking reservation.

#### Request

**Method**: `POST`

**URL**: `/api/bookings`

**Headers**:

```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (optional for public bookings)
```

**Body**:

```json
{
  "hotelId": "550e8400-e29b-41d4-a716-446655440000",
  "roomId": "room-uuid-here",
  "checkIn": "2025-07-15",
  "checkOut": "2025-07-18",
  "guests": 2,
  "guestInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "specialRequests": "Late check-in expected around 10 PM"
  },
  "paymentIntentId": "pi_xxx"
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hotelId` | string | Yes | Hotel unique identifier |
| `roomId` | string | Yes | Specific room identifier |
| `checkIn` | string | Yes | Check-in date (YYYY-MM-DD) |
| `checkOut` | string | Yes | Check-out date (YYYY-MM-DD) |
| `guests` | integer | Yes | Number of guests |
| `guestInfo` | object | Yes | Guest information |
| `guestInfo.firstName` | string | Yes | Guest first name |
| `guestInfo.lastName` | string | Yes | Guest last name |
| `guestInfo.email` | string | Yes | Guest email address |
| `guestInfo.phone` | string | No | Guest phone number |
| `guestInfo.specialRequests` | string | No | Special requests or notes |
| `paymentIntentId` | string | No | Stripe PaymentIntent ID (if pre-authorized) |

#### Response

**Status**: `201 Created`

**Body**:

```json
{
  "success": true,
  "booking": {
    "id": "bk_8x9y0z1a2b3c",
    "reference": "BK-8X9Y0Z1A",
    "status": "confirmed",
    "hotelId": "550e8400-e29b-41d4-a716-446655440000",
    "roomId": "room-uuid-here",
    "checkIn": "2025-07-15",
    "checkOut": "2025-07-18",
    "guests": 2,
    "nights": 3,
    "guestInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123",
      "specialRequests": "Late check-in expected around 10 PM"
    },
    "pricing": {
      "subtotal": 513,
      "tax": 51.3,
      "total": 584.3
    },
    "createdAt": "2025-06-01T14:30:00.000Z"
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation success indicator |
| `booking` | object | Created booking details |
| `booking.id` | string | Unique booking identifier |
| `booking.reference` | string | Human-readable booking reference |
| `booking.status` | string | Booking status (pending, confirmed, etc.) |
| `booking.hotelId` | string | Hotel identifier |
| `booking.roomId` | string | Room identifier |
| `booking.checkIn` | string | Check-in date |
| `booking.checkOut` | string | Check-out date |
| `booking.guests` | integer | Number of guests |
| `booking.nights` | integer | Number of nights |
| `booking.guestInfo` | object | Guest information |
| `booking.pricing` | object | Price breakdown |
| `booking.createdAt` | string | Booking creation timestamp (ISO 8601) |

#### Error Responses

**400 Bad Request** - Missing fields:

```json
{
  "error": "Missing required fields"
}
```

**400 Bad Request** - Missing guest info:

```json
{
  "error": "Missing required guest information"
}
```

**400 Bad Request** - Invalid date format:

```json
{
  "error": "Invalid date format"
}
```

**400 Bad Request** - Invalid date range:

```json
{
  "error": "Check-out date must be after check-in date"
}
```

**400 Bad Request** - Past date:

```json
{
  "error": "Check-in date cannot be in the past"
}
```

**409 Conflict** - Room unavailable:

```json
{
  "error": "Room is not available for selected dates"
}
```

**500 Internal Server Error**:

```json
{
  "error": "Failed to create booking"
}
```

---

## Webhook Events

### Overview

Webhooks allow your application to receive real-time notifications about booking events.

### Configuration

Configure webhook endpoints in:
**Dashboard > Settings > API > Webhooks**

### Webhook Signature Verification

All webhook requests include a signature header for verification:

```http
X-Webhook-Signature: sha256=abc123...
```

**Verification Process**:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `booking.created` | New booking created |
| `booking.confirmed` | Booking confirmed (payment received) |
| `booking.cancelled` | Booking cancelled |
| `booking.checked_in` | Guest checked in |
| `booking.checked_out` | Guest checked out |

### Webhook Payload

```json
{
  "event": "booking.created",
  "timestamp": "2025-06-01T14:30:00.000Z",
  "data": {
    "bookingId": "bk_8x9y0z1a2b3c",
    "reference": "BK-8X9Y0Z1A",
    "hotelId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "confirmed",
    "checkIn": "2025-07-15",
    "checkOut": "2025-07-18",
    "guestEmail": "john.doe@example.com",
    "total": 584.3
  }
}
```

### Retry Policy

Failed webhook deliveries are retried:
- Retry 1: After 1 minute
- Retry 2: After 5 minutes
- Retry 3: After 15 minutes
- Retry 4: After 1 hour
- Retry 5: After 4 hours

After 5 failed attempts, the webhook is marked as failed and requires manual intervention.

---

## Code Examples

### JavaScript/Node.js

#### Check Availability

```javascript
const fetch = require('node-fetch');

async function checkAvailability(hotelId, checkIn, checkOut, guests) {
  const url = `https://app.hotelius.com/api/hotels/${hotelId}/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
checkAvailability(
  '550e8400-e29b-41d4-a716-446655440000',
  '2025-07-15',
  '2025-07-18',
  2
)
  .then(data => console.log('Available rooms:', data.availableRooms))
  .catch(error => console.error('Error:', error.message));
```

#### Get Pricing

```javascript
async function getPricing(hotelId, roomTypeId, checkIn, checkOut, guests) {
  const url = `https://app.hotelius.com/api/hotels/${hotelId}/pricing?roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
getPricing(
  '550e8400-e29b-41d4-a716-446655440000',
  '1',
  '2025-07-15',
  '2025-07-18',
  2
)
  .then(data => console.log('Total price:', data.pricing.total))
  .catch(error => console.error('Error:', error.message));
```

#### Create Booking

```javascript
async function createBooking(bookingData) {
  const url = 'https://app.hotelius.com/api/bookings';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
const bookingData = {
  hotelId: '550e8400-e29b-41d4-a716-446655440000',
  roomId: 'room-uuid-here',
  checkIn: '2025-07-15',
  checkOut: '2025-07-18',
  guests: 2,
  guestInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
  },
};

createBooking(bookingData)
  .then(data => console.log('Booking created:', data.booking.reference))
  .catch(error => console.error('Error:', error.message));
```

### Python

#### Check Availability

```python
import requests
from datetime import date

def check_availability(hotel_id, check_in, check_out, guests):
    url = f'https://app.hotelius.com/api/hotels/{hotel_id}/availability'

    params = {
        'checkIn': check_in.isoformat(),
        'checkOut': check_out.isoformat(),
        'guests': guests
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()

# Usage
try:
    data = check_availability(
        hotel_id='550e8400-e29b-41d4-a716-446655440000',
        check_in=date(2025, 7, 15),
        check_out=date(2025, 7, 18),
        guests=2
    )
    print(f"Available rooms: {len(data['availableRooms'])}")
except requests.exceptions.HTTPError as e:
    print(f"Error: {e.response.json()['error']}")
```

#### Create Booking

```python
import requests

def create_booking(booking_data):
    url = 'https://app.hotelius.com/api/bookings'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    response = requests.post(url, json=booking_data, headers=headers)
    response.raise_for_status()

    return response.json()

# Usage
booking_data = {
    'hotelId': '550e8400-e29b-41d4-a716-446655440000',
    'roomId': 'room-uuid-here',
    'checkIn': '2025-07-15',
    'checkOut': '2025-07-18',
    'guests': 2,
    'guestInfo': {
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john.doe@example.com',
        'phone': '+1-555-0123'
    }
}

try:
    result = create_booking(booking_data)
    print(f"Booking created: {result['booking']['reference']}")
except requests.exceptions.HTTPError as e:
    print(f"Error: {e.response.json()['error']}")
```

### PHP

#### Check Availability

```php
<?php

function checkAvailability($hotelId, $checkIn, $checkOut, $guests) {
    $url = sprintf(
        'https://app.hotelius.com/api/hotels/%s/availability?checkIn=%s&checkOut=%s&guests=%d',
        $hotelId,
        $checkIn,
        $checkOut,
        $guests
    );

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        $error = json_decode($response, true);
        throw new Exception($error['error']);
    }

    return json_decode($response, true);
}

// Usage
try {
    $data = checkAvailability(
        '550e8400-e29b-41d4-a716-446655440000',
        '2025-07-15',
        '2025-07-18',
        2
    );
    echo "Available rooms: " . count($data['availableRooms']) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

### cURL

#### Check Availability

```bash
curl -X GET \
  'https://app.hotelius.com/api/hotels/550e8400-e29b-41d4-a716-446655440000/availability?checkIn=2025-07-15&checkOut=2025-07-18&guests=2' \
  -H 'Accept: application/json'
```

#### Get Pricing

```bash
curl -X GET \
  'https://app.hotelius.com/api/hotels/550e8400-e29b-41d4-a716-446655440000/pricing?roomTypeId=1&checkIn=2025-07-15&checkOut=2025-07-18&guests=2' \
  -H 'Accept: application/json'
```

#### Create Booking

```bash
curl -X POST \
  'https://app.hotelius.com/api/bookings' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "hotelId": "550e8400-e29b-41d4-a716-446655440000",
    "roomId": "room-uuid-here",
    "checkIn": "2025-07-15",
    "checkOut": "2025-07-18",
    "guests": 2,
    "guestInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    }
  }'
```

---

## Best Practices

### Performance Optimization

1. **Cache Availability Checks**: Cache availability results for at least 30 seconds
2. **Batch Requests**: When checking multiple room types, make parallel requests
3. **Connection Pooling**: Reuse HTTP connections when possible
4. **Compression**: Enable gzip compression for responses

### Error Handling

1. **Implement Retries**: Use exponential backoff for transient failures
2. **Log Errors**: Log all API errors for debugging
3. **Graceful Degradation**: Provide fallback options when API is unavailable
4. **Validate Locally**: Validate inputs before sending to API

### Security

1. **Use HTTPS**: Always use secure connections
2. **Protect API Keys**: Never expose API keys in client-side code
3. **Validate Webhooks**: Always verify webhook signatures
4. **Rate Limiting**: Implement client-side rate limiting

### Integration Testing

1. **Use Staging Environment**: Test integrations in staging first
2. **Test Edge Cases**: Invalid dates, full occupancy, etc.
3. **Monitor Production**: Set up monitoring for API errors
4. **Test Webhooks**: Use webhook testing tools (e.g., ngrok)

---

## Support

### Documentation

- **API Changelog**: https://hotelius.com/docs/api/changelog
- **Status Page**: https://status.hotelius.com
- **Interactive API Explorer**: https://hotelius.com/docs/api/explorer

### Contact

- **Email**: api-support@hotelius.com
- **Developer Forum**: https://community.hotelius.com
- **Bug Reports**: https://github.com/hotelius/api-issues

### SLA

- **Uptime**: 99.9% guaranteed
- **Response Time**: <200ms (95th percentile)
- **Support Response**: <24 hours for API issues

---

## Version History

### v1.0 (Current)

- Initial API release
- Availability checking
- Pricing calculation
- Booking creation
- Webhook events

### Upcoming Features

- Bulk booking creation
- Booking modifications
- Inventory management API
- Real-time availability updates via WebSocket

---

For the latest API updates and announcements, subscribe to the [API Changelog](https://hotelius.com/docs/api/changelog) or join our [Developer Community](https://community.hotelius.com).
