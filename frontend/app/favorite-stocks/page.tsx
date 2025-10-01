import FavoriteStocksTable from "@/components/favorite-stocks-table";
import { Header } from "@/components/header";

export default function FavoriteStocksPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 space-y-8">
                <h1 className="text-3xl font-bold mb-6">Favorite Stocks</h1>
                <FavoriteStocksTable />
            </main>
        </div >
    );
}
