import { model, Schema } from "mongoose";

const notificationSchema = Schema(
    {
        userId: { type: Schema.Types.ObjectId, index: true, ref: 'user' },
        title: { type: String, index: true, default: null },
        body: { type: String, index: true, default: null },
        image: { type: String, index: true, default: null },
        url: { type: String, index: true, default: null },
        isRead: { type: Boolean, index: true, default: false }
    },
    { timestamps: true }
);
const Notification = model('notification', notificationSchema);
export default Notification;
