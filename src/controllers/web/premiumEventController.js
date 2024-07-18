import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse, authValues, getFilterValueById, getSortingValueById } from '../../helpers/helper.js';
import Cart from '../../models/Cart.js';
import PremiumEvent from '../../models/PremiumEvent.js';
import VendorProduct from '../../models/VendorProduct.js';
import Wishlist from '../../models/Wishlist.js';


export const PremiumEventLists = async (req, res) => {
    try {
        const hostname = req.headers.host;
        const protocol = req.protocol;

        let filter = { isDeleted: false };
        let data = await PremiumEvent.find(filter)
            .populate([
                { path: 'image', select: '_id url' },
                // {
                //     path: 'category',
                //     select: '-__v -isDeleted',
                //     populate: { path: 'image', select: '_id url' },
                // },
                // {
                //     path: 'subCategory',
                //     select: '-__v -isDeleted',
                //     populate: { path: 'image', select: '_id url' },
                // },
                // {
                //     path: 'segment',
                //     select: '-__v -isDeleted',
                //     populate: { path: 'image', select: '_id url' },
                // },
            ])
            .select('-isDeleted -__v -category -subCategory -segment -updatedAt -createdAt -updatedBy -createdBy -isActive')
            .lean();

        if (data.length > 0) {

            for (let solo of data) {
                if ('image' in solo && solo.image && solo.image.url.length > 0) {
                    let url = solo.image.url.map((item) => `${protocol}://${hostname}/${item}`);
                    solo.image = url;
                }
                // if ('category' in solo && solo.category) {
                //     for (let dataInSolo of solo.category) {
                //         if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url) {
                //             let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                //             dataInSolo.image = url;
                //         }
                //     }
                // }
                // if ('subCategory' in solo && solo.subCategory) {
                //     for (let dataInSolo of solo.subCategory) {
                //         if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url) {
                //             let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                //             dataInSolo.image = url;
                //         }
                //     }
                // }

                // if ('segment' in solo && solo.segment) {
                //     for (let dataInSolo of solo.segment) {
                //         if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url) {
                //             let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
                //             dataInSolo.image = url;
                //         }
                //     }
                // }
            }

            return sendResponseWithData(res, 200, true, 'Premium event list fetched successfully!', data,);
        }

        return sendResponseWithoutData(res, 200, true, 'No premium event found',);
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};


export const getProductBYPremiumEvent = async (req, res) => {
    try {
        let user = null;

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            user = await authValues(token);
        }

        const page = req.body.page || 1;
        const count = req.body.count || 10;
        const hostname = req.headers.host;
        const protocol = req.protocol;

        let { slug, filter } = req.body;
        let catArr = [];
        let segArr = [];
        let subCatArr = [];
        let data = await PremiumEvent.findOne({
            slug: slug, isDeleted: false
        })
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
            ])
            .select('-isDeleted -__v')
            .lean();

        if (!data) {
            return sendResponseWithoutData(res, 400, false, 'Invalid event id!');
        }

        // let query = { isDeleted: false, isActive: true, status: 'approved' };
        let query = {
            $or: [
                { category: { $in: catArr } },
                { segment: { $in: segArr } },
                { subCategory: { $in: subCatArr } }
            ],
            isDeleted: false,
            isActive: true,
            status: 'approved'
        };
        let sortingFilter = {};

        if (filter.length > 0) {
            for (const id of filter) {
                if (id && isValidObjectId(id)) {
                    let filterValue = await getFilterValueById(id);

                    if (filterValue && filterValue.filterCategoryId.type === 'range') {
                        // if (!query.hasOwnProperty('$or')) {
                        if (query.hasOwnProperty('$or')) {
                            query.$or = [];
                        }
                        let tempRangeFilter = { [filterValue.filterCategoryId.field]: {} };

                        if (filterValue.min) {
                            tempRangeFilter[filterValue.filterCategoryId.field].$gt = filterValue.min;
                        }
                        if (filterValue.max) {
                            tempRangeFilter[filterValue.filterCategoryId.field].$lt = filterValue.max;
                        }

                        query.$or.push(tempRangeFilter);
                    }

                    if (filterValue && filterValue.filterCategoryId.type === 'match') {
                        if (!query.hasOwnProperty(filterValue.filterCategoryId.field)) {
                            query[filterValue.filterCategoryId.field] = [];
                        }

                        query[filterValue.filterCategoryId.field].push(filterValue.match);
                    }
                }
            }
        }

        if ('sort' in req.body && req.body.sort && isValidObjectId(req.body.sort)) {
            let getSorting = await getSortingValueById(req.body.sort);

            if (getSorting) {
                sortingFilter = getSorting;
            }
        }

        if (data.category && Array.isArray(data.category)) {
            for (let cat of data.category) {
                if (cat && cat._id) {
                    catArr.push(cat._id)
                    // query.category = cat._id;
                }
            }
            // query.category = data.category._id;
        }


        if (data.segment && Array.isArray(data.segment)) {
            for (let seg of data.segment) {
                if (seg && seg._id) {
                    segArr.push(seg._id)
                    // query.segment = seg._id
                }
            }
        }

        if (data.subCategory && Array.isArray(data.subCategory)) {
            for (let subCat of data.subCategory) {
                if (subCat && subCat._id) {
                    subCatArr.push(subCat._id)
                    // query.subCategory = subCat._id
                }
            }
        }

        const totalCount = await VendorProduct.countDocuments(query);
        let getProduct = await VendorProduct.find(query)
            .populate([
                // { path: "category", select: "name" }, { path: "subCategory", select: "name" }, { path: "segment", select: "name slug" }, 
                { path: "image", select: "_id url" }]).select(
                    '-subCategory -category -segment -isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice -sales',
                ).sort(sortingFilter)
            .skip((page - 1) * count)
            .limit(count)
            .lean();

        for (let product of getProduct) {
            product.inWishlist = false;
            product.inCart = false;

            if (user) {
                let checkWishlist = await Wishlist.findOne({ user: user._id, product: product._id });
                if (checkWishlist) {
                    product.inWishlist = true;
                }

                let checkCart = await Cart.findOne({ user: user._id, product: product._id });
                if (checkCart) {
                    product.inCart = true;
                }
            }
            let productUrl = [];

            if (product.image && Array.isArray(product.image)) {
                for (let img of product.image) {
                    if (img && 'url' in img && img.url.length > 0) {
                        productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
                    }
                }
                product.image = productUrl;
            }

        }


        if (getProduct.length > 0) {
            return res.status(200).json({ status: true, msg: 'Product list fetched successfully.', getProduct, count: totalCount });
        }
        return res.status(200).json({ status: true, msg: 'No premium event found', getProduct, count: totalCount });

    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};

