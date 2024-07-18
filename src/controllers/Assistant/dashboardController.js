import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
    sendResponseWithData,
    sendResponseWithoutData,
    sendErrorResponse,
} from '../../helpers/helper.js';
import VendorProduct from '../../models/VendorProduct.js';
import Order from '../../models/Order.js';

export const dashboardAssistantPoductDetails = async (req, res) => {
    try {
        let user = req.apiUser;


        let orderDetails = await Order.aggregate([
            {
                $match: {
                    "productDetails.segment": user.segment,
                    // 'productDetails.vendor': user._id,
                },
            },
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: '$_id',
                    userId: { $first: '$userId' },
                    totalAmountToPay: { $first: '$totalAmountToPay' },
                    productDetails: { $push: '$productDetails' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $project: {
                    user: { $arrayElemAt: ['$userDetails', 0] },
                    productDetails: 1,
                    totalAmountToPay: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmountToPay: { $sum: '$totalAmountToPay' },
                    totalOrders: { $sum: 1 },
                },
            },

            {
                $project: {
                    _id: 0,
                    totalAmountToPay: 1,
                    totalOrders: 1,
                },
            },
        ]);

        let dashboardData = {};
        if (orderDetails && orderDetails.length > 0) {
            dashboardData.totalAmountToPay = orderDetails[0].totalAmountToPay.toFixed(2);
            dashboardData.totalOrders = orderDetails[0].totalOrders;
        }

        let productLists = await VendorProduct.find({ isDeleted: false, isActive: true, status: 'approved', segment: user.segment })
            .sort({ createdAt: -1 })
            .select('name price createdAt updatedAt');

        if (productLists && productLists.length > 0) {
            dashboardData.productLists = productLists;
        }

        let updatedData = await VendorProduct.find({ isDeleted: false, isActive: true, status: 'approved', segment: user.segment })
            .sort({ sales: -1 })
            .select(
                '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -approvedBy -vendor -rating -stock -offer -image -segment -category -description -subCategory -mrp -price',
            );

        let topSellingProductLists = updatedData.map((product) => {
            let totalRevenue = product.vendorPrice * product.sales;
            return {
                ...product._doc,
                totalRevenue,
            };
        });

        if (topSellingProductLists && topSellingProductLists.length > 0) {
            dashboardData.topSellingProductLists = topSellingProductLists;
        }

        if (Object.keys(dashboardData).length > 0) {
            return sendResponseWithData(res, 200, true, 'All Details fetched successfully!', dashboardData);
        }

        return sendResponseWithoutData(res, 400, false, 'Failed to fetch details!');
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};




