import { model, Schema } from 'mongoose';

const roleSchema = Schema(
  {
    name: { type: String, index: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Role = model('role', roleSchema);

export default Role;