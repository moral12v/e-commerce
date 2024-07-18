import { model, Schema } from 'mongoose';

const contactUsSchema = Schema(
    {
        name: { type: String, index: true, default: '', },
        email: { type: String, index: true },
        mobile: { type: String, index: true, default: '', },
        query: { type: String, index: true, default: '' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
    },
    {
        timestamps: true,
    },
);

const ContactUs = model('Contact_us', contactUsSchema);

export default ContactUs;
