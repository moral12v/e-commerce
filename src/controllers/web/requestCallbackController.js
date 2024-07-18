import { errorLog } from '../../../config/logger.js';
import { sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from '../../helpers/helper.js';
import RequestCallBack from '../../models/RequestCallbacks.js';

export const createRequestCallbacks = async (req, res) => {
    try {

        let { name, mobile, queries } = req.body;
        let newData = {};
        if ('name' in req.body) {
            newData.name = name
        }
        if ('mobile' in req.body) {
            newData.mobile = mobile
        }
        if ('queries' in req.body) {
            newData.queries = queries
        }

        let newRequestCallback = await RequestCallBack.create(newData);

        if (newRequestCallback) {
            return sendResponseWithoutData(res, 200, true, 'Request Callback created successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Fail to creation Request Callback!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};


