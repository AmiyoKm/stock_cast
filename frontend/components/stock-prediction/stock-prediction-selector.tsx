import {
	Select,
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, Cpu, TriangleAlert } from "lucide-react";
import type { PredictionPeriod, PredictionModelType } from "@/types/prediction";
import { Label } from "../ui/label";

interface StockPredictionSelectorProps {
	selectedPeriod: PredictionPeriod;
	handlePeriodChange: (_: PredictionPeriod) => void;
	selectedModel: PredictionModelType;
	handleModelChange: (_: PredictionModelType) => void;
	loading: boolean;
}

export function StockPredictionSelector({
	selectedPeriod,
	handlePeriodChange,
	selectedModel,
	handleModelChange,
	loading,
}: StockPredictionSelectorProps) {
	const models: PredictionModelType[] = [
		"StockCast/seperate",
		"StockCast/unified",
	];
	const periods = [1, 3, 7, 15, 30];

	return (
		<div className="flex justify-between gap-4">
			<Select
				onValueChange={(value) =>
					handlePeriodChange(Number(value) as PredictionPeriod)
				}
				value={selectedPeriod.toString()}
				disabled={loading}
			>
				<SelectTrigger className="w-[180px] bg-primary text-white [&>svg]:hidden">
					<div className="flex items-center gap-2">
						<Calendar color="white" className="h-4 w-4" />
						<SelectValue />
					</div>
				</SelectTrigger>
				<SelectContent>
					{periods.map((period) => (
						<SelectItem
							key={period}
							value={period.toString()}
							disabled={
								selectedModel === "StockCast/unified" &&
								(period === 15 || period === 30)
							}
						>
							{period} Day{period > 1 ? "s" : ""}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="flex gap-2">
				<Label
					htmlFor="model"
					className="font-semibold text-primary-foreground text-lg tracking-wide mb-1"
				>
					<span className="inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						Select a Model !
					</span>
				</Label>
				<Select
					onValueChange={(value) =>
						handleModelChange(value as PredictionModelType)
					}
					value={selectedModel}
					disabled={loading}
				>
					<SelectTrigger className="w-[220px] bg-primary text-white [&>svg]:hidden">
						<div className="flex items-center gap-2">
							<Cpu color="white" className="h-4 w-4" />
							<SelectValue />
						</div>
					</SelectTrigger>
					<SelectContent>
						{models.map((model) => (
							<SelectItem key={model} value={model}>
								{model === "StockCast/unified" ? (
									<TooltipProvider>
										<Tooltip >
											<TooltipTrigger asChild >
												<div className="flex items-center gap-2">
													{model}
													<div className="flex items-center text-destructive gap-1">
														<TriangleAlert className="h-4 w-4" />
													</div>
												</div>
											</TooltipTrigger>
											<TooltipContent>
												<p>Unstable Model</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : (
									<div className="flex items-center gap-2">
										{model}
									</div>
								)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
