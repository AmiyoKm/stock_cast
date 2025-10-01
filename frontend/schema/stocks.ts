import z from "zod"

export const favoriteStockSchema = z.object({
    trading_code: z.string()
})
export type favoriteStockType = z.infer<typeof favoriteStockSchema>
