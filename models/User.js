import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Employee', 'Manager', 'HR'], 
    default: 'Employee',
    required: true 
  },
  department: { type: String },
  manager: { type: String }, // Manager UID
  phoneNumber: { type: String },
  photoURL: { type: String },
  lastLogin: { type: Date },
  leaveBalance: {
    annual: { type: Number, default: 25 }, // jours de congés annuels
    sick: { type: Number, default: 5 }, // jours maladie
    personal: { type: Number, default: 3 }, // jours personnels
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);