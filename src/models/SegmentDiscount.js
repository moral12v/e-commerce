import { model, Schema } from 'mongoose';

const segmentDiscountSchema = Schema(
    {
        segmentId: { type: Schema.Types.ObjectId, ref: 'segment', index: true },
        discountValue: { type: String, index: true },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: String },
        updatedBy: { type: String }
    },
    { timestamps: true },
);

const SegmentDiscount = model('segmentDiscount', segmentDiscountSchema);

export default SegmentDiscount;