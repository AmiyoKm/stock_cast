export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-BD").format(num)
}

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

export const calculatePriceChange = (current: number, previous: number) => {
  const change = current - previous
  const changePercent = (change / previous) * 100

  return {
    change: change,
    changePercent: changePercent,
    isPositive: change >= 0,
  }
}

export const getPriceChangeColor = (isPositive: boolean): string => {
  return isPositive ? "text-primary" : "text-destructive"
}
