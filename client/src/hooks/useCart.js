import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
export function useCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: cartItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/cart"],
    retry: false,
  });
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity = 1, specialRequests }) => {
      const response = await apiRequest("POST", "/api/cart", {
        productId,
        quantity,
        specialRequests,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });
  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart item",
        variant: "destructive",
      });
    },
  });
  const removeFromCart = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });
  const clearCart = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });
  const cartTotal = cartItems.reduce((total, item) => {
    return total + parseFloat(item.product?.price || 0) * item.quantity;
  }, 0);
  const cartCount = cartItems.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
  return {
    cartItems,
    cartTotal,
    cartCount,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
