import mongoose from 'mongoose';
import Category from './models/Category.js';

const categories = [
  'Cakes',
  'Cupcakes',
  'Cookies',
  'Brownies & Bars',
  'Pastries',
  'Tarts & Pies',
  'Cheesecakes',
  'Breads & Loaves',
  'Donuts',
  'Macarons',
  'Muffins',
  'Chocolates & Truffles',
  'Ice Cream & Frozen Treats',
  'Seasonal Specials',
  'Dessert Boxes',
  'Gluten-Free Treats',
  'Vegan Desserts',
  'Sugar-Free / Keto',
  'Indian Sweets',
  'Custom Orders',
  'Birthday Cakes',
  'Wedding Cakes',
  'French Pastries',
  'Middle Eastern Sweets',
  'Breakfast Pastries',
  'Savory Bakes',
  'Holiday Specials',
];

async function insertCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetspot');
    for (const name of categories) {
      await Category.updateOne(
        { name },
        { $setOnInsert: { name } },
        { upsert: true }
      );
    }
    console.log('Categories inserted/updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error inserting categories:', err);
    process.exit(1);
  }
}

insertCategories(); 