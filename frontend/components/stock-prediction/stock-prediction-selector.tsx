import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import type { PredictionPeriod } from "@/types/prediction";

interface StockPredictionSelectorProps {
    selectedPeriod: PredictionPeriod;
    handlePeriodChange: (period: PredictionPeriod) => void;
    loading: boolean;
}

export function StockPredictionSelector({
    selectedPeriod,
    handlePeriodChange,
    loading,
}: StockPredictionSelectorProps) {
    return (
        <div className="flex gap-2">
            <Select
                onValueChange={(value) =>
                    handlePeriodChange(Number(value) as PredictionPeriod)
                }
                defaultValue={selectedPeriod.toString()}
                disabled={loading}
            >
                <SelectTrigger className="w-[180px] bg-primary text-white [&>svg]:hidden">
                    <div className="flex items-center gap-2">
                        <Calendar color="white" className="h-4 w-4" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {[1, 3, 7, 15, 30].map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                            {period} Day{period > 1 ? "s" : ""}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
