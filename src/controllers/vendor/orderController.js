import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';

export const vendorOrderLists = async (req, res) => {
  try {
    let user = req.apiUser;

    const filterValues = {};

    if (req.body.filter) {
      filterValues.status = req.body.filter;
    }

    const orderDetails = await Order.aggregate([
      {
        $match: filterValues,
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'productDetails.vendor': user._id,
        },
      },
      {
        $group: {
          _id: '$_id',
          status: { $first: '$status' },
          orderId: { $first: '$orderId' },
          paymentStatus: { $first: '$paymentStatus' },
          paymentMethod: { $first: '$paymentMethod' },
          userId: { $first: '$userId' },
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
          orderId: 1,
          status: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          user: { $arrayElemAt: ['$userDetails', 0] },
          // productDetails: { $arrayElemAt: ['$productDetails', 0] },
          productDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $project: {
          orderId: 1,
          status: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          'user.name': 1,
          'user.mobile': 1,
          'user.email': 1,
          'user.alternateMobile': 1,
          productDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]).sort({ createdAt: -1 })

    // const orderDetails = await Order.find(user._id);

    if (orderDetails) {
      return sendResponseWithData(res, 200, true, 'Vendor order lists fetched successfully!', orderDetails);
    }
    return sendResponseWithoutData(res, 400, false, 'Order not found!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const vendorOrderDetails = async (req, res) => {
  try {
    let user = req.apiUser;

    const hostname = req.headers.host;
    const protocol = req.protocol;

    let { id } = req.body;
    const orderDetails = await Order.findOne({ _id: id })
      .populate([
        {
          path: 'userId',
          select: 'name email mobile type alternateMobile',
        },
        {
          path: 'shippingAddressId',
          select: ' -isDefault -isDeleted -__v -createdAt -updatedAt -createdBy -updatedBy',
        },
        { path: 'productDetails.category', select: ' -isActive -isDeleted -__v -createdAt -updatedAt -segment' },
        {
          path: 'productDetails.segment',
          select: '-image -isActive -isDeleted -__v -createdAt -updatedAt -slug',
        },
        {
          path: 'productDetails.subCategory',
          select: '-image -isActive -isDeleted -__v -createdAt -updatedAt -category -createdBy -updatedBy',
        },
        { path: 'productDetails.image', select: '_id url' },
      ])
      .select(
        '-__v -couponId -couponCode -orderFrom -shippingStatus -subTotal -discount -couponDiscount -invoiceNo -tax -shippingCost -amountToPay',
      )
      .lean();

    if (orderDetails && orderDetails.productDetails.length > 0) {
      for (let data of orderDetails.productDetails) {
        if (data.image && 'url' in data.image && data.image.url.length > 0) {
          let productUrl = data.image.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
          data.image = productUrl;
        }

        if (data.vendor.toString() === user._id.toString()) {
          return sendResponseWithData(res, 200, true, 'Vendor order detials fetched successfully!', orderDetails);
        }
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Order not found!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
