import { errorLog } from "../../../config/logger.js";
import { sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from "../../helpers/helper.js";
import ContactUs from "../../models/ContactUs.js";


export const queryLists = async (req, res) => {
    try {
        const page = req.body.page || 1;
        const count = req.body.count || 10;
        const totalCount = await ContactUs.countDocuments();
        let queries = await ContactUs.find().select('-__v').skip((page - 1) * count)
            .limit(count).lean();
        if (queries.length > 0) {

            return sendResponseWithData(res, 200, true, 'Query lists fetched successfully.', queries, { count: totalCount });
        }

        return sendResponseWithoutData(res, 400, false, 'No Request queries found!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};


export const queryDetails = async (req, res) => {
    try {
        let { id } = req.params
        let query = await ContactUs.findOne({ _id: id, }).select('-__v').lean();
        if (query) {
            return sendResponseWithData(res, 200, true, 'Query details fetched successfully.', query);
        }

        return sendResponseWithoutData(res, 400, false, 'No Request query found!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};