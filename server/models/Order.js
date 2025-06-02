import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  specialRequests: { type: String },
});

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderItems: [OrderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  deliveryAddress: { type: Object },
  specialInstructions: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema); 