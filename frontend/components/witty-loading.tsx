"use client";

import { useEffect, useState } from "react";

const wittyMessages = [
    "Sharpening pencils...",
    "Consulting financial wizards...",
    "Aligning stock market stars...",
    "Brewing coffee for the algorithms...",
    "Teaching AI to read charts...",
    "Reticulating splines...",
    "Herding cats... I mean, data points...",
    "Polishing the crystal ball...",
    "Asking the magic 8-ball for a stock tip...",
    "Warming up the flux capacitor...",
    "Don't worry, it's just crunching numbers, not your portfolio.",
    "Our AI is asking its mom for financial advice.",
    "Shaking the money tree...",
    "Just waiting for the market to open... on Mars.",
    "Predicting the future is hard. Give us a second.",
    "Compiling financial poetry...",
    "Downloading more RAM for the stock market.",
    "Feeding the hamsters that power our servers.",
    "Optimizing stock-picking squirrels.",
    "Untangling the ticker tape.",
];

const WittyLoading = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(
                (prevIndex) => (prevIndex + 1) % wittyMessages.length,
            );
        }, 3000); // Rotate message every 3 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 h-full">
            <svg
                width="80"
                height="40"
                viewBox="0 0 80 40"
                className="text-primary"
            >
                <path
                    d="M 0 20 L 10 10 L 20 30 L 30 15 L 40 25 L 50 5 L 60 20 L 70 10 L 80 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="120"
                    strokeDashoffset="120"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="120"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
            <p className="text-lg font-semibold text-primary">Loading...</p>
            <p className="text-muted-foreground animate-pulse">
                {wittyMessages[messageIndex]}
            </p>
        </div>
    );
};

export default WittyLoading;
