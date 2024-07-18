import {  isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  getPercentageToNumber,
  getDiscount,
  getDayFromDate,
} from '../../helpers/helper.js';
import Cart from '../../models/Cart.js';
import VendorProduct from '../../models/VendorProduct.js';
import Coupon from '../../models/Coupon.js';
import CouponUsed from '../../models/CouponUsed.js';
import PoojaPackage from '../../models/PoojaPackage.js';
import SegmentDiscount from '../../models/SegmentDiscount.js';



// export const getBill = async (req, res) => {
//   try {
//     let user = req.apiUser;
//     const hostname = req.headers.host;
//     const protocol = req.protocol;
//     let { type, shipping, } = req.body;

//     let products = [];


//     let productsForStocks = [];

//     let totalPrice = 0;
//     let totalProductPrice = 0;
//     let totalMrp = 0;
//     let couponDiscount = 0;
//     let extraDiscount = 0;

//     let finalAmount = 0;

//     if (type === 'cart') {
//       let getCartProducts = await Cart.find({ user: user._id })
//         .populate({
//           path: 'product',
//           select:
//             '-isActive -isDeleted -vendorPrice -deliveryTypes -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
//           populate: [
//             {
//               path: "category", select: "name"
//             },
//             {
//               path: "segment", select: "name"
//             },
//             {
//               path: "image", select: "url"
//             },
//             {
//               path: "vendor", select: "name"
//             }
//           ]
//         },
//         )
//         .select('-createdBy -createdAt -updatedAt -updatedBy -__v -user')
//         .lean();

//       getCartProducts = getCartProducts.filter((item) => item.product);

//       if (getCartProducts.length === 0) {
//         return sendResponseWithoutData(res, 200, true, 'Your cart is empty!');
//       }

//       for (let item of getCartProducts) {
//         let findProduct = await VendorProduct.findOne({ _id: item.product, isDeleted: false }).populate([{ path: 'segment', select: "slug" }, { path: 'category', select: "name" },])
//           .select(
//             '-isActive -isDeleted  -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
//           )
//           .lean();

//         let checkSegmentDiscount = await SegmentDiscount.findOne({ segmentId: findProduct?.segment?._id, isDeleted: false }).select(
//           '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v '
//         ).lean();

//         if (item.product.stock < req.body.quantity) {
//           item.product.quantity = req.body.quantity;
//           item.product.quantity = false
  
//           if (item.product.image && Array.isArray(item.product.image)) {
//             let productUrl = [];
//             for (let img of item.product.image) {
//               if (img && 'url' in img && img.url.length > 0) {
//                 productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//               }

//               item.product.image = productUrl;
//             }
//           }
//           products.push({ ...item.product });
//           delete item.product.stock
//           delete item.product.sales
//           delete item.product.offer
//           delete item.product.rating
//           return sendResponseWithData(res, 200, true, 'Item out of stock!', {
//             mrp: 0,
//             price: 0,
//             extraDiscount: 0,
//             couponDiscount: 0,
//             // totalDiscount: totalDiscount,
//             shipping: 0,
//             total: 0,
//             product: products,
//           });
//         }
//         if (item.product.stock >= item.quantity) {





          
//           item.product.quantity = item.quantity;
//           item.product.totalPrice = Number(item.product.price) * Number(item.product.quantity);
//           item.product.totalMrp = Number(item.product.mrp) * Number(item.product.quantity);
//           totalProductPrice += item.product.totalPrice;
//           totalPrice += item.product.totalPrice;
//           totalMrp += item.product.totalMrp;

//           productsForStocks.push({ ...item.product });

//           delete item.product.stock;
//           delete item.product.offer;
//           delete item.product.rating;
//           delete item.product.sales;
//           delete item.product.slug;

//           item.product.discount = item.product.totalMrp - item.product.totalPrice;
//           if (checkSegmentDiscount) {
//             let discountPrice = await getDiscount(findProduct.price, checkSegmentDiscount.discountValue);
//             item.product.extraDiscount = discountPrice * item.product.quantity;
//             item.product.totalPrice -= item.product.extraDiscount;
//             totalPrice -= item.product.extraDiscount;
//             extraDiscount = item.product.extraDiscount
//           }
//           item.product.amountToPay = item.product.totalPrice;

//           if (item.product.image && Array.isArray(item.product.image)) {
//             let productUrl = [];
//             for (let img of item.product.image) {
//               if (img && 'url' in img && img.url.length > 0) {
//                 productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//               }

//               item.product.image = productUrl;
//             }
//           }

//           products.push({ ...item.product });
//         } else {
//           item.product.quantity = item.quantity;
//           delete item._id;
//           delete item.quantity;

//           return sendResponseWithData(res, 200, true, 'Item out of stock!', item);
//         }
//       }
//     } else if (type === 'product') {
//       if (!('product' in req.body) || !isValidObjectId(req.body.product)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid product id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for product which you want to buy!');
//       }

//       let getProductDirect = await VendorProduct.findOne({ slug: req.body.product, isDeleted: false }).populate([{ path: 'segment', select: "name" }, { path: 'category', select: "name" }, { path: "vendor", select: "name" },
//       { path: "image", select: "_id url" }

//       ])
//         .select(
//           '-isActive -slug -vendorPrice -deliveryTypes -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
//         )
//         .lean();

//       if (!getProductDirect) {
//         return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//       }

//       let checkSegmentDiscount = await SegmentDiscount.findOne({ segmentId: getProductDirect?.segment?._id, isDeleted: false }).select(
//         '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v'
//       ).lean();

//       if (getProductDirect.stock < req.body.quantity) {
//         getProductDirect.quantity = req.body.quantity;
//         getProductDirect.inStock = false

