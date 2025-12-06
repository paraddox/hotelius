/**
 * Booking System - Main Export
 * Central export point for all booking-related functionality
 */

// New State Machine (event-based)
export {
  type BookingStatus,
  type BookingEvent,
  getNextState,
  canTransition,
  isTerminalState as isEventBasedTerminalState,
  getAvailableActions,
  getPossibleNextStates,
  validateTransition,
  getStateLabel,
  getEventLabel,
  isAutomatedEvent,
  requiresReason,
  requiresPaymentInfo,
  TERMINAL_STATES as EVENT_TERMINAL_STATES,
  EVENT_METADATA,
  STATE_METADATA,
} from './state-machine';

// Booking Actions (uses new state machine)
export {
  type Booking,
  type CreateBookingData,
  createBooking,
  updateBookingStatus,
  cancelBooking as cancelBookingAction,
  checkInGuest,
  checkOutGuest,
  markNoShow as markNoShowAction,
  confirmBooking as confirmBookingAction,
  expireBooking as expireBookingAction,
  getBooking,
  getBookingByConfirmation,
  getHotelBookings,
  getBookingHistory,
  BookingActionError,
} from './actions';

// Legacy State machine (for backward compatibility)
export {
  BOOKING_STATES,
  TERMINAL_STATES,
  STATE_TRANSITIONS,
  isValidTransition,
  isTerminalState,
  getPossibleTransitions,
  getTransitionMetadata,
  type BookingState,
} from './states';

// Legacy State transitions (for backward compatibility)
export {
  confirmBooking,
  cancelBooking,
  checkIn,
  checkOut,
  markNoShow,
  expireBooking,
  BookingTransitionError,
  BookingNotFoundError,
  InvalidTransitionError,
  PermissionDeniedError,
} from './transitions';

// Soft hold system
export {
  createSoftHold,
  extendSoftHold,
  releaseSoftHold,
  isSoftHoldExpired,
  getSoftHoldInfo,
  cleanupExpiredSoftHolds,
  SoftHoldError,
  type SoftHoldResult,
} from './soft-hold';

// Pricing
export {
  calculateStayPrice,
  formatPrice,
  formatPriceBreakdown,
  validateBookingPrice,
  PricingError,
  type PricingResult,
  type PriceBreakdownItem,
} from './pricing';

// Availability
export {
  checkAvailability,
  getAvailableRooms,
  getAvailableRoomIds,
  isRoomAvailable,
  getAvailabilityCalendar,
  getMinimumAvailability,
  AvailabilityError,
  type AvailableRoomType,
  type RoomAvailability,
} from './availability';
