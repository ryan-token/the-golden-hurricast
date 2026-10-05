/** Formats an amount in the currency's minor unit (e.g. cents), like `$27.00`. */
export const formatMoney = (minor: number, currency: string) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100);
