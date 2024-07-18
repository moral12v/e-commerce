import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  getPercentageToNumber,
  generateOrderId,
  generateInvoiceId,
  mailOrderPlaceTemplate,
  getDiscount,
  getDayFromDate,
  sendPushNotification,
} from '../../helpers/helper.js';
import { payment } from '../../helpers/payment.js';
import Cart from '../../models/Cart.js';
import VendorProduct from '../../models/VendorProduct.js';
import Coupon from '../../models/Coupon.js';
import Order from '../../models/Order.js';
import Transaction from '../../models/Transaction.js';
import CouponUsed from '../../models/CouponUsed.js';
import PoojaPackage from '../../models/PoojaPackage.js';
import { MAILER_EMAIL } from '../../../config/config.js';
import { sendMail } from '../../../config/mailer.js';
import SegmentDiscount from '../../models/SegmentDiscount.js';



export const placeOrder = async (req, res) => {
  try {
    let user = req.apiUser;

    let { type, paymentMethod, address } = req.body;

    console.log('------------------ Request start ------------------');
    console.log(req.body);

    let products = [];


    let productsForStocks = [];

    let totalPrice = 0;
    let totalProductPrice = 0;
    let totalMrp = 0;
    let couponDiscount = 0;
    let extraDiscount = 0;
    let deliveryDate;
    let finalAmount = 0;
    let shippingCost = 60;

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
              path: "segment", select: "name slug"
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
          '-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v'
        ).lean();


        if (item.product.stock >= item.quantity) {
          item.product.quantity = item.quantity;
          item.product.totalPrice = Number(item.product.price) * Number(item.product.quantity);
          item.product.totalMrp = Number(item.product.mrp) * Number(item.product.quantity);
          totalProductPrice += item.product.totalPrice;
          totalPrice += item.product.totalPrice;
          totalMrp += item.product.totalMrp;

          productsForStocks.push({ ...item.product });

          delete item.product.stock;
          delete item.product.offer;
          delete item.product.rating;
          delete item.product.sales;
          delete item.product.slug;

          if (new Date(item.product.deliveryDate) < new Date()) {
            return sendResponseWithData(
              res,
              400,
              false,
              'Item in your cart has a past delivery date, update it and try again!',
              item.product,
            );
          }


          item.product.discount = item.product.totalMrp - item.product.totalPrice;
          if (checkSegmentDiscount) {
            let discountPrice = await getDiscount(findProduct.price, checkSegmentDiscount.discountValue);
            item.product.extraDiscount = discountPrice * item.product.quantity;
            item.product.totalPrice -= item.product.extraDiscount;
            totalPrice -= item.product.extraDiscount;
            extraDiscount = item.product.extraDiscount;
          }

          if (item.product.totalPrice > 1000) {
            shippingCost = 0
          }

          item.product.amountToPay = item.product.totalPrice;
          item.product.deliveryDate = item.deliveryDate;
          item.product.deliveryTime = item.deliveryTime;

          if (item.product.segment.slug === 'cakes') {
            item.product.nameOnCake = item.nameOnCake;
            item.product.messageForCelebration = item.messageForCelebration;
            item.product.weightOfCake = item.weightOfCake;
            item.product.imageOnCake = item.imageOnCake;

          }
          deliveryDate = item.deliveryDate
          item.product.status = 'pending';

          products.push({ ...item.product });



        } else {
          item.product.quantity = item.quantity;
          delete item._id;
          delete item.quantity;
          return sendResponseWithData(res, 400, false, 'Item out of stock!', item);
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

      let getProductDirect = await VendorProduct.findOne({ _id: req.body.product, isDeleted: false }).populate([{ path: 'segment', select: "slug" }, { path: 'category', select: "name" }, { path: "vendor", select: "name" },
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
        return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
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
        extraDiscount = getProductDirect.extraDiscount;
      }
      if (getProductDirect.totalPrice > 1000) {
        shippingCost = 0
      }

      getProductDirect.amountToPay = getProductDirect.totalPrice;

      //   if (getProductDirect.image) {
      //     let url = getProductDirect.image.url.map((item) => {
      //       return `${protocol}://${hostname}/${item}`;
      //     });
      //     getProductDirect.image = url;
      //   }

      productsForStocks.push({ ...getProductDirect });
      delete getProductDirect.stock;
      delete getProductDirect.offer;
      delete getProductDirect.rating;
      delete getProductDirect.sales;

      if (new Date(req.body.deliveryDate) < new Date()) {
        return sendResponseWithoutData(res, 400, false, 'Provide an upcoming date for delivery!');
      }

      if (getProductDirect.segment.slug === 'garden_galleria') {
        if (!('deliveryType' in req.body && req.body.deliveryType)) {
          return sendResponseWithoutData(res, 400, false, 'Provide a deliveryType for product!');
        }

        getProductDirect.deliveryTypes = req.body.deliveryType;
      }

      if (getProductDirect.segment.slug === 'cakes') {
        if ('nameOnCake' in req.body) {
          getProductDirect.nameOnCake = req.body.nameOnCake;
        }
        if ('messageForCelebration' in req.body) {
          getProductDirect.messageForCelebration = req.body.messageForCelebration;
        }
        if ('weightOfCake' in req.body) {
          getProductDirect.weightOfCake = req.body.weightOfCake;
        }
        if ('imageOnCake' in req.body) {
          getProductDirect.imageOnCake = req.body.imageOnCake;
        }

      }


      getProductDirect.deliveryDate = req.body.deliveryDate;
      getProductDirect.deliveryTime = deliveryTime;
      getProductDirect.status = 'pending';
      getProductDirect.paymentStatus = 'unpaid';

      deliveryDate = req.body.deliveryDate
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
        .select('-description -isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
        .lean();

      if (!getProductDirect) {
        return sendResponseWithoutData(res, 400, false, 'Invalid package id!');
      }

      if (getProductDirect.stock < req.body.quantity) {
        getProductDirect.quantity = req.body.quantity;
        return sendResponseWithData(res, 400, false, 'Item out of stock!', { product: getProductDirect });
      }
      getProductDirect.quantity = req.body.quantity;
      getProductDirect.totalPrice = Number(getProductDirect.price) * Number(getProductDirect.quantity);
      getProductDirect.totalMrp = Number(getProductDirect.mrp) * Number(getProductDirect.quantity);
      totalPrice += getProductDirect.totalPrice;
      totalProductPrice += getProductDirect.totalPrice;
      totalMrp += getProductDirect.totalMrp;

      if (new Date(req.body.deliveryDate) < new Date()) {
        return sendResponseWithoutData(res, 400, false, 'Provide an upcoming date for delivery!');
      }


      getProductDirect.discount = getProductDirect.totalMrp - getProductDirect.totalPrice;
      if (getProductDirect.totalPrice > 1000) {
        shippingCost = 0
      }
      getProductDirect.amountToPay = getProductDirect.totalPrice;


      getProductDirect.deliveryDate = req.body.deliveryDate;
      getProductDirect.deliveryTime = deliveryTime;
      getProductDirect.status = 'pending';
      deliveryDate = req.body.deliveryDate;

      // if (getProductDirect.image) {
      //   let url = getProductDirect.image.url.map((item) => {
      //     return `${protocol}://${hostname}/${item}`;
      //   });
      //   getProductDirect.image = url;
      // }

      // if (getProductDirect.elements && getProductDirect.elements.length > 0) {
      //   getProductDirect.elements.map((item) => {
      //     if (item.image && item.image.url.length > 0) {
      //       let url = item.image.url.map((e) => `${protocol}://${hostname}/${e}`);
      //       item.image = url;
      //     }
      //   });
      // }

      products.push(getProductDirect);

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
    // const shippingPrice = shipping === 'standard' ? 60 : 0;
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
      product.couponDiscount = perProductDiscount;
      product.shippingCost = perProductShippingPrice;
      product.amountToPay -= perProductDiscount;
      totalPrice -= perProductDiscount;
      product.amountToPay += perProductShippingPrice;

      finalAmount += product.amountToPay
    });
    // // final amount calculation
    // const shippingPrice = shipping === 'standard' ? 60 : 0;
    // // const discount = totalMrp - totalPrice;
    // const finalAmount = totalPrice - couponDiscount + shippingPrice;

    let newOrderId = await generateOrderId();
    let newInvoiceId = await generateInvoiceId();

    // order object
    let orderData = {
      orderId: newOrderId,
      userId: user._id,
      couponId: couponDetails ? couponDetails._id : null,
      couponCode: couponDetails ? couponDetails.code : null,
      orderFrom: type,
      paymentMethod: paymentMethod,
      paymentStatus: 'unpaid',
      // shippingMethod: shipping,
      shippingStatus: '',
      totalMrp: totalMrp,
      totalPrice: totalProductPrice,
      shippingAddressId: address,
      extraDiscount: extraDiscount,
      couponDiscount: couponDiscount,
      invoiceNo: newInvoiceId,
      tax: '',
      shippingCost: shippingPrice,
      totalAmountToPay: finalAmount,
      productDetails: products,
      shiprocketDetails: [],
      transactionDbId: null,
    };

    // return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);

    if (paymentMethod === 'online') {
      const paymentDetails = await payment(orderData);
      if (paymentDetails.status && 'data' in paymentDetails) {
        let createOrder = await Order.create(orderData);

        if (createOrder) {
          let transactionData = {
            orderId: createOrder.orderId,
            transactionId: paymentDetails.data.id,
            amount: createOrder.totalAmountToPay,
            currency: createOrder.currency,
            status: 'pending',
            payment_gateway: 'Razorpay',
            invoice_number: orderData.invoiceNo,
          }
          let createTransaction = await Transaction.create(transactionData);

          if (createTransaction) {
            await Order.updateOne({ _id: createOrder._id }, { $set: { transactionDbId: createTransaction._id } });

            // reducing stocks
            for (let product of productsForStocks) {
              let newStockNumber = Number(product.stock) - Number(product.quantity);
              let updatedSales = product.sales + Number(product.quantity) || 1;
              await VendorProduct.updateOne(
                { _id: product._id },
                { $set: { stock: newStockNumber, sales: updatedSales } },
              );
            }

            ///////////////////

            // Update sales
            // const updatedSales = product.sales + quantitySold;
            // await VendorProduct.updateOne({ _id: product._id }, { $set: { sales: updatedSales } });
            // cleaning cart
            if (type === 'cart') {
              await Cart.deleteMany({ user: user._id });
            }
            //////////////////

            if (couponDetails) {
              await CouponUsed.create({
                couponId: couponDetails._id,
                couponCode: couponDetails.code,
                amountReduced: couponDiscount,
                orderDbId: couponDiscount._id,
                usedBy: user._id,
              });
            }

            orderData.transactionId = paymentDetails.data.id;
            orderData._id = createOrder._id;

            console.log(paymentDetails);
            console.log('------------------ Request end ------------------');
            let link = `https://gamlewala.in/order/${createOrder?.orderId?.toLowerCase()}`
            const mailOptions = {
              from: MAILER_EMAIL,
              to: user.email,
              subject: 'Order booked',
              html: mailOrderPlaceTemplate({ name: user?.name, orderId: createOrder?.orderId, link: link }),
            };

            sendMail(mailOptions);

            await sendPushNotification(createOrder?.userId, "Order Booked - Gamlewala", `Hello ${user?.name}, Thank you for shopping with Gamlewala! Your order ${createOrder?.orderId} has been confirmed. You can track your order status in your account.`, "", "/order");
            return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);
          } else {
            console.log(paymentDetails);
            console.log('------------------ Request end ------------------');
            return sendResponseWithoutData(res, 400, false, 'Transaction creation failed, failed to place order!');
          }
        }

        return sendResponseWithoutData(res, 400, false, 'Failed to place order!');
      }

      console.log(paymentDetails);
      console.log('------------------ Request end ------------------');
      return sendResponseWithoutData(res, 400, false, paymentDetails.reason);
    } else if (paymentMethod === 'cod') {
      let createOrder = await Order.create(orderData);
      // let link = `https://gamlewala.in/order/${createOrder?.orderId?.toLowerCase()}`
      // const mailOptions = {
      //   from: MAILER_EMAIL,
      //   to: user.email,
      //   subject: 'Order booked',
      //   html: mailOrderPlaceTemplate({ name: user?.name, orderId: createOrder?.orderId, link: link }),
      // };

      // sendMail(mailOptions);

      if (createOrder) {
        // reducing stocks
        for (let product of productsForStocks) {
          let newStockNumber = Number(product.stock) - Number(product.quantity);
          let updatedSales = product.sales + Number(product.quantity) || 1;
          await VendorProduct.updateOne({ _id: product._id }, { $set: { stock: newStockNumber, sales: updatedSales } });
        }

        // cleaning cart
        if (type === 'cart') {
          await Cart.deleteMany({ user: user._id });
        }

        if (couponDetails) {
          await CouponUsed.create({
            couponId: couponDetails._id,
            couponCode: couponDetails.code,
            amountReduced: couponDiscount,
            orderDbId: couponDiscount._id,
            usedBy: user._id,
          });
        }

        orderData.transactionId = null;
        orderData._id = createOrder._id;

        // console.log(createOrder);
        console.log('------------------ Request end ------------------');

        let link = `https://gamlewala.in/order/${createOrder?.orderId?.toLowerCase()}`
        const mailOptions = {
          from: MAILER_EMAIL,
          to: user.email,
          subject: 'Order booked',
          html: mailOrderPlaceTemplate({ name: user?.name, orderId: createOrder?.orderId, link: link }),
        };

        sendMail(mailOptions);

        await sendPushNotification(createOrder?.userId, "Order Booked - Gamlewala", `Hello ${user?.name}, Thank you for shopping with Gamlewala! Your order ${createOrder?.orderId} has been confirmed. You can track your order status in your account.`, "", "/order");

        return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);
      }
    }
    return sendResponseWithoutData(res, 400, false, 'Failed to place order!');

    // return sendResponseWithoutData(res, 400, false, 'Failed to place order, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// export const orderList = async (req, res) => {
