import { model, Schema } from 'mongoose';

const poojaPackageSchema = Schema(
  {
    name: { type: String, index: true },
    description: { type: String },
    image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    elements: { type: [{ type: Schema.ObjectId, ref: 'pooja_element', index: true }], default: [] },
    segment: { type: Schema.ObjectId, ref: 'segment', index: true, default: null },
    price: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    offer: { type: Number, index: true, default: 0 },
    stock: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const PoojaPackage = model('pooja_package', poojaPackageSchema);

export default PoojaPackage;
