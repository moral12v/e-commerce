import { model, Schema } from 'mongoose';

const eventBannerSchema = Schema(
  {
    title: { type: String, index: true },
    image: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    darkModeImage: { type: Schema.ObjectId, index: true, ref: 'file', default: null },
    font_color: { type: String, default: '000000' },
    dark_font_color: { type: String, default: '000000' },
    buttons: { type: [{ type: Schema.ObjectId, ref: 'eventBannerButton' }], default: [] },
    bg_color: { type: [String], default: [] },
    dark_bg_color: { type: [String], default: [] },
    isGradient: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

const EventBanner = model('eventBanner', eventBannerSchema);

export default EventBanner;
