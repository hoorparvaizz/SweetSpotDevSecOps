import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Share2, 
  Clock, 
  Truck, 
  Shield,
  ArrowLeft,
  Plus,
  Minus
} from "lucide-react";
import type { Product, Review } from "@/types";

export default function ProductDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [imageError, setImageError] = useState(false);

  const productId = parseInt(params.id as string);

  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["/api/products", { 
      categoryId: product?.categoryId,
      isActive: true 
    }],
    enabled: !!product?.categoryId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await addToCart.mutateAsync({
        productId,
        quantity,
        specialRequests: specialRequests || undefined,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${quantity} ${product?.name} added to your cart`,
      });
    },
  });

  if (productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Product Not Found</h2>
        <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/products")}>
          Browse Products
        </Button>
      </div>
    );
  }

  const isFav = isFavorite(productId);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const relatedProductsFiltered = relatedProducts
    .filter((p: Product) => p.id !== productId)
    .slice(0, 4);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        onClick={() => setLocation("/products")}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      {/* Product Details */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-muted">
            {product.imageUrl && !imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-96 gradient-sweet flex items-center justify-center">
                <span className="text-white text-8xl">🧁</span>
              </div>
            )}
            
            {/* Quick actions overlay */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 rounded-full p-0 bg-white/90"
                onClick={() => toggleFavorite(productId)}
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
                className="w-10 h-10 rounded-full p-0 bg-white/90"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Stock status badge */}
            <div className="absolute top-4 left-4">
              <Badge 
                variant={product.stock > 0 ? "default" : "destructive"}
                className="shadow-md"
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground">{product.description}</p>

            <div className="text-3xl font-bold text-primary">
              ${parseFloat(product.price).toFixed(2)}
              <span className="text-lg text-muted-foreground font-normal ml-2">each</span>
            </div>
          </div>

          {/* Dietary badges */}
          {product.dietary && product.dietary.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.dietary.map((diet) => (
                <Badge
                  key={diet}
                  variant="outline"
                  className="bg-sweet-mint/10 text-sweet-mint border-sweet-mint/20"
                >
                  {diet}
                </Badge>
              ))}
            </div>
          )}

          {/* Product info cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-card/50">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Prep Time</p>
                <p className="text-xs text-muted-foreground">
                  {product.prepTimeMinutes ? `${product.prepTimeMinutes} mins` : "Varies"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-card/50">
              <CardContent className="p-4 text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Delivery</p>
                <p className="text-xs text-muted-foreground">Same day</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-card/50">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Fresh</p>
                <p className="text-xs text-muted-foreground">Made to order</p>
              </CardContent>
            </Card>
          </div>

          {/* Quantity and Special Requests */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-full p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-4">
                  {product.stock} available
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Special Requests (Optional)</label>
              <Textarea
                placeholder="Any special requests or customizations..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full gradient-sweet text-white"
              onClick={() => addToCartMutation.mutate()}
              disabled={product.stock === 0 || addToCartMutation.isPending}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
            
            <div className="text-center">
              <p className="text-lg font-semibold">
                Total: ${(parseFloat(product.price) * quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
        
        {reviewsLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <Card key={review.id} className="border-0 shadow-md bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.customer.profileImageUrl || ""} />
                      <AvatarFallback className="gradient-sweet text-white">
                        {review.customer.firstName?.[0]}{review.customer.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {review.customer.firstName} {review.customer.lastName}
                          </p>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt || "").toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProductsFiltered.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProductsFiltered.map((relatedProduct: Product) => (
              <Card 
                key={relatedProduct.id}
                className="card-hover cursor-pointer border-0 shadow-lg bg-card/50"
                onClick={() => setLocation(`/products/${relatedProduct.id}`)}
              >
                <div className="relative overflow-hidden">
                  {relatedProduct.imageUrl ? (
                    <img
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 gradient-sweet flex items-center justify-center">
                      <span className="text-white text-2xl">🧁</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-primary font-bold">
                    ${parseFloat(relatedProduct.price).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
