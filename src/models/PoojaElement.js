import { model, Schema } from 'mongoose';

const poojaElementSchema = Schema(
  {
    name: { type: String, index: true },
    description: { type: String },
    image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const PoojaElement = model('pooja_element', poojaElementSchema);

export default PoojaElement;
