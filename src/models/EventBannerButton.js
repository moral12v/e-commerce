import { Schema, model } from 'mongoose';

const eventBannerButtonSchema = Schema(
  {
    title: { type: String },
    bg_color: { type: [String], default: [] },
    dark_bg_color: { type: [String], default: [] },
    font_color: { type: String, default: '000000' },
    dark_font_color: { type: String, default: '000000' },
    isGradient: { type: Boolean, default: false },
    logo: { type: Schema.ObjectId, ref: 'file', default: null },
    darkLogo: { type: Schema.ObjectId, ref: 'file', default: null },
    type: { type: String, enum: ['segment', 'category', 'sub_category', 'package', 'product'], require: true },
    typeId: { type: Schema.ObjectId, require: true },
  },
  {
    timestamps: true,
  },
);

const EventBannerButton = model('eventBannerButton', eventBannerButtonSchema);

export default EventBannerButton;
