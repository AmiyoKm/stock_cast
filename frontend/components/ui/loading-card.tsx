"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoadingCardProps {
    title: string
}

/**
 * A reusable loading card component that displays a spinner
 * Used to show loading state in table components
 */
export function LoadingCard({ title }: LoadingCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="font-serif text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </CardContent>
        </Card>
    )
}
