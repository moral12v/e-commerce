import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
} from '../../helpers/helper.js';
import Category from '../../models/Category.js';
import VendorProduct from '../../models/VendorProduct.js';
import { isValidObjectId } from 'mongoose';

export const listVendorProduct = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false };

    if (req.body.category) {
      filter.category = makeObjectId(req.body.category);
    }

    if (req.body.segment) {
      filter.segment = makeObjectId(req.body.segment);
    }

    if (
      req.body.status &&
      (req.body.status === 'pending' || req.body.status === 'rejected' || req.body.status === 'approved')
    ) {
      filter.status = req.body.status;
    }

    let data = await VendorProduct.find(filter)
      .populate([
        { path: 'category', select: '_id name' },
        { path: 'segment', select: '_id name' },
        { path: 'image', select: '_id url' },
        { path: 'vendor', select: '_id name email mobile isActive isVerified createdAt updatedAt role type' },
      ])
      .select('-isDeleted -__v').sort({ createdAt: - 1 })
      .lean();

    for (let product of data) {
      if (product.image && Array.isArray(product.image)) {
        let productUrl = [];
        for (let img of product.image) {
          if (img && 'url' in img && img.url.length > 0) {
            // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            productUrl.push({
              _id: img._id,
              url: `${protocol}://${hostname}/${img.url}`
            });
          }
          product.image = productUrl;
        }
      }


    }

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Vendor product list get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No product found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const detailProduct = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    const productId = req.params.id;
    if (!isValidObjectId(productId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }

    let productInfo = await VendorProduct.findOne({
      isDeleted: false,
      _id: makeObjectId(productId),
    })
      .populate([
        { path: 'segment', select: '-isDeleted -createdAt -updatedAt -__v' },
        { path: 'category', select: '-isDeleted -createdAt -updatedAt -__v' },
        { path: 'image', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
        {
          path: 'vendor',
          select: '-isDeleted -__v -password -segment -role -type -createdAt -updatedAt -createdBy -updatedBy',
        },
        {
          path: 'approvedBy',
          select:
            '-otp -otpExpiryTime -isEmailVerify -isDeleted -__v -password -segment -role -type -createdAt -updatedAt -createdBy -updatedBy',
        },
      ])
      .select('-isDeleted -createdAt -updatedAt -__v')
      .lean();


    if (productInfo.image && Array.isArray(productInfo.image)) {
      let productUrl = [];
      for (let img of productInfo.image) {
        if (img && 'url' in img && img.url.length > 0) {
          // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
          productUrl.push({
            _id: img._id,
            url: `${protocol}://${hostname}/${img.url}`
          });
        }
      }
      productInfo.image = productUrl;
    }



    if (productInfo) {
      return sendResponseWithData(res, 200, true, 'Vendor product has been fetched successfully!', productInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const approveProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    let updatedValue = {
      status: req.body.status,
      approvedBy: user._id,
      rejectReason: req.body.status === 'approved' ? '' : req.body.reason || '',
    };

    let dataSave = await VendorProduct.updateOne(
      { _id: req.body.id },
      {
        $set: updatedValue,
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, `Product status updated successfully!`);
    }
    return sendResponseWithoutData(res, 400, false, 'Product updation failed, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateVendorProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    let productDetails = await VendorProduct.findById(req.body.id).lean();

    let categoryDetails = await Category.findOne({ _id: req.body.category, segment: productDetails.segment }).lean();

    if (!categoryDetails) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Invalid category, please provide the correct category according to vendor segment!',
      );
    }

    let updatedData = {
      price: req.body.price,
      vendorPrice: req.body.vendorPrice,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      deliveryType: req.body.deliveryType,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('subCategory' in req.body && req.body.subCategory) {
      updatedData.subCategory = req.body.subCategory;
    }

    if ('mrp' in req.body && req.body.mrp) {
      updatedData.mrp = req.body.mrp;
    }

    if ('offer' in req.body && req.body.offer) {
      updatedData.offer = req.body.offer;
    }

    // if ('file' in req.body && req.body.file) {
    //   updatedData.file = req.body.file;
    // }
    if ('file' in req.body && Array.isArray(req.body.file)) {
      updatedData.image = req.body.file.length > 0 ? req.body.file : null;
    } else {
      updatedData.image = null;
    }

    const dataUpdate = await VendorProduct.updateOne(
      { _id: req.body.id },
      {
        $set: updatedData,
      },
    );

    if (dataUpdate.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Product has been updated successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Product updation failed, try again in sometime!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};


export const deleteVendorProduct = async (req, res) => {
  try {
    let user = req.apiUser;
    let { id } = req.params

    if (!id || !isValidObjectId(id)) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Invalid product id, please provide the correct product id!',
      );
    }

    let productDetails = await VendorProduct.findOne({ _id: id }).lean();
    if (!productDetails) {
      return sendResponseWithoutData(
        res,
        400,
        false,
        'Invalid product id, please provide the correct product id!',
      );
    }

    let updatedData = {
      isDeleted: true,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    const dataUpdate = await VendorProduct.updateOne(
      { _id: id },
      {
        $set: updatedData,
      },
    );

    if (dataUpdate.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Product has been deleted successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Product deletion failed, try again in sometime!');
    }

  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }

}