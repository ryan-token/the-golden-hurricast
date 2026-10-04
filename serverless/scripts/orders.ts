/**
 * Order lookup, for debugging and fulfillment checks.
 *
 *   npm run orders -- --stage prod              # most recent orders
 *   npm run orders -- --stage prod <orderId>    # one order in full
 *   npm run orders -- --stage prod --due        # orders the sweeper will re-check
 */
import { getOrder, listDueReservations, listOrders } from '../src/data/orders.ts';
import { money, parseCli } from './cli.ts';

const { values, positionals } = parseCli({ due: { type: 'boolean' } });

if (positionals[0]) {
	console.dir(await getOrder(positionals[0]), { depth: null });
} else {
	const orders = values.due
		? await listDueReservations(new Date('9999-12-31'))
		: await listOrders(50);
	console.table(
		orders.map((order) => ({
			orderId: order.orderId,
			status: order.status,
			items: order.items.map((item) => `${item.quantity}× ${item.name}`).join(', '),
			total: money(order.amountTotal, order.currency),
			created: order.createdAt,
			flags: order.flags?.join(',') ?? ''
		}))
	);
}
