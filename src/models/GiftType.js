import { model, Schema } from 'mongoose';

const giftTypeSchema = Schema(
    {
        name: { type: String, index: true },
        slug: { type: String, index: true },
        category: { type: [{ type: Schema.ObjectId, ref: 'category' }], default: [] },
        subCategory: { type: [{ type: Schema.ObjectId, ref: 'sub_category' }], default: [] },
        slug: { type: String, index: true },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    {
        timestamps: true,
    },
);

const GiftType = model('gift_type', giftTypeSchema);

export default GiftType;
