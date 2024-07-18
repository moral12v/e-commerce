import { model, Schema } from 'mongoose';

const premiumEventSchema = Schema(
    {
        name: { type: String, index: true },
        description: { type: String },
        slug: { type: String, index: true },
        image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
        category: { type: [{ type: Schema.ObjectId, ref: 'category' }], default: [] },
        subCategory: { type: [{ type: Schema.ObjectId, ref: 'sub_category' }], default: [] },
        segment: { type: [{ type: Schema.ObjectId, ref: 'segment' }], default: [] },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    {
        timestamps: true,
    },
);

const PremiumEvent = model('premiumEvent', premiumEventSchema);

export default PremiumEvent;
