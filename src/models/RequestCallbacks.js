import { model, Schema } from 'mongoose';


const RequestCallBackSchema = Schema(
    {
        name: { type: String, index: true, default: '', },
        mobile: { type: String, index: true, default: '', },
        queries: { type: String, index: true, default: '' },
    },
    {
        timestamps: true,
    },
);

const RequestCallBack = model('RequestCallBack', RequestCallBackSchema);

export default RequestCallBack;
