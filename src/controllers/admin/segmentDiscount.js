import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
    sendResponseWithData,
    sendResponseWithoutData,
    sendErrorResponse,
    removeFilter,

} from '../../helpers/helper.js';
import Category from '../../models/Category.js';
import SegmentDiscount from '../../models/SegmentDiscount.js';


export const createSegmentDiscount = async (req, res) => {
    try {
        let user = req.apiUser;
        let { discountValue } = req.body;

        if (discountValue <= 0 || discountValue >= 100) {
            return sendResponseWithoutData(res, 400, false, 'Discount value should be greater than 0 and less then 100!');
        }
        const dataSave = await SegmentDiscount.create({
            segmentId: req.body.segmentId,
            discountValue: discountValue,
            createdBy: user._id,
            updatedBy: user._id,
        });

        if (dataSave) {
            return sendResponseWithoutData(res, 200, true, 'Segment discount has been added Successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Failed to segment discount insertion!');
        }
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};

export const listSegmentDiscount = async (req, res) => {
    try {
        const hostname = req.headers.host;
        const protocol = req.protocol;
        let filter = { isDeleted: false };

        let data = await SegmentDiscount.find(filter)
            .select('-isDeleted -__v').populate({ path: 'segmentId', select: "-isActive -isDeleted -__v", populate: { path: "image", select: "_id url" } })
            .lean();

        for (let segment of data) {
            const image = segment.segmentId.image;
            if (image && 'url' in image && image.url.length > 0) {
                image.url = image.url.map(item => `${protocol}://${hostname}/${item}`);
            } else {
                segment.segmentId.image = null;
            }
        }

        if (data && data.length > 0) {

            return sendResponseWithData(res, 200, true, 'Segment discount list get Successfully', data, true);
        }

        return sendResponseWithData(res, 200, true, 'No Segment found', data, true);
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const segmentDiscountDetails = async (req, res) => {
    try {
        const hostname = req.headers.host;
        const protocol = req.protocol;
        let segmentId = req?.params?.id;

        if (segmentId && isValidObjectId(segmentId)) {
            let segmentInfo = await SegmentDiscount.findOne({ _id: segmentId, isDeleted: false }).populate({ path: 'segmentId', select: "-isActive -isDeleted -__v", populate: { path: "image", select: "_id url" } })
                .select('-isDeleted -__v')
                .lean();

            if (!segmentInfo) {
                return sendResponseWithoutData(res, 400, false, 'Invalid segment discount id!');
            }

            if (segmentInfo && segmentInfo.segmentId.image && 'url' in segmentInfo.segmentId.image && segmentInfo.segmentId.image.url.length > 0) {
                segmentInfo.segmentId.image.url = segmentInfo.segmentId.image.url.map((item) => {
                    return `${protocol}://${hostname}/${item}`;
                });
            }

            return sendResponseWithData(res, 200, true, 'Segment discount details fetched successfully!', segmentInfo);
        } else {
            return sendResponseWithoutData(res, 400, false, 'Invalid segment discount id!');
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const updateSegmentDiscount = async (req, res) => {
    try {
        let user = req.apiUser;

        let updatedData = {
            updatedBy: user._id,
            updatedAt: Date.now(),
        };

        if ('segmentId' in req.body && req.body.segmentId) {
            updatedData.segmentId = req.body.segmentId;
        }
        if ('discountValue' in req.body && req.body.discountValue) {
            updatedData.discountValue = req.body.discountValue;
        }

        let dataSave = await SegmentDiscount.updateOne(
            { _id: req.body.id },
            {
                $set: updatedData,
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Segment discount has been updated successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Failed to segment discount update!');
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const deleteSegmentDiscount = async (req, res) => {
    try {
        let segmentId = req?.params?.id;

        if (!segmentId || !isValidObjectId(segmentId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid segment discount Id!');
        }

        const segmentInfo = await SegmentDiscount.findOne({ _id: segmentId, isDeleted: false });

        if (!segmentInfo) {
            return sendResponseWithoutData(res, 400, false, 'Invalid segment Id!');
        }

        let dataSave = await SegmentDiscount.updateOne(
            { _id: segmentId },
            {
                $set: {
                    isDeleted: true,
                },
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Segment discount has been deleted Successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Failed to segment discount deletion!');
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};
