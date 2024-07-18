import { errorLog } from "../../../config/logger.js";
import { sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from "../../helpers/helper.js";
import RequestCallBackForVendor from "../../models/RequestCallBackForVendor.js";


export const requestQueryLists = async (req, res) => {
    try {
        let user = req.apiUser;
        const page = req.body.page || 1;
        const count = req.body.count || 10;
        const totalCount = await RequestCallBackForVendor.countDocuments();
        let requestCallbacks = await RequestCallBackForVendor.find({ vendorId: user._id }).select('-createdAt -updatedAt -__v').skip((page - 1) * count)
            .limit(count).lean();
        if (requestCallbacks.length > 0) {

            return sendResponseWithData(res, 200, true, 'Request Queries list fetched successfully.', requestCallbacks, { count: totalCount });
        }

        return sendResponseWithoutData(res, 400, false, 'No Request Queries found!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};


// export const requestCallBackDetails = async (req, res) => {
//     try {
//         let { id } = req.params
//         let requestCallbacks = await RequestCallBack.findOne({ _id: id }).select('-createdAt -updatedAt -__v').lean();


//         if (requestCallbacks) {

//             return sendResponseWithData(res, 200, true, 'Request Callbacks details fetched successfully.', requestCallbacks);
//         }

//         return sendResponseWithoutData(res, 400, false, 'No Request Callbacks found!');
//     } catch (error) {
//         errorLog(error);
//         sendErrorResponse(res);
//     }
// };