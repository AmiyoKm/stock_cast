import { type SortDirection, type SortField } from "@/lib/utils/sort"
import { Dispatch, MouseEvent, SetStateAction } from "react"

/**
 * Reusable sort handler for table components
 * Manages sorting state based on field selection
 */
export function useTableSort(
    sortField: SortField,
    setSortField: Dispatch<SetStateAction<SortField>>,
    sortDirection: SortDirection,
    setSortDirection: Dispatch<SetStateAction<SortDirection>>,
    defaultDirection: SortDirection = "asc"
) {
    return (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection(defaultDirection)
        }
    }
}

/**
 * Reusable favorite toggle handler for table components
 * Manages adding/removing stocks from favorites
 */
export function handleFavoriteToggle(
    tradingCode: string,
    e: MouseEvent,
    isFavorite: (_code: string) => boolean,
    addToFavorites: (_code: string) => void,
    removeFromFavorites: (_code: string) => void
) {
    e.stopPropagation()
    if (isFavorite(tradingCode)) {
        removeFromFavorites(tradingCode)
    } else {
        addToFavorites(tradingCode)
    }
}
