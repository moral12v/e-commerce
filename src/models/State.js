import { model, Schema } from 'mongoose';

const stateSchema = Schema(
  {
    code: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true, required: true, index: true },
  },
  { timestamps: true },
);

const State = model('state', stateSchema);
export default State;