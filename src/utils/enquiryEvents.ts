/**
 * Enquiry Event Bus
 *
 * A lightweight pub/sub system for enquiry-related events.
 * Used to sync the sidebar notification badge with enquiry actions
 * without requiring constant polling.
 */

export type EnquiryEventType = 'status-changed' | 'deleted' | 'created';

export interface EnquiryEvent {
  type: EnquiryEventType;
  enquiryId: number;
  previousStatus?: string;
  newStatus?: string;
}

type EnquiryEventListener = (event: EnquiryEvent) => void;

const listeners = new Set<EnquiryEventListener>();

export const enquiryEvents = {
  /**
   * Emit an enquiry event to all subscribers
   */
  emit: (event: EnquiryEvent) => {
    listeners.forEach(fn => fn(event));
  },

  /**
   * Subscribe to enquiry events
   * @returns Unsubscribe function
   */
  subscribe: (fn: EnquiryEventListener) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }
};
