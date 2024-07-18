import { model, Schema } from 'mongoose';

const customerSchema = Schema(
  {
    userId: { type: Schema.ObjectId, index: true, ref: 'user' },
    name: { type: String, index: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

const Customer = model('user', customerSchema);
export default Customer;
