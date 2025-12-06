// Type definitions for the booking system

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: HotelAmenity[];
  checkInTime: string; // e.g., "15:00"
  checkOutTime: string; // e.g., "11:00"
  cancellationPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelAmenity {
  id: string;
  name: string;
  icon: string;
  category: 'general' | 'room' | 'dining' | 'recreation';
}

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber?: string;
  name: string;
  description: string;
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  size: number; // in square meters
  beds: BedConfiguration[];
  amenities: string[];
  images: string[];
  basePrice: number;
  status: 'available' | 'occupied' | 'maintenance' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface BedConfiguration {
  type: 'king' | 'queen' | 'double' | 'single' | 'sofa';
  count: number;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  maxGuests: number;
  size: number;
  beds: string;
  amenities: string[];
  images: string[];
  basePrice: number;
  totalRooms: number;
}

export interface Booking {
  id: string;
  reference: string;
  hotelId: string;
  roomId: string;
  roomTypeId: string;
  guestId?: string; // If user is registered

  // Stay details
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;

  // Guest information
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;

  // Pricing
  pricing: BookingPricing;

  // Payment
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentIntentId?: string; // Stripe PaymentIntent ID

  // Status
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  cancellationReason?: string;
  cancelledAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingPricing {
  baseRate: number;
  adjustedRate: number; // After seasonal/demand adjustments
  nights: number;
  subtotal: number;
  discounts: BookingDiscount[];
  tax: number;
  serviceFee: number;
  total: number;
  currency: string;
  breakdown: PriceBreakdownItem[];
}

export interface BookingDiscount {
  type: 'length-of-stay' | 'early-bird' | 'last-minute' | 'promotion' | 'loyalty';
  name: string;
  amount: number;
  percentage?: number;
}

export interface PriceBreakdownItem {
  type: 'room' | 'discount' | 'tax' | 'fee';
  description: string;
  amount: number;
}

export interface GuestProfile {
  id: string;
  userId?: string; // If linked to auth system
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  nationality?: string;

  // Address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Preferences
  preferences?: {
    roomType?: string;
    floorPreference?: 'low' | 'middle' | 'high';
    smokingPreference?: 'smoking' | 'non-smoking';
    specialRequests?: string[];
  };

  // Stats
  totalBookings: number;
  totalSpent: number;
  loyaltyPoints?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityQuery {
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  adults?: number;
  children?: number;
  roomTypeId?: string;
}

export interface AvailabilityResult {
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  availableRooms: AvailableRoom[];
}

export interface AvailableRoom {
  id: string;
  roomTypeId: string;
  name: string;
  description: string;
  maxGuests: number;
  size: number;
  beds: string;
  amenities: string[];
  images: string[];
  available: number; // Number of available rooms
  basePrice: number;
}

export interface PricingQuery {
  hotelId: string;
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  promoCode?: string;
}

export interface PricingResult {
  hotelId: string;
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  pricing: BookingPricing;
}

export interface BookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentIntentId?: string;
  promoCode?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
}

// Form validation schemas (for Zod)
export interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface PaymentFormData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingZip: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search filters
export interface HotelSearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
  roomType?: string;
}

// Booking status types
export type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Notification types
export interface BookingNotification {
  type: 'confirmation' | 'reminder' | 'cancellation' | 'modification';
  bookingId: string;
  recipientEmail: string;
  sentAt: Date;
}

// Review/Rating types
export interface Review {
  id: string;
  bookingId: string;
  hotelId: string;
  guestId: string;
  guestName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  cleanliness: number;
  comfort: number;
  location: number;
  service: number;
  value: number;
  images?: string[];
  verifiedStay: boolean;
  hotelResponse?: {
    comment: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Cancellation types
export interface CancellationPolicy {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  rules: CancellationRule[];
}

export interface CancellationRule {
  hoursBefore: number; // Hours before check-in
  refundPercentage: number; // 0-100
  penalty?: number; // Fixed penalty amount
}

// Promotion types
export interface Promotion {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free-night';
  discountValue: number;
  minNights?: number;
  minAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
}