//         if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
//           let productUrl = [];
//           for (let img of getProductDirect.image) {
//             if (img && 'url' in img && img.url.length > 0) {
//               productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//             }
//             getProductDirect.image = productUrl;
//           }

//         }
//         products.push(getProductDirect)
//         delete getProductDirect.stock
//         delete getProductDirect.sales
//         delete getProductDirect.offer
//         delete getProductDirect.rating
//         return sendResponseWithData(res, 200, true, 'Item out of stock!', {
//           mrp: 0,
//           price: 0,
//           extraDiscount: 0,
//           couponDiscount: 0,
//           // totalDiscount: totalDiscount,
//           shipping: 0,
//           total: 0,
//           product: products,
//         });
//       }
//       getProductDirect.quantity = req.body.quantity;
//       getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
//       getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
//       totalPrice += getProductDirect.totalPrice;
//       totalProductPrice += getProductDirect.totalPrice;
//       totalMrp += getProductDirect.totalMrp;


//       getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
//       if (checkSegmentDiscount) {
//         let discountPrice = await getDiscount(getProductDirect.price, checkSegmentDiscount.discountValue)
//         totalPrice -= discountPrice;
//         getProductDirect.extraDiscount = discountPrice * getProductDirect.quantity;
//         getProductDirect.totalPrice -= getProductDirect.extraDiscount;
//         totalPrice -= getProductDirect.extraDiscount;
//         extraDiscount = getProductDirect.extraDiscount
//       }

//       getProductDirect.amountToPay = getProductDirect.totalPrice;

//       if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
//         let productUrl = [];
//         for (let img of getProductDirect.image) {
//           if (img && 'url' in img && img.url.length > 0) {
//             productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//           }
//           getProductDirect.image = productUrl;
//         }

//       }

//       productsForStocks.push({ ...getProductDirect });
//       getProductDirect.inStock = true
//       delete getProductDirect.stock;
//       delete getProductDirect.offer;
//       delete getProductDirect.rating;
//       delete getProductDirect.sales;

//       products.push(getProductDirect);


//     } else if (type === 'package') {
//       if (!('package' in req.body) || !isValidObjectId(req.body.package)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid package id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for package which you want to buy!');
//       }

//       let getProductDirect = await PoojaPackage.findOne({ _id: req.body.package, isActive: true, isDeleted: false })
//         .populate([
//           {
//             path: 'image',
//             select: '_id url',
//           },
//           {
//             path: 'elements',
//             select: '_id name',
//           },
//           {
//             path: 'segment',
//             select: '_id name',
//           },
//         ])
//         .select('-description -isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v ')
//         .lean();

//       if (!getProductDirect) {
//         return sendResponseWithoutData(res, 400, false, 'Invalid package id!');
//       }

//       if (getProductDirect.stock < req.body.quantity) {
//         getProductDirect.quantity = req.body.quantity;

//         getProductDirect.inStock = false

//         if (getProductDirect.image) {
//           if (getProductDirect.image && 'url' in getProductDirect.image && getProductDirect.image.url.length > 0) {
//             let url = getProductDirect.image.url.map((item) => {
//               return `${protocol}://${hostname}/${item}`;
//             });
//             getProductDirect.image = url;
//           }

//         }
//         products.push(getProductDirect)
//         delete getProductDirect.stock
//         delete getProductDirect.sales
//         delete getProductDirect.offer
//         delete getProductDirect.rating
//         return sendResponseWithData(res, 200, true, 'Item out of stock!', {
//           mrp: 0,
//           price: 0,
//           extraDiscount: 0,
//           couponDiscount: 0,
//           // totalDiscount: totalDiscount,
//           shipping: 0,
//           total: 0,
//           product: products,
//         });

//         // return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
//       }
//       getProductDirect.quantity = req.body.quantity;
//       getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
//       getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
//       totalPrice += getProductDirect.totalPrice;
//       totalProductPrice += getProductDirect.totalPrice;
//       totalMrp += getProductDirect.totalMrp;
//       getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
//       getProductDirect.amountToPay = getProductDirect.totalPrice;

//       if (getProductDirect.image) {
//         if (getProductDirect.image && 'url' in getProductDirect.image && getProductDirect.image.url.length > 0) {
//           let url = getProductDirect.image.url.map((item) => {
//             return `${protocol}://${hostname}/${item}`;
//           });
//           getProductDirect.image = url;
//         }

//       }
//       getProductDirect.inStock = true
//       products.push(getProductDirect);
//       delete getProductDirect.sales
//       delete getProductDirect.stock
//     }

//     // coupon calculation
//     let couponDetails = null;
//     if ('coupon' in req.body && req.body.coupon) {
//       const currentDate = new Date();

//       let tempCouponInfo = await Coupon.findOne({
//         code: req.body.coupon,
//         expiredAt: { $gt: currentDate },
//         isExpired: false,
//         isActive: true,
//         isDeleted: false,
//       }).lean();

//       if (tempCouponInfo) {
//         let userCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon, usedBy: user._id });
//         if (userCouponUserCount >= tempCouponInfo.userLimit) {
//           return sendResponseWithoutData(res, 400, false, 'You have already used this coupon maximum time!');
//         }

//         let totalCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon });
//         if (totalCouponUserCount >= tempCouponInfo.totalLimit) {
//           await Coupon.updateOne({ code: req.body.coupon, isDeleted: false }, { $set: { isExpired: true } });
//           return sendResponseWithoutData(res, 400, false, 'This coupon is expired!');
//         }

//         couponDetails = tempCouponInfo;
//       }
//     }

