import {
  users,
  products,
  categories,
  orders,
  orderItems,
  cartItems,
  favorites,
  subscriptions,
  reviews,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type Favorite,
  type InsertFavorite,
  type Subscription,
  type InsertSubscription,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, like, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    vendorId?: string;
    search?: string;
    tags?: string[];
    dietary?: string[];
    isActive?: boolean;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getVendorProducts(vendorId: string): Promise<Product[]>;

  // Cart operations
  getCartItems(customerId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(customerId: string): Promise<void>;

  // Favorites operations
  getFavorites(customerId: string): Promise<(Favorite & { product: Product })[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(customerId: string, productId: number): Promise<void>;
  isFavorite(customerId: string, productId: number): Promise<boolean>;

  // Order operations
  getOrders(filters?: {
    customerId?: string;
    vendorId?: string;
    status?: string;
  }): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Subscription operations
  getSubscriptions(filters?: {
    customerId?: string;
    vendorId?: string;
    isActive?: boolean;
  }): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  cancelSubscription(id: number): Promise<void>;

  // Review operations
  getProductReviews(productId: number): Promise<(Review & { customer: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Analytics
  getVendorStats(vendorId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
    averageRating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: number;
    vendorId?: string;
    search?: string;
    tags?: string[];
    dietary?: string[];
    isActive?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.vendorId) {
      conditions.push(eq(products.vendorId, filters.vendorId));
    }
    
    if (filters?.search) {
      conditions.push(
        sql`${products.name} ILIKE ${`%${filters.search}%`} OR ${products.description} ILIKE ${`%${filters.search}%`}`
      );
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      conditions.push(sql`${products.tags} && ${filters.tags}`);
    }
    
    if (filters?.dietary && filters.dietary.length > 0) {
      conditions.push(sql`${products.dietary} && ${filters.dietary}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));
  }

  // Cart operations
  async getCartItems(customerId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.customerId, customerId))
      .then(rows => 
        rows.map(row => ({
          ...row.cart_items,
          product: row.products!,
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.customerId, cartItem.customerId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(customerId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));
  }

  // Favorites operations
  async getFavorites(customerId: string): Promise<(Favorite & { product: Product })[]> {
    return await db
      .select()
      .from(favorites)
      .leftJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.customerId, customerId))
      .orderBy(desc(favorites.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.favorites,
          product: row.products!,
        }))
      );
  }

  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFromFavorites(customerId: string, productId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.customerId, customerId),
          eq(favorites.productId, productId)
        )
      );
  }

  async isFavorite(customerId: string, productId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.customerId, customerId),
          eq(favorites.productId, productId)
        )
      );
    return !!favorite;
  }

  // Order operations
  async getOrders(filters?: {
    customerId?: string;
    vendorId?: string;
    status?: string;
  }): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    let query = db.select().from(orders);
    
    const conditions = [];
    
    if (filters?.customerId) {
      conditions.push(eq(orders.customerId, filters.customerId));
    }
    
    if (filters?.vendorId) {
      conditions.push(eq(orders.vendorId, filters.vendorId));
    }
    
    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const ordersResult = await query.orderBy(desc(orders.createdAt));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(rows => 
            rows.map(row => ({
              ...row.order_items,
              product: row.products!,
            }))
          );
        
        return {
          ...order,
          orderItems: items,
        };
      })
    );
    
    return ordersWithItems;
  }

  async getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .then(rows => 
        rows.map(row => ({
          ...row.order_items,
          product: row.products!,
        }))
      );
    
    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Add order items
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Subscription operations
  async getSubscriptions(filters?: {
    customerId?: string;
    vendorId?: string;
    isActive?: boolean;
  }): Promise<Subscription[]> {
    let query = db.select().from(subscriptions);
    
    const conditions = [];
    
    if (filters?.customerId) {
      conditions.push(eq(subscriptions.customerId, filters.customerId));
    }
    
    if (filters?.vendorId) {
      conditions.push(eq(subscriptions.vendorId, filters.vendorId));
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(subscriptions.isActive, filters.isActive));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async cancelSubscription(id: number): Promise<void> {
    await db
      .update(subscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptions.id, id));
  }

  // Review operations
  async getProductReviews(productId: number): Promise<(Review & { customer: User })[]> {
    return await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.reviews,
          customer: row.users!,
        }))
      );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Analytics
  async getVendorStats(vendorId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
    averageRating: number;
  }> {
    // Total sales and orders
    const [salesData] = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        totalOrders: count(),
      })
      .from(orders)
      .where(eq(orders.vendorId, vendorId));

    // Active products
    const [productsData] = await db
      .select({
        activeProducts: count(),
      })
      .from(products)
      .where(and(eq(products.vendorId, vendorId), eq(products.isActive, true)));

    // Average rating
    const vendorProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.vendorId, vendorId));

    const productIds = vendorProducts.map(p => p.id);
    
    let averageRating = 0;
    if (productIds.length > 0) {
      const [ratingData] = await db
        .select({
          avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        })
        .from(reviews)
        .where(inArray(reviews.productId, productIds));
      
      averageRating = ratingData?.avgRating || 0;
    }

    return {
      totalSales: Number(salesData?.totalSales) || 0,
      totalOrders: salesData?.totalOrders || 0,
      activeProducts: productsData?.activeProducts || 0,
      averageRating: Number(averageRating),
    };
  }
}

export const storage = new DatabaseStorage();
