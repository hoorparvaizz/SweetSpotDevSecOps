import express from "express";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "./middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import Review from './models/Review.js';
import CartItem from './models/CartItem.js';
import Favorite from './models/Favorite.js';
import mongoose from "mongoose";

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 },
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

if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production!');
    } else {
        process.env.JWT_SECRET = 'your-secret-key';
        console.warn('[WARNING] JWT_SECRET not set in environment. Using default secret. Set JWT_SECRET in your .env file for production!');
    }
}

export async function registerRoutes(app) {
    app.use(express.json());

    // HEALTH CHECK ENDPOINT
    app.get("/api/health", async (req, res) => {
        try {
            // Check database connection
            const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
            
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: dbStatus,
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            });
        } catch (error) {
            res.status(503).json({
                status: 'error',
                message: 'Service unavailable',
                error: error.message
            });
        }
    });

    // AUTH ROUTES
    app.post("/api/auth/signup", async (req, res) => {
        try {
            const { firstName, lastName, email, password, role } = req.body;
            if (!firstName || !email || !password || !role) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(409).json({ message: "Email already in use" });
            }
            const bcrypt = await import("bcryptjs");
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET || "your-secret-key",
                { expiresIn: "1d" }
            );
            res.cookie("session_token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.status(201).json({
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                token,
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({ message: "Server error during signup" });
        }
    });

    app.post("/api/auth/login", async (req, res) => {
        try {
            const { email, password, role } = req.body;
            if (!email || !password || !role) {
                return res.status(400).json({ message: "Email, password, and role are required" });
            }

            const user = await User.findOne({ email, role });
            if (!user) return res.status(401).json({ message: "Invalid email or password" });

            const bcrypt = await import("bcryptjs");
            const isMatch = await bcrypt.compare(password, user.password || "");
            if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

            const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            res.cookie("session_token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 86400000 });
            res.json({ user: { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, token });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Server error during login" });
        }
    });

    // Serve uploaded files
    app.use("/uploads", express.static("uploads"));

    // Products - Customer Marketplace
    app.get("/api/products", async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const { category, search, dietary, tags, sort } = req.query;
            const query = { isActive: true };

            if (category) {
                query.categoryId = category;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ];
            }

            if (dietary) {
                query.dietary = { $in: dietary.split(',') };
            }

            if (tags) {
                query.tags = { $in: tags.split(',') };
            }

            let sortOption = { createdAt: -1 };
            if (sort === 'price-asc') sortOption = { price: 1 };
            else if (sort === 'price-desc') sortOption = { price: -1 };
            else if (sort === 'newest') sortOption = { createdAt: -1 };
            else if (sort === 'oldest') sortOption = { createdAt: 1 };

            console.log("/api/products query:", query);
            const products = await Product.find(query)
                .populate('categoryId', 'name')
                .sort(sortOption);
            console.log("/api/products found:", products.length);

            if (!products || products.length === 0) {
                return res.status(200).json([]);
            }

            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Failed to fetch products', error: error.message });
        }
    });
    
    // Create a new product
    app.post("/api/products", upload.single('image'), isAuthenticated, async (req, res) => {
        try {
            const { name, description, price, categoryId, stock, prepTimeMinutes, tags, dietary } = req.body;
            const vendorId = req.user.id;
            
            // Validate required fields
            if (!name || !description || !price || !stock) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            
            // Create product data
            const productData = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                vendorId,
                isActive: true
            };
            
            // Add optional fields if they exist
            if (categoryId) productData.categoryId = categoryId;
            if (prepTimeMinutes) productData.prepTimeMinutes = parseInt(prepTimeMinutes, 10);
            if (tags) productData.tags = tags.split(',').map(tag => tag.trim());
            if (dietary) productData.dietary = dietary.split(',').map(item => item.trim());
            if (req.file) productData.imageUrl = `/uploads/${req.file.filename}`;
            
            const product = new Product(productData);
            await product.save();
            
            // Populate category for the response
            await product.populate('categoryId', 'name');
            
            res.status(201).json(product);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'Failed to create product', error: error.message });
        }
    });
    
    // Update a product
    app.put("/api/products/:id", upload.single('image'), isAuthenticated, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, price, categoryId, stock, prepTimeMinutes, tags, dietary, isActive } = req.body;
            
            // Find the product
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            // Verify ownership (vendor can only update their own products)
            if (product.vendorId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this product' });
            }
            
            // Update product data
            if (name) product.name = name;
            if (description) product.description = description;
            if (price) product.price = parseFloat(price);
            if (stock) product.stock = parseInt(stock, 10);
            if (categoryId) product.categoryId = categoryId;
            if (prepTimeMinutes) product.prepTimeMinutes = parseInt(prepTimeMinutes, 10);
            if (tags) product.tags = tags.split(',').map(tag => tag.trim());
            if (dietary) product.dietary = dietary.split(',').map(item => item.trim());
            if (isActive !== undefined) product.isActive = isActive === 'true';
            if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;
            
            await product.save();
            await product.populate('categoryId', 'name');
            
            res.json(product);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Failed to update product', error: error.message });
        }
    });
    
    // Delete a product
    app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
        try {
            const { id } = req.params;
            
            // Find the product
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            // Verify ownership (vendor can only delete their own products)
            if (product.vendorId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this product' });
            }
            
            console.log(`🗑️ DELETING PRODUCT: ${product.name} (ID: ${id})`);
            
            // Step 1: Remove product from all customers' carts
            const cartItemsDeleted = await CartItem.deleteMany({ productId: id });
            console.log(`📝 Removed ${cartItemsDeleted.deletedCount} cart items`);
            
            // Step 2: Remove product from all customers' favorites
            const favoritesDeleted = await Favorite.deleteMany({ productId: id });
            console.log(`❤️ Removed ${favoritesDeleted.deletedCount} favorites`);
            
            // Step 3: Permanently delete the product from database
            await Product.findByIdAndDelete(id);
            console.log(`✅ Product permanently deleted from database`);
            
            res.json({ 
                message: 'Product deleted successfully',
                details: {
                    cartItemsRemoved: cartItemsDeleted.deletedCount,
                    favoritesRemoved: favoritesDeleted.deletedCount,
                    productDeleted: true
                }
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Failed to delete product', error: error.message });
        }
    });
    
    // Vendor products with backend filtering and sorting
    app.get("/api/vendor/products", isAuthenticated, async (req, res) => {
        try {
            const vendorId = req.user.id;
            const {
                search = "",
                category = "all",
                availability = "all",
                status = "all",
                sort = "newest"
            } = req.query;
            const query = { vendorId };
            
            // Status filter
            if (status === "active") {
                query.isActive = true;
            } else if (status === "inactive") {
                query.isActive = false;
            } else if (status === "all") {
                // Show all products when explicitly requested
                // Don't set isActive filter at all
            }
            
            // Category filter
            if (category !== "all") query.categoryId = category;
            // Availability filter
            if (availability === "in") query.stock = { $gt: 0 };
            else if (availability === "out") query.stock = 0;
            // Search filter
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }
            // Sorting
            let sortOption = { updatedAt: -1 };
            if (sort === "price-asc") sortOption = { price: 1 };
            else if (sort === "price-desc") sortOption = { price: -1 };
            else if (sort === "oldest") sortOption = { updatedAt: 1 };
            else if (sort === "newest") sortOption = { updatedAt: -1 };
            
            const products = await Product.find(query)
            .populate('categoryId', 'name')
                .sort(sortOption);
            
            res.json(products);
        } catch (error) {
            console.error("Error in /api/vendor/products:", error);
            res.status(500).json({ 
                message: "Failed to fetch vendor products",
                error: error.message 
            });
        }
    });
    
    app.get("/api/auth/user", isAuthenticated, async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });
    app.post("/api/auth/role", isAuthenticated, async (req, res) => {
        try {
            const userId = req.user.id;
            const { role } = req.body;
            if (!role || !['customer', 'vendor'].includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }
            const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Failed to update role" });
        }
    });
    // Categories
    app.get("/api/categories", async (_req, res) => {
        try {
            const categories = await Category.find().sort({ name: 1 });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch categories" });
        }
    });
    app.post("/api/categories", async (req, res) => {
        try {
            const category = await Category.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ message: "Failed to create category" });
        }
    });
    // Products
    app.get("/api/products/:id", async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product not found" });
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch product" });
        }
    });
    app.put("/api/products/:id", isAuthenticated, upload.single("image"), async (req, res) => {
        try {
            const userId = req.user.id;
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product not found" });
            if (product.vendorId.toString() !== userId) return res.status(403).json({ message: "You can only edit your own products" });
            const updateData = {
                ...req.body,
                ...(req.body.price && { price: parseFloat(req.body.price) }),
                ...(req.body.stock && { stock: parseInt(req.body.stock) }),
                ...(req.body.categoryId && { categoryId: req.body.categoryId }),
                ...(req.body.tags && { tags: req.body.tags.split(",") }),
                ...(req.body.dietary && { dietary: req.body.dietary.split(",") }),
                ...(req.file && { imageUrl: `/uploads/${req.file.filename}` }),
            };
            const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: "Failed to update product" });
        }
    });
    // Cart
    app.get("/api/cart", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            // Populate productId and return as 'product' for frontend compatibility
            const cartItems = await CartItem.find({ customerId }).populate('productId');
            // Map to flatten productId to product
            const result = cartItems.map(item => ({
                _id: item._id,
                product: item.productId,
                quantity: item.quantity,
                specialRequests: item.specialRequests,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch cart" });
        }
    });
    app.post("/api/cart", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { productId, quantity, specialRequests } = req.body;
            const productObjectId = new mongoose.Types.ObjectId(productId);
            // Log the query for debugging
            console.log("Cart query:", { customerId, productId: productObjectId });
            let cartItem = await CartItem.findOne({ customerId, productId: productObjectId });
            if (cartItem) {
                cartItem.quantity += quantity;
                if (specialRequests) cartItem.specialRequests = specialRequests;
                await cartItem.save();
            } else {
                cartItem = await CartItem.create({ customerId, productId: productObjectId, quantity, specialRequests });
            }
            // Populate productId for response
            await cartItem.populate('productId');
            res.status(201).json({
                _id: cartItem._id,
                product: cartItem.productId,
                quantity: cartItem.quantity,
                specialRequests: cartItem.specialRequests,
                createdAt: cartItem.createdAt,
                updatedAt: cartItem.updatedAt
            });
        } catch (error) {
            console.error("POST /api/cart error (full):", error);
            console.error("POST /api/cart error (stack):", error.stack);
            res.status(400).json({ message: "Failed to add to cart", error: error.message });
        }
    });
    app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
        try {
            const { quantity } = req.body;
            let cartItem = await CartItem.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
            if (cartItem) await cartItem.populate('productId');
            res.json(cartItem ? {
                _id: cartItem._id,
                product: cartItem.productId,
                quantity: cartItem.quantity,
                specialRequests: cartItem.specialRequests,
                createdAt: cartItem.createdAt,
                updatedAt: cartItem.updatedAt
            } : null);
        } catch (error) {
            res.status(400).json({ message: "Failed to update cart item" });
        }
    });
    app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
        try {
            await CartItem.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: "Failed to remove from cart" });
        }
    });
    app.delete("/api/cart", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            await CartItem.deleteMany({ customerId });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: "Failed to clear cart" });
        }
    });
    // Favorites
    app.get("/api/favorites", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            const favorites = await Favorite.find({ customerId }).populate('productId');
            res.json(favorites);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch favorites" });
        }
    });
    app.post("/api/favorites", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { productId } = req.body;
            let favorite = await Favorite.findOne({ customerId, productId });
            if (!favorite) {
                favorite = await Favorite.create({ customerId, productId });
                res.status(201).json({ 
                    message: "Product added to favorites",
                    favorite: favorite 
                });
            } else {
                res.status(200).json({ 
                    message: "Product already in favorites",
                    favorite: favorite 
                });
            }
        } catch (error) {
            res.status(400).json({ message: "Failed to add to favorites" });
        }
    });
    app.delete("/api/favorites/:productId", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { productId } = req.params;
            await Favorite.deleteOne({ customerId, productId });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Failed to remove from favorites" });
        }
    });
    app.get("/api/favorites/:productId/check", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { productId } = req.params;
            const isFavorite = !!(await Favorite.findOne({ customerId, productId }));
            res.json({ isFavorite });
        } catch (error) {
            res.status(500).json({ message: "Failed to check favorite status" });
        }
    });
    // Orders
    app.get("/api/orders", isAuthenticated, async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);
            const filters = user?.role === "vendor" ? { vendorId: userId } : { customerId: userId };
            if (req.query.status) filters.status = req.query.status;
            const orders = await Order.find(filters).populate({
                path: 'orderItems.product',
                match: {},  // Include all products regardless of isActive status
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch orders" });
        }
    });
    app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate({
                path: 'orderItems.product',
                match: {},  // Include all products regardless of isActive status
            });
            if (!order) return res.status(404).json({ message: "Order not found" });
            res.json(order);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch order" });
        }
    });
    app.post("/api/orders", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            let { orderData, orderItems } = req.body;
            // If vendorId is not set, get it from the first product in the order
            if (!orderData.vendorId && orderItems.length > 0) {
                const firstProduct = await Product.findById(orderItems[0].productId);
                orderData.vendorId = firstProduct?.vendorId;
            }
            // Map orderItems to correct structure
            const items = orderItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                specialRequests: item.specialRequests,
            }));
            const total = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);
            const order = await Order.create({ ...orderData, customerId, orderItems: items, total });
            await CartItem.deleteMany({ customerId });

            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ message: "Failed to create order", error: error.message });
        }
    });
    app.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
        try {
            const userId = req.user.id;
            const { status } = req.body;
            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ message: "Order not found" });
            if (order.vendorId.toString() !== userId) return res.status(403).json({ message: "You can only update your own orders" });
            order.status = status;
            await order.save();
            console.log("Order status updated:", order._id, "Customer ID:", order.customerId);
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: "Failed to update order status" });
        }
    });
    // Reviews
    app.get("/api/products/:id/reviews", async (req, res) => {
        try {
            const reviews = await Review.find({ productId: req.params.id }).populate('customerId');
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch reviews" });
        }
    });
    app.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
        try {
            const customerId = req.user.id;
            const productId = req.params.id;
            const review = await Review.create({ ...req.body, customerId, productId });
            res.status(201).json(review);
        } catch (error) {
            res.status(400).json({ message: "Failed to create review" });
        }
    });
    // Vendor analytics
    app.get("/api/vendor/stats", isAuthenticated, async (req, res) => {
        try {
            const vendorId = req.user.id;
            const user = await User.findById(vendorId);
            if (user?.role !== "vendor") return res.status(403).json({ message: "Only vendors can access analytics" });
            const totalSales = await Order.aggregate([
                { $match: { vendorId } },
                { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
            ]);
            const activeProducts = await Product.countDocuments({ vendorId, isActive: true });
            const vendorProducts = await Product.find({ vendorId }).select('_id');
            const productIds = vendorProducts.map(p => p._id);
            let averageRating = 0;
            if (productIds.length > 0) {
                const ratingAgg = await Review.aggregate([
                    { $match: { productId: { $in: productIds } } },
                    { $group: { _id: null, avg: { $avg: "$rating" } } }
                ]);
                averageRating = ratingAgg[0]?.avg || 0;
            }
            res.json({
                totalSales: totalSales[0]?.total || 0,
                totalOrders: totalSales[0]?.count || 0,
                activeProducts,
                averageRating,
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch vendor stats" });
        }
    });
    // Vendor profile update (name, email, photo)
    app.put(
      "/api/vendor/profile",
      isAuthenticated,
      upload.single("profileImage"),
      async (req, res) => {
        try {
          console.log("[PROFILE UPDATE] req.body:", req.body);
          console.log("[PROFILE UPDATE] req.file:", req.file);
          const userId = req.user.id;
          const { firstName, lastName, email } = req.body;
          const updateData = {};
          if (firstName) updateData.firstName = firstName;
          if (lastName) updateData.lastName = lastName;
          if (email) updateData.email = email;
          if (req.file) updateData.profileImageUrl = `/uploads/${req.file.filename}`;

          const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
          res.json(updatedUser);
        } catch (error) {
          res.status(400).json({ message: "Failed to update profile", error: error.message });
        }
      }
    );
    // Delete account and all related data
    app.delete("/api/account", isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "vendor") {
          // Delete all products by vendor
          await Product.deleteMany({ vendorId: userId });
          // Delete all orders for this vendor
          await Order.deleteMany({ vendorId: userId });
        } else {
          // Customer: delete their orders
          await Order.deleteMany({ customerId: userId });
          await CartItem.deleteMany({ customerId: userId });
          await Favorite.deleteMany({ customerId: userId });
        }
        // Delete the user
        await User.findByIdAndDelete(userId);
        res.json({ message: "Account and all related data deleted" });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete account", error: error.message });
      }
    });
    // Customer profile update (name, email)
    app.put("/api/customer/profile", isAuthenticated, async (req, res) => {
      try {
        const userId = req.user.id;
        const { firstName, lastName, email } = req.body;
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.json(updatedUser);
      } catch (error) {
        res.status(400).json({ message: "Failed to update profile", error: error.message });
      }
    });
    // Serve uploaded files
    app.use("/uploads", express.static("uploads"));
}
