/** Formats an amount in the currency's minor unit (e.g. cents), like `$27` or `$4.50`. */
export const formatMoney = (minor: number, currency: string) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		trailingZeroDisplay: 'stripIfInteger'
	}).format(minor / 100);
