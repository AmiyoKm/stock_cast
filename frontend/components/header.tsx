"use client"

import { Search, User, Menu, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useFavorites } from "@/contexts/favorites-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  onSearch?: (query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { favorites } = useFavorites() // removed notification functionality
  const router = useRouter()

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
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                  isSearchFocused ? "text-primary" : "text-muted-foreground"
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

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent transition-colors"
              onClick={() => router.push("/watchlist")}
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {favorites.length}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
              <User className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/watchlist")}>
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                  {favorites.length}
                </Badge>
              )}
            </Button>

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
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => router.push("/watchlist")}
                    >
                      <Heart className="h-4 w-4" />
                      My Watchlist ({favorites.length})
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
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