//     if (couponDetails) {
//       if (couponDetails.type === 'flat') {
//         couponDiscount = couponDetails.discount || 0;
//       } else if (couponDetails.type === 'percentage') {
//         let discountFromPercent = getPercentageToNumber(totalPrice, couponDetails.discount);
//         if (discountFromPercent > couponDetails.discountUpTo) {
//           couponDiscount = couponDetails.discountUpTo;
//         } else {
//           couponDiscount = discountFromPercent;
//         }
//       }
//     }
//     // final amount calculation
//     const shippingPrice = shipping === 'standard' ? 60 : 0;

//     let perProductDiscount = couponDiscount / products.length;
//     let perProductShippingPrice = shippingPrice / products.length;
//     products.forEach((product) => {
//       product.couponDiscount = perProductDiscount;
//       product.shippingCost = perProductShippingPrice;
//       product.amountToPay -= perProductDiscount;
//       totalPrice -= perProductDiscount;
//       product.amountToPay += perProductShippingPrice;

//       finalAmount += product.amountToPay
//     });

//     const result = {
//       mrp: totalMrp,
//       price: totalProductPrice,
//       extraDiscount: extraDiscount,
//       couponDiscount: couponDiscount,
//       // totalDiscount: totalDiscount,
//       shipping: shippingPrice,
//       total: finalAmount,
//       product: products,
//     };
//     if (!result) {

//       return sendResponseWithoutData(res, 400, false, 'Failed to Bill fetched!');
//     }
//     return sendResponseWithData(res, 200, true, 'Bill fetched successfully!', result);

//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };


