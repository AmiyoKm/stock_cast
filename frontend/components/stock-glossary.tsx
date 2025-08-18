"use client"

import type React from "react"

import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StockTermTooltipProps {
  term: string
  children: React.ReactNode
}

const stockTerms = {
  "TRADING CODE": "The unique identifier of the stock in the market",
  LTP: "Last Traded Price - The current price at which the stock was last traded",
  HIGH: "The highest price at which the stock traded for the day",
  LOW: "The lowest price for the stock in the day",
  CLOSEP: "Closing Price - The price at which the stock ended the trading day",
  YCP: "Yesterday's Closing Price - The previous day's closing price",
  CHANGE: "How much the stock has gained or lost compared to the previous day",
  TRADE: "Total number of trades for the stock",
  VALUE: "Total monetary value of all trades in millions (mn)",
  VOLUME: "The total number of shares that were traded",
}

export function StockTermTooltip({ term, children }: StockTermTooltipProps) {
  const definition = stockTerms[term as keyof typeof stockTerms]

  if (!definition) return <>{children}</>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="h-3 w-3 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StockGlossary() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <HelpCircle className="h-5 w-5" />
        Stock Market Terms
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stockTerms).map(([term, definition]) => (
          <div key={term} className="space-y-1">
            <dt className="font-medium text-sm text-primary">{term}</dt>
            <dd className="text-sm text-muted-foreground">{definition}</dd>
          </div>
        ))}
      </div>
    </div>
  )
}
