import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

// Sample product data
const sampleProducts = [
  {
    name: "Midnight Mocha Brownie",
    description: "Rich, fudgy brownie with a hint of coffee and dark chocolate chunks, topped with a mocha glaze.",
    price: 4.99,
    stock: 20,
    category: "Brownies & Bars",
    dietary: [],
    imageUrl: "/images/brownie.jpg"
  },
  {
    name: "Kesar Peda Tartlets",
    description: "Mini tart shells filled with saffron-infused milk solids, garnished with pistachios and edible silver leaf.",
    price: 3.99,
    stock: 15,
    category: "Indian Sweets",
    dietary: ["vegetarian"],
    imageUrl: "/images/kesar-peda.jpg"
  },
  {
    name: "Vegan Vanilla Cheesecake",
    description: "Creamy cashew-based cheesecake with a gluten-free almond crust, topped with fresh berries.",
    price: 6.99,
    stock: 12,
    category: "Vegan Desserts",
    dietary: ["vegan", "gluten-free"],
    imageUrl: "/images/vegan-cheesecake.jpg"
  },
  {
    name: "Gluten-Free Chocolate Chip Cookies",
    description: "Chewy cookies made with almond and oat flour, packed with dark chocolate chunks and sea salt.",
    price: 3.49,
    stock: 30,
    category: "Gluten-Free Treats",
    dietary: ["gluten-free"],
    imageUrl: "/images/cookies.jpg"
  },
  {
    name: "Seasonal Sampler Box",
    description: "Assortment of seasonal treats including mini tarts, macarons, and truffles. Perfect for gifting!",
    price: 24.99,
    stock: 8,
    category: "Dessert Boxes",
    dietary: [],
    imageUrl: "/images/sampler-box.jpg"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if vendor exists, if not create one
    let vendor = await User.findOne({ email: 'vendor@example.com' });
    
    if (!vendor) {
      console.log('Creating vendor user...');
      const hashedPassword = await bcrypt.hash('vendor123', 10);
      vendor = await User.create({
        firstName: 'Sweet',
        lastName: 'Vendor',
        email: 'vendor@example.com',
        password: hashedPassword,
        role: 'vendor'
      });
      console.log('Vendor user created');
    }

    // Get all categories to map names to IDs
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Delete existing products (optional, remove if you want to keep existing products)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Create sample products
    const productsToInsert = sampleProducts.map(product => ({
      ...product,
      categoryId: categoryMap[product.category],
      vendorId: vendor._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Product.insertMany(productsToInsert);
    console.log('Added sample products');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedDatabase();
