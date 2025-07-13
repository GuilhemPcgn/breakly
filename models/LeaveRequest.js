import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeUid: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String },
  attachment: { type: String }, // base64 encoded file
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);