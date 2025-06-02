import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  specialRequests: { type: String },
}, { timestamps: true });

CartItemSchema.index({ customerId: 1, productId: 1 }, { unique: true });

export default mongoose.model('CartItem', CartItemSchema); 