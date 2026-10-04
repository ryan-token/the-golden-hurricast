import { sweepReservations } from '../merch/sweep.ts';
import { getStripe } from '../merch/stripe.ts';

/** Scheduled: re-check orders holding stock past their deadline (see merch/sweep.ts). */
export const handler = async () => {
	const result = await sweepReservations(await getStripe());
	// Surface partial failures as an invocation error so they show up in metrics and alarms.
	if (result.failed > 0)
		throw new Error(`${result.failed} of ${result.checked} orders failed to sweep`);
	return result;
};
