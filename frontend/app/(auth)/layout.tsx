import React from 'react'
import Link from 'next/link'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <div className="flex flex-col gap-6">
                    <Link href="/" className="flex items-center gap-2 self-center font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <span className="text-xs font-bold">S</span>
                        </div>
                        Stockcast
                    </Link>
                    <div className="mx-auto grid w-full max-w-md gap-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default layout