export const getBill = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let { type, } = req.body;

    let products = [];

    let productsForStocks = [];
    let productsOutOfStocks = [];
    let productsForPreviousDate = [];

    let totalPrice = 0;
    let totalProductPrice = 0;
    let totalMrp = 0;
    let couponDiscount = 0;
    let extraDiscount = 0;
    let shippingCost = 60;

    let finalAmount = 0;
    let deliveryDate ;

    if (type === 'cart') {
      let getCartProducts = await Cart.find({ user: user._id })
        .populate({
          path: 'product',
          select:
            '-isActive -isDeleted -vendorPrice -deliveryTypes -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
          populate: [
            {
              path: "category", select: "name"
            },
            {
              path: "segment", select: "name"
            },
            {
              path: "image", select: "url"
            },
            {
              path: "vendor", select: "name"
            }
          ]
        },
        )
        .select('-createdBy -createdAt -updatedAt -updatedBy -__v -user')
        .lean();

      getCartProducts = getCartProducts.filter((item) => item.product);

      if (getCartProducts.length === 0) {
        return sendResponseWithoutData(res, 200, true, 'Your cart is empty!');
      }

      for (let item of getCartProducts) {
        let findProduct = await VendorProduct.findOne({ _id: item.product, isDeleted: false }).populate([{ path: 'segment', select: "slug" }, { path: 'category', select: "name" },])
          .select(
            '-isActive -isDeleted  -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
          )
          .lean();

        let checkSegmentDiscount = await SegmentDiscount.findOne({ segmentId: findProduct?.segment?._id, isDeleted: false }).select(
          '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v '
        ).lean();

        if (item.product.stock < item.quantity) {
          item.product.inStock = false;
          item.product.quantity = item.quantity;
          item.product.totalPrice = Number(item.product.price) * Number(item.product.stock);
          item.product.totalMrp = Number(item.product.mrp) * Number(item.product.stock);
          item.product.amountToPay = item.product.totalPrice;
  
          if (item.product.image && Array.isArray(item.product.image)) {
            let productUrl = [];
            for (let img of item.product.image) {
              if (img && 'url' in img && img.url.length > 0) {
                productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
              }
            }
        
            item.product.image = productUrl;
          }
          shippingCost =0
          delete item.product.sales;
          delete item.product.stock;
          delete item.product.offer;
        productsOutOfStocks.push({ ...item.product });
          // productsForStocks.push({ ...item.product });
          // products.push({ ...item.product });
        } 
        else {
          
          if (new Date(item.deliveryDate) < new Date()) {
            item.product.quantity = item.quantity;
            item.product.isValidDeliveryDate = false;
          item.product.totalPrice = 0;
          item.product.totalMrp = 0;
          shippingCost =0;
            if (item.product.image && Array.isArray(item.product.image)) {
              let productUrl = [];
              for (let img of item.product.image) {
                if (img && 'url' in img && img.url.length > 0) {
                  productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
                }
              }
              item.product.image = productUrl;
            }
            productsForPreviousDate.push({ ...item.product });
          }else{

            item.product.quantity = item.quantity;
            item.product.totalPrice = Number(item.product.price) * Number(item.product.quantity);
            item.product.totalMrp = Number(item.product.mrp) * Number(item.product.quantity);
            totalProductPrice += item.product.totalPrice;
            totalPrice += item.product.totalPrice;
            totalMrp += item.product.totalMrp;
            
            deliveryDate = item.deliveryDate
            productsForStocks.push({ ...item.product });
  
            delete item.product.stock;
            delete item.product.offer;
            delete item.product.rating;
            delete item.product.sales;
            delete item.product.slug;
  
            item.product.discount = item.product.totalMrp - item.product.totalPrice;
            if (checkSegmentDiscount) {
              let discountPrice = await getDiscount(findProduct.price, checkSegmentDiscount.discountValue);
              item.product.extraDiscount = discountPrice * item.product.quantity;
              item.product.totalPrice -= item.product.extraDiscount;
              totalPrice -= item.product.extraDiscount;
              extraDiscount += item.product.extraDiscount;
            }
          
            item.product.amountToPay = item.product.totalPrice;
            item.product.inStock = true;
            item.product.isValidDeliveryDate = true;
  
            if (item.product.image && Array.isArray(item.product.image)) {
              let productUrl = [];
              for (let img of item.product.image) {
                if (img && 'url' in img && img.url.length > 0) {
                  productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
                }
              }
              item.product.image = productUrl;
            }
           
            if (item.product.totalPrice > 1000) {
              shippingCost = 0;
            }
  
            // productsForStocks.push({ ...item.product });
            products.push({ ...item.product });
          }
         
        }
      }
    } else if (type === 'product') {
      if (!('product' in req.body) || !isValidObjectId(req.body.product)) {
        return sendResponseWithoutData(res, 400, false, 'Provide a valid product id to proceed!');
      }

      if (!('quantity' in req.body)) {
        return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for product which you want to buy!');
      }


      if (!('deliveryDate' in req.body)) {
        return sendResponseWithoutData(res, 400, false, 'Provide a deliveryDate for product which you want to buy!');
      }
      deliveryDate = req.body.deliveryDate
      let deliveryTime = '00:00';
      if ('deliveryTime' in req.body && req.body.deliveryTime) {
        let [hrs, min] = req.body.deliveryTime.split(':');
        if (
          Number(hrs) &&
          Number(min) &&
          Number(hrs) >= 0 &&
          Number(hrs) < 24 &&
          Number(min) >= 0 &&
          Number(min) < 60
        ) {
          deliveryTime = `${hrs}:${min}`;
        }
      }
   
       
      let getProductDirect = await VendorProduct.findOne({ _id: req.body.product, isDeleted: false }).populate([{ path: 'segment', select: "name" }, { path: 'category', select: "name" }, { path: "vendor", select: "name" },
      { path: "image", select: "_id url" }

      ])
        .select(
          '-isActive -slug -vendorPrice -deliveryTypes -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
        )
        .lean();

      if (!getProductDirect) {
        return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
      }

      let checkSegmentDiscount = await SegmentDiscount.findOne({ segmentId: getProductDirect?.segment?._id, isDeleted: false }).select(
        '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v'
      ).lean();

      if (getProductDirect.stock < req.body.quantity) {
        getProductDirect.quantity = req.body.quantity;
        getProductDirect.inStock = false

        if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
          let productUrl = [];
          for (let img of getProductDirect.image) {
            if (img && 'url' in img && img.url.length > 0) {
              productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            }
            getProductDirect.image = productUrl;
          }

        }
        products.push(getProductDirect)
        delete getProductDirect.stock
        delete getProductDirect.sales
        delete getProductDirect.offer
        delete getProductDirect.rating
        return sendResponseWithData(res, 200, true, 'Item out of stock!', {
          mrp: 0,
          price: 0,
          extraDiscount: 0,
          couponDiscount: 0,
          // totalDiscount: totalDiscount,
          shipping: 0,
          total: 0,
          product: products,
        });
      }
      getProductDirect.quantity = req.body.quantity;
      getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
      getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
      totalPrice += getProductDirect.totalPrice;
      totalProductPrice += getProductDirect.totalPrice;
      totalMrp += getProductDirect.totalMrp;


      getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
      if (checkSegmentDiscount) {
        let discountPrice = await getDiscount(getProductDirect.price, checkSegmentDiscount.discountValue)
        totalPrice -= discountPrice;
        getProductDirect.extraDiscount = discountPrice * getProductDirect.quantity;
        getProductDirect.totalPrice -= getProductDirect.extraDiscount;
        totalPrice -= getProductDirect.extraDiscount;
        extraDiscount = getProductDirect.extraDiscount
      }

      getProductDirect.amountToPay = getProductDirect.totalPrice;

      if(getProductDirect.totalPrice > 1000){
        shippingCost = 0
      }

      if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
        let productUrl = [];
        for (let img of getProductDirect.image) {
          if (img && 'url' in img && img.url.length > 0) {
            productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
          }
          getProductDirect.image = productUrl;
        }

      }

      getProductDirect.inStock = true
      productsForStocks.push({ ...getProductDirect });
      delete getProductDirect.stock;
      delete getProductDirect.offer;
      delete getProductDirect.rating;
      delete getProductDirect.sales;

      products.push(getProductDirect);

    } else if (type === 'package') {
      if (!('package' in req.body) || !isValidObjectId(req.body.package)) {
        return sendResponseWithoutData(res, 400, false, 'Provide a valid package id to proceed!');
      }

      if (!('quantity' in req.body)) {
        return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for package which you want to buy!');
      }

      if (!('deliveryDate' in req.body)) {
        return sendResponseWithoutData(res, 400, false, 'Provide a deliveryDate for package which you want to buy!');
      }
      deliveryDate = req.body.deliveryDate
      let deliveryTime = '00:00';
      if ('deliveryTime' in req.body && req.body.deliveryTime) {
        let [hrs, min] = req.body.deliveryTime.split(':');
        if (
          Number(hrs) &&
          Number(min) &&
          Number(hrs) >= 0 &&
          Number(hrs) < 24 &&
          Number(min) >= 0 &&
          Number(min) < 60
        ) {
          deliveryTime = `${hrs}:${min}`;
        }
      }


      let getProductDirect = await PoojaPackage.findOne({ _id: req.body.package, isActive: true, isDeleted: false })
        .populate([
          {
            path: 'image',
            select: '_id url',
          },
          {
            path: 'elements',
            select: '_id name',
          },
          {
            path: 'segment',
            select: '_id name',
          },
        ])
        .select('-description -isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v ')
        .lean();

      if (!getProductDirect) {
        return sendResponseWithoutData(res, 400, false, 'Invalid package id!');
      }

      if (getProductDirect.stock < req.body.quantity) {
        getProductDirect.quantity = req.body.quantity;

        getProductDirect.inStock = false

        if (getProductDirect.image) {
          if (getProductDirect.image && 'url' in getProductDirect.image && getProductDirect.image.url.length > 0) {
            let url = getProductDirect.image.url.map((item) => {
              return `${protocol}://${hostname}/${item}`;
            });
            getProductDirect.image = url;
          }

        }
        products.push(getProductDirect)
        delete getProductDirect.stock
        delete getProductDirect.sales
        delete getProductDirect.offer
        delete getProductDirect.rating
        return sendResponseWithData(res, 200, true, 'Item out of stock!', {
          mrp: 0,
          price: 0,
          extraDiscount: 0,
          couponDiscount: 0,
          // totalDiscount: totalDiscount,
          shipping: 0,
          total: 0,
          product: products,
        });

        // return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
      }
      getProductDirect.quantity = req.body.quantity;
      getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
      getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
      totalPrice += getProductDirect.totalPrice;
      totalProductPrice += getProductDirect.totalPrice;
      totalMrp += getProductDirect.totalMrp;
      getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
      getProductDirect.amountToPay = getProductDirect.totalPrice;

      if (getProductDirect.image) {
        if (getProductDirect.image && 'url' in getProductDirect.image && getProductDirect.image.url.length > 0) {
          let url = getProductDirect.image.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
          getProductDirect.image = url;
        }

      }

      if(getProductDirect.totalPrice > 1000){
        shippingCost =0;
      }
      getProductDirect.inStock = true
      // productsForStocks.push(getProductDirect);
      products.push(getProductDirect);
      delete getProductDirect.sales
      delete getProductDirect.stock
    }

    // coupon calculation
    let couponDetails = null;
    if ('coupon' in req.body && req.body.coupon) {
      const currentDate = new Date();

      let tempCouponInfo = await Coupon.findOne({
        code: req.body.coupon,
        expiredAt: { $gt: currentDate },
        isExpired: false,
        isActive: true,
        isDeleted: false,
      }).lean();

      if (tempCouponInfo) {
        let userCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon, usedBy: user._id });
        if (userCouponUserCount >= tempCouponInfo.userLimit) {
          return sendResponseWithoutData(res, 400, false, 'You have already used this coupon maximum time!');
        }

        let totalCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon });
        if (totalCouponUserCount >= tempCouponInfo.totalLimit) {
          await Coupon.updateOne({ code: req.body.coupon, isDeleted: false }, { $set: { isExpired: true } });
          return sendResponseWithoutData(res, 400, false, 'This coupon is expired!');
        }

        couponDetails = tempCouponInfo;
      }
    }

    if (couponDetails) {
      if (couponDetails.type === 'flat') {
        couponDiscount = couponDetails.discount || 0;
      } else if (couponDetails.type === 'percentage') {
        let discountFromPercent = getPercentageToNumber(totalPrice, couponDetails.discount);
        if (discountFromPercent > couponDetails.discountUpTo) {
          couponDiscount = couponDetails.discountUpTo;
        } else {
          couponDiscount = discountFromPercent;
        }
      }
    }

    // final amount calculation
    let shippingPrice;

    let day = await getDayFromDate(deliveryDate);

    if (day === "Sunday") {
      shippingPrice = 0
    } else {
      shippingPrice = shippingCost
    }

    let perProductDiscount = couponDiscount / products.length;
    let perProductShippingPrice = shippingPrice / products.length;

   
    products.forEach((product) => {
      if (product.price < 1000) {
        product.shippingCost = perProductShippingPrice;
        product.amountToPay += perProductShippingPrice;
      }
      
      product.couponDiscount = perProductDiscount;
      product.amountToPay -= perProductDiscount;
      totalPrice -= perProductDiscount;
      finalAmount += product.amountToPay;
    });
 
let productArr = [...products,...productsOutOfStocks,...productsForPreviousDate]

    const result = {
      mrp: totalMrp,
      price: totalProductPrice,
      extraDiscount: extraDiscount,
      couponDiscount: couponDiscount,
      shipping: shippingPrice,
      total: finalAmount,
       products: productArr,
    };

    if (!result) {
      return sendResponseWithoutData(res, 400, false, 'Failed to Bill fetched!');
    }

    return sendResponseWithData(res, 200, true, 'Bill fetched successfully!', result);

  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};


// export const getBill = async (req, res) => {
//   try {
//     let user = req.apiUser;
//     const hostname = req.headers.host;
//     const protocol = req.protocol;
//     let { type, shipping, } = req.body;

//     let products = [];


//     let productsForStocks = [];

//     let totalPrice = 0;
//     let totalProductPrice = 0;
//     let totalMrp = 0;
//     let couponDiscount = 0;
//     let extraDiscount = 0;

//     let finalAmount = 0;

//     if (type === 'cart') {
//       let getCartProducts = await Cart.find({ user: user._id })
//         .populate({
//           path: 'product',
//           select:
//             '-isActive -isDeleted -vendorPrice -deliveryTypes -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
//           populate: [
//             {
//               path: "category", select: "name"
//             },
//             {
//               path: "segment", select: "name"
//             },
//             {
//               path: "image", select: "url"
//             },
//             {
//               path: "vendor", select: "name"
//             }
//           ]
//         },
//         )
//         .select('-createdBy -createdAt -updatedAt -updatedBy -__v -user')
//         .lean();

//       getCartProducts = getCartProducts.filter((item) => item.product);

//       if (getCartProducts.length === 0) {
//         return sendResponseWithoutData(res, 200, true, 'Your cart is empty!');
//       }

//       for (let item of getCartProducts) {
//         let findProduct = await VendorProduct.findOne({ _id: item.product, isDeleted: false }).populate([{ path: 'segment', select: "slug" }, { path: 'category', select: "name" },])
//           .select(
//             '-isActive -isDeleted  -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
//           )
//           .lean();

//         let checkSegmentDiscount = await SegmentDiscount.findOne({ segmentId: findProduct?.segment?._id, isDeleted: false }).select(
//           '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v '
//         ).lean();

        
//         if (item.product.stock >= item.quantity) {
//           item.product.quantity = item.quantity;
//           item.product.totalPrice = Number(item.product.price) * Number(item.product.quantity);
//           item.product.totalMrp = Number(item.product.mrp) * Number(item.product.quantity);
//           totalProductPrice += item.product.totalPrice;
//           totalPrice += item.product.totalPrice;
//           totalMrp += item.product.totalMrp;

//           productsForStocks.push({ ...item.product });

//           delete item.product.stock;
//           delete item.product.offer;
//           delete item.product.rating;
//           delete item.product.sales;
//           delete item.product.slug;

//           item.product.discount = item.product.totalMrp - item.product.totalPrice;
//           if (checkSegmentDiscount) {
//             let discountPrice = await getDiscount(findProduct.price, checkSegmentDiscount.discountValue);
//             item.product.extraDiscount = discountPrice * item.product.quantity;
//             item.product.totalPrice -= item.product.extraDiscount;
//             totalPrice -= item.product.extraDiscount;
//             extraDiscount = item.product.extraDiscount
//           }
//           item.product.amountToPay = item.product.totalPrice;

//           if (item.product.image && Array.isArray(item.product.image)) {
//             let productUrl = [];
//             for (let img of item.product.image) {
//               if (img && 'url' in img && img.url.length > 0) {
//                 productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//               }

//               item.product.image = productUrl;
//             }
//           }

//           products.push({ ...item.product });
//         } else {
//           item.product.quantity = item.quantity;
//           delete item._id;
//           delete item.quantity;

//           return sendResponseWithData(res, 200, true, 'Item out of stock!', item);
//         }
//       }
//     } else if (type === 'product') {
//       if (!('product' in req.body) || !isValidObjectId(req.body.product)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid product id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for product which you want to buy!');
//       }

//       let getProductDirect = await VendorProduct.findOne({ _id: req.body.product, isDeleted: false }).populate([{ path: 'segment', select: "name" }, { path: 'category', select: "name" }, { path: "vendor", select: "name" },
//       { path: "image", select: "_id url" }

//       ])
//         .select(
//           '-isActive -slug -vendorPrice -deliveryTypes -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
//         )
//         .lean();

//       if (!getProductDirect) {
//         return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//       }

//       let checkSegmentDiscount = await SegmentDiscount.findOne({ segmentId: getProductDirect?.segment?._id, isDeleted: false }).select(
//         '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v'
//       ).lean();

//       if (getProductDirect.stock < req.body.quantity) {
//         getProductDirect.quantity = req.body.quantity;
//         getProductDirect.inStock = false

//         if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
//           let productUrl = [];
//           for (let img of getProductDirect.image) {
//             if (img && 'url' in img && img.url.length > 0) {
//               productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//             }
//             getProductDirect.image = productUrl;
//           }

//         }
//         products.push(getProductDirect)
//         delete getProductDirect.stock
//         delete getProductDirect.sales
//         delete getProductDirect.offer
//         delete getProductDirect.rating
//         return sendResponseWithData(res, 200, true, 'Item out of stock!', {
//           mrp: 0,
//           price: 0,
//           extraDiscount: 0,
//           couponDiscount: 0,
//           // totalDiscount: totalDiscount,
//           shipping: 0,
//           total: 0,
//           product: products,
//         });
//       }
//       getProductDirect.quantity = req.body.quantity;
//       getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
//       getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
//       totalPrice += getProductDirect.totalPrice;
//       totalProductPrice += getProductDirect.totalPrice;
//       totalMrp += getProductDirect.totalMrp;


//       getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
//       if (checkSegmentDiscount) {
//         let discountPrice = await getDiscount(getProductDirect.price, checkSegmentDiscount.discountValue)
//         totalPrice -= discountPrice;
//         getProductDirect.extraDiscount = discountPrice * getProductDirect.quantity;
//         getProductDirect.totalPrice -= getProductDirect.extraDiscount;
//         totalPrice -= getProductDirect.extraDiscount;
//         extraDiscount = getProductDirect.extraDiscount
//       }

//       getProductDirect.amountToPay = getProductDirect.totalPrice;

//       if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
//         let productUrl = [];
//         for (let img of getProductDirect.image) {
//           if (img && 'url' in img && img.url.length > 0) {
//             productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
//           }
//           getProductDirect.image = productUrl;
//         }

//       }

//       productsForStocks.push({ ...getProductDirect });
//       getProductDirect.inStock = true
//       delete getProductDirect.stock;
//       delete getProductDirect.offer;
//       delete getProductDirect.rating;
//       delete getProductDirect.sales;

//       products.push(getProductDirect);


//     } else if (type === 'package') {
//       if (!('package' in req.body) || !isValidObjectId(req.body.package)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid package id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for package which you want to buy!');
//       }

//       let getProductDirect = await PoojaPackage.findOne({ _id: req.body.package, isActive: true, isDeleted: false })
//         .populate([
//           {
//             path: 'image',
//             select: '_id url',
//           },
//           {
//             path: 'elements',
//             select: '_id name',
//           },
//           {
//             path: 'segment',
//             select: '_id name',
//           },
//         ])
//         .select('-description -isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v ')
//         .lean();

//       if (!getProductDirect) {
//         return sendResponseWithoutData(res, 400, false, 'Invalid package id!');
//       }

//       if (getProductDirect.stock < req.body.quantity) {
//         getProductDirect.quantity = req.body.quantity;

//         getProductDirect.inStock = false

//         if (getProductDirect.image) {
//           if (getProductDirect.image && 'url' in getProductDirect.image && getProductDirect.image.url.length > 0) {
//             let url = getProductDirect.image.url.map((item) => {
//               return `${protocol}://${hostname}/${item}`;
//             });
//             getProductDirect.image = url;
//           }

//         }
//         products.push(getProductDirect)
//         delete getProductDirect.stock
//         delete getProductDirect.sales
//         delete getProductDirect.offer
//         delete getProductDirect.rating
//         return sendResponseWithData(res, 200, true, 'Item out of stock!', {
//           mrp: 0,
//           price: 0,
//           extraDiscount: 0,
//           couponDiscount: 0,
//           // totalDiscount: totalDiscount,
//           shipping: 0,
//           total: 0,
//           product: products,
//         });

//         // return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
//       }
//       getProductDirect.quantity = req.body.quantity;
//       getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
//       getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
//       totalPrice += getProductDirect.totalPrice;
//       totalProductPrice += getProductDirect.totalPrice;
//       totalMrp += getProductDirect.totalMrp;
//       getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
//       getProductDirect.amountToPay = getProductDirect.totalPrice;

//       if (getProductDirect.image) {
//         if (getProductDirect.image && 'url' in getProductDirect.image && getProductDirect.image.url.length > 0) {
//           let url = getProductDirect.image.url.map((item) => {
//             return `${protocol}://${hostname}/${item}`;
//           });
//           getProductDirect.image = url;
//         }

//       }
//       getProductDirect.inStock = true
//       products.push(getProductDirect);
//       delete getProductDirect.sales
//       delete getProductDirect.stock
//     }

//     // coupon calculation
//     let couponDetails = null;
//     if ('coupon' in req.body && req.body.coupon) {
//       const currentDate = new Date();

//       let tempCouponInfo = await Coupon.findOne({
//         code: req.body.coupon,
//         expiredAt: { $gt: currentDate },
//         isExpired: false,
//         isActive: true,
//         isDeleted: false,
//       }).lean();

//       if (tempCouponInfo) {
//         let userCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon, usedBy: user._id });
//         if (userCouponUserCount >= tempCouponInfo.userLimit) {
//           return sendResponseWithoutData(res, 400, false, 'You have already used this coupon maximum time!');
//         }

//         let totalCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon });
//         if (totalCouponUserCount >= tempCouponInfo.totalLimit) {
//           await Coupon.updateOne({ code: req.body.coupon, isDeleted: false }, { $set: { isExpired: true } });
//           return sendResponseWithoutData(res, 400, false, 'This coupon is expired!');
//         }

//         couponDetails = tempCouponInfo;
//       }
//     }

//     if (couponDetails) {
//       if (couponDetails.type === 'flat') {
//         couponDiscount = couponDetails.discount || 0;
//       } else if (couponDetails.type === 'percentage') {
//         let discountFromPercent = getPercentageToNumber(totalPrice, couponDetails.discount);
//         if (discountFromPercent > couponDetails.discountUpTo) {
//           couponDiscount = couponDetails.discountUpTo;
//         } else {
//           couponDiscount = discountFromPercent;
//         }
//       }
//     }
//     // final amount calculation
//     const shippingPrice = shipping === 'standard' ? 60 : 0;

//     let perProductDiscount = couponDiscount / products.length;
//     let perProductShippingPrice = shippingPrice / products.length;
//     products.forEach((product) => {
//       product.couponDiscount = perProductDiscount;
//       product.shippingCost = perProductShippingPrice;
//       product.amountToPay -= perProductDiscount;
//       totalPrice -= perProductDiscount;
//       product.amountToPay += perProductShippingPrice;

//       finalAmount += product.amountToPay
//     });

//     const result = {
//       mrp: totalMrp,
//       price: totalProductPrice,
//       extraDiscount: extraDiscount,
//       couponDiscount: couponDiscount,
//       // totalDiscount: totalDiscount,
//       shipping: shippingPrice,
//       total: finalAmount,
//       product: products,
//     };
//     if (!result) {

//       return sendResponseWithoutData(res, 400, false, 'Failed to Bill fetched!');
//     }
//     return sendResponseWithData(res, 200, true, 'Bill fetched successfully!', result);

//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };
// export const getBill1 = async (req, res) => {
//   try {
//     let user = req.apiUser;
//     const hostname = req.headers.host;
//     const protocol = req.protocol;

//     let { type, shipping, paymentMethod } = req.body;

//     let products = [];
//     let totalPrice = 0;
//     let totalMrp = 0;
//     let couponDiscount = 0;

//     if (type === 'cart') {
//       let getCartProducts = await Cart.find({ user: user._id })
//         // .populate({ path: 'product', select: 'name price stock mrp' })
//         .populate({
//           path: 'product',
//           select:
//             '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
//           populate: [
//             {
//               path: 'image',
//               select: '_id url',
//             },
//             {
//               path: 'category',
//               select: '_id name',
//             },
//             {
//               path: 'segment',
//               select: '_id name',
//             },
//             {
//               path: 'vendor',
//               select: '_id name',
//             },
//           ],
//         })
//         .select('-createdBy -createdAt -updatedAt -updatedBy -__v -user')
//         .lean();

//       getCartProducts = getCartProducts.filter((item) => item.product);

//       if (getCartProducts.length === 0) {
//         return sendResponseWithoutData(res, 200, true, 'Your cart is empty!');
//       }

//       for (let item of getCartProducts) {
//         if (item.product.stock >= item.quantity) {
//           item.product.quantity = item.quantity;
//           item.product.totalPrice = Number(item.product.price) * Number(item.product.quantity);
//           item.product.totalMrp = Number(item.product.mrp) * Number(item.product.quantity);
//           totalPrice += item.product.totalPrice;
//           totalMrp += item.product.totalMrp;

//           if (item.product.image && Array.isArray(item.product.image)) {
//             for (let img of item.product.image) {
//               let url = img.url.map((item) => {
//                 return `${protocol}://${hostname}/${item}`;
//               });
//               item.product.image = url;
//             }


//           }
//           products.push(item.product);
//           delete item.product.sales

//         } else {
//           item.product.quantity = item.quantity;
//           delete item._id;
//           delete item.quantity;
//           return sendResponseWithData(res, 400, false, 'Item out of stock!', item);
//         }
//       }
//     } else if (type === 'product') {
//       if (!('product' in req.body) || !isValidObjectId(req.body.product)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid product id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for product which you want to buy!');
//       }

//       let getProductDirect = await VendorProduct.findOne({ _id: req.body.product, isDeleted: false })
//         // .select('name price stock mrp')
//         .populate([
//           {
//             path: 'image',
//             select: '_id url',
//           },
//           {
//             path: 'category',
//             select: '_id name',
//           },
//           {
//             path: 'segment',
//             select: '_id name',
//           },
//           {
//             path: 'vendor',
//             select: '_id name',
//           },
//         ])
//         .select(
//           '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
//         )
//         .lean();

//       if (!getProductDirect) {
//         return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
//       }

//       if (getProductDirect.stock < req.body.quantity) {
//         getProductDirect.quantity = req.body.quantity;
//         return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
//       }
//       getProductDirect.quantity = req.body.quantity;
//       getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
//       getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
//       totalPrice += getProductDirect.totalPrice;
//       totalMrp += getProductDirect.totalMrp;

//       if (getProductDirect.image && Array.isArray(getProductDirect.image)) {
//         for (let img of getProductDirect.image) {
//           let url = img.url.map((item) => {
//             return `${protocol}://${hostname}/${item}`;
//           });
//           getProductDirect.image = url;

//         }

//       }

//       products.push(getProductDirect);
//     } else if (type === 'package') {
//       if (!('package' in req.body) || !isValidObjectId(req.body.package)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid package id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for package which you want to buy!');
//       }

//       let getProductDirect = await PoojaPackage.findOne({ _id: req.body.package, isActive: true, isDeleted: false })
//         .populate([
//           {
//             path: 'image',
//             select: '_id url',
//           },
//           {
//             path: 'elements',
//             select: '_id name description image',
//             populate: [{ path: 'image', select: 'id url' }],
//           },
//           {
//             path: 'segment',
//             select: '_id name',
//           },
//         ])
//         .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
//         .lean();

//       if (!getProductDirect) {
//         return sendResponseWithoutData(res, 400, false, 'Invalid package id!');
//       }

//       if (getProductDirect.stock < req.body.quantity) {
//         getProductDirect.quantity = req.body.quantity;
//         return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
//       }
//       getProductDirect.quantity = req.body.quantity;
//       getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
//       getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
//       totalPrice += getProductDirect.totalPrice;
//       totalMrp += getProductDirect.totalMrp;

//       if (getProductDirect.image) {
//         let url = getProductDirect.image.url.map((item) => {
//           return `${protocol}://${hostname}/${item}`;
//         });
//         getProductDirect.image = url;
//       }

//       if (getProductDirect.elements && getProductDirect.elements.length > 0) {
//         getProductDirect.elements.map((item) => {
//           if (item.image && item.image.url.length > 0) {
//             let url = item.image.url.map((e) => `${protocol}://${hostname}/${e}`);
//             item.image = url;
//           }
//         });
//       }

//       products.push(getProductDirect);
//     }

//     let couponDetails = null;
//     if ('coupon' in req.body && req.body.coupon) {
//       const currentDate = new Date();

//       let tempCouponInfo = await Coupon.findOne({
//         code: req.body.coupon,
//         expiredAt: { $gt: currentDate },
//         isExpired: false,
//         isActive: true,
//         isDeleted: false,
//       }).lean();

//       if (tempCouponInfo) {
//         let userCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon, usedBy: user._id });
//         if (userCouponUserCount >= tempCouponInfo.userLimit) {
//           return sendResponseWithoutData(res, 400, false, 'You have already used this coupon maximum time!');
//         }

//         let totalCouponUserCount = await CouponUsed.countDocuments({ couponCode: req.body.coupon });
//         if (totalCouponUserCount >= tempCouponInfo.totalLimit) {
//           await Coupon.updateOne({ code: req.body.coupon, isDeleted: false }, { $set: { isExpired: true } });
//           return sendResponseWithoutData(res, 400, false, 'This coupon is expired!');
//         }

//         couponDetails = tempCouponInfo;
//       }
//     }

//     if (couponDetails) {
//       if (couponDetails.type === 'flat') {
//         couponDiscount = couponDetails.discount || 0;
//       } else if (couponDetails.type === 'percentage') {
//         let discountFromPercent = getPercentageToNumber(totalPrice, couponDetails.discount);
//         if (discountFromPercent > couponDetails.discountUpTo) {
//           couponDiscount = couponDetails.discountUpTo;
//         } else {
//           couponDiscount = discountFromPercent;
//         }
//       }
//     }

//     const shippingPrice = shipping === 'standard' ? 60 : 0;
//     const discount = totalMrp - totalPrice;
//     const finalAmount = totalPrice - couponDiscount + shippingPrice;
//     const totalDiscount = discount + couponDiscount;

//     const result = {
//       mrp: totalMrp,
//       discount: discount,
//       price: totalPrice,
//       couponDiscount: couponDiscount,
//       totalDiscount: totalDiscount,
//       shipping: shippingPrice,
//       total: finalAmount,
//       product: products,
//     };

//     return sendResponseWithData(res, 200, true, 'Bill fetched successfully!', result);
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };
