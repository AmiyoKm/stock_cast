"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorCardProps {
    title: string
    errorMessage?: string
}

/**
 * A reusable error card component to display error states
 * Used to show error messages in table components
 */
export function ErrorCard({ title, errorMessage = "An error occurred loading data" }: ErrorCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="font-serif text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                    {errorMessage}
                </div>
            </CardContent>
        </Card>
    )
}
