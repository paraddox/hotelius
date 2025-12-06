/**
 * Booking State Machine
 * Defines all possible booking states and their valid transitions
 */

export const BOOKING_STATES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  NO_SHOW: 'no_show',
} as const;

export type BookingState = typeof BOOKING_STATES[keyof typeof BOOKING_STATES];

/**
 * Terminal states - once a booking reaches these states, it cannot transition further
 */
export const TERMINAL_STATES: BookingState[] = [
  BOOKING_STATES.CANCELLED,
  BOOKING_STATES.EXPIRED,
  BOOKING_STATES.NO_SHOW,
  BOOKING_STATES.CHECKED_OUT,
];

/**
 * State transition map
 * Defines which states can transition to which other states
 */
export const STATE_TRANSITIONS: Record<BookingState, BookingState[]> = {
  [BOOKING_STATES.PENDING]: [
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.EXPIRED,
  ],
  [BOOKING_STATES.CONFIRMED]: [
    BOOKING_STATES.CHECKED_IN,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.NO_SHOW,
  ],
  [BOOKING_STATES.CHECKED_IN]: [
    BOOKING_STATES.CHECKED_OUT,
  ],
  [BOOKING_STATES.CHECKED_OUT]: [], // Terminal state
  [BOOKING_STATES.CANCELLED]: [], // Terminal state
  [BOOKING_STATES.EXPIRED]: [], // Terminal state
  [BOOKING_STATES.NO_SHOW]: [], // Terminal state
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  fromState: BookingState,
  toState: BookingState
): boolean {
  const allowedTransitions = STATE_TRANSITIONS[fromState];
  return allowedTransitions.includes(toState);
}

/**
 * Check if a state is terminal (no further transitions allowed)
 */
export function isTerminalState(state: BookingState): boolean {
  return TERMINAL_STATES.includes(state);
}

/**
 * Get all possible next states for a given state
 */
export function getPossibleTransitions(state: BookingState): BookingState[] {
  return STATE_TRANSITIONS[state] || [];
}

/**
 * State transition metadata - describes what each transition means
 */
export const TRANSITION_METADATA: Record<string, {
  action: string;
  description: string;
  requiresReason?: boolean;
  requiresTimestamp?: boolean;
}> = {
  'pending->confirmed': {
    action: 'confirm',
    description: 'Confirm a pending booking after payment authorization',
    requiresTimestamp: true,
  },
  'pending->cancelled': {
    action: 'cancel',
    description: 'Cancel a pending booking',
    requiresReason: true,
    requiresTimestamp: true,
  },
  'pending->expired': {
    action: 'expire',
    description: 'Expire a pending booking due to timeout (auto)',
    requiresTimestamp: true,
  },
  'confirmed->checked_in': {
    action: 'check_in',
    description: 'Check in a guest for their confirmed booking',
    requiresTimestamp: true,
  },
  'confirmed->cancelled': {
    action: 'cancel',
    description: 'Cancel a confirmed booking',
    requiresReason: true,
    requiresTimestamp: true,
  },
  'confirmed->no_show': {
    action: 'mark_no_show',
    description: 'Mark booking as no-show when guest does not arrive',
    requiresTimestamp: true,
  },
  'checked_in->checked_out': {
    action: 'check_out',
    description: 'Check out a guest',
    requiresTimestamp: true,
  },
};

/**
 * Get transition metadata for a specific transition
 */
export function getTransitionMetadata(fromState: BookingState, toState: BookingState) {
  const key = `${fromState}->${toState}`;
  return TRANSITION_METADATA[key];
}
