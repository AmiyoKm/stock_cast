"use client"

import { Button } from "@/components/ui/button"
import { type SortField } from "@/lib/utils/sort"
import { ArrowUpDown } from "lucide-react"
import type React from "react"

interface SortButtonProps {
    field: SortField
    onClick: (field: SortField) => void
    children: React.ReactNode
}

/**
 * A reusable button component for sorting tables
 * Used in stock tables to trigger sorting by different fields
 */
export function SortButton({ field, onClick, children }: SortButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-medium hover:bg-accent transition-colors"
            onClick={() => onClick(field)}
        >
            {children}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )
}
