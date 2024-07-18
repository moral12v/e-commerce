import { model, Schema } from 'mongoose';

const uploadVideoSchema = Schema(
    {
        title: { type: String, index: true },
        hindiTitle: { type: String, index: true },
        description: { type: String },
        hindiDescription: { type: String },
        videoUrl: { type: [String], index: true, default: null },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    {
        timestamps: true,
    },
);

const UploadVideo = model('upload_video', uploadVideoSchema);

export default UploadVideo;