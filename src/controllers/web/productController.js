import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendErrorResponse,
  sendResponseWithoutData,
  makeObjectId,
  authValues,
  getFilterValueById,
  getSortingValueById,
  getSegmentIdsBySlugs,
  getCategoryIdsBySlugs,
} from '../../helpers/helper.js';
import VendorProduct from '../../models/VendorProduct.js';
import Wishlist from '../../models/Wishlist.js';
import Cart from '../../models/Cart.js';
import Review from '../../models/Review.js';
import ReviewLike from '../../models/ReviewsLike.js';

export const productList = async (req, res) => {
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
    let { segment, category, filter } = req.body;
    // let { filter } = req.body;

    let queryFilter = { isDeleted: false, isActive: true, status: 'approved' };
    let sortingFilter = {};

    if (segment && segment.length > 0) {
      let segmentIds = await getSegmentIdsBySlugs(segment);
      if (segmentIds && Array.isArray(segmentIds) && segmentIds.length > 0) {
        segmentIds = segmentIds.filter(isValidObjectId);
        if (segmentIds.length > 0) {
          queryFilter.segment = { $in: segmentIds };
        }
      }
    }


    if (category && category.length > 0) {
      let categoryIds = await getCategoryIdsBySlugs(category);
      if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
        categoryIds = categoryIds.filter(isValidObjectId);
        if (categoryIds.length > 0) {
          queryFilter.category = { $in: categoryIds };
        }
      }

    }

    if (filter.length > 0) {
      for (const id of filter) {
        if (id && isValidObjectId(id)) {
          let filterValue = await getFilterValueById(id);

          if (filterValue && filterValue.filterCategoryId.type === 'range') {
            if (!queryFilter.hasOwnProperty('$or')) {
              queryFilter.$or = [];
            }
            let tempRangeFilter = { [filterValue.filterCategoryId.field]: {} };

            if (filterValue.min) {
              tempRangeFilter[filterValue.filterCategoryId.field].$gt = filterValue.min;
            }
            if (filterValue.max) {
              tempRangeFilter[filterValue.filterCategoryId.field].$lt = filterValue.max;
            }

            queryFilter.$or.push(tempRangeFilter);
          }

          if (filterValue && filterValue.filterCategoryId.type === 'match') {
            if (!queryFilter.hasOwnProperty(filterValue.filterCategoryId.field)) {
              queryFilter[filterValue.filterCategoryId.field] = [];
            }

            queryFilter[filterValue.filterCategoryId.field].push(filterValue.match);
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

    // return res.status(200).json({ status: true, msg: 'Filters to use', data:queryFilter});

    const totalCount = await VendorProduct.countDocuments(queryFilter);
    let data = await VendorProduct.find(queryFilter)
      .select(
        '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
      )
      .populate([
        { path: 'segment', select: '_id name slug' },
        { path: 'category', select: '_id name slug' },
        { path: 'subCategory', select: '_id name' },
        { path: 'image', select: '_id url' },
      ])
      .sort(sortingFilter)
      .skip((page - 1) * count)
      .limit(count)
      .lean();

    for (let product of data) {
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

      if (product.image && Array.isArray(product.image)) {
        let productUrl = [];
        for (let img of product.image) {
          if (img && 'url' in img && img.url.length > 0) {
            productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
          }
          product.image = productUrl;
        }
      }

    }

    if (data.length > 0) {
      return res.status(200).json({ status: true, msg: 'Product list fetched successfully.', data, count: totalCount });
    }

    return res.status(200).json({ status: true, msg: 'No product found', data, count: totalCount });
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// export const productList = async (req, res) => {
//   try {
//     let user = null;

//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (token) {
//       user = await authValues(token);
//     }

//     const page = req.body.page || 1;
//     const count = req.body.count || 10;
//     const hostname = req.headers.host;
//     const protocol = req.protocol;
//     // let { segment, category, filter } = req.body;
//     let { filter } = req.body;

//     let queryFilter = { isDeleted: false, isActive: true, status: 'approved' };
//     let sortingFilter = {};

//     // if (segment.length > 0) {
//     //   segment = segment.map((item) => {
//     //     if (isValidObjectId(item)) {
//     //       return item;
//     //     }
//     //   });
//     //   queryFilter.segment = { $in: segment };
//     // }

//     // if (category.length > 0) {
//     //   category = category.map((item) => {
//     //     if (isValidObjectId(item)) {
//     //       return item;
//     //     }
//     //   });
//     //   queryFilter.category = { $in: category };
//     // }

//     if (filter.length > 0) {
//       for (const id of filter) {
//         if (id && isValidObjectId(id)) {
//           let filterValue = await getFilterValueById(id);

//           if (filterValue && filterValue.filterCategoryId.type === 'range') {
//             if (!queryFilter.hasOwnProperty('$or')) {
//               queryFilter.$or = [];
//             }
//             let tempRangeFilter = { [filterValue.filterCategoryId.field]: {} };

//             if (filterValue.min) {
//               tempRangeFilter[filterValue.filterCategoryId.field].$gt = filterValue.min;
//             }
//             if (filterValue.max) {
//               tempRangeFilter[filterValue.filterCategoryId.field].$lt = filterValue.max;
//             }

//             queryFilter.$or.push(tempRangeFilter);
//           }

//           if (filterValue && filterValue.filterCategoryId.type === 'match') {
//             if (!queryFilter.hasOwnProperty(filterValue.filterCategoryId.field)) {
//               queryFilter[filterValue.filterCategoryId.field] = [];
//             }

//             queryFilter[filterValue.filterCategoryId.field].push(filterValue.match);
//           }
//         }
//       }
//     }

//     if ('sort' in req.body && req.body.sort && isValidObjectId(req.body.sort)) {
//       let getSorting = await getSortingValueById(req.body.sort);
//       if (getSorting) {
//         sortingFilter = getSorting;
//       }
//     }

//     const totalCount = await VendorProduct.countDocuments(queryFilter);

//     let vendorAggregate = [
//       { $match: queryFilter },
//       {
//         $lookup: {
//           from: 'subCategories',
//           localField: 'subCategory',
//           foreignField: '_id',
//           as: 'subCategory',
//         },
//       },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'category',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },
//       {
//         $lookup: {
//           from: 'segments',
//           localField: 'segment',
//           foreignField: '_id',
//           as: 'segment',
//         },
//       },
//       {
//         $lookup: {
//           from: 'files',
//           localField: 'image',
//           foreignField: '_id',
//           as: 'image',
//         },
//       },
//       {
//         $addFields: {
//           imageUrl: {
//             $cond: {
//               if: { $eq: ['$image', null] },
//               then: null,
//               else: {
//                 $map: {
//                   input: { $arrayElemAt: ['$image.url', 0] },
//                   as: 'imgUrl',
//                   in: {
//                     $concat: [protocol, '://', hostname, '/', '$$imgUrl'],
//                   },
//                 },
//               },
//             },
//           },
//           subCategory: {
//             $cond: {
//               if: { $gt: [{ $size: '$subCategory' }, 0] },
//               then: { $arrayElemAt: ['$subCategory', 0] },
//               else: null,
//             },
//           },
//           category: { $arrayElemAt: ['$category', 0] },
//           segment: { $arrayElemAt: ['$segment', 0] },
//         },
//       },
//       { $skip: (page - 1) * count },
//       { $limit: count },
//       {
//         $project: {
//           productId: 1,
//           name: 1,
//           description: 1,
//           subCategory: 1,
//           category: 1,
//           segment: 1,
//           image: '$imageUrl',
//           price: 1,
//           vendorPrice: 1,
//           mrp: 1,
//           offer: 1,
//           stock: 1,
//           rating: 1,
//           vendor: 1,
//         },
//       },
//     ];

//     if (Object.keys(sortingFilter).length > 0) {
//       vendorAggregate.push({ $sort: sortingFilter });
//     }

//     let data = await VendorProduct.aggregate(vendorAggregate);

//     // for (let product of data) {
//     //   product.inWishlist = false;
//     //   product.inCart = false;

//     //   if (user) {
//     //     let checkWishlist = await Wishlist.findOne({ user: user._id, product: product._id });
//     //     if (checkWishlist) {
//     //       product.inWishlist = true;
//     //     }

//     //     let checkCart = await Cart.findOne({ user: user._id, product: product._id });
//     //     if (checkCart) {
//     //       product.inCart = true;
//     //     }
//     //   }

//     //   if (product.image && 'url' in product.image && product.image.url.length > 0) {
//     //     let productUrl = product.image.url.map((item) => {
//     //       return `${protocol}://${hostname}/${item}`;
//     //     });
//     //     product.image = productUrl;
//     //   }
//     // }

//     if (data.length > 0) {
//       return res.status(200).json({ status: true, msg: 'Product list fetched successfully.', data, count: totalCount });
//     }

//     return res.status(200).json({ status: true, msg: 'No product found', data, count: totalCount });
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

export const topRatedProductList = async (req, res) => {
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

    let queryFilter = { isDeleted: false, isActive: true, status: 'approved' };

    const totalCount = await VendorProduct.countDocuments(queryFilter);
    let data = await VendorProduct.find(queryFilter)
      .select(
        '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
      )
      .populate([
        { path: 'segment', select: '_id name slug' },
        { path: 'category', select: '_id name' },
        { path: 'subCategory', select: '_id name' },
        { path: 'image', select: '_id url' },
      ])
      .sort({ rating: -1 })
      .skip((page - 1) * count)
      .limit(count)
      .lean();

    for (let product of data) {
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

      // if (product.image && 'url' in product.image && product.image.url.length > 0) {
      //   let productUrl = product.image.url.map((item) => {
      //     return `${protocol}://${hostname}/${item}`;
      //   });
      //   product.image = productUrl;
      // }

      if (product.image && Array.isArray(product.image)) {
        let productUrl = [];
        for (let img of product.image) {
          if (img && 'url' in img && img.url.length > 0) {
            productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
          }
          product.image = productUrl;
        }
      }

    }

    if (data.length > 0) {
      return res.status(200).json({ status: true, msg: 'Product list fetched successfully.', data, count: totalCount });
    }

    return res.status(200).json({ status: true, msg: 'No product found', data, count: totalCount });
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};


export const productDetails = async (req, res) => {
  try {
    let user = null;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      user = await authValues(token);
    }

    const hostname = req.headers.host;
    const protocol = req.protocol;

    // const productId = req.params.id;
    const slug = req.params.slug;
    // if (!isValidObjectId(productId)) {
    //   return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    // }

    let productInfo = await VendorProduct.findOne({
      isDeleted: false,
      isActive: true,
      status: 'approved',
      slug: slug
    })
      .populate([
        { path: 'category', select: '-segment -isActive -isDeleted -createdAt -updatedAt -__v' },
        { path: 'image', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
        { path: 'segment', select: '_id name slug' },
        { path: 'vendor', select: '_id name email mobile' },
      ])
      .select(
        '-isActive -createdBy -updatedBy -isDeleted -createdAt -updatedAt -rejectReason -status -approvedBy -__v -vendorPrice',
      )
      .lean();

    if (!productInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid slug!');
    }

    let productUrl = [];
    if (productInfo.image && Array.isArray(productInfo.image)) {
      for (let img of productInfo.image) {
        if (img && 'url' in img && img.url.length > 0) {
          productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
        }
      }
      productInfo.image = productUrl;
    }

    if (productInfo) {
      productInfo.inWishlist = false;
      productInfo.inCart = false;
      productInfo.dateNeeded = true;
      productInfo.timeNeeded = false;
      productInfo.availableToCart = false;

      if (
        productInfo.segment.slug === 'garden_galleria' ||
        productInfo.segment.slug === 'cakes' ||
        productInfo.segment.slug === 'flowers'
      ) {
        productInfo.availableToCart = true;
        productInfo.timeNeeded = true;
      }

      if (user) {
        let checkWishlist = await Wishlist.findOne({ user: user._id, product: productInfo._id });
        if (checkWishlist) {
          productInfo.inWishlist = true;
        }

        let checkCart = await Cart.findOne({ user: user._id, product: productInfo._id });
        if (checkCart) {
          productInfo.inCart = true;
        }
      }

      const comments = await Review.find({ productId: productInfo._id })
        .populate([{ path: 'userId', select: 'name email' }])
        .select('-__v -productId -updatedAt')
        .lean();

      for (let rev of comments) {
        rev.likedByMe = false;
        if (user) {
          let checkLiked = await ReviewLike.findOne({ reviewId: rev._id, likedBy: user._id });
          if (checkLiked) {
            rev.likedByMe = true;
          }
        }
      }

      productInfo.reviews = comments;

      return sendResponseWithData(res, 200, true, 'Product details has been fetched successfully!', productInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// export const productDetails = async (req, res) => {
//   try {
//     let user = null;

//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (token) {
//       user = await authValues(token);
//     }

//     const hostname = req.headers.host;
//     const protocol = req.protocol;

//     const productId = req.params.id;
//     if (!isValidObjectId(productId)) {
//       return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//     }

//     let productInfo = await VendorProduct.findOne({
//       isDeleted: false,
//       isActive: true,
//       status: 'approved',
//       _id: makeObjectId(productId),
//     })
//       .populate([
//         { path: 'category', select: '-segment -isActive -isDeleted -createdAt -updatedAt -__v' },
//         { path: 'image', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
//         { path: 'segment', select: '_id name slug' },
//         { path: 'vendor', select: '_id name email mobile' },
//       ])
//       .select(
//         '-isActive -createdBy -updatedBy -isDeleted -createdAt -updatedAt -rejectReason -status -approvedBy -__v -vendorPrice',
//       )
//       .lean();

//     let productUrl = [];
//     for (let img of productInfo.image) {
//       if (img && 'url' in img && img.url.length > 0) {
//         productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//       }
//     }
//     productInfo.image = productUrl;


//     // if (
//     //   productInfo &&
//     //   'image' in productInfo &&
//     //   productInfo.image &&
//     //   'url' in productInfo.image &&
//     //   productInfo.image.url.length > 0
//     // ) {
//     //   productInfo.image.url = productInfo.image.url.map((item) => {
//     //     return `${protocol}://${hostname}/${item}`;
//     //   });
//     // }

//     if (productInfo) {
//       productInfo.inWishlist = false;
//       productInfo.inCart = false;
//       productInfo.dateNeeded = true;
//       productInfo.timeNeeded = false;
//       productInfo.availableToCart = false;

//       if (
//         productInfo.segment.slug === 'garden_galleria' ||
//         productInfo.segment.slug === 'cakes' ||
//         productInfo.segment.slug === 'flowers'
//       ) {
//         productInfo.availableToCart = true;
//         productInfo.timeNeeded = true;
//       }

//       if (user) {
//         let checkWishlist = await Wishlist.findOne({ user: user._id, product: productInfo._id });
//         if (checkWishlist) {
//           productInfo.inWishlist = true;
//         }

//         let checkCart = await Cart.findOne({ user: user._id, product: productInfo._id });
//         if (checkCart) {
//           productInfo.inCart = true;
//         }
//       }

//       const comments = await Review.find({ productId })
//         .populate([{ path: 'userId', select: 'name email' }])
//         .select('-__v -productId -updatedAt')
//         .lean();

//       for (let rev of comments) {
//         rev.likedByMe = false;
//         if (user) {
//           let checkLiked = await ReviewLike.findOne({ reviewId: rev._id, likedBy: user._id });
//           if (checkLiked) {
//             rev.likedByMe = true;
//           }
//         }
//       }

//       productInfo.reviews = comments;

//       return sendResponseWithData(res, 200, true, 'Product details has been fetched successfully!', productInfo);
//     } else {
//       return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//     }
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };



export const relatedProductList = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let { id } = req.body;

    const productDetails = await VendorProduct.findById(id).lean();

    let data = await VendorProduct.find({
      _id: { $ne: id },
      // $or: [{ category: productDetails.category },
      // { subCategory: productDetails.subCategory }]
      // ,
      category: productDetails.category,
      isDeleted: false,
      isActive: true,
      status: 'approved',
    })
      .select(
        '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
      )
      .populate([
        { path: 'segment', select: '_id name slug' },
        { path: 'category', select: '_id name' },
        { path: 'subCategory', select: '_id name' },
        { path: 'image', select: '_id url' },
      ])
      .lean();

    if (data.length > 0) {
      for (let product of data) {
        if (product.image && Array.isArray(product.image)) {
          let productUrl = [];
          for (let img of product.image) {
            if (img && 'url' in img && img.url.length > 0) {
              productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            }
            product.image = productUrl;
          }
        }

      }
      return sendResponseWithData(res, 200, true, 'Related product list fetched successfully.', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No related product found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// export const relatedProductList = async (req, res) => {
//   try {
//     const hostname = req.headers.host;
//     const protocol = req.protocol;

//     let { id } = req.body;

//     const productDetails = await VendorProduct.findById(id).lean();

//     let data = await VendorProduct.aggregate([
//       {
//         $match: {
//           _id: { $ne: id },
//           // $or: [
//           //   { subCategory: productDetails.subCategory, },
//           //   { category: productDetails.category, },
//           // ],
//           category: productDetails.category,
//           isDeleted: false,
//           isActive: true,
//           status: 'approved',
//         },
//       },

//       {
//         $lookup: {
//           from: 'segments',
//           localField: 'segment',
//           foreignField: '_id',
//           as: 'segment',
//         },
//       },
//       { $unwind: { path: '$segment', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'sub_categories',
//           localField: 'subCategory',
//           foreignField: '_id',
//           as: 'subCategory',
//         },
//       },
//       { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'category',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },

//       { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'files',
//           localField: 'image',
//           foreignField: '_id',
//           as: 'image',
//         },
//       },
//       {
//         $project: {
//           _id: "$_id",
//           // _id: 1,
//           name: 1,
//           // "subCategory.name": 1,
//           "category.name": 1,
//           "segment.name": 1,
//           "segment.slug": 1,
//           "image._id": 1,
//           "image.url": 1,
//           price: 1,
//           mrp: 1,
//           sales: 1,
//           offer: 1,
//           stock: 1,
//           rating: 1,
//           vendor: 1,
//           deliveryType: 1,
//           slug: 1,

//         }
//       }
//     ])

//     if (data.length > 0) {
//       for (let product of data) {
//         if (product.image && Array.isArray(product.image)) {
//           let productUrl = [];
//           for (let img of product.image) {
//             if (img && 'url' in img && img.url.length > 0) {
//               productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//             }
//             product.image = productUrl;
//           }
//         }

//       }
//       return sendResponseWithData(res, 200, true, 'Related product list fetched successfully.', data, true);
//     }

//     return sendResponseWithData(res, 200, true, 'No related product found', data, true);
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

export const getCartRelatedProductList = async (req, res) => {
  try {
    const user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let cartProduct = await Cart.find({ user: user._id })
      .populate({
        path: 'product',
        select: 'category _id',
      })
      .select('product')
      .lean();

    let idsList = await cartProduct.map((item) => item.product._id);
    let relatedCategory = await cartProduct.map((item) => item.product.category);

    let data = await VendorProduct.find({
      _id: { $nin: idsList },
      category: relatedCategory,
      isDeleted: false,
      isActive: true,
      status: 'approved',
    })
      .select(
        '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
      )
      .populate([
        { path: 'segment', select: '_id name' },
        { path: 'category', select: '_id name' },
        { path: 'subCategory', select: '_id name' },
        { path: 'image', select: '_id url' },
      ])
      .lean();

    if (data.length > 0) {
      for (let product of data) {
        if (product.image && Array.isArray(product.image)) {
          let productUrl = [];
          for (let img of product.image) {
            if (img && 'url' in img && img.url.length > 0) {
              productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            }
            product.image = productUrl;
          }
        }

      }

      return sendResponseWithData(res, 200, true, 'Related product list fetched successfully.', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No related product found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
}; // add inWishlist and inCart field

export const productListByIds = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let { ids } = req.body;

    ids = ids.filter((item) => isValidObjectId(item));

    let data = await VendorProduct.find({
      _id: ids,
      isDeleted: false,
      isActive: true,
      status: 'approved',
    })
      .select(
        '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
      )
      .populate([
        { path: 'segment', select: '_id name slug' },
        { path: 'category', select: '_id name' },
        { path: 'subCategory', select: '_id name' },
        { path: 'image', select: '_id url' },
      ])
      .lean();

    if (data.length > 0) {
      for (let product of data) {
        if (product.image && Array.isArray(product.image)) {
          let productUrl = [];
          for (let img of product.image) {
            if (img && 'url' in img && img.url.length > 0) {
              productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            }
            product.image = productUrl;
          }
        }

      }

      return sendResponseWithData(res, 200, true, 'Related product list fetched successfully.', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No products found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
