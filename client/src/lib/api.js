import { apiRequest } from "./queryClient";
// Product API
export const productApi = {
    getAll: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.categoryId)
            searchParams.set("categoryId", params.categoryId);
        if (params?.vendorId)
            searchParams.set("vendorId", params.vendorId);
        if (params?.search)
            searchParams.set("search", params.search);
        if (params?.tags)
            searchParams.set("tags", params.tags.join(","));
        if (params?.dietary)
            searchParams.set("dietary", params.dietary.join(","));
        return apiRequest("GET", `/api/products?${searchParams.toString()}`);
    },
    getById: (id) => apiRequest("GET", `/api/products/${id}`),
    create: (data) => apiRequest("POST", "/api/products", data),
    update: (id, data) => apiRequest("PUT", `/api/products/${id}`, data),
    delete: (id) => apiRequest("DELETE", `/api/products/${id}`),
    getVendorProducts: () => apiRequest("GET", "/api/vendor/products"),
};
// Cart API
export const cartApi = {
    getItems: () => apiRequest("GET", "/api/cart"),
    addItem: (data) => apiRequest("POST", "/api/cart", data),
    updateItem: (id, quantity) => apiRequest("PUT", `/api/cart/${id}`, { quantity }),
    removeItem: (id) => apiRequest("DELETE", `/api/cart/${id}`),
    clear: () => apiRequest("DELETE", "/api/cart"),
};
// Orders API
export const orderApi = {
    getAll: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status)
            searchParams.set("status", params.status);
        return apiRequest("GET", `/api/orders?${searchParams.toString()}`);
    },
    getById: (id) => apiRequest("GET", `/api/orders/${id}`),
    create: (data) => apiRequest("POST", "/api/orders", data),
    updateStatus: (id, status) => apiRequest("PUT", `/api/orders/${id}/status`, { status }),
};
// Favorites API
export const favoritesApi = {
    getAll: () => apiRequest("GET", "/api/favorites"),
    add: (productId) => apiRequest("POST", "/api/favorites", { productId }),
    remove: (productId) => apiRequest("DELETE", `/api/favorites/${productId}`),
    check: (productId) => apiRequest("GET", `/api/favorites/${productId}/check`),
};
// Reviews API
export const reviewApi = {
    getProductReviews: (productId) => apiRequest("GET", `/api/products/${productId}/reviews`),
    create: (productId, data) => apiRequest("POST", `/api/products/${productId}/reviews`, data),
};
// Vendor API
export const vendorApi = {
    getStats: () => apiRequest("GET", "/api/vendor/stats"),
};
// Categories API
export const categoryApi = {
    getAll: () => apiRequest("GET", "/api/categories"),
};
