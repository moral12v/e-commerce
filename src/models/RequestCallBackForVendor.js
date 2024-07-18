import { model, Schema } from 'mongoose';


const RequestCallBackForVendorSchema = Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'vendor_product', default: null, },
        vendorId: { type: Schema.Types.ObjectId, ref: 'vendor', default: null, },
        name: { type: String, index: true, default: '', },
        mobile: { type: String, index: true, default: '', },
        query: { type: String, index: true, default: '' },
    },
    {
        timestamps: true,
    },
);

const RequestCallBackForVendor = model('RequestCallBackForVendor', RequestCallBackForVendorSchema);

export default RequestCallBackForVendor;
