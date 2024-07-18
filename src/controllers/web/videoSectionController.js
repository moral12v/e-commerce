import { isValidObjectId } from "mongoose";
import { errorLog } from "../../../config/logger.js";
import { sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from "../../helpers/helper.js";
import UploadVideo from "../../models/UploadVideo.js";

export const listVideoSection = async (req, res) => {
    try {
        let filter = { isDeleted: false, isActive: true };
        const page = req.body.page || 1;
        const count = req.body.count || 10;
        let paginationStatus =
            "all" in req.body && req.body.all === true ? true : false;

        const totalCount = await UploadVideo.countDocuments(filter);
        let newData = UploadVideo.find(filter)
            .select('-isDeleted -__v')
            .lean();

        if (paginationStatus) {
            newData = newData.skip((page - 1) * count).limit(count)
        }
        let data = await newData;

        if (data && data.length > 0) {
            return sendResponseWithData(
                res,
                200,
                true,
                "Video section lists fetched successfully!",
                data,
                { count: totalCount }
            );
        }
        return sendResponseWithoutData(
            res,
            400,
            false,
            "Video section lists not found!",
        );
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const videoSectionDetails = async (req, res) => {
    try {
        let { id } = req?.params

        if (!id || !isValidObjectId(id)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid id!');
        }

        let checkVideoSection = await UploadVideo.findOne({ _id: id, isDeleted: false }).select('-isDeleted -__v')


        if (!checkVideoSection) {
            return sendResponseWithoutData(res, 400, false, 'Invalid video section id!');
        }

        return sendResponseWithData(res, 200, true, 'Video section details fetched successfully!', checkVideoSection);

    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};