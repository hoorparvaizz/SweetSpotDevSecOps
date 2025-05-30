import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import {
  insertProductSchema,
  insertCartItemSchema,
  insertFavoriteSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertSubscriptionSchema,
  insertReviewSchema,
} from "@shared/schema";

// File upload configuration
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        categoryId,
        vendorId,
        search,
        tags,
        dietary,
        isActive = "true",
      } = req.query;

      const filters = {
        ...(categoryId && { categoryId: parseInt(categoryId as string) }),
        ...(vendorId && { vendorId: vendorId as string }),
        ...(search && { search: search as string }),
        ...(tags && { tags: (tags as string).split(",") }),
        ...(dietary && { dietary: (dietary as string).split(",") }),
        isActive: isActive === "true",
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, upload.single("image"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "vendor") {
        return res.status(403).json({ message: "Only vendors can create products" });
      }

      const productData = {
        ...req.body,
        vendorId: userId,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock) || 0,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
        prepTimeMinutes: req.body.prepTimeMinutes ? parseInt(req.body.prepTimeMinutes) : null,
        tags: req.body.tags ? req.body.tags.split(",") : [],
        dietary: req.body.dietary ? req.body.dietary.split(",") : [],
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product", error: error.message });
    }
  });

  app.put("/api/products/:id", isAuthenticated, upload.single("image"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.vendorId !== userId) {
        return res.status(403).json({ message: "You can only edit your own products" });
      }

      const updateData = {
        ...req.body,
        ...(req.body.price && { price: parseFloat(req.body.price) }),
        ...(req.body.stock && { stock: parseInt(req.body.stock) }),
        ...(req.body.categoryId && { categoryId: parseInt(req.body.categoryId) }),
        ...(req.body.prepTimeMinutes && { prepTimeMinutes: parseInt(req.body.prepTimeMinutes) }),
        ...(req.body.tags && { tags: req.body.tags.split(",") }),
        ...(req.body.dietary && { dietary: req.body.dietary.split(",") }),
        ...(req.file && { imageUrl: `/uploads/${req.file.filename}` }),
      };

      const product = await storage.updateProduct(productId, updateData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product", error: error.message });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.vendorId !== userId) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }

      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Vendor products
  app.get("/api/vendor/products", isAuthenticated, async (req: any, res) => {
    try {
      const vendorId = req.user.claims.sub;
      const products = await storage.getVendorProducts(vendorId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ message: "Failed to fetch vendor products" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(customerId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const cartItemData = {
        ...req.body,
        customerId,
      };

      const validatedData = insertCartItemSchema.parse(cartItemData);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: "Failed to add to cart", error: error.message });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(parseInt(req.params.id), quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeFromCart(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      await storage.clearCart(customerId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const favorites = await storage.getFavorites(customerId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const favoriteData = {
        ...req.body,
        customerId,
      };

      const validatedData = insertFavoriteSchema.parse(favoriteData);
      const favorite = await storage.addToFavorites(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(400).json({ message: "Failed to add to favorites", error: error.message });
    }
  });

  app.delete("/api/favorites/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      await storage.removeFromFavorites(customerId, productId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get("/api/favorites/:productId/check", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      const isFavorite = await storage.isFavorite(customerId, productId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Orders routes
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const filters = user?.role === "vendor" 
        ? { vendorId: userId }
        : { customerId: userId };
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const { orderData, orderItems } = req.body;

      const orderWithCustomer = {
        ...orderData,
        customerId,
      };

      const validatedOrder = insertOrderSchema.parse(orderWithCustomer);
      const validatedItems = orderItems.map((item: any) => insertOrderItemSchema.parse(item));

      const order = await storage.createOrder(validatedOrder, validatedItems);
      
      // Clear cart after successful order
      await storage.clearCart(customerId);
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Failed to create order", error: error.message });
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only vendor can update order status
      if (order.vendorId !== userId) {
        return res.status(403).json({ message: "You can only update your own orders" });
      }

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  // Subscriptions routes
  app.get("/api/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const filters = user?.role === "vendor" 
        ? { vendorId: userId }
        : { customerId: userId };

      const subscriptions = await storage.getSubscriptions(filters);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const subscriptionData = {
        ...req.body,
        customerId,
      };

      const validatedData = insertSubscriptionSchema.parse(subscriptionData);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: "Failed to create subscription", error: error.message });
    }
  });

  app.put("/api/subscriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.updateSubscription(subscriptionId, req.body);
      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(400).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      await storage.cancelSubscription(subscriptionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      
      const reviewData = {
        ...req.body,
        customerId,
        productId,
      };

      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review", error: error.message });
    }
  });

  // Vendor analytics
  app.get("/api/vendor/stats", isAuthenticated, async (req: any, res) => {
    try {
      const vendorId = req.user.claims.sub;
      const user = await storage.getUser(vendorId);
      
      if (user?.role !== "vendor") {
        return res.status(403).json({ message: "Only vendors can access analytics" });
      }

      const stats = await storage.getVendorStats(vendorId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
      res.status(500).json({ message: "Failed to fetch vendor stats" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