//   try {
//     let user = req.apiUser;
//     // const hostname = req.headers.host;
//     // const protocol = req.protocol;

//     let orderList = await Order.find({ userId: user._id })
//       .populate([
//         {
//           path: 'shippingAddressId',
//           select: '-isDefault -isDeleted -__v -createdBy -createdAt -updatedBy -updatedAt',
//         },
//         {
//           path: 'productDetails.subCategory',
//           select: '_id name',
//         },
//         {
//           path: 'productDetails.category',
//           select: '_id name',
//         },
//         {
//           path: 'productDetails.segment',
//           select: '_id name',
//         },
//         {
//           path: 'productDetails.vendor',
//           select: '_id name',
//         },
//       ])
//       .select('-createdAt -updatedAt -__v')
//       .lean();

//     if (orderList.length > 0) {
//       return sendResponseWithData(res, 200, true, 'Order list fetched successfully!', orderList, true);
//     }

//     return sendResponseWithData(res, 200, true, "You don't have any order history!", orderList, true);
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

export const orderDetails = async (req, res) => {
  try {
    const orderDbId = 'id' in req.params ? req.params.id : null;

    // if (!orderDbId || !isValidObjectId(orderDbId)) {
    //   return sendResponseWithoutData(res, 400, false, 'Invalid db order id!');
    // }

    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    // let orderList = await Order.findOne({ _id: orderDbId, userId: user._id })
    let orderList = await Order.findOne({ orderId: orderDbId, userId: user._id })
      .populate([
        {
          path: 'shippingAddressId',
          select: '-isDefault -isDeleted -__v -createdBy -createdAt -updatedBy -updatedAt',
          populate: [
            { path: 'city', select: 'name' },
            { path: 'state', select: 'name' },
          ],
        },
        {
          path: 'productDetails.image',
          select: '_id url',
        },
        {
          path: 'productDetails.imageOnCake',
          select: '_id url',
        },
        {
          path: 'productDetails.subCategory',
          select: '_id name',
        },
        {
          path: 'productDetails.category',
          select: '_id name',
        },
        {
          path: 'productDetails.segment',
          select: '_id name',
        },
        {
          path: 'productDetails.vendor',
          select: '_id name',
        },
        {
          path: 'userId',
          select: 'name email mobile isVerified alternateMobile',
        },
        {
          path: 'transactionDbId',
          select: 'transactionId amount status payment_gateway',
        },
      ])
      .select('-createdAt -updatedAt -__v')
      .lean();

    // if (orderList.status === 'pending' || orderList.status === 'confirmed') {

    //   await Order.updateOne({ _id: orderDbId }, { $set: { isOrderCancelAble: true } });

    // }

    // console.log('-/------------------------------');
    // console.log(orderList);
    // console.log('99999999999999');

    if (orderList) {
      for (let product of orderList.productDetails) {

        if (product.status === 'pending' || product.status === 'confirmed') {
          await Order.updateOne({ orderId: orderDbId }, { $set: { isOrderCancelAble: true } });

        }

        if (product.imageOnCake && Array.isArray(product.imageOnCake)) {
          let productUrl = [];
          for (let img of product.imageOnCake) {
            if (img && 'url' in img && img.url.length > 0) {
              productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
            }
            product.imageOnCake = productUrl;
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
      // orderList.productDetails = orderList.productDetails.map((item) => {
      //   console.log('item', item)
      //   if ('image' in item && item.image && item.image.url) {
      //     let urls = item.image.url.map((path) => `${protocol}://${hostname}/${path}`);
      //     item.image = urls;
      //   }
      //   return item;
      // });

      return sendResponseWithData(res, 200, true, 'Order list fetched successfully!', orderList, true);
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid db order id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const orderList = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    const page = Number(req.body.page) || 1;
    const count = Number(req.body.count) || 10;

    let paginationStatus =
      "all" in req.body && req.body.all === true ? true : false;

    let newData = Order.find({ userId: user._id })
      .populate([
        {
          path: 'shippingAddressId',
          select: '-isDefault -isDeleted -__v -createdBy -createdAt -updatedBy -updatedAt',
        },
        {
          path: 'productDetails.subCategory',
          select: '_id name',
        },
        {
          path: 'productDetails.category',
          select: '_id name',
        },
        {
          path: 'productDetails.segment',
          select: '_id name',
        },
        {
          path: 'productDetails.vendor productDetails.image',
          select: '_id name url',
        },
        {
          path: 'productDetails.imageOnCake',
          select: '_id url',
        },
      ]).sort({ createdAt: -1 })
      .select('-createdAt -updatedAt -__v')
      .lean();
    if (paginationStatus) {
      newData = newData.skip((page - 1) * count).limit(count);
    }

    let orderList = await newData;

    if (orderList && orderList.length > 0) {
      for (let doc of orderList) {
        for (let data of doc?.productDetails) {


          if (data.image && Array.isArray(data.image)) {
            let productUrl = [];
            for (let img of data.image) {
              if (img && 'url' in img && img.url.length > 0) {
                productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
              }
              data.image = productUrl;
            }
          }

          if (data.imageOnCake && Array.isArray(data.imageOnCake)) {
            let productUrl = [];
            for (let img of data.imageOnCake) {
              if (img && 'url' in img && img.url.length > 0) {
                productUrl.push(...img.url.map((item) => `${protocol}://${hostname}/${item}`));
              }
              data.imageOnCake = productUrl;
            }
          }

          //   if (data && 'image' in data && data.image && data.image.url) {
          //     data.image = data.image.url.map((item) => `${protocol}://${hostname}/${item}`);
          //   }
        }

      }
      return sendResponseWithData(res, 200, true, 'Order list fetched successfully!', orderList, true);
    }

    return sendResponseWithData(res, 200, true, "You don't have any order history!", orderList, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

// export const updatebyMEplaceOrder = async (req, res) => {
//   try {
//     let user = req.apiUser;

//     let { type, shipping, paymentMethod, address } = req.body;

//     console.log('------------------ Request start ------------------');
//     console.log(req.body);

//     let products = [];
//     let productsForStocks = [];

//     let totalPrice = 0;
//     let totalMrp = 0;
//     let couponDiscount = 0;

//     if (type === 'cart') {
//       let getCartProducts = await Cart.find({ user: user._id })
//         .populate({
//           path: 'product',
//           select:
//             '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
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

//           productsForStocks.push({ ...item.product });

//           delete item.product.stock;
//           delete item.product.offer;
//           delete item.product.rating;

//           if (new Date(item.product.deliveryDate) < new Date()) {
//             return sendResponseWithData(
//               res,
//               400,
//               false,
//               'Item in your cart has a past delivery date, update it and try again!',
//               item.product,
//             );
//           }

//           item.product.deliveryDate = item.deliveryDate;
//           item.product.deliveryTime = item.deliveryTime;
//           // Add nameOfCake and messageForCelebration fields from cart item to product

//           item.product.nameOnCake = item.nameOnCake;

//           item.product.messageForCelebration = item.messageForCelebration;
//           item.product.status = 'pending';

//           products.push({ ...item.product, nameOnCake: item.nameOnCake, messageForCelebration: item.messageForCelebration });

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

//       if (!('deliveryDate' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a deliveryDate for product which you want to buy!');
//       }

//       let deliveryTime = '00:00';
//       if ('deliveryTime' in req.body && req.body.deliveryTime) {
//         let [hrs, min] = req.body.deliveryTime.split(':');
//         if (
//           Number(hrs) &&
//           Number(min) &&
//           Number(hrs) >= 0 &&
//           Number(hrs) < 24 &&
//           Number(min) >= 0 &&
//           Number(min) < 60
//         ) {
//           deliveryTime = `${hrs}:${min}`;
//         }
//       }

//       let getProductDirect = await VendorProduct.findOne({ _id: req.body.product, isDeleted: false }).populate({ path: 'segment', select: "slug" })
//         .select(
//           '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
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

//       //   if (getProductDirect.image) {
//       //     let url = getProductDirect.image.url.map((item) => {
//       //       return `${protocol}://${hostname}/${item}`;
//       //     });
//       //     getProductDirect.image = url;
//       //   }

//       productsForStocks.push({ ...getProductDirect });
//       delete getProductDirect.stock;
//       delete getProductDirect.offer;
//       delete getProductDirect.rating;

//       if (new Date(req.body.deliveryDate) < new Date()) {
//         return sendResponseWithoutData(res, 400, false, 'Provide an upcoming date for delivery!');
//       }

//       if (getProductDirect.segment.slug === 'garden_galleria') {
//         if (!('deliveryType' in req.body && req.body.deliveryType)) {
//           return sendResponseWithoutData(res, 400, false, 'Provide a deliveryType for product!');
//         }

//         getProductDirect.deliveryTypes = req.body.deliveryType;
//       }
//       getProductDirect.nameOnCake = req.body.nameOnCake;
//       getProductDirect.messageForCelebration = req.body.messageForCelebration;
//       getProductDirect.deliveryDate = req.body.deliveryDate;
//       getProductDirect.deliveryTime = deliveryTime;
//       getProductDirect.status = 'pending';

//       products.push(getProductDirect);
//     } else if (type === 'package') {
//       if (!('package' in req.body) || !isValidObjectId(req.body.package)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid package id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for package which you want to buy!');
//       }

//       if (!('deliveryDate' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a deliveryDate for package which you want to buy!');
//       }

//       let deliveryTime = '00:00';
//       if ('deliveryTime' in req.body && req.body.deliveryTime) {
//         let [hrs, min] = req.body.deliveryTime.split(':');
//         if (
//           Number(hrs) &&
//           Number(min) &&
//           Number(hrs) >= 0 &&
//           Number(hrs) < 24 &&
//           Number(min) >= 0 &&
//           Number(min) < 60
//         ) {
//           deliveryTime = `${hrs}:${min}`;
//         }
//       }

//       let getProductDirect = await PoojaPackage.findOne({ _id: req.body.package, isActive: true, isDeleted: false })
//         .populate([
//           // {
//           //   path: 'image',
//           //   select: '_id url',
//           // },
//           {
//             path: 'elements',
//             select: '_id name',
//           },
//           {
//             path: 'segment',
//             select: '_id name',
//           },
//         ])
//         .select('-description -isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
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

//       if (new Date(req.body.deliveryDate) < new Date()) {
//         return sendResponseWithoutData(res, 400, false, 'Provide an upcoming date for delivery!');
//       }

//       getProductDirect.deliveryDate = req.body.deliveryDate;
//       getProductDirect.deliveryTime = deliveryTime;
//       getProductDirect.status = 'pending';

//       // if (getProductDirect.image) {
//       //   let url = getProductDirect.image.url.map((item) => {
//       //     return `${protocol}://${hostname}/${item}`;
//       //   });
//       //   getProductDirect.image = url;
//       // }

//       // if (getProductDirect.elements && getProductDirect.elements.length > 0) {
//       //   getProductDirect.elements.map((item) => {
//       //     if (item.image && item.image.url.length > 0) {
//       //       let url = item.image.url.map((e) => `${protocol}://${hostname}/${e}`);
//       //       item.image = url;
//       //     }
//       //   });
//       // }

//       products.push(getProductDirect);
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
//     const discount = totalMrp - totalPrice;
//     const finalAmount = totalPrice - couponDiscount + shippingPrice;

//     let newOrderId = await generateOrderId();
//     let newInvoiceId = await generateInvoiceId();

//     // order object
//     let orderData = {
//       orderId: newOrderId,
//       // status: 'pending',
//       userId: user._id,
//       couponId: couponDetails ? couponDetails._id : null,
//       couponCode: couponDetails ? couponDetails.code : null,
//       orderFrom: type,
//       paymentMethod: paymentMethod,
//       paymentStatus: 'unpaid',
//       shippingMethod: shipping,
//       shippingStatus: '',
//       totalMrp: totalMrp,
//       subTotal: totalPrice,
//       shippingAddressId: address,
//       discount: discount,
//       couponDiscount: couponDiscount,
//       invoiceNo: newInvoiceId,
//       tax: '',
//       shippingCost: shippingPrice,
//       amountToPay: finalAmount,
//       productDetails: products,
//       shiprocketDetails: [],
//       transactionDbId: null,
//     };



//     // return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);

//     if (paymentMethod === 'online') {
//       const paymentDetails = await payment(orderData);
//       if (paymentDetails.status && 'data' in paymentDetails) {
//         let createOrder = await Order.create(orderData);
//         const mailOptions = {
//           from: MAILER_EMAIL,
//           to: user.email,
//           subject: 'Order booked',
//           html: mailOrderPlaceTemplate({ name: user.name, orderId: createOrder.orderId }),
//         };

//         sendMail(mailOptions);
//         if (createOrder) {
//           const transactionData = {
//             orderId: createOrder.orderId,
//             transactionId: paymentDetails.data.id,
//             amount: createOrder.amountToPay,
//             currency: createOrder.currency,
//             status: 'pending',
//             payment_gateway: 'Razorpay',
//             invoice_number: orderData.invoiceNo,
//           };

//           let createTransaction = await Transaction.create(transactionData);

//           if (createTransaction) {
//             await Order.updateOne({ _id: createOrder._id }, { $set: { transactionDbId: createTransaction._id } });

//             // reducing stocks
//             for (let product of productsForStocks) {
//               let newStockNumber = Number(product.stock) - Number(product.quantity);
//               let updatedSales = product.sales + 1 || 1;
//               await VendorProduct.updateOne(
//                 { _id: product._id },
//                 { $set: { stock: newStockNumber, sales: updatedSales } },
//               );
//             }

//             ///////////////////

//             // Update sales
//             // const updatedSales = product.sales + quantitySold;
//             // await VendorProduct.updateOne({ _id: product._id }, { $set: { sales: updatedSales } });

//             //////////////////

//             if (couponDetails) {
//               await CouponUsed.create({
//                 couponId: couponDetails._id,
//                 couponCode: couponDetails.code,
//                 amountReduced: couponDiscount,
//                 orderDbId: couponDiscount._id,
//                 usedBy: user._id,
//               });
//             }

//             orderData.transactionId = paymentDetails.data.id;
//             orderData._id = createOrder._id;

//             //send mail here

//             console.log(paymentDetails);
//             console.log('------------------ Request end ------------------');
//             return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);
//           } else {
//             console.log(paymentDetails);
//             console.log('------------------ Request end ------------------');
//             return sendResponseWithoutData(res, 400, false, 'Transaction creation failed, failed to place order!');
//           }
//         }

//         return sendResponseWithoutData(res, 400, false, 'Failed to place order!');
//       }

//       console.log(paymentDetails);
//       console.log('------------------ Request end ------------------');
//       return sendResponseWithoutData(res, 400, false, paymentDetails.reason);
//     } else if (paymentMethod === 'cod') {
//       let createOrder = await Order.create(orderData);
//       const mailOptions = {
//         from: MAILER_EMAIL,
//         to: user.email,
//         subject: 'Order booked',
//         html: mailOrderPlaceTemplate({ name: user.name, orderId: createOrder.orderId }),
//       };

//       sendMail(mailOptions);

//       if (createOrder) {
//         // reducing stocks
//         for (let product of productsForStocks) {
//           let newStockNumber = Number(product.stock) - Number(product.quantity);
//           let updatedSales = product.sales + 1 || 1;
//           await VendorProduct.updateOne({ _id: product._id }, { $set: { stock: newStockNumber, sales: updatedSales } });
//         }

//         // cleaning cart
//         if (type === 'cart') {
//           await Cart.deleteMany({ user: user._id });
//         }

//         if (couponDetails) {
//           await CouponUsed.create({
//             couponId: couponDetails._id,
//             couponCode: couponDetails.code,
//             amountReduced: couponDiscount,
//             orderDbId: couponDiscount._id,
//             usedBy: user._id,
//           });
//         }

//         orderData.transactionId = null;
//         orderData._id = createOrder._id;

//         console.log(createOrder);
//         console.log('------------------ Request end ------------------');
//         //send mail here
//         return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);
//       }

//       return sendResponseWithoutData(res, 400, false, 'Failed to place order!');
//     }

//     return sendResponseWithoutData(res, 400, false, 'Failed to place order, try again in sometime!');
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

export const cancelOrder = async (req, res) => {
  try {
    let { id, productId, reason } = req.body;
    let user = req.apiUser;

    if (!id || !productId) {
      return sendResponseWithoutData(res, 400, false, 'id and product id is required!');
    }
    if (!isValidObjectId(id) || !isValidObjectId(productId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid order id!');
    }


    let checkOrderExists = await Order.findOne({ _id: id, "productDetails._id": productId, "productDetails.status": { $in: ['confirmed', 'pending'] } });

    if (!checkOrderExists) {
      return sendResponseWithoutData(res, 400, false, 'Invalid order id or the order cannot be cancelled!!');
    }

    if (checkOrderExists) {
      let order = await Order.updateOne({ _id: id, "productDetails._id": productId }, { $set: { "productDetails.$[].status": 'cancelled', "productDetails.$[].reason": reason } });
      if (order) {
        let link = `https://gamlewala.in/order/${checkOrderExists?.orderId?.toLowerCase()}`
        const mailOptions = {
          from: MAILER_EMAIL,
          to: user.email,
          subject: 'Order Cancelled',
          html: mailOrderPlaceTemplate({ name: user?.name, orderId: checkOrderExists?.orderId, link: link }),
        };

        sendMail(mailOptions);

        await sendPushNotification(user._id, "Order Cancelled - Gamlewala", `Hello ${user?.name},Your order ${checkOrderExists?.orderId} has been cancelled.`, "", "/order");
        return sendResponseWithoutData(res, 200, true, 'Order cancelled successfully!');
      } else {
        return sendResponseWithoutData(res, 400, false, 'Fail to Order cancel!');
      }

    }

    return sendResponseWithoutData(res, 400, false, 'Fail to Order cancel!');

  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
// export const placeOrder = async (req, res) => {
//   try {
//     let user = req.apiUser;

//     let { type, shipping, paymentMethod, address } = req.body;

//     console.log('------------------ Request start ------------------');
//     console.log(req.body);

//     let products = [];
//     let productsForStocks = [];

//     let totalPrice = 0;
//     let totalMrp = 0;
//     let couponDiscount = 0;

//     if (type === 'cart') {
//       let getCartProducts = await Cart.find({ user: user._id })
//         .populate({
//           path: 'product',
//           select:
//             '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
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

//           productsForStocks.push({ ...item.product });
//           delete item.product.stock;
//           delete item.product.offer;
//           delete item.product.rating;

//           if (new Date(item.product.deliveryDate) < new Date()) {
//             return sendResponseWithData(
//               res,
//               400,
//               false,
//               'Item in your cart has a past delivery date, update it and try again!',
//               item.product,
//             );
//           }

//           item.product.deliveryDate = item.deliveryDate;
//           item.product.deliveryTime = item.deliveryTime;

//           products.push(item.product);
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

//       if (!('deliveryDate' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a deliveryDate for product which you want to buy!');
//       }

//       let deliveryTime = '00:00';
//       if ('deliveryTime' in req.body && req.body.deliveryTime) {
//         let [hrs, min] = req.body.deliveryTime.split(':');
//         if (
//           Number(hrs) &&
//           Number(min) &&
//           Number(hrs) >= 0 &&
//           Number(hrs) < 24 &&
//           Number(min) >= 0 &&
//           Number(min) < 60
//         ) {
//           deliveryTime = `${hrs}:${min}`;
//         }
//       }

//       let getProductDirect = await VendorProduct.findOne({ _id: req.body.product, isDeleted: false })
//         .select(
//           '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId',
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

//       //   if (getProductDirect.image) {
//       //     let url = getProductDirect.image.url.map((item) => {
//       //       return `${protocol}://${hostname}/${item}`;
//       //     });
//       //     getProductDirect.image = url;
//       //   }

//       productsForStocks.push({ ...getProductDirect });
//       delete getProductDirect.stock;
//       delete getProductDirect.offer;
//       delete getProductDirect.rating;

//       if (new Date(req.body.deliveryDate) < new Date()) {
//         return sendResponseWithoutData(res, 400, false, 'Provide an upcoming date for delivery!');
//       }

//       getProductDirect.deliveryDate = req.body.deliveryDate;
//       getProductDirect.deliveryTime = deliveryTime;

//       products.push(getProductDirect);
//     } else if (type === 'package') {
//       if (!('package' in req.body) || !isValidObjectId(req.body.package)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a valid package id to proceed!');
//       }

//       if (!('quantity' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a quantiy for package which you want to buy!');
//       }

//       if (!('deliveryDate' in req.body)) {
//         return sendResponseWithoutData(res, 400, false, 'Provide a deliveryDate for package which you want to buy!');
//       }

//       let deliveryTime = '00:00';
//       if ('deliveryTime' in req.body && req.body.deliveryTime) {
//         let [hrs, min] = req.body.deliveryTime.split(':');
//         if (
//           Number(hrs) &&
//           Number(min) &&
//           Number(hrs) >= 0 &&
//           Number(hrs) < 24 &&
//           Number(min) >= 0 &&
//           Number(min) < 60
//         ) {
//           deliveryTime = `${hrs}:${min}`;
//         }
//       }

//       let getProductDirect = await PoojaPackage.findOne({ _id: req.body.package, isActive: true, isDeleted: false })
//         .populate([
//           // {
//           //   path: 'image',
//           //   select: '_id url',
//           // },
//           {
//             path: 'elements',
//             select: '_id name',
//           },
//           {
//             path: 'segment',
//             select: '_id name',
//           },
//         ])
//         .select('-description -isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
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

//       if (new Date(req.body.deliveryDate) < new Date()) {
//         return sendResponseWithoutData(res, 400, false, 'Provide an upcoming date for delivery!');
//       }

//       getProductDirect.deliveryDate = req.body.deliveryDate;
//       getProductDirect.deliveryTime = deliveryTime;

//       // if (getProductDirect.image) {
//       //   let url = getProductDirect.image.url.map((item) => {
//       //     return `${protocol}://${hostname}/${item}`;
//       //   });
//       //   getProductDirect.image = url;
//       // }

//       // if (getProductDirect.elements && getProductDirect.elements.length > 0) {
//       //   getProductDirect.elements.map((item) => {
//       //     if (item.image && item.image.url.length > 0) {
//       //       let url = item.image.url.map((e) => `${protocol}://${hostname}/${e}`);
//       //       item.image = url;
//       //     }
//       //   });
//       // }

//       products.push(getProductDirect);
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
//     const discount = totalMrp - totalPrice;
//     const finalAmount = totalPrice - couponDiscount + shippingPrice;

//     let newOrderId = await generateOrderId();
//     let newInvoiceId = await generateInvoiceId();

//     // order object
//     let orderData = {
//       orderId: newOrderId,
//       status: 'pending',
//       userId: user._id,
//       couponId: couponDetails ? couponDetails._id : null,
//       couponCode: couponDetails ? couponDetails.code : null,
//       orderFrom: type,
//       paymentMethod: paymentMethod,
//       paymentStatus: 'unpaid',
//       shippingMethod: shipping,
//       shippingStatus: '',
//       totalMrp: totalMrp,
//       subTotal: totalPrice,
//       shippingAddressId: address,
//       discount: discount,
//       couponDiscount: couponDiscount,
//       invoiceNo: newInvoiceId,
//       tax: '',
//       shippingCost: shippingPrice,
//       amountToPay: finalAmount,
//       productDetails: products,
//       shiprocketDetails: [],
//       transactionDbId: null,
//     };

//     // return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);

//     if (paymentMethod === 'online') {
//       const paymentDetails = await payment(orderData);

//       if (paymentDetails.status && 'data' in paymentDetails) {
//         let createOrder = await Order.create(orderData);

//         if (createOrder) {
//           const transactionData = {
//             orderId: createOrder.orderId,
//             transactionId: paymentDetails.data.id,
//             amount: createOrder.amountToPay,
//             currency: createOrder.currency,
//             status: 'pending',
//             payment_gateway: 'Razorpay',
//             invoice_number: orderData.invoiceNo,
//           };

//           let createTransaction = await Transaction.create(transactionData);

//           if (createTransaction) {
//             await Order.updateOne({ _id: createOrder._id }, { $set: { transactionDbId: createTransaction._id } });

//             // reducing stocks
//             for (let product of productsForStocks) {
//               let newStockNumber = Number(product.stock) - Number(product.quantity);
//               let updatedSales = product.sales + 1 || 1;
//               await VendorProduct.updateOne(
//                 { _id: product._id },
//                 { $set: { stock: newStockNumber, sales: updatedSales } },
//               );
//             }

//             ///////////////////

//             // Update sales
//             // const updatedSales = product.sales + quantitySold;
//             // await VendorProduct.updateOne({ _id: product._id }, { $set: { sales: updatedSales } });

//             //////////////////

//             if (couponDetails) {
//               await CouponUsed.create({
//                 couponId: couponDetails._id,
//                 couponCode: couponDetails.code,
//                 amountReduced: couponDiscount,
//                 orderDbId: couponDiscount._id,
//                 usedBy: user._id,
//               });
//             }

//             orderData.transactionId = paymentDetails.data.id;
//             orderData._id = createOrder._id;

//             console.log(paymentDetails);
//             console.log('------------------ Request end ------------------');
//             return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);
//           } else {
//             console.log(paymentDetails);
//             console.log('------------------ Request end ------------------');
//             return sendResponseWithoutData(res, 400, false, 'Transaction creation failed, failed to place order!');
//           }
//         }

//         return sendResponseWithoutData(res, 400, false, 'Failed to place order!');
//       }

//       console.log(paymentDetails);
//       console.log('------------------ Request end ------------------');
//       return sendResponseWithoutData(res, 400, false, paymentDetails.reason);
//     } else if (paymentMethod === 'cod') {
//       let createOrder = await Order.create(orderData);

//       if (createOrder) {
//         // reducing stocks
//         for (let product of productsForStocks) {
//           let newStockNumber = Number(product.stock) - Number(product.quantity);
//           let updatedSales = product.sales + 1 || 1;
//           await VendorProduct.updateOne({ _id: product._id }, { $set: { stock: newStockNumber, sales: updatedSales } });
//         }

//         // cleaning cart
//         if (type === 'cart') {
//           await Cart.deleteMany({ user: user._id });
//         }

//         if (couponDetails) {
//           await CouponUsed.create({
//             couponId: couponDetails._id,
//             couponCode: couponDetails.code,
//             amountReduced: couponDiscount,
//             orderDbId: couponDiscount._id,
//             usedBy: user._id,
//           });
//         }

//         orderData.transactionId = null;
//         orderData._id = createOrder._id;

//         console.log(createOrder);
//         console.log('------------------ Request end ------------------');

//         return sendResponseWithData(res, 200, true, 'Order placed successfully!', orderData);
//       }

//       return sendResponseWithoutData(res, 400, false, 'Failed to place order!');
//     }

//     return sendResponseWithoutData(res, 400, false, 'Failed to place order, try again in sometime!');
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };




