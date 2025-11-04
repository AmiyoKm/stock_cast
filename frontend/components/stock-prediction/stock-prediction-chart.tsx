import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface StockPredictionChartProps {
	chartData: { date: string; history?: number; prediction?: number }[];
	currentPrice: number;
}

export function StockPredictionChart({
	chartData,
	currentPrice,
}: StockPredictionChartProps) {

	return (
		<div className="space-y-4">
			<h4 className="font-medium">Price Trajectory</h4>
			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{
							top: 5,
							right: 30,
							left: 20,
							bottom: 5,
						}}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							className="stroke-muted"
						/>
						<XAxis
							dataKey="date"
							className="text-xs fill-muted-foreground"
							tickFormatter={(value) => {
								if (typeof value === "string") {
									return new Date(
										value.replace(/-/g, "/"),
									).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									});
								}
								return value;
							}}
						/>
						<YAxis
							className="text-xs fill-muted-foreground"
							tickFormatter={(value) => formatCurrency(value)}
						/>
						<Tooltip
							content={({ active, payload, label }) => {
								if (active && payload && payload.length) {
									return (
										<div className="bg-background border rounded-lg p-3 shadow-lg">
											<p className="text-sm font-medium">
												{typeof label === "string"
													? new Date(
															label.replace(
																/-/g,
																"/",
															),
														).toLocaleDateString(
															"en-US",
															{
																weekday:
																	"short",
																month: "short",
																day: "numeric",
															},
														)
													: label}
											</p>
											<p className="text-sm text-primary">
												Price:{" "}
												{formatCurrency(
													payload[0].value as number,
												)}
											</p>
										</div>
									);
								}
								return null;
							}}
						/>
						<Line
							type="monotone"
							dataKey="history"
							stroke="#8884d8"
							strokeWidth={4}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="prediction"
							stroke="#82ca9d"
							strokeWidth={4}
							dot={false}
						/>{" "}
						<ReferenceLine
							y={currentPrice}
							label="Current Price"
							stroke="red"
							strokeDasharray="3 3"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
