import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
  removeProductsFromCart,
  removeProductsFromWishlist,
  removeReviewsFromProduct,
  removeSpace,
} from '../../helpers/helper.js';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import SubCategory from '../../models/SubCategory.js';
import VendorProduct from '../../models/VendorProduct.js';
import { isValidObjectId } from 'mongoose';

export const createProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    const categoryAvailable = await Category.findOne({
      _id: req.body.category,
      isDeleted: false,
      isActive: true,
      segment: user.segment,
    });

    if (!categoryAvailable) {
      return sendResponseWithoutData(res, 400, false, 'Category not available!');
    }

    if ('subCategory' in req.body && req.body.subCategory && isValidObjectId(req.body.subCategory)) {
      const subCategoryInfo = await SubCategory.findOne({
        _id: req.body.subCategory,
        category: req.body.category,
        isDeleted: false,
        isActive: true,
      });
      if (!subCategoryInfo) {
        return sendResponseWithoutData(
          res,
          400,
          false,
          'Invalid sub category, please provide the correct sub category which lies under the given category!',
        );
      }
    }

    const checkProductName = await VendorProduct.findOne({
      name: req.body.name,
      category: req.body.category,
      segment: user.segment,
      isDeleted: false,
    });

    if (checkProductName) {
      return sendResponseWithoutData(res, 400, false, 'Product already exists with this name!');
    }

    let imgArr = []

    if ('file' in req.body && Array.isArray(req.body.file)) {
      for (let img of req.body.file) {
        imgArr.push(img)
      }
    }
    let findCategory = await Category.findOne({ _id: req.body.category, isDeleted: false });
    let name = removeSpace(req.body.name.toLowerCase(), "-")

    let category = removeSpace(findCategory.name.toLowerCase(), "-")

    let createSlug = `${name}-${category}-${Date.now()}`;
    let checkSlugExists = await VendorProduct.findOne({ slug: createSlug });

    if (checkSlugExists) {
      return sendResponseWithoutData(res, 400, false, 'Product addition request fail to sent, try again in sometime!');
    }

    const dataSave = await VendorProduct.create({
      productId: null,
      name: req.body.name,
      slug: createSlug,
      description: req.body.description || '',
      subCategory: req.body.subCategory || null,
      category: req.body.category,
      segment: user.segment,
      image: imgArr || null,
      price: req.body.price,
      mrp: req.body.price,
      vendorPrice: req.body.price,
      offer: req.body.offer || 0,
      stock: req.body.stock,
      deliveryType: req.body.deliveryType,
      vendor: user._id,
      status: 'pending',
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Product addition request sent successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Product addition request fail to sent, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listProduct = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false, isActive: true, vendor: user._id };

    if (req.body.category) {
      filter.category = makeObjectId(req.body.category);
    }

    if (req.body.status && req.body.status !== '') {
      filter.status = req.body.status;
    }

    let data = await VendorProduct.find(filter)
      .populate([
        { path: 'image', select: '_id url' },
        { path: 'subCategory', select: '_id name' },
        { path: 'category', select: '_id name' },
        { path: 'segment', select: '_id name' },
      ])
      .select('-approvedBy -createdBy -updatedBy -vendor -isDeleted -isActive -isApproved -__v')
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
      return sendResponseWithData(res, 200, true, 'Product list get successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No product found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const productDetails = async (req, res) => {
  try {

    let user = req.apiUser;
    let productId = req?.params?.id;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    if (productId && isValidObjectId(productId)) {
      let productInfo = await VendorProduct.findOne({
        _id: makeObjectId(productId),
        segment: user.segment,
        isDeleted: false,
      })
        .populate([
          { path: 'image', select: '_id url' },
          { path: 'subCategory', select: '_id name' },
          { path: 'category', select: '_id name' },
          { path: 'segment', select: '_id name' },
        ])
        .select('-status -approvedBy -rejectReason -createdBy -updatedBy -vendor -isDeleted -isActive -isApproved -__v')
        .lean();

      if (!productInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
      }
      if (productInfo.image && Array.isArray(productInfo.image)) {
        let productUrl = [];
        for (let img of productInfo.image) {
          if (img && 'url' in img && img.url.length > 0) {
            // productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            productUrl.push({ id: img._id, url: `${protocol}://${hostname}/${img.url}` });
          }

          productInfo.image = productUrl;
        }
      }
      return sendResponseWithData(res, 200, true, 'Product details fetched successfully!', productInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const addProductInSection = async (req, res) => {
  try {
    let user = req.apiUser;

    let getProductInfo = await Product.findById(req.body.id).lean();

    let alreadyExists = await VendorProduct.findOne({ productId: req.body.id, vendor: user._id, isDeleted: false });
    if (alreadyExists) {
      return sendResponseWithoutData(res, 400, false, 'Product already in the list!');
    }

    let addProduct = await VendorProduct.create({
      productId: getProductInfo._id,
      name: getProductInfo.name,
      description: getProductInfo.description || '',
      subCategory: getProductInfo?.subCategory || null,
      category: getProductInfo.category,
      segment: getProductInfo.segment,
      image: getProductInfo.image,
      vendorPrice: getProductInfo.vendorPrice || getProductInfo.price,
      price: getProductInfo.price,
      vendorPrice: getProductInfo.price,
      mrp: getProductInfo.mrp,
      vendor: user._id,
      offer: req.body.offer || 0,
      stock: req.body.stock,
      deliveryType: getProductInfo.deliveryType || 'local',
      status: 'approved',
      approvedBy: getProductInfo.createdBy,
      rejectReason: '',
      isActive: getProductInfo.isActive,
      isDeleted: false,
      createdBy: getProductInfo.createdBy,
      updatedBy: getProductInfo.updatedBy,
    });

    if (addProduct) {
      return sendResponseWithoutData(res, 200, true, 'Product add successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Product addition failed!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const removeProductInSection = async (req, res) => {
  try {
    let removeProduct = await VendorProduct.deleteOne({ _id: req.body.id });
    if (removeProduct.deletedCount > 0) {
      removeProductsFromCart(req.body.id);
      removeProductsFromWishlist(req.body.id);
      removeReviewsFromProduct(req.body.id);
      return sendResponseWithoutData(res, 200, true, 'Product removed successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Product fails to remove!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};


export const addSlugInVendorProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    let findAllVendorProduct = await VendorProduct.find();

    for (let data of findAllVendorProduct) {

      let findCategory = await Category.findOne({ _id: data.category, isDeleted: false });

      if (findCategory) {

        let name = removeSpace(data.name.toLowerCase(), "-");
        let categoryName = removeSpace(findCategory.name.toLowerCase(), "-");
        let createSlug = `${name}-${categoryName}-${Date.now()}`;


        await VendorProduct.updateOne({ _id: data._id }, { $set: { slug: createSlug } });
      }
    }

    return sendResponseWithoutData(res, 200, true, 'Product slugs updated successfully!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};


// export const updateProductInSection = async (req, res) => {
//   try {
//     let user = req.apiUser;
//     let getProductDetails = await VendorProduct.findOne({ _id: req.body.id, isDeleted: false }).lean();

//     let updatedData = {
//       stock: req.body.stock,
//       offer: req.body.offer,
//       status: 'pending',
//       rejectReason: '',
//       updatedBy: user._id,
//       updatedAt: Date.now(),
//     };

//     if (
//       getProductDetails.createdBy === user._id &&
//       'subCategory' in req.body &&
//       req.body.subCategory &&
//       isValidObjectId(req.body.subCategory)
//     ) {
//       const subCategoryInfo = await SubCategory.findOne({
//         _id: req.body.subCategory,
//         category: getProductDetails.category,
//         isDeleted: false,
//         isActive: true,
//       });
//       if (!subCategoryInfo) {
//         return sendResponseWithoutData(
//           res,
//           400,
//           false,
//           'Invalid sub category, please provide the correct sub category which lies under the given category!',
//         );
//       }
//       updatedData.subCategory = req.body.SubCategory || null;
//     }

//     let updateProduct = await VendorProduct.updateOne({ _id: req.body.id }, { $set: updatedData });

//     if (updateProduct.modifiedCount > 0) {
//       return sendResponseWithoutData(res, 200, true, 'Product updated successfully!');
//     }

//     return sendResponseWithoutData(res, 400, false, 'Product updation failed!');
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };



