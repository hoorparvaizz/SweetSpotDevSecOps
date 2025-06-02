import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['customer', 'vendor'], default: 'customer' },
  profileImageUrl: { type: String },
  sessionToken: { type: String, index: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Add a method to get user info for session
UserSchema.methods.toSessionJSON = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    profileImageUrl: this.profileImageUrl
  };
};

export default mongoose.model('User', UserSchema);