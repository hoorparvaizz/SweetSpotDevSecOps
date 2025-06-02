import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  stock: { type: Number, default: 0 },
  dietary: [{ type: String }],
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema); 