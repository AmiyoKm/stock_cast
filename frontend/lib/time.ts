import { ChartTimeframe } from "@/types/stock";

export function getDateInString(
	now: Date,
	selectedTimeframe: ChartTimeframe,
): string {
	const date = new Date(now);
	switch (selectedTimeframe) {
		case "1D":
			date.setDate(date.getDate() - 1);
			break;
		case "1W":
			date.setDate(date.getDate() - 7);
			break;
		case "1M":
			date.setMonth(date.getMonth() - 1);
			break;
		case "3M":
			date.setMonth(date.getMonth() - 3);
			break;
		case "6M":
			date.setMonth(date.getMonth() - 6);
			break;
		case "1Y":
			date.setFullYear(date.getFullYear() - 1);
			break;
	}
	return date.toISOString().slice(0, 10);
}

export const getMarketStatus = () => {
	const now = new Date();
	const options: Intl.DateTimeFormatOptions = {
		timeZone: "Asia/Dhaka",
		weekday: "short",
		hour: "numeric",
		minute: "numeric",
		hour12: false,
	};
	const dhakaTimeParts = new Intl.DateTimeFormat(
		"en-US",
		options,
	).formatToParts(now);

	const getPart = (part: string) =>
		dhakaTimeParts.find((p) => p.type === part)?.value;

	const dayOfWeek = getPart("weekday");
	const hour = parseInt(getPart("hour") || "0", 10);
	const minute = parseInt(getPart("minute") || "0", 10);

	if (dayOfWeek === "Fri" || dayOfWeek === "Sat") {
		return { isLive: false, message: "Market Closed" };
	}

	// DSE open from 10:00 AM to 2:20 PM
	const marketOpenHour = 10;
	const marketOpenMinute = 0;
	const marketCloseHour = 14;
	const marketCloseMinute = 20;

	const currentTimeInMinutes = hour * 60 + minute;
	const marketOpenTimeInMinutes = marketOpenHour * 60 + marketOpenMinute;
	const marketCloseTimeInMinutes = marketCloseHour * 60 + marketCloseMinute;

	const isMarketOpen =
		currentTimeInMinutes >= marketOpenTimeInMinutes &&
		currentTimeInMinutes < marketCloseTimeInMinutes;

	if (isMarketOpen) {
		return { isLive: true, message: "Market is Live" };
	}

	return { isLive: false, message: "Market Closed" };
};

export function getStartDateForTradingDays(
	endDate: Date,
	numberOfDays: number,
): Date {
	const isFridayOrSaturday = (date: Date) => {
		const day = date.getDay();
		return day === 5 || day === 6;
	};

	let tradingDaysCount = 0;
	let tempDate = new Date(endDate);
	const tradingDates: Date[] = [];

	while (tradingDaysCount < numberOfDays) {
		if (!isFridayOrSaturday(tempDate)) {
			tradingDates.push(new Date(tempDate));
			tradingDaysCount++;
		}
		tempDate.setDate(tempDate.getDate() - 1);
	}

	return tradingDates[tradingDates.length - 1];
}
