import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse, removeSpace } from '../../helpers/helper.js';
import PremiumEvent from '../../models/PremiumEvent.js';



export const createPremiumEvent = async (req, res) => {
    try {
        let user = req.apiUser;

        let { name, category, subCategory, segment } = req.body;

        let eventName = removeSpace(name.toLowerCase(), "-")
        let createSlug = `${eventName}-${Date.now()}`;
        let checkSlugExists = await PremiumEvent.findOne({ slug: createSlug });

        if (checkSlugExists) {
            return sendResponseWithoutData(res, 400, false, 'Premium event addition failed, try again in sometime!');
        }
        let newData = {
            name: name,
            slug: createSlug,
            category: category,
            subCategory: subCategory,
            segment: segment,
            createdBy: user._id,
            updatedBy: user._id,
        };

        if ('description' in req.body && req.body.description) {
            newData.description = req.body.description;
        }

        if ('file' in req.body && req.body.file) {
            newData.image = req.body.file;
        }

        const dataSave = await PremiumEvent.create(newData);

        if (dataSave) {
            return sendResponseWithoutData(res, 200, true, 'Premium event has been created successfully!');
        } else {
            return sendResponseWithoutData(res, 400, false, 'Premium event creation failed, try again in sometime!');
        }
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};

export const listPremiumEvent = async (req, res) => {
    try {
        const hostname = req.headers.host;
        const protocol = req.protocol;

        let filter = { isDeleted: false };

        if ('isActive' in req.body) {
            filter.isActive = req.body.isActive;
        }

        let data = await PremiumEvent.find(filter)
            .populate([
                { path: 'image', select: '_id url' },
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
                {
                    path: 'segment',
                    select: '-__v -isDeleted',
                    populate: { path: 'image', select: '_id url' },
                },
            ]).sort({ createdAt: -1 })
            .select('-isDeleted -__v')
            .lean();

        if (data.length > 0) {
            for (let solo of data) {
                if ('image' in solo && solo.image && solo.image.url.length > 0) {
                    // let url = solo.image.url.map((item) => `${protocol}://${hostname}/${item}`);
                    let url = { id: solo._id, url: `${protocol}://${hostname}/${solo.image.url}` }
                    solo.image = url;
                }

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

                if ('segment' in solo && solo.segment) {
                    for (let dataInSolo of solo.segment) {
                        if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url) {
                            // let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                            let url = { id: dataInSolo._id, url: `${protocol}://${hostname}/${dataInSolo.image.url}` }
                            dataInSolo.image = url;
                        }
                    }
                }
            }

            return sendResponseWithData(res, 200, true, 'Premium event list fetched successfully!', data,);
        }

        return sendResponseWithoutData(res, 200, true, 'No premium event found',);
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const premiumEventDetails = async (req, res) => {
    try {
        let eventId = req?.params?.id;
        if (!eventId || !isValidObjectId(eventId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid event id!');
        }

        const hostname = req.headers.host;
        const protocol = req.protocol;

        let data = await PremiumEvent.findOne({ _id: eventId, isDeleted: false })
            .populate([
                { path: 'image', select: '_id url' },
                { path: 'category', select: '-__v -createdAt -updatedAt -isDeleted', populate: ({ path: 'image', select: "_id url" }) },
                { path: 'subCategory', select: '-__v -createdAt -updatedAt -isDeleted', populate: ({ path: 'image', select: "_id url" }) },
                { path: 'segment', select: '-__v -createdAt -updatedAt -isDeleted', populate: ({ path: 'image', select: "_id url" }) },
            ])
            .select('-isDeleted -__v')
            .lean();

        if (data) {

            if ('image' in data && data.image && data.image.url.length > 0) {
                // data.image.url = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
                data.image = { id: data.image._id, url: `${protocol}://${hostname}/${data.image.url}` };
            }
            for (let solo of data.category) {
                if ('image' in solo && solo.image && solo.image.url) {
                    // let url = solo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                    let url = { id: solo.image._id, url: `${protocol}://${hostname}/${solo.image.url}` };
                    solo.image = url;
                }
            }

            for (let solo of data.segment) {
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

            return sendResponseWithData(res, 200, true, 'Premium event details fetched successfully!', data);
        }

        return sendResponseWithoutData(res, 400, false, 'Invalid premium event id!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const updatePremiumEvent = async (req, res) => {
    try {
        let user = req.apiUser;
        let { id, name, category, subCategory, segment } = req.body;

        let updatedData = {
            name: name,
            category: category,
            subCategory: subCategory,
            segment: segment,
            updatedBy: user._id,
            updatedAt: Date.now(),
        };

        if ('description' in req.body && req.body.description) {
            updatedData.description = req.body.description;
        }

        if ('file' in req.body && req.body.file) {
            updatedData.image = req.body.file;
        }



        if ('slug' in req.body && req.body.slug) {

            let eventName = removeSpace(req.body.slug.toLowerCase(), "-")
            updatedData.slug = eventName;
        }

        let dataSave = await PremiumEvent.updateOne(
            { _id: id },
            {
                $set: updatedData,
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Event has been updated successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Event updation failed, try again in sometime!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

export const deletePremiumEvent = async (req, res) => {
    try {
        let eventId = req?.params?.id;
        if (!eventId || !isValidObjectId(eventId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid event id!');
        }

        const eventInfo = await PremiumEvent.findOne({ _id: eventId, isDeleted: false });

        if (!eventInfo) {
            return sendResponseWithoutData(res, 400, false, 'Invalid event Id!');
        }

        let dataSave = await PremiumEvent.updateOne(
            { _id: eventId },
            {
                $set: {
                    isDeleted: true,
                },
            },
        );

        if (dataSave.modifiedCount > 0) {
            return sendResponseWithoutData(res, 200, true, 'Premium event has been deleted successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Premium event deletion failed, try again in sometime!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};



export const addSlugInPremiumEvent = async (req, res) => {
    try {

        let findAllPremiumEvent = await PremiumEvent.find();

        for (let data of findAllPremiumEvent) {

            let name = removeSpace(data.name.toLowerCase(), "-");
            let createSlug = `${name}-${Date.now()}`;


            await PremiumEvent.updateOne({ _id: data._id }, { $set: { slug: createSlug } });

        }

        return sendResponseWithoutData(res, 200, true, 'Premium Event slugs updated successfully!');
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};