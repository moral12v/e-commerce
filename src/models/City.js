import { model, Schema } from 'mongoose';

const citySchema = Schema(
  {
    name: { type: String, required: true, index: true },
    stateId: { type: Schema.ObjectId, ref: 'state', required: true, index: true },
    stateCode: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true, required: true, index: true },
  },
  { timestamps: true },
);

const City = model('city', citySchema);
export default City;