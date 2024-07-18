import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse, removeSpace } from '../../helpers/helper.js';
import GiftType from '../../models/GiftType.js';

export const createGiftType = async (req, res) => {
    try {
        let user = req.apiUser;

        let { name, category, subCategory, } = req.body;

        let giftName = removeSpace(name.toLowerCase(), "-")
        let createSlug = `${giftName}-${Date.now()}`;
        let checkSlugExists = await GiftType.findOne({ slug: createSlug, isDeleted: false });

        if (checkSlugExists) {
            return sendResponseWithoutData(res, 400, false, 'Gift addition failed, try again in sometime!');
        }
        let newData = {
            name: name,
            slug: createSlug,
            category: category,
            subCategory: subCategory,
            createdBy: user._id,
            updatedBy: user._id,
        };

        const dataSave = await GiftType.create(newData);

        if (dataSave) {
            return sendResponseWithoutData(res, 200, true, 'Gift has been created successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Gift creation failed, try again in sometime!');
        }
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};

export const listGiftType = async (req, res) => {
    try {
        const hostname = req.headers.host;
        const protocol = req.protocol;

        let filter = { isDeleted: false };

        let data = await GiftType.find(filter)
            .populate([
                {
                    path: 'category',
                    select: '-__v -isDeleted',
                    populate: { path: 'image', select: '_id url' },
                },
                {
                    path: 'subCategory',
                    select: '-__v -isDeleted',
                    populate: { path: 'image', select: '_id url' },
                },
            ]).sort({ createdAt: -1 })
            .select('-isDeleted -__v')
            .lean();

        if (data.length > 0) {
            for (let solo of data) {
                if ('category' in solo && solo.category) {
                    for (let dataInSolo of solo.category) {
                        if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url) {
                            // let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                            let url = { id: dataInSolo._id, url: `${protocol}://${hostname}/${dataInSolo.image.url}` }
                            dataInSolo.image = url;
                        }
                    }
                }
                if ('subCategory' in solo && solo.subCategory) {
                    for (let dataInSolo of solo.subCategory) {
                        if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url) {
                            // let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                            let url = { id: dataInSolo._id, url: `${protocol}://${hostname}/${dataInSolo.image.url}` }
                            dataInSolo.image = url;
                        }
                    }
                }
            }

            return sendResponseWithData(res, 200, true, 'Gift list fetched successfully!', data,);
        }

        return sendResponseWithoutData(res, 200, true, 'No gift event found',);
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const giftTypeDetails = async (req, res) => {
    try {
        let giftId = req?.params?.id;
        if (!giftId || !isValidObjectId(giftId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid gift id!');
        }

        const hostname = req.headers.host;
        const protocol = req.protocol;

        let data = await GiftType.findOne({ _id: giftId, isDeleted: false })
            .populate([
                { path: 'category', select: '-__v -createdAt -updatedAt -isDeleted', populate: ({ path: 'image', select: "_id url" }) },
                { path: 'subCategory', select: '-__v -createdAt -updatedAt -isDeleted', populate: ({ path: 'image', select: "_id url" }) },

            ])
            .select('-isDeleted -__v')
            .lean();

        if (data) {

            for (let solo of data.category) {
                if ('image' in solo && solo.image && solo.image.url) {
                    // let url = solo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                    let url = { id: solo.image._id, url: `${protocol}://${hostname}/${solo.image.url}` };
                    solo.image = url;
                }
            }

            for (let solo of data.subCategory) {

                if ('image' in solo && solo.image && solo.image.url) {
                    // let url = solo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                    let url = { id: solo.image._id, url: `${protocol}://${hostname}/${solo.image.url}` };
                    solo.image = url;
                }
            }

            return sendResponseWithData(res, 200, true, 'Gift details fetched successfully!', data);
        }

        return sendResponseWithoutData(res, 400, false, 'Invalid gift id!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const updatGiftType = async (req, res) => {
    try {
        let user = req.apiUser;
        let { id, name, category, subCategory } = req.body;

        let updatedData = {
            name: name,
            category: category,
            subCategory: subCategory,
            updatedBy: user._id,
            updatedAt: Date.now(),
        };

        if ('slug' in req.body && req.body.slug) {

            let giftName = removeSpace(req.body.slug.toLowerCase(), "-")
            updatedData.slug = giftName;
        }

        let dataSave = await GiftType.updateOne(
            { _id: id },
            {
                $set: updatedData,
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Gift has been updated successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Gift updation failed, try again in sometime!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const deleteGiftType = async (req, res) => {
    try {
        let giftId = req?.params?.id;
        if (!giftId || !isValidObjectId(giftId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid gift id!');
        }

        const giftInfo = await GiftType.findOne({ _id: giftId, isDeleted: false });

        if (!giftInfo) {
            return sendResponseWithoutData(res, 400, false, 'Invalid gift Id!');
        }

        let dataSave = await GiftType.updateOne(
            { _id: giftId },
            {
                $set: {
                    isDeleted: true,
                },
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Gift has been deleted successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Gift deletion failed, try again in sometime!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};



