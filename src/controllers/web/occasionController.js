import { errorLog } from "../../../config/logger.js";
import { sendErrorResponse, sendResponseWithData } from "../../helpers/helper.js";
import Occasion from "../../models/Occasion.js";


export const listOccasion = async (req, res) => {
    try {
        let filter = { isActive: true, isDeleted: false };
        let data = await Occasion.find(filter).populate({ path: 'giftType', select: "name slug" })
            .select('-isDeleted -__v')
            .lean();

        if (data && data.length > 0) {
            return sendResponseWithData(res, 200, true, 'Occasion list get Successfully', data, true);
        }
        return sendResponseWithData(res, 200, true, 'No occasion found', data, true);
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};