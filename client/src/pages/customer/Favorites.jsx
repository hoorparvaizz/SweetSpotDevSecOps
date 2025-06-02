import { useFavorites } from "@/hooks/useFavorites";
import ProductCard from "@/components/ui/ProductCard";

export default function Favorites() {
  const { favorites, isLoading } = useFavorites();
  console.log("Favorites data in standalone page:", favorites); // Debug log

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Your Favorites</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : favorites.length === 0 ? (
        <div className="text-muted-foreground">No favorites yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <ProductCard key={fav.productId._id || fav.productId} product={fav.productId} />
          ))}
        </div>
      )}
    </div>
  );
} 