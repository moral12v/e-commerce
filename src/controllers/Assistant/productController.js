import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
} from '../../helpers/helper.js';
import VendorProduct from '../../models/VendorProduct.js';
import { populate } from 'dotenv';

// export const createProduct = async (req, res) => {
//   try {
//     let user = req.apiUser;

//     let CategoryAvailable = await Category.findOne({ isDeleted: false, segment: user.segment, _id: req.body.category });
//     if (!CategoryAvailable) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
//     }

//     const dataSave = await Product.create({
//       name: req.body.name,
//       category: req.body.category,
//       segment: user.segment,
//       image: req.body.file || null,
//       price: req.body.price,
//       status: 'approved',
//       approvedBy: user._id,
//       createdBy: user._id,
//       updatedBy: user._id,
//     });

//     if (dataSave) {
//       return sendResponseWithoutData(res, 200, true, 'Product has been added successfully!');
//     } else {
//       return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
//     }
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };

export const listProduct = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false, segment: user.segment };

    if (req.body.category) {
      filter.category = makeObjectId(req.body.category);
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
        { path: 'vendor', select: '_id name' },
      ])
      .select('-isDeleted -__v')
      .lean();

    for (let product of data) {
      let productUrl = []
      for (let img of product.image) {
        if (img && 'url' in img && img.url.length > 0) {
          // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
          productUrl.push({ id: img._id, url: `${protocol}://${hostname}/${img.url}` });
        }
        product.image = productUrl;
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

export const detailProduct = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    const productId = req.params.id;
    if (!isValidObjectId(productId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }

    let productInfo = await VendorProduct.findOne({
      isDeleted: false,
      segment: user.segment,
      _id: makeObjectId(productId),
    })
      .populate([
        { path: 'segment', select: '-isDeleted -createdAt -updatedAt -__v' },
        { path: 'category', select: '-isDeleted -createdAt -updatedAt -__v', populate: { path: 'image', select: "_id url" } },
        { path: 'image', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
        {
          path: 'approvedBy',
          select: '-isDeleted -createdAt -updatedAt -password -type -isEmailVerified -otp -otpExpiryTime -__v',
        },
      ])
      .select('-isDeleted -createdAt -updatedAt -__v')
      .lean();

    if (productInfo.category && productInfo.category.image && 'url' in productInfo.category.image && productInfo.category.image.url.length > 0) {
      productInfo.category.image.url = productInfo.category.image.url.map((item) => {
        return `${protocol}://${hostname}/${item}`;
      });
    }
    if (productInfo.image && Array.isArray(productInfo.image)) {
      let productUrl = [];
      for (let img of productInfo.image) {
        if (img && 'url' in img && img.url.length > 0) {
          // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
          productUrl.push({ id: img._id, url: `${protocol}://${hostname}/${img.url}` });
        }
      }
      productInfo.image = productUrl;

    }

    if (productInfo) {
      return sendResponseWithData(res, 200, true, 'Product has been fetched successfully!', productInfo);
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
    let product = await VendorProduct.findById(req.body.id);

    if (product.segment.toHexString() !== user.segment.toHexString()) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product segment!');
    }

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

    return sendResponseWithoutData(res, 400, false, 'Product updation failed!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    const ProductDetails = await VendorProduct.findById(req.body.id).lean();

    if (ProductDetails.segment.toHexString() !== user.segment.toHexString()) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }

    let updatedData = {
      price: req.body.price,
      vendorPrice: req.body.vendorPrice,
      mrp: req.body.mrp,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('subCategory' in req.body && req.body.subCategory) {
      updatedData.subCategory = req.body.subCategory;
    }

    // if ('mrp' in req.body && req.body.mrp) {
    //   updatedData.mrp = req.body.mrp;
    // }

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

// export const deleteProduct = async (req, res) => {
//   try {
//     let user = req.apiUser;

//     const productId = req.params.id;
//     if (!isValidObjectId(productId)) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//     }

//     let productAvailable = await Product.findOne({ isDeleted: false, segment: user.segment, _id: productId });
//     if (!productAvailable) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//     }

//     const dataUpdate = await Product.updateOne(
//       { _id: productId },
//       {
//         $set: {
//           isDeleted: true,
//         },
//       },
//     );

//     if (dataUpdate.modifiedCount > 0) {
//       return sendResponseWithoutData(res, 200, true, 'Product has been deleted successfully!');
//     } else {
//       return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
//     }
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };
