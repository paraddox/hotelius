/**
 * Booking State Machine
 * Implements event-driven state transitions for hotel bookings
 *
 * State Flow:
 * pending_payment -> confirmed -> checked_in -> checked_out
 * pending_payment -> cancelled (timeout or user cancel)
 * confirmed -> cancelled
 * confirmed -> no_show
 */

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'
  | 'expired';

export type BookingEvent =
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_TIMEOUT'
  | 'CANCEL'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'MARK_NO_SHOW'
  | 'EXPIRE';

/**
 * State transition map
 * Defines valid state transitions based on events
 */
const STATE_TRANSITIONS: Record<BookingStatus, Partial<Record<BookingEvent, BookingStatus>>> = {
  pending: {
    PAYMENT_RECEIVED: 'confirmed',
    PAYMENT_FAILED: 'cancelled',
    PAYMENT_TIMEOUT: 'expired',
    CANCEL: 'cancelled',
    EXPIRE: 'expired',
  },
  confirmed: {
    CHECK_IN: 'checked_in',
    CANCEL: 'cancelled',
    MARK_NO_SHOW: 'no_show',
  },
  checked_in: {
    CHECK_OUT: 'checked_out',
  },
  checked_out: {
    // Terminal state - no transitions
  },
  cancelled: {
    // Terminal state - no transitions
  },
  no_show: {
    // Terminal state - no transitions
  },
  expired: {
    // Terminal state - no transitions
  },
};

/**
 * Terminal states that cannot transition to any other state
 */
export const TERMINAL_STATES: BookingStatus[] = [
  'checked_out',
  'cancelled',
  'no_show',
  'expired',
];

/**
 * Get the next state for a given current state and event
 * @param currentState - The current booking status
 * @param event - The event that triggers the transition
 * @returns The new state, or null if the transition is invalid
 */
export function getNextState(
  currentState: BookingStatus,
  event: BookingEvent
): BookingStatus | null {
  const transitions = STATE_TRANSITIONS[currentState];
  return transitions?.[event] ?? null;
}

/**
 * Check if a transition is valid
 * @param currentState - The current booking status
 * @param event - The event that would trigger the transition
 * @returns True if the transition is valid, false otherwise
 */
export function canTransition(
  currentState: BookingStatus,
  event: BookingEvent
): boolean {
  return getNextState(currentState, event) !== null;
}

/**
 * Check if a state is terminal (no further transitions possible)
 * @param state - The booking status to check
 * @returns True if the state is terminal
 */
export function isTerminalState(state: BookingStatus): boolean {
  return TERMINAL_STATES.includes(state);
}

/**
 * Get all available events/actions for a given state
 * @param currentState - The current booking status
 * @returns Array of events that can be triggered from this state
 */
export function getAvailableActions(currentState: BookingStatus): BookingEvent[] {
  const transitions = STATE_TRANSITIONS[currentState];
  return transitions ? (Object.keys(transitions) as BookingEvent[]) : [];
}

/**
 * Get all possible next states for a given state
 * @param currentState - The current booking status
 * @returns Array of states that can be reached from this state
 */
export function getPossibleNextStates(currentState: BookingStatus): BookingStatus[] {
  const transitions = STATE_TRANSITIONS[currentState];
  return transitions ? Object.values(transitions) : [];
}

/**
 * Validate a state transition and return detailed error if invalid
 * @param currentState - The current booking status
 * @param event - The event that would trigger the transition
 * @returns Object with validation result and error message if invalid
 */
export function validateTransition(
  currentState: BookingStatus,
  event: BookingEvent
): { valid: boolean; error?: string; nextState?: BookingStatus } {
  // Check if current state is terminal
  if (isTerminalState(currentState)) {
    return {
      valid: false,
      error: `Cannot transition from terminal state: ${currentState}`,
    };
  }

  // Check if transition exists
  const nextState = getNextState(currentState, event);
  if (nextState === null) {
    const availableActions = getAvailableActions(currentState);
    return {
      valid: false,
      error: `Invalid event '${event}' for state '${currentState}'. Available actions: ${availableActions.join(', ') || 'none'}`,
    };
  }

  return {
    valid: true,
    nextState,
  };
}

/**
 * Event metadata - describes what each event means and when it should be used
 */
export const EVENT_METADATA: Record<BookingEvent, {
  label: string;
  description: string;
  requiresReason?: boolean;
  requiresPaymentInfo?: boolean;
  automated?: boolean;
}> = {
  PAYMENT_RECEIVED: {
    label: 'Payment Received',
    description: 'Payment has been successfully processed',
    requiresPaymentInfo: true,
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    description: 'Payment processing failed',
    requiresReason: true,
  },
  PAYMENT_TIMEOUT: {
    label: 'Payment Timeout',
    description: 'Payment window expired without completion',
    automated: true,
  },
  CANCEL: {
    label: 'Cancel Booking',
    description: 'Booking cancelled by user or hotel',
    requiresReason: true,
  },
  CHECK_IN: {
    label: 'Check In',
    description: 'Guest has checked in to the hotel',
  },
  CHECK_OUT: {
    label: 'Check Out',
    description: 'Guest has checked out from the hotel',
  },
  MARK_NO_SHOW: {
    label: 'Mark as No-Show',
    description: 'Guest did not arrive for their reservation',
  },
  EXPIRE: {
    label: 'Expire',
    description: 'Booking expired (soft hold timeout)',
    automated: true,
  },
};

/**
 * State metadata - describes what each state means
 */
export const STATE_METADATA: Record<BookingStatus, {
  label: string;
  description: string;
  color: 'gray' | 'yellow' | 'blue' | 'green' | 'red';
  isActive: boolean;
}> = {
  pending: {
    label: 'Pending Payment',
    description: 'Awaiting payment confirmation',
    color: 'yellow',
    isActive: true,
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Payment received, booking confirmed',
    color: 'green',
    isActive: true,
  },
  checked_in: {
    label: 'Checked In',
    description: 'Guest has checked in',
    color: 'blue',
    isActive: true,
  },
  checked_out: {
    label: 'Checked Out',
    description: 'Guest has checked out',
    color: 'gray',
    isActive: false,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Booking was cancelled',
    color: 'red',
    isActive: false,
  },
  no_show: {
    label: 'No Show',
    description: 'Guest did not arrive',
    color: 'red',
    isActive: false,
  },
  expired: {
    label: 'Expired',
    description: 'Booking expired without payment',
    color: 'gray',
    isActive: false,
  },
};

/**
 * Get human-readable label for a state
 */
export function getStateLabel(state: BookingStatus): string {
  return STATE_METADATA[state]?.label ?? state;
}

/**
 * Get human-readable label for an event
 */
export function getEventLabel(event: BookingEvent): string {
  return EVENT_METADATA[event]?.label ?? event;
}

/**
 * Check if an event is automated (triggered by system, not user)
 */
export function isAutomatedEvent(event: BookingEvent): boolean {
  return EVENT_METADATA[event]?.automated ?? false;
}

/**
 * Check if an event requires a reason to be provided
 */
export function requiresReason(event: BookingEvent): boolean {
  return EVENT_METADATA[event]?.requiresReason ?? false;
}

/**
 * Check if an event requires payment information
 */
export function requiresPaymentInfo(event: BookingEvent): boolean {
  return EVENT_METADATA[event]?.requiresPaymentInfo ?? false;
}
