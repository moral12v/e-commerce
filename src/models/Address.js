import { model, Schema } from 'mongoose';

const addressSchema = new Schema(
  {
    userId: { type: Schema.ObjectId, ref: 'user', index: true, required: true },
    title: { type: String, default: null },
    name: { type: String, index: true, required: true },
    type: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home', index: true, required: true },
    mobile: { type: String, required: true },
    alternateMobile: { type: String, default: null },
    street: { type: String, required: true },
    city: { type: Schema.ObjectId, ref: 'city', required: true },
    state: { type: Schema.ObjectId, ref: 'state', required: true },
    country: { type: String, required: true, default: 'India' },
    postalCode: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true },
);

const Address = model('address', addressSchema);

export default Address;