export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: "customer" | "vendor";
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  vendorId: string;
  name: string;
  description?: string;
  price: string;
  categoryId?: number;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  tags?: string[];
  prepTimeMinutes?: number;
  dietary?: string[];
  createdAt?: string;
  updatedAt?: string;
  vendor?: User;
  category?: Category;
}

export interface CartItem {
  id: number;
  customerId: string;
  productId: number;
  quantity: number;
  specialRequests?: string;
  createdAt?: string;
  product: Product;
}

export interface Favorite {
  id: number;
  customerId: string;
  productId: number;
  createdAt?: string;
  product: Product;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  specialRequests?: string;
  product: Product;
}

export interface Order {
  id: number;
  customerId: string;
  vendorId: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  subtotal: string;
  tax: string;
  deliveryFee: string;
  total: string;
  deliveryAddress?: any;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  createdAt?: string;
  updatedAt?: string;
  orderItems: OrderItem[];
  customer?: User;
  vendor?: User;
}

export interface Subscription {
  id: number;
  customerId: string;
  vendorId: string;
  planType: "monthly" | "weekly";
  preferences?: any;
  isActive: boolean;
  nextDeliveryDate?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: User;
  vendor?: User;
}

export interface Review {
  id: number;
  productId: number;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  customer: User;
}

export interface VendorStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  averageRating: number;
}
