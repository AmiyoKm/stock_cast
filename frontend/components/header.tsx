"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/hooks/useAuth"
import { Menu, Search, Star, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ModeToggle } from "./mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface HeaderProps {
    onSearch?: (_query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const router = useRouter()
    const { isLoggedIn, logout } = useAuth()

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                                onClick={() => router.push("/")}
                            >
                                <span className="text-primary-foreground font-bold text-sm">SC</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-serif font-bold text-xl cursor-pointer" onClick={() => router.push("/")}>
                                    Stockcast
                                </h1>
                                <p className="text-sm text-muted-foreground">Bangladesh Stock Market Intelligence</p>
                            </div>
                            <div className="sm:hidden">
                                <h1 className="font-serif font-bold text-lg cursor-pointer" onClick={() => router.push("/")}>
                                    Stockcast
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <Search
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? "text-primary" : "text-muted-foreground"
                                    }`}
                            />
                            <Input
                                placeholder="Search stocks..."
                                className="pl-10 w-64 transition-all duration-200 focus:w-72"
                                onChange={(e) => onSearch?.(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </div>

                        {isLoggedIn ? (
                            <>
                                <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors" onClick={() => router.push('/favorite-stocks')}>
                                    <Star className="h-5 w-5" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
                                            <User className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
                                <Button onClick={() => router.push('/signup')}>Signup</Button>
                            </>
                        )}


                        <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
                            <ModeToggle />
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center space-x-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <div className="space-y-6 mt-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search stocks..."
                                            className="pl-10"
                                            onChange={(e) => onSearch?.(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        {isLoggedIn ? (
                                            <>
                                                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push('/favorite-stocks')}>
                                                    <Star className="h-4 w-4" />
                                                    Favorite Stocks
                                                </Button>
                                                <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                                                    <User className="h-4 w-4" />
                                                    Logout
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push('/login')}>
                                                    Login
                                                </Button>
                                                <Button className="w-full justify-start gap-2" onClick={() => router.push('/signup')}>
                                                    Signup
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
