import { AppProviders } from "@/components/providers/AppProviders"
import { FavoritesProvider } from "@/contexts/favorites-context"
import type { Metadata } from "next"
import type React from "react"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
    title: "Stockcast - Bangladesh Stock Market Live Data",
    description: "Real-time Bangladesh stock market data, charts, and forecasting tools",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
            </head>
            <body>
                <AppProviders>
                    <FavoritesProvider>
                        {children}
                        <Toaster position="bottom-right" richColors />
                    </FavoritesProvider>
                </AppProviders>
            </body>
        </html>
    )
}
