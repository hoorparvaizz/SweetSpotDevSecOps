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
    mutationFn: async (productId) => {
      const response = await apiRequest("POST", "/api/favorites", {
        productId,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "Item has been added to your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });
  const removeFromFavorites = useMutation({
    mutationFn: async (productId) => {
      await apiRequest("DELETE", `/api/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });
  const isFavorite = (productId) => {
    return favorites.some((fav) => {
      if (typeof fav.productId === 'object' && fav.productId !== null) {
        return fav.productId._id === productId;
      }
      return fav.productId === productId;
    });
  };
  const toggleFavorite = (productId) => {
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
