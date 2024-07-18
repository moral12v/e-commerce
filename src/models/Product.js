import { model, Schema } from 'mongoose';

const productSchema = Schema(
  {
    name: { type: String, index: true },
    description: { type: String },
    hindiDescription: { type: String },
    hindiName: { type: String },
    subCategory: { type: Schema.ObjectId, index: true, ref: 'sub_category', default: null },
    category: { type: Schema.ObjectId, index: true, ref: 'category' },
    segment: { type: Schema.ObjectId, index: true, ref: 'segment' },
    image: { type: [Schema.Types.ObjectId], index: true, ref: 'file', default: null },
    videoUrl: { type: String, default: null },
    deliveryType: { type: String, enum: ['local', 'partner', 'both '], index: true, require: true },
    mrp: { type: Number, index: true, default: 0 },
    price: { type: Number, index: true, default: 0 },
    vendorPrice: { type: Number, index: true, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const Product = model('product', productSchema);

export default Product;