/**
 * Timing shared by checkout, reconciliation and the sweeper. `SWEEP_INTERVAL_MS` must match
 * the sweeper's `rate(10 minutes)` schedule in serverless.yml.
 */
export const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/** Grace after a checkout expires before the sweeper steps in, giving Stripe's webhook time to arrive. */
export const SWEEP_GRACE_MS = SWEEP_INTERVAL_MS;

/** How long a delayed payment (e.g. bank debit) may stay pending before we re-check it. */
export const PROCESSING_RECHECK_MS = 24 * 60 * 60 * 1000;
