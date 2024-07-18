import { model, Schema } from 'mongoose';

const CouponUsedSchema = Schema(
  {
    couponId: { type: Schema.Types.ObjectId, ref: 'coupon', index: true, require: true },
    couponCode: { type: String, index: true, require: true },
    amountReduced: { type: Number, index: true, require: true },
    orderDbId: { type: Schema.Types.ObjectId, ref: 'order', index: true, require: true },
    usedBy: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    usedAt: { type: Date, default: Date.now() },
  },
  {
    timestamps: true,
  },
);

const CouponUsed = model('couponUsed', CouponUsedSchema);

export default CouponUsed;