import { model, Schema } from 'mongoose';

const CouponSchema = Schema(
  {
    code: { type: String, index: true, require: true },
    type: { type: String, required: true, enum: ['flat', 'percentage'], index: true },
    discount: { type: Number, index: true, require: true },
    discountUpTo: { type: Number, default: null },
    totalLimit: { type: Number, default: 1 },
    userLimit: { type: Number, default: 1 },
    expiredAt: { type: Date, default: null },
    isExpired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
  },
  {
    timestamps: true,
  },
);

const Coupon = model('coupon', CouponSchema);

export default Coupon;
