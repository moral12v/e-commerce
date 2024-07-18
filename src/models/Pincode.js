import { model, Schema } from 'mongoose';

const pincodeSchema = Schema(
  {
    pincode: { type: String, required: true, index: true },
    office: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: Schema.ObjectId, ref: 'state', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Pincode = model('pincode', pincodeSchema);
export default Pincode;
