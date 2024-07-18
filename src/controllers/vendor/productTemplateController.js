import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendErrorResponse,
  makeObjectId,
  sendResponseWithoutData,
} from '../../helpers/helper.js';
import Product from '../../models/Product.js';
import VendorProduct from '../../models/VendorProduct.js';

export const listProductTemplate = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false, isActive: true, segment: user.segment };

    if (req.body.category) {
      filter.category = makeObjectId(req.body.category);
    }

    let vendorProducts = await VendorProduct.find({ vendor: user._id, isDeleted: false, isActive: true })
      .select('productId')
      .lean();


    if (vendorProducts.length > 0) {
      // console.log(vendorProducts);
      vendorProducts = vendorProducts.map((item) => {
        if (item.productId && isValidObjectId(item.productId)) {
          return item.productId.toHexString()
        }
      });
      filter._id = { $nin: vendorProducts };
    }

    let data = await Product.find(filter)
      .populate([
        { path: 'image', select: '_id url' },
        { path: 'category', select: '_id name' },
        { path: 'segment', select: '_id name' },
      ])
      .select('-status -approvedBy -rejectReason -createdBy -updatedBy -vendor -isDeleted -isActive -isApproved -__v')
      .lean();

    for (let product of data) {

      if (product.image && Array.isArray(product.image)) {
        let productUrl = [];
        for (let img of product.image) {
          if (img && 'url' in img && img.url.length > 0) {
            // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            productUrl.push({ id: img._id, url: `${protocol}://${hostname}/${img.url}` });
          }

          product.image = productUrl;
        }

      }

    }

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Product list get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No product found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const productTemplateDetails = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product template id!');
    }
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false, isActive: true, segment: user.segment, _id: req.params.id };

    let product = await Product.findOne(filter)
      .populate([
        { path: 'image', select: '_id url' },
        { path: 'category', select: '_id name' },
        { path: 'segment', select: '_id name' },
      ])
      .select('-status -approvedBy -rejectReason -createdBy -updatedBy -vendor -isDeleted -isActive -isApproved -__v')
      .lean();

    if (product) {

      if (product.image && Array.isArray(product.image)) {
        let productUrl = [];
        for (let img of product.image) {
          if (img && 'url' in img && img.url.length > 0) {
            // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            productUrl.push({ id: img._id, url: `${protocol}://${hostname}/${img.url}` });
          }

          product.image = productUrl;
        }
      }

      return sendResponseWithData(res, 200, true, 'Product details get Successfully', product);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid product template id!', product);
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
