import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
  getSortingValueById,
  getFilterValueById,
} from '../../helpers/helper.js';
import EventGroup from '../../models/EventsGroup.js';
import VendorProduct from '../../models/VendorProduct.js';
import Wishlist from '../../models/Wishlist.js';
import Cart from '../../models/Cart.js';

export const getEvents = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await EventGroup.find({ isActive: true, isDeleted: false })
      .populate([
        { path: 'image', select: '_id url' },
        {
          path: 'group',
          select: '-__v -createdAt -createdBy -updatedAt -updatedBy -isDeleted -isActive',
          populate: { path: 'image', select: '_id url' },
        },
      ])
      .select('-isDeleted -__v')
      .lean();


    if (data.length > 0) {
      for (let solo of data) {
        if ('image' in solo && solo.image && solo.image.url.length > 0) {
          let url = solo.image.url.map((item) => `${protocol}://${hostname}/${item}`);
          solo.image = url;
        }

        if ('group' in solo && solo.group) {
          for (let dataInSolo of solo.group) {
            if ('image' in dataInSolo && dataInSolo.image && dataInSolo.image.url.length > 0) {
              let url = dataInSolo.image.url.map((innerItem) => `${protocol}://${hostname}/${innerItem}`);
              dataInSolo.image = url;
            }
          }
        }
      }

      return sendResponseWithData(res, 200, true, 'Event list fetched successfully!', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No event found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getProductsByEventId = async (req, res) => {
  try {
    const user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    const page = req.body.page || 1;
    const count = req.body.count || 10;

    let { slug, filter } = req.body;

    let data = await EventGroup.findOne({ slug: slug, isDeleted: false })
      .populate([
        { path: 'image', select: '_id url' },
        {
          path: 'group',
          select: '-__v -createdAt -createdBy -updatedAt -updatedBy -isDeleted -isActive',
          // populate: { path: 'image', select: '_id url' },
        },
      ])
      .select('-isDeleted -__v -createdBy -createdAt -updatedBy -updatedAt -isActive')
      .lean();

    if ('image' in data && data.image && data.image.url.length > 0) {
      let imgUrl = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
      data.image = imgUrl;
    }

    if ('group' in data && data.group.length > 0) {
      let categoryIds = data.group.map((item) => makeObjectId(item._id));

      const queryFilter = {
        category: categoryIds,
        status: 'approved',
        isActive: true,
        isDeleted: false,
      };

      let sortingFilter = {};

      if ('sort' in req.body && req.body.sort && isValidObjectId(req.body.sort)) {
        let getSorting = await getSortingValueById(req.body.sort);

        if (getSorting) {
          sortingFilter = getSorting;
        }
      }

      if (filter.length > 0) {
        for (const id of filter) {
          if (id && isValidObjectId(id)) {
            let filterValue = await getFilterValueById(id);

            // console.log('-----------');
            // console.log(filterValue);

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

      let totalCount = await VendorProduct.countDocuments(queryFilter);
      let products = await VendorProduct.find(queryFilter)
        .populate([
          { path: 'segment', select: '_id name' },
          { path: 'category', select: '_id name' },
          { path: 'subCategory', select: '_id name' },
          { path: 'image', select: '_id url' },
        ])
        .select(
          '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
        )
        .sort(sortingFilter)
        .skip((page - 1) * count)
        .limit(count)
        .lean();

      for (let product of products) {
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
          for (let img of product.image) {
            if (img && 'url' in img && img.url.length > 0) {
              let productUrl = img.url.map((item) => {
                return `${protocol}://${hostname}/${item}`;
              });
              product.image = productUrl;
            }
          }

        }

      }

      return res.status(200).json({
        status: true,
        msg: 'Event products fetched successfully!',
        data: products,
        currentCount: products.length,
        totalCount,
      });
    }

    return sendResponseWithoutData(res, 400, false, 'No products available!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};


// export const getProductsByEventId = async (req, res) => {
//   try {
//     const user = req.apiUser;
//     const hostname = req.headers.host;
//     const protocol = req.protocol;

//     const page = req.body.page || 1;
//     const count = req.body.count || 10;

//     let { id, filter } = req.body;

//     let data = await EventGroup.findById(id)
//       .populate([
//         { path: 'image', select: '_id url' },
//         {
//           path: 'group',
//           select: '-__v -createdAt -createdBy -updatedAt -updatedBy -isDeleted -isActive',
//           // populate: { path: 'image', select: '_id url' },
//         },
//       ])
//       .select('-isDeleted -__v -createdBy -createdAt -updatedBy -updatedAt -isActive')
//       .lean();

//     if ('image' in data && data.image && data.image.url.length > 0) {
//       let imgUrl = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
//       data.image = imgUrl;
//     }

//     if ('group' in data && data.group.length > 0) {
//       let categoryIds = data.group.map((item) => makeObjectId(item._id));

//       const queryFilter = {
//         category: categoryIds,
//         status: 'approved',
//         isActive: true,
//         isDeleted: false,
//       };

//       let sortingFilter = {};

//       if ('sort' in req.body && req.body.sort && isValidObjectId(req.body.sort)) {
//         let getSorting = await getSortingValueById(req.body.sort);

//         if (getSorting) {
//           sortingFilter = getSorting;
//         }
//       }

//       if (filter.length > 0) {
//         for (const id of filter) {
//           if (id && isValidObjectId(id)) {
//             let filterValue = await getFilterValueById(id);

//             // console.log('-----------');
//             // console.log(filterValue);

//             if (filterValue && filterValue.filterCategoryId.type === 'range') {
//               if (!queryFilter.hasOwnProperty('$or')) {
//                 queryFilter.$or = [];
//               }
//               let tempRangeFilter = { [filterValue.filterCategoryId.field]: {} };

//               if (filterValue.min) {
//                 tempRangeFilter[filterValue.filterCategoryId.field].$gt = filterValue.min;
//               }
//               if (filterValue.max) {
//                 tempRangeFilter[filterValue.filterCategoryId.field].$lt = filterValue.max;
//               }

//               queryFilter.$or.push(tempRangeFilter);
//             }

//             if (filterValue && filterValue.filterCategoryId.type === 'match') {
//               if (!queryFilter.hasOwnProperty(filterValue.filterCategoryId.field)) {
//                 queryFilter[filterValue.filterCategoryId.field] = [];
//               }

//               queryFilter[filterValue.filterCategoryId.field].push(filterValue.match);
//             }
//           }
//         }
//       }

//       let totalCount = await VendorProduct.countDocuments(queryFilter);
//       let products = await VendorProduct.find(queryFilter)
//         .populate([
//           { path: 'segment', select: '_id name' },
//           { path: 'category', select: '_id name' },
//           { path: 'subCategory', select: '_id name' },
//           { path: 'image', select: '_id url' },
//         ])
//         .select(
//           '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
//         )
//         .sort(sortingFilter)
//         .skip((page - 1) * count)
//         .limit(count)
//         .lean();

//       for (let product of products) {
//         product.inWishlist = false;
//         product.inCart = false;

//         if (user) {
//           let checkWishlist = await Wishlist.findOne({ user: user._id, product: product._id });
//           if (checkWishlist) {
//             product.inWishlist = true;
//           }

//           let checkCart = await Cart.findOne({ user: user._id, product: product._id });
//           if (checkCart) {
//             product.inCart = true;
//           }
//         }

//         if (product.image && Array.isArray(product.image)) {
//           for (let img of product.image) {
//             if (img && 'url' in img && img.url.length > 0) {
//               let productUrl = img.url.map((item) => {
//                 return `${protocol}://${hostname}/${item}`;
//               });
//               product.image = productUrl;
//             }
//           }

//         }

//       }

//       return res.status(200).json({
//         status: true,
//         msg: 'Event products fetched successfully!',
//         data: products,
//         currentCount: products.length,
//         totalCount,
//       });
//     }

//     return sendResponseWithoutData(res, 400, false, 'No products available!');
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };





