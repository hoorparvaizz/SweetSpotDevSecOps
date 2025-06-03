import { createContext, useContext, useReducer, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_ITEMS":
      const total = action.payload.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.product?.price || 0),
        0
      );
      return { ...state, items: action.payload, total };
    case "ADD_ITEM":
      const newItems = [...state.items, action.payload];
      const addTotal = newItems.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.product?.price || 0),
        0
      );
      return { ...state, items: newItems, total: addTotal };
    case "UPDATE_ITEM":
      const updatedItems = state.items.map((item) =>
        item._id === action.payload._id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const updateTotal = updatedItems.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.product?.price || 0),
        0
      );
      return { ...state, items: updatedItems, total: updateTotal };
    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(
        (item) => item._id !== action.payload,
      );
      const filteredTotal = filteredItems.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.product?.price || 0),
        0
      );
      return { ...state, items: filteredItems, total: filteredTotal };
    case "CLEAR_CART":
      return { ...state, items: [], total: 0 };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
    total: 0,
  });
  // Fetch cart items
  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });
  useEffect(() => {
    if (cartItems) {
      dispatch({ type: "SET_ITEMS", payload: cartItems });
    }
  }, [cartItems]);
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, notes }) => {
      const response = await apiRequest("POST", "/api/cart", {
        productId,
        quantity,
        notes,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart!",
        description: "Item has been added to your cart.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });
  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await apiRequest("PUT", `/api/cart/${itemId}`, {
        quantity,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    },
  });
  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });
  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      dispatch({ type: "CLEAR_CART" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    },
  });
  const addToCart = (productId, quantity = 1, notes) => {
    addToCartMutation.mutate({ productId, quantity, notes });
  };
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    updateQuantityMutation.mutate({ itemId, quantity });
  };
  const removeFromCart = (itemId) => {
    removeFromCartMutation.mutate(itemId);
  };
  const clearCart = () => {
    clearCartMutation.mutate();
  };
  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
