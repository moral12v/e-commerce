import { model, Schema } from 'mongoose';

const ReviewSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
    productId: { type: Schema.Types.ObjectId, ref: 'vendor_product', index: true, require: true },
    rate: { type: Number, index: true, default: 4, min: 3, max: 5 },
    comment: { type: String },
    like: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
);

const Review = model('review', ReviewSchema);

export default Review;
