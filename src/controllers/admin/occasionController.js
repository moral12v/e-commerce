import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
    sendResponseWithData,
    sendResponseWithoutData,
    sendErrorResponse,
    removeSpace,
} from '../../helpers/helper.js';
import Occasion from '../../models/Occasion.js';


export const createOccasion = async (req, res) => {
    try {
        let { giftType } = req.body;
        let user = req.apiUser;
        let occasionName = removeSpace(req.body.name.toLowerCase(), "-");
        let createSlug = `${occasionName}-${Date.now()}`;
        let checkSlugExists = await Occasion.findOne({ slug: createSlug, isDeleted: false });

        if (checkSlugExists) {
            return sendResponseWithoutData(res, 400, false, 'Occasion addition failed, try again in sometime!');
        }

        const dataSave = await Occasion.create({
            name: req.body.name,
            slug: createSlug,
            giftType: giftType,
            createdBy: user._id,
            updatedBy: user._id,
        });

        if (dataSave) {
            return sendResponseWithoutData(res, 200, true, 'Occasion has been added Successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
        }
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};

export const listOccasion = async (req, res) => {
    try {
        let filter = { isDeleted: false };
        let data = await Occasion.find(filter).populate({ path: 'giftType', select: "name slug" }).sort({ createdAt: -1 })
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

export const occasionDetails = async (req, res) => {
    try {
        let occasionId = req?.params?.id;

        if (occasionId && isValidObjectId(occasionId)) {
            let occasionInfo = await Occasion.findOne({ _id: occasionId, isDeleted: false }).populate({ path: 'giftType', select: "name slug" })
                .select('-isDeleted -__v')
                .lean();

            if (!occasionInfo) {
                return sendResponseWithoutData(res, 400, false, 'Invalid occasion id!');
            }

            return sendResponseWithData(res, 200, true, 'Occasion details fetched successfully!', occasionInfo);
        } else {
            return sendResponseWithoutData(res, 400, false, 'Invalid occasion id!');
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const updateOccasion = async (req, res) => {
    try {
        let user = req.apiUser;
        let { giftType } = req.body;
        let updatedData = {
            name: req.body.name,
            isActive: req.body.isActive,
            updatedBy: user._id,
            updatedAt: Date.now(),
        };


        if ('slug' in req.body && req.body.slug) {
            let occasionName = removeSpace(req.body.slug.toLowerCase(), "-")
            updatedData.slug = occasionName;
        }


        if (giftType && Array.isArray(giftType)) {
            let giftTypeArr = []
            for (let gift of giftType) {
                if (!gift || !isValidObjectId(gift)) {
                    return sendResponseWithoutData(res, 400, false, 'Invalid id!');
                }
                giftTypeArr.push(gift)
            }
            updatedData.giftType = giftTypeArr
        }

        let dataSave = await Occasion.updateOne(
            { _id: req.body.id },
            {
                $set: updatedData,
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Occasion has been updated successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const deleteOccasion = async (req, res) => {
    try {
        let occasionId = req?.params?.id;

        if (!isValidObjectId(occasionId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid occasion Id!');
        }

        const occasionInfo = await Occasion.findOne({ _id: occasionId, isDeleted: false });

        if (!occasionInfo) {
            return sendResponseWithoutData(res, 400, false, 'Invalid occasion Id!');
        }

        let dataSave = await Occasion.updateOne(
            { _id: occasionId },
            {
                $set: {
                    isDeleted: true,
                },
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Occasion has been deleted Successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

