import {
  users,
  products,
  orders,
  orderItems,
  cartItems,
  subscriptions,
  favorites,
  reviews,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type CartItem,
  type InsertCartItem,
  type Subscription,
  type InsertSubscription,
  type Favorite,
  type InsertFavorite,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(filters?: { category?: string; search?: string; vendorId?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Cart operations
  getCartItems(customerId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(customerId: string): Promise<void>;
  
  // Order operations
  getOrders(filters?: { customerId?: string; vendorId?: string; status?: string }): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: { productId: string; quantity: number; unitPrice: string; notes?: string }[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Subscription operations
  getSubscriptions(filters?: { customerId?: string; vendorId?: string }): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  
  // Favorites operations
  getFavorites(customerId: string): Promise<(Favorite & { product: Product })[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(customerId: string, productId: string): Promise<void>;
  
  // Review operations
  getProductReviews(productId: string): Promise<(Review & { customer: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
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

  // Product operations
  async getProducts(filters?: { category?: string; search?: string; vendorId?: string }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    if (filters?.category) {
      query = query.where(eq(products.category, filters.category));
    }
    
    if (filters?.search) {
      query = query.where(ilike(products.name, `%${filters.search}%`));
    }
    
    if (filters?.vendorId) {
      query = query.where(eq(products.vendorId, filters.vendorId));
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(customerId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.customerId, customerId))
      .then(rows => rows.map(row => ({ ...row.cart_items, product: row.products! })));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.customerId, item.customerId),
        eq(cartItems.productId, item.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(customerId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));
  }

  // Order operations
  async getOrders(filters?: { customerId?: string; vendorId?: string; status?: string }): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    let query = db.select().from(orders);
    
    if (filters?.customerId) {
      query = query.where(eq(orders.customerId, filters.customerId));
    }
    
    if (filters?.vendorId) {
      query = query.where(eq(orders.vendorId, filters.vendorId));
    }
    
    if (filters?.status) {
      query = query.where(eq(orders.status, filters.status));
    }
    
    const ordersList = await query.orderBy(desc(orders.createdAt));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then(rows => rows.map(row => ({ ...row.order_items, product: row.products! })));
        
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  async getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .then(rows => rows.map(row => ({ ...row.order_items, product: row.products! })));
    
    return { ...order, items };
  }

  async createOrder(order: InsertOrder, items: { productId: string; quantity: number; unitPrice: string; notes?: string }[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Insert order items
    await db.insert(orderItems).values(
      items.map(item => ({
        orderId: newOrder.id,
        ...item,
      }))
    );
    
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Subscription operations
  async getSubscriptions(filters?: { customerId?: string; vendorId?: string }): Promise<Subscription[]> {
    let query = db.select().from(subscriptions);
    
    if (filters?.customerId) {
      query = query.where(eq(subscriptions.customerId, filters.customerId));
    }
    
    if (filters?.vendorId) {
      query = query.where(eq(subscriptions.vendorId, filters.vendorId));
    }
    
    return await query.orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Favorites operations
  async getFavorites(customerId: string): Promise<(Favorite & { product: Product })[]> {
    return await db
      .select()
      .from(favorites)
      .leftJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.customerId, customerId))
      .then(rows => rows.map(row => ({ ...row.favorites, product: row.products! })));
  }

  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFromFavorites(customerId: string, productId: string): Promise<void> {
    await db.delete(favorites).where(
      and(
        eq(favorites.customerId, customerId),
        eq(favorites.productId, productId)
      )
    );
  }

  // Review operations
  async getProductReviews(productId: string): Promise<(Review & { customer: User })[]> {
    return await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .then(rows => rows.map(row => ({ ...row.reviews, customer: row.users! })));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
}

export const storage = new DatabaseStorage();
