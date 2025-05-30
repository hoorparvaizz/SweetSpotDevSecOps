import { apiRequest } from "./queryClient";

// Product API
export const productApi = {
  getAll: (params?: {
    categoryId?: number;
    vendorId?: string;
    search?: string;
    tags?: string[];
    dietary?: string[];
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
    if (params?.vendorId) searchParams.set("vendorId", params.vendorId);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tags) searchParams.set("tags", params.tags.join(","));
    if (params?.dietary) searchParams.set("dietary", params.dietary.join(","));
    
    return apiRequest("GET", `/api/products?${searchParams.toString()}`);
  },
  
  getById: (id: number) => apiRequest("GET", `/api/products/${id}`),
  
  create: (data: FormData) => apiRequest("POST", "/api/products", data),
  
  update: (id: number, data: FormData) => apiRequest("PUT", `/api/products/${id}`, data),
  
  delete: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
  
  getVendorProducts: () => apiRequest("GET", "/api/vendor/products"),
};

// Cart API
export const cartApi = {
  getItems: () => apiRequest("GET", "/api/cart"),
  
  addItem: (data: { productId: number; quantity?: number; specialRequests?: string }) =>
    apiRequest("POST", "/api/cart", data),
  
  updateItem: (id: number, quantity: number) =>
    apiRequest("PUT", `/api/cart/${id}`, { quantity }),
  
  removeItem: (id: number) => apiRequest("DELETE", `/api/cart/${id}`),
  
  clear: () => apiRequest("DELETE", "/api/cart"),
};

// Orders API
export const orderApi = {
  getAll: (params?: { status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    return apiRequest("GET", `/api/orders?${searchParams.toString()}`);
  },
  
  getById: (id: number) => apiRequest("GET", `/api/orders/${id}`),
  
  create: (data: { orderData: any; orderItems: any[] }) =>
    apiRequest("POST", "/api/orders", data),
  
  updateStatus: (id: number, status: string) =>
    apiRequest("PUT", `/api/orders/${id}/status`, { status }),
};

// Favorites API
export const favoritesApi = {
  getAll: () => apiRequest("GET", "/api/favorites"),
  
  add: (productId: number) => apiRequest("POST", "/api/favorites", { productId }),
  
  remove: (productId: number) => apiRequest("DELETE", `/api/favorites/${productId}`),
  
  check: (productId: number) => apiRequest("GET", `/api/favorites/${productId}/check`),
};

// Subscriptions API
export const subscriptionApi = {
  getAll: () => apiRequest("GET", "/api/subscriptions"),
  
  create: (data: any) => apiRequest("POST", "/api/subscriptions", data),
  
  update: (id: number, data: any) => apiRequest("PUT", `/api/subscriptions/${id}`, data),
  
  cancel: (id: number) => apiRequest("DELETE", `/api/subscriptions/${id}`),
};

// Reviews API
export const reviewApi = {
  getProductReviews: (productId: number) => apiRequest("GET", `/api/products/${productId}/reviews`),
  
  create: (productId: number, data: { rating: number; comment?: string }) =>
    apiRequest("POST", `/api/products/${productId}/reviews`, data),
};

// Vendor API
export const vendorApi = {
  getStats: () => apiRequest("GET", "/api/vendor/stats"),
};

// Categories API
export const categoryApi = {
  getAll: () => apiRequest("GET", "/api/categories"),
};
