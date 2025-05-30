import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/favorites"],
    retry: false,
  });

  const addToFavorites = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", "/api/favorites", { productId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "Item has been added to your favorites.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const isFavorite = (productId: number) => {
    return favorites.some((fav: any) => fav.productId === productId);
  };

  const toggleFavorite = (productId: number) => {
    if (isFavorite(productId)) {
      removeFromFavorites.mutate(productId);
    } else {
      addToFavorites.mutate(productId);
    }
  };

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  };
}
