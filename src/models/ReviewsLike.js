import { model, Schema } from 'mongoose';

const ReviewLikeSchema = Schema(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: 'review', index: true, require: true },
    productId: { type: Schema.Types.ObjectId, ref: 'vendor_product', index: true, require: true },
    likedBy: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
  },
  {
    timestamps: true,
  },
);

const ReviewLike = model('reviewLike', ReviewLikeSchema);

export default ReviewLike;
