import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  comment: { type: String },
}, { timestamps: true });

export default mongoose.model('Review', ReviewSchema); 