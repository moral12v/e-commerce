import { model, Schema } from 'mongoose';

const vendorProductSchema = Schema(
  {
    productId: { type: Schema.ObjectId, index: true, ref: 'product' },
    name: { type: String, index: true },
    slug: { type: String, index: true },
    description: { type: String },
    subCategory: { type: Schema.ObjectId, index: true, ref: 'sub_category', default: null },
    category: { type: Schema.ObjectId, index: true, ref: 'category' },
    segment: { type: Schema.ObjectId, index: true, ref: 'segment' },
    image: { type: [Schema.Types.ObjectId], index: true, ref: 'file', default: null },
    price: { type: Number, index: true, default: 0 },
    vendorPrice: { type: Number, index: true, default: 0 },
    mrp: { type: Number, default: 0 },
    sales: { type: Number, index: true, default: 0 },
    offer: { type: Number, index: true, default: 0 },
    stock: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    adminRating: { type: Number, default: 0 },
    vendor: { type: Schema.ObjectId, index: true, ref: 'user' },
    deliveryType: { type: String, enum: ['local', 'partner', 'both '], index: true, require: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    approvedBy: { type: Schema.ObjectId, index: true, ref: 'user', default: null },
    rejectReason: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const VendorProduct = model('vendor_product', vendorProductSchema);

export default VendorProduct;
