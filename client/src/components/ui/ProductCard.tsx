import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { Heart, ShoppingCart, Star, Share2 } from "lucide-react";
import { useLocation } from "wouter";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  vendorId: string;
  stock: number;
  tags?: string[];
  dietary?: string[];
  isActive: boolean;
}

interface ProductCardProps {
  product: Product;
  showVendorActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  showVendorActions = false, 
  onEdit, 
  onDelete 
}: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [, setLocation] = useLocation();
  const [imageError, setImageError] = useState(false);

  const isCustomer = user?.role !== "vendor";
  const isFav = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart.mutate({ productId: product.id });
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleCardClick = () => {
    setLocation(`/products/${product.id}`);
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { label: "Out of Stock", color: "destructive" };
    if (product.stock <= 5) return { label: "Low Stock", color: "secondary" };
    return { label: "In Stock", color: "default" };
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className="card-hover cursor-pointer group overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 gradient-sweet flex items-center justify-center">
            <span className="text-white text-6xl">🧁</span>
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3">
          <Badge variant={stockStatus.color as any} className="shadow-md">
            {stockStatus.label}
          </Badge>
        </div>

        {/* Action buttons for customers */}
        {isCustomer && (
          <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 rounded-full p-0"
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 rounded-full p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product name and rating */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center space-x-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-muted-foreground">4.8</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Tags */}
          {product.dietary && product.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.dietary.slice(0, 2).map((diet) => (
                <Badge
                  key={diet}
                  variant="outline"
                  className="text-xs bg-sweet-mint/10 text-sweet-mint border-sweet-mint/20"
                >
                  {diet}
                </Badge>
              ))}
            </div>
          )}

          {/* Price and actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xl font-bold text-primary">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground ml-1">each</span>
            </div>

            {isCustomer ? (
              <Button
                size="sm"
                className="gradient-sweet text-white"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            ) : showVendorActions ? (
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(product);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(product);
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : (
              <Badge variant="outline">Stock: {product.stock}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
