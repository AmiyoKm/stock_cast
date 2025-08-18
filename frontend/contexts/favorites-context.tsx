"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { UserFavorite, StockNotification } from "@/types/stock"
import { toast } from "sonner"

interface FavoritesContextType {
  favorites: UserFavorite[]
  notifications: StockNotification[]
  addToFavorites: (tradingCode: string) => void
  removeFromFavorites: (tradingCode: string) => void
  isFavorite: (tradingCode: string) => boolean
  markNotificationAsRead: (notificationId: string) => void
  getUnreadNotificationsCount: () => number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Mock notifications data
const mockNotifications: StockNotification[] = [
  {
    id: "1",
    type: "price_alert",
    tradingCode: "SQURPHARMA",
    title: "Price Alert Triggered",
    message: "SQURPHARMA reached your target price of ৳285.00",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    priority: "high",
    data: { currentPrice: 285.5, targetPrice: 285.0 },
  },
  {
    id: "2",
    type: "volume_spike",
    tradingCode: "BEXIMCO",
    title: "Volume Spike Alert",
    message: "BEXIMCO trading volume increased by 340% in the last hour",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    priority: "medium",
    data: { volumeIncrease: 340 },
  },
  {
    id: "3",
    type: "news",
    tradingCode: "GRAMEENPHONE",
    title: "Company News",
    message: "Grameenphone announces quarterly earnings report",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "earnings",
    tradingCode: "BRACBANK",
    title: "Earnings Report",
    message: "BRAC Bank Q4 earnings exceed expectations by 15%",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isRead: false,
    priority: "high",
  },
  {
    id: "5",
    type: "dividend",
    tradingCode: "CITYBANK",
    title: "Dividend Announcement",
    message: "City Bank declares 12% cash dividend for shareholders",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    isRead: true,
    priority: "medium",
  },
]

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [notifications, setNotifications] = useState<StockNotification[]>(mockNotifications)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("stockcast-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("stockcast-favorites", JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = (tradingCode: string) => {
    const newFavorite: UserFavorite = {
      tradingCode,
      addedAt: new Date().toISOString(),
    }
    setFavorites((prev) => [...prev, newFavorite])
    toast.success(`${tradingCode} added to favorites`, {
      description: "You can view all your favorites in the watchlist",
      duration: 3000,
    })
  }

  const removeFromFavorites = (tradingCode: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.tradingCode !== tradingCode))
    toast.success(`${tradingCode} removed from favorites`, {
      duration: 2000,
    })
  }

  const isFavorite = (tradingCode: string) => {
    return favorites.some((fav) => fav.tradingCode === tradingCode)
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }

  const getUnreadNotificationsCount = () => {
    return notifications.filter((notif) => !notif.isRead).length
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        notifications,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        markNotificationAsRead,
        getUnreadNotificationsCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
