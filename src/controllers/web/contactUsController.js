import { errorLog } from '../../../config/logger.js';
import { sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from '../../helpers/helper.js';
import ContactUs from '../../models/ContactUs.js';


export const createQuery = async (req, res) => {
    try {

        let { name, mobile, query } = req.body;

        let newData = {};

        if ('name' in req.body) {
            newData.name = name
        }
        if ('mobile' in req.body) {
            newData.mobile = mobile
        }
        if ('query' in req.body) {
            newData.query = query
        }

        let queryAdded = await ContactUs.create(newData);

        if (queryAdded) {
            return sendResponseWithoutData(res, 200, true, 'Query created successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Fail to creation query!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};


