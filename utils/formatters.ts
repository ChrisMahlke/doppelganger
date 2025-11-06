export const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export const formatNumber = (value: number) => value.toLocaleString();

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatNumberCompact = (value: number) => new Intl.NumberFormat('en-US', { 
    notation: 'compact', 
    compactDisplay: 'short' 
}).format(value);
