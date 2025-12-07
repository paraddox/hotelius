import { describe, it, expect } from 'vitest';
import {
  BookingStatus,
  BookingEvent,
  getNextState,
  canTransition,
  isTerminalState,
  getAvailableActions,
  getPossibleNextStates,
  validateTransition,
  TERMINAL_STATES,
  getStateLabel,
  getEventLabel,
  isAutomatedEvent,
  requiresReason,
  requiresPaymentInfo,
} from '../state-machine';

describe('Booking State Machine', () => {
  describe('getNextState', () => {
    it('should transition from pending to confirmed on payment received', () => {
      const nextState = getNextState('pending', 'PAYMENT_RECEIVED');
      expect(nextState).toBe('confirmed');
    });

    it('should transition from pending to cancelled on payment failed', () => {
      const nextState = getNextState('pending', 'PAYMENT_FAILED');
      expect(nextState).toBe('cancelled');
    });

    it('should transition from pending to expired on payment timeout', () => {
      const nextState = getNextState('pending', 'PAYMENT_TIMEOUT');
      expect(nextState).toBe('expired');
    });

    it('should transition from pending to cancelled on cancel', () => {
      const nextState = getNextState('pending', 'CANCEL');
      expect(nextState).toBe('cancelled');
    });

    it('should transition from confirmed to checked_in on check in', () => {
      const nextState = getNextState('confirmed', 'CHECK_IN');
      expect(nextState).toBe('checked_in');
    });

    it('should transition from confirmed to cancelled on cancel', () => {
      const nextState = getNextState('confirmed', 'CANCEL');
      expect(nextState).toBe('cancelled');
    });

    it('should transition from confirmed to no_show on mark no show', () => {
      const nextState = getNextState('confirmed', 'MARK_NO_SHOW');
      expect(nextState).toBe('no_show');
    });

    it('should transition from checked_in to checked_out on check out', () => {
      const nextState = getNextState('checked_in', 'CHECK_OUT');
      expect(nextState).toBe('checked_out');
    });

    it('should return null for invalid transitions', () => {
      expect(getNextState('cancelled', 'CHECK_IN')).toBeNull();
      expect(getNextState('checked_out', 'CANCEL')).toBeNull();
      expect(getNextState('no_show', 'CHECK_OUT')).toBeNull();
      expect(getNextState('expired', 'PAYMENT_RECEIVED')).toBeNull();
    });

    it('should return null for transitions from terminal states', () => {
      expect(getNextState('checked_out', 'CHECK_IN')).toBeNull();
      expect(getNextState('cancelled', 'PAYMENT_RECEIVED')).toBeNull();
      expect(getNextState('no_show', 'CHECK_IN')).toBeNull();
      expect(getNextState('expired', 'CANCEL')).toBeNull();
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transitions', () => {
      expect(canTransition('pending', 'PAYMENT_RECEIVED')).toBe(true);
      expect(canTransition('confirmed', 'CHECK_IN')).toBe(true);
      expect(canTransition('checked_in', 'CHECK_OUT')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(canTransition('cancelled', 'CHECK_IN')).toBe(false);
      expect(canTransition('checked_out', 'CANCEL')).toBe(false);
      expect(canTransition('pending', 'CHECK_OUT')).toBe(false);
    });
  });

  describe('isTerminalState', () => {
    it('should identify terminal states correctly', () => {
      expect(isTerminalState('checked_out')).toBe(true);
      expect(isTerminalState('cancelled')).toBe(true);
      expect(isTerminalState('no_show')).toBe(true);
      expect(isTerminalState('expired')).toBe(true);
    });

    it('should identify non-terminal states correctly', () => {
      expect(isTerminalState('pending')).toBe(false);
      expect(isTerminalState('confirmed')).toBe(false);
      expect(isTerminalState('checked_in')).toBe(false);
    });

    it('should match TERMINAL_STATES constant', () => {
      TERMINAL_STATES.forEach((state) => {
        expect(isTerminalState(state)).toBe(true);
      });
    });
  });

  describe('getAvailableActions', () => {
    it('should return all available actions for pending state', () => {
      const actions = getAvailableActions('pending');
      expect(actions).toContain('PAYMENT_RECEIVED');
      expect(actions).toContain('PAYMENT_FAILED');
      expect(actions).toContain('PAYMENT_TIMEOUT');
      expect(actions).toContain('CANCEL');
      expect(actions).toContain('EXPIRE');
      expect(actions.length).toBe(5);
    });

    it('should return all available actions for confirmed state', () => {
      const actions = getAvailableActions('confirmed');
      expect(actions).toContain('CHECK_IN');
      expect(actions).toContain('CANCEL');
      expect(actions).toContain('MARK_NO_SHOW');
      expect(actions.length).toBe(3);
    });

    it('should return all available actions for checked_in state', () => {
      const actions = getAvailableActions('checked_in');
      expect(actions).toContain('CHECK_OUT');
      expect(actions.length).toBe(1);
    });

    it('should return empty array for terminal states', () => {
      expect(getAvailableActions('checked_out')).toEqual([]);
      expect(getAvailableActions('cancelled')).toEqual([]);
      expect(getAvailableActions('no_show')).toEqual([]);
      expect(getAvailableActions('expired')).toEqual([]);
    });
  });

  describe('getPossibleNextStates', () => {
    it('should return all possible next states for pending', () => {
      const nextStates = getPossibleNextStates('pending');
      expect(nextStates).toContain('confirmed');
      expect(nextStates).toContain('cancelled');
      expect(nextStates).toContain('expired');
    });

    it('should return all possible next states for confirmed', () => {
      const nextStates = getPossibleNextStates('confirmed');
      expect(nextStates).toContain('checked_in');
      expect(nextStates).toContain('cancelled');
      expect(nextStates).toContain('no_show');
    });

    it('should return empty array for terminal states', () => {
      expect(getPossibleNextStates('checked_out')).toEqual([]);
      expect(getPossibleNextStates('cancelled')).toEqual([]);
      expect(getPossibleNextStates('no_show')).toEqual([]);
      expect(getPossibleNextStates('expired')).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    it('should validate valid transitions', () => {
      const result = validateTransition('pending', 'PAYMENT_RECEIVED');
      expect(result.valid).toBe(true);
      expect(result.nextState).toBe('confirmed');
      expect(result.error).toBeUndefined();
    });

    it('should reject transitions from terminal states', () => {
      const result = validateTransition('cancelled', 'PAYMENT_RECEIVED');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot transition from terminal state');
      expect(result.nextState).toBeUndefined();
    });

    it('should reject invalid transitions with helpful error message', () => {
      const result = validateTransition('pending', 'CHECK_OUT');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid event');
      expect(result.error).toContain('CHECK_OUT');
      expect(result.error).toContain('pending');
      expect(result.error).toContain('Available actions');
      expect(result.nextState).toBeUndefined();
    });

    it('should provide available actions in error message', () => {
      const result = validateTransition('confirmed', 'PAYMENT_RECEIVED');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Available actions: CHECK_IN, CANCEL, MARK_NO_SHOW');
    });
  });

  describe('State and Event Metadata', () => {
    describe('getStateLabel', () => {
      it('should return correct labels for all states', () => {
        expect(getStateLabel('pending')).toBe('Pending Payment');
        expect(getStateLabel('confirmed')).toBe('Confirmed');
        expect(getStateLabel('checked_in')).toBe('Checked In');
        expect(getStateLabel('checked_out')).toBe('Checked Out');
        expect(getStateLabel('cancelled')).toBe('Cancelled');
        expect(getStateLabel('no_show')).toBe('No Show');
        expect(getStateLabel('expired')).toBe('Expired');
      });
    });

    describe('getEventLabel', () => {
      it('should return correct labels for all events', () => {
        expect(getEventLabel('PAYMENT_RECEIVED')).toBe('Payment Received');
        expect(getEventLabel('PAYMENT_FAILED')).toBe('Payment Failed');
        expect(getEventLabel('PAYMENT_TIMEOUT')).toBe('Payment Timeout');
        expect(getEventLabel('CANCEL')).toBe('Cancel Booking');
        expect(getEventLabel('CHECK_IN')).toBe('Check In');
        expect(getEventLabel('CHECK_OUT')).toBe('Check Out');
        expect(getEventLabel('MARK_NO_SHOW')).toBe('Mark as No-Show');
        expect(getEventLabel('EXPIRE')).toBe('Expire');
      });
    });

    describe('isAutomatedEvent', () => {
      it('should identify automated events', () => {
        expect(isAutomatedEvent('PAYMENT_TIMEOUT')).toBe(true);
        expect(isAutomatedEvent('EXPIRE')).toBe(true);
      });

      it('should identify manual events', () => {
        expect(isAutomatedEvent('PAYMENT_RECEIVED')).toBe(false);
        expect(isAutomatedEvent('CANCEL')).toBe(false);
        expect(isAutomatedEvent('CHECK_IN')).toBe(false);
      });
    });

    describe('requiresReason', () => {
      it('should identify events that require a reason', () => {
        expect(requiresReason('PAYMENT_FAILED')).toBe(true);
        expect(requiresReason('CANCEL')).toBe(true);
      });

      it('should identify events that do not require a reason', () => {
        expect(requiresReason('PAYMENT_RECEIVED')).toBe(false);
        expect(requiresReason('CHECK_IN')).toBe(false);
        expect(requiresReason('CHECK_OUT')).toBe(false);
      });
    });

    describe('requiresPaymentInfo', () => {
      it('should identify events that require payment info', () => {
        expect(requiresPaymentInfo('PAYMENT_RECEIVED')).toBe(true);
      });

      it('should identify events that do not require payment info', () => {
        expect(requiresPaymentInfo('CANCEL')).toBe(false);
        expect(requiresPaymentInfo('CHECK_IN')).toBe(false);
        expect(requiresPaymentInfo('PAYMENT_FAILED')).toBe(false);
      });
    });
  });

  describe('Complete State Flow', () => {
    it('should support complete happy path flow', () => {
      // Start with pending
      let state: BookingStatus = 'pending';
      expect(state).toBe('pending');

      // Receive payment
      let nextState = getNextState(state, 'PAYMENT_RECEIVED');
      expect(nextState).toBe('confirmed');
      state = nextState as BookingStatus;

      // Check in
      nextState = getNextState(state, 'CHECK_IN');
      expect(nextState).toBe('checked_in');
      state = nextState as BookingStatus;

      // Check out
      nextState = getNextState(state, 'CHECK_OUT');
      expect(nextState).toBe('checked_out');
      state = nextState as BookingStatus;

      // Now in terminal state
      expect(isTerminalState(state)).toBe(true);
      expect(getAvailableActions(state)).toEqual([]);
    });

    it('should support cancellation flow from pending', () => {
      let state: BookingStatus = 'pending';
      const nextState = getNextState(state, 'CANCEL');
      expect(nextState).toBe('cancelled');
      expect(isTerminalState(nextState as BookingStatus)).toBe(true);
    });

    it('should support cancellation flow from confirmed', () => {
      let state: BookingStatus = 'confirmed';
      const nextState = getNextState(state, 'CANCEL');
      expect(nextState).toBe('cancelled');
      expect(isTerminalState(nextState as BookingStatus)).toBe(true);
    });

    it('should support no-show flow', () => {
      let state: BookingStatus = 'confirmed';
      const nextState = getNextState(state, 'MARK_NO_SHOW');
      expect(nextState).toBe('no_show');
      expect(isTerminalState(nextState as BookingStatus)).toBe(true);
    });

    it('should support expiration flow', () => {
      let state: BookingStatus = 'pending';
      const nextState = getNextState(state, 'EXPIRE');
      expect(nextState).toBe('expired');
      expect(isTerminalState(nextState as BookingStatus)).toBe(true);
    });
  });

  describe('Edge Cases and Business Rules', () => {
    it('should not allow checking in from pending state', () => {
      expect(canTransition('pending', 'CHECK_IN')).toBe(false);
      expect(getNextState('pending', 'CHECK_IN')).toBeNull();
    });

    it('should not allow checking out from confirmed state', () => {
      expect(canTransition('confirmed', 'CHECK_OUT')).toBe(false);
      expect(getNextState('confirmed', 'CHECK_OUT')).toBeNull();
    });

    it('should not allow payment received after already confirmed', () => {
      expect(canTransition('confirmed', 'PAYMENT_RECEIVED')).toBe(false);
    });

    it('should not allow cancellation after check-in', () => {
      expect(canTransition('checked_in', 'CANCEL')).toBe(false);
    });

    it('should not allow marking as no-show after check-in', () => {
      expect(canTransition('checked_in', 'MARK_NO_SHOW')).toBe(false);
    });

    it('should not allow any transitions from checked_out state', () => {
      const allEvents: BookingEvent[] = [
        'PAYMENT_RECEIVED',
        'PAYMENT_FAILED',
        'PAYMENT_TIMEOUT',
        'CANCEL',
        'CHECK_IN',
        'CHECK_OUT',
        'MARK_NO_SHOW',
        'EXPIRE',
      ];

      allEvents.forEach((event) => {
        expect(canTransition('checked_out', event)).toBe(false);
      });
    });

    it('should have exactly 5 possible events from pending state', () => {
      const actions = getAvailableActions('pending');
      expect(actions).toHaveLength(5);
    });

    it('should have exactly 3 possible events from confirmed state', () => {
      const actions = getAvailableActions('confirmed');
      expect(actions).toHaveLength(3);
    });

    it('should have exactly 1 possible event from checked_in state', () => {
      const actions = getAvailableActions('checked_in');
      expect(actions).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error for invalid transition', () => {
      const validation = validateTransition('checked_out', 'CHECK_IN');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error).toContain('terminal state');
    });

    it('should list available actions in error message', () => {
      const validation = validateTransition('pending', 'CHECK_OUT');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error).toContain('PAYMENT_RECEIVED');
      expect(validation.error).toContain('CANCEL');
    });

    it('should indicate when no actions are available', () => {
      const validation = validateTransition('expired', 'PAYMENT_RECEIVED');
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('terminal state');
    });
  });

  describe('Event Requirements', () => {
    it('should identify payment received as requiring payment info', () => {
      expect(requiresPaymentInfo('PAYMENT_RECEIVED')).toBe(true);
    });

    it('should identify cancel as requiring reason', () => {
      expect(requiresReason('CANCEL')).toBe(true);
    });

    it('should identify payment failed as requiring reason', () => {
      expect(requiresReason('PAYMENT_FAILED')).toBe(true);
    });

    it('should not require reason for check in', () => {
      expect(requiresReason('CHECK_IN')).toBe(false);
    });

    it('should not require reason for check out', () => {
      expect(requiresReason('CHECK_OUT')).toBe(false);
    });
  });

  describe('State Metadata Validation', () => {
    it('should have metadata for all states', () => {
      const states: BookingStatus[] = [
        'pending',
        'confirmed',
        'checked_in',
        'checked_out',
        'cancelled',
        'no_show',
        'expired',
      ];

      states.forEach((state) => {
        expect(getStateLabel(state)).toBeDefined();
        expect(typeof getStateLabel(state)).toBe('string');
      });
    });

    it('should have metadata for all events', () => {
      const events: BookingEvent[] = [
        'PAYMENT_RECEIVED',
        'PAYMENT_FAILED',
        'PAYMENT_TIMEOUT',
        'CANCEL',
        'CHECK_IN',
        'CHECK_OUT',
        'MARK_NO_SHOW',
        'EXPIRE',
      ];

      events.forEach((event) => {
        expect(getEventLabel(event)).toBeDefined();
        expect(typeof getEventLabel(event)).toBe('string');
      });
    });
  });
});
