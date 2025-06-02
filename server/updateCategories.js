import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const categories = [
  "Cakes",
  "Cupcakes",
  "Cookies",
  "Brownies & Bars",
  "Pastries",
  "Tarts & Pies",
  "Cheesecakes",
  "Breads & Loaves",
  "Donuts",
  "Macarons",
  "Muffins",
  "Chocolates & Truffles",
  "Ice Cream & Frozen Treats",
  "Seasonal Specials",
  "Dessert Boxes",
  "Gluten-Free Treats",
  "Vegan Desserts",
  "Sugar-Free / Keto",
  "Indian Sweets",
  "Custom Orders"
];

async function updateCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing categories
    await Category.deleteMany({});
    console.log('Removed existing categories');

    // Insert new categories
    const categoryDocs = categories.map(name => ({
      name,
      description: `${name} - Delicious treats for every occasion`,
      isActive: true
    }));

    await Category.insertMany(categoryDocs);
    console.log('Added new categories');

    console.log('Categories updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
}

updateCategories();
