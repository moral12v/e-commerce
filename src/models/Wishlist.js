import { model, Schema } from 'mongoose';

const wishlistSchema = Schema(
  {
    product: { type: Schema.ObjectId, index: true, ref: 'vendor_product' },
    user: { type: Schema.ObjectId, index: true, ref: 'user' },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const Wishlist = model('wishlist', wishlistSchema);

export default Wishlist;