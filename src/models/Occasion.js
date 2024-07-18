import { model, Schema } from 'mongoose';

const occasionSchema = Schema(
    {
        name: { type: String, index: true },
        slug: { type: String, index: true },
        giftType: { type: [{ type: Schema.ObjectId, ref: 'gift_type' }], default: [] },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    {
        timestamps: true,
    },
);

const Occasion = model('occasion', occasionSchema);

export default Occasion;
