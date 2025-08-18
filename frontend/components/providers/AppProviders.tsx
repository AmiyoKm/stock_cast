"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextTopLoader from "nextjs-toploader";
import React from "react";
import { ThemeProvider } from "../theme-provider";
export function AppProviders({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <NextTopLoader color="#10b981" showSpinner={false} />
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}
