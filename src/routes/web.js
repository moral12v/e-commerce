import express from 'express';
import { body } from 'express-validator';
export const webRoute = express.Router();
export const webAuthRoute = express.Router();
import expressGroupRoutes from 'express-group-routes';

import { webValidation } from '../validators/webValidations.js';
import { listSegment, listSegmentWithCategory } from '../controllers/web/segmentController.js';
import {
  customerEmailVerify,
  customerForgotPassword,
  customerGoogleSignIn,
  customerGoogleSignUp,
  customerResetPassword,
  customerSignIn,
  customerSignUp,
} from '../controllers/web/authController.js';
import {
  getCartRelatedProductList,
  productDetails,
  productList,
  productListByIds,
  relatedProductList,
  topRatedProductList,
} from '../controllers/web/productController.js';
import { addMultipleProduct, addProduct, listProduct, removeProduct } from '../controllers/web/wishlistController.js';
import VendorProduct from '../models/VendorProduct.js';
import { isValidObjectId } from 'mongoose';
import {
  addAddress,
  deleteAddress,
  detailAddress,
  listAddress,
  listCity,
  listState,
  searchPinCode,
  setDefaultAddress,
  updateAddress,
} from '../controllers/web/addressController.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Address from '../models/Address.js';
import User from '../models/User.js';
import { changePassword, editProfile, getProfile, updateDeviceId } from '../controllers/web/profileController.js';
import { addProductToCart, listProductOfCart, updateProductFromCart } from '../controllers/web/cartController.js';
import { getBill } from '../controllers/web/billingController.js';
import { listCategory } from '../controllers/web/categoryController.js';
import { getBanner } from '../controllers/web/bannerController.js';
import { checkCoupon } from '../controllers/web/couponController.js';
import { cancelOrder, orderDetails, orderList, placeOrder } from '../controllers/web/orderController.js';
import { paymentVerification } from '../controllers/web/paymentController.js';
import { getEvents, getProductsByEventId } from '../controllers/web/eventController.js';
import EventGroup from '../models/EventsGroup.js';
import { staticListPage, staticPageDetails } from '../controllers/web/staticPageController.js';
import {
  editReviewProduct,
  likeReview,
  listReviewByProductId,
  reviewProduct,
  unlikeReview,
} from '../controllers/web/reviewController.js';
import Review from '../models/Review.js';
import { festDetails, listFest, packageDetailById } from '../controllers/web/calendarController.js';
import { globalSearch } from '../controllers/web/globalController.js';
import {
  addReminder,
  deleteReminder,
  detailReminder,
  listReminder,
  updateReminder,
} from '../controllers/web/reminderController.js';
import Reminder from '../models/Reminder.js';
import { listEventBanner } from '../controllers/web/eventBannerController.js';
import { addVendorBecomePartner } from '../controllers/web/unVerifiedVendorController.js';
import Vendor from '../models/Vendor.js';
import Segment from '../models/Segment.js';
import UnVerifiedVendor from '../models/UnVerifiedVendor.js';
import Order from '../models/Order.js';
import { makeObjectId } from '../helpers/helper.js';
import { createRequestCallbacks } from '../controllers/web/requestCallbackController.js';
import Category from '../models/Category.js';
import { PremiumEventLists, getProductBYPremiumEvent } from '../controllers/web/premiumEventController.js';
import SubCategory from '../models/SubCategory.js';
import PremiumEvent from '../models/PremiumEvent.js';
import { listVideoSection, videoSectionDetails } from '../controllers/web/videoSectionController.js';
import { createRequestQuery } from '../controllers/web/requestQueryController.js';
import { appNotification, deleteNotification, deleteManyNotification, readUnreadNotification } from '../controllers/web/notificationController.js';
import { listOccasion } from '../controllers/web/occasionController.js';
import { createQuery } from '../controllers/web/contactUsController.js';
import GiftType from '../models/GiftType.js';
import { getProductByGiftType } from '../controllers/web/giftController.js';
import Notification from '../models/Notification.js';


/************************************************/
/************* UNAUTHORIZE ROUTES ***************/
/************************************************/

webRoute.group('/auth', (webRoute) => {
  webRoute.post(
    '/sign-up',
    [
      body('title').optional(),
      body('name').notEmpty().withMessage('name field is required'),
      body('email')
        .notEmpty()
        .withMessage('email field is required')
        .custom(async (email) => {
          const checkExists = await User.findOne({ email: email, type: 'customer', isDeleted: false });

          if (checkExists) {
            throw new Error('email already in exists!');
          } else {
            return true;
          }
        }),
      body('mobile')
        .notEmpty()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number should be of 10 digits')
        .custom(async (mobile) => {
          const checkExists = await User.findOne({ mobile: mobile, isDeleted: false });

          if (checkExists) {
            throw new Error('mobile already in exists!');
          } else {
            return true;
          }
        }),
      body('alternateMobile')
        .optional()
        .custom(async (alternateMobile) => {
          if (alternateMobile === '') {
            return true;
          }

          if (alternateMobile && alternateMobile.length !== 10) {
            throw new Error('Alternate mobile number should be of 10 digits');
          }

          let checkMobile = await User.findOne({ mobile: alternateMobile, isDeleted: false });
          if (checkMobile) {
            throw new Error('Mobile number already registered!');
          }
          return true;
        }),
      body('password').notEmpty().withMessage('password field is required'),
    ],
    webValidation,
    customerSignUp,
  );

  webRoute.post(
    '/sign-in',
    [
      body('email').notEmpty().withMessage('email field is required'),
      body('password').notEmpty().withMessage('password field is required'),
    ],
    webValidation,
    customerSignIn,
  );

  webRoute.post(
    '/google-sign-up',
    [
      body('token').notEmpty().withMessage('token field is required')
    ],
    webValidation,
    customerGoogleSignUp,
  );

  webRoute.post(
    '/google-sign-in',
    [
      body('token').notEmpty().withMessage('token field is required')
    ],
    webValidation,
    customerGoogleSignIn,
  );

  webRoute.post(
    '/forgot-password',
    [body('email').notEmpty().withMessage('email field is required')],
    webValidation,
    customerForgotPassword,
  );

  webRoute.post(
    '/reset-password',
    [body('password').notEmpty().withMessage('password field is required')],
    webValidation,
    customerResetPassword,
  );
});

webRoute.group('/segment', (webRoute) => {
  webRoute.get('/',
    listSegment);
  webRoute.get('/with-category', listSegmentWithCategory);
});

webRoute.group('/category', (webRoute) => {
  webRoute.get('/',
    listCategory);
});

webRoute.group('/products', (webRoute) => {
  webRoute.post(
    '/',
    [
      body('segment').optional().isArray().withMessage('segment value should be an array'),
      body('category').optional().isArray().withMessage('category value should be an array'),
      body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
      body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
      body('sort').optional(),
      body('filter')
        .notEmpty()
        .withMessage('filter value is required')
        .isArray()
        .withMessage('filter value should be an array'),
    ],
    webValidation,
    productList,
  );

  webRoute.post(
    '/top-rated',
    [
      body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
      body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    ],
    webValidation,
    topRatedProductList,
  );

  webRoute.get('/:slug', productDetails);

  webRoute.post(
    '/related',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid product id!');
          }

          let checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false, isActive: true });
          if (!checkExists) {
            throw new Error('Invalid product id!');
          }

          return true;
        }),
    ],
    webValidation,
    relatedProductList,
  );

  webRoute.post(
    '/product-by-ids',
    [
      body('ids')
        .notEmpty()
        .withMessage('ids value is required')
        .isArray()
        .withMessage('ids field must be in array format'),
    ],
    webValidation,
    productListByIds,
  );
});

webRoute.group('/location', (webRoute) => {
  webRoute.get('/pin-code/:pin', searchPinCode);
  webRoute.post('/state',
    [
      body("page").optional(),
      body("count").optional(),
      body("all").optional(),
    ],
    webValidation, listState);

  webRoute.post(
    '/city',
    [
      body('state')
        .optional()
        .custom(async (state) => {
          if (state === '') {
            return true;
          }

          if (!isValidObjectId(state)) {
            throw new Error('Invalid state, please enter the correct state');
          }

          let checkState = await State.findOne({ _id: state, isActive: true });
          if (!checkState) {
            throw new Error('Invalid state, please enter the correct state');
          }
          return true;
        }),
      body("page").optional(),
      body("count").optional(),
      body("search").optional(),
      body("all").optional(),
    ],
    webValidation,
    listCity,
  );
});

webRoute.group('/banner', (webRoute) => {
  webRoute.get('/', getBanner);
});

webRoute.group('/events', (webRoute) => {

  webRoute.get('/',
    getEvents);

  webRoute.post(
    '/products',
    [
      body('slug')
        .notEmpty()
        .withMessage('slug is required')
        .custom(async (slug) => {
          // if (!isValidObjectId(id)) {
          //   throw new Error('Invalid event id!');
          // }

          let checkExists = await EventGroup.findOne({ slug: slug, isActive: true, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid event id!');
          }

          return true;
        }),
    ],
    webValidation,
    getProductsByEventId,
  );
});

webRoute.group('/static-page', (webRoute) => {
  webRoute.get('/', staticListPage);

  webRoute.get('/:slug', staticPageDetails);
});

webRoute.post(
  '/global-search',
  [body('search').notEmpty().withMessage('search value is required')],
  webValidation,
  globalSearch,
);

webRoute.group('/event-banner', (webRoute) => {
  webRoute.post('/',
    [
      body("page").optional(),
      body("count").optional(),
      body("all").optional(),
    ]
    , webValidation, listEventBanner);
});

webRoute.group('/calendar', (webRoute) => {
  webRoute.post(
    '/',
    [
      body('day')
        .optional()
        .isInt({ min: 1, max: 31 })
        .withMessage('Invalid value for day. The value should be in the range of 1 to 31.'),
      body('month')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('Invalid value for month. The value should be in the range of 1 to 12.'),
      body('year')
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Invalid value for year. The value should be in the range of 2000 to 2100.'),
    ],
    webValidation,
    listFest,
  );

  webRoute.get('/:id', festDetails);

  webRoute.get('/package/:id', packageDetailById);
});

webRoute.get('/verify-email', customerEmailVerify);

webRoute.get('/profile', getProfile);

/************************************************/
/************** AUTHORIZE ROUTES ****************/
/************************************************/

webAuthRoute.group('/profile', (webAuthRoute) => {
  webAuthRoute.put(
    '/update',
    [
      body('title').optional(),
      body('name').notEmpty().withMessage('name value is required'),
      body('mobile').notEmpty().isLength({ min: 10, max: 10 }).withMessage('Mobile number should be of 10 digits'),
      body('alternateMobile')
        .optional()
        .custom(async (alternateMobile) => {
          if (alternateMobile === '') {
            return true;
          }

          if (alternateMobile && alternateMobile.length !== 10) {
            throw new Error('Alternate mobile number should be of 10 digits');
          }

          let checkMobile = await User.findOne({ mobile: alternateMobile, isDeleted: false });
          if (checkMobile) {
            throw new Error('Mobile number already registered!');
          }
          return true;
        }),
    ],
    webValidation,
    editProfile,
  );
  webAuthRoute.put(
    '/change-password',
    [
      body('old').notEmpty().withMessage('old field is required'),
      body('new').notEmpty().withMessage('new field is required'),
    ],
    webValidation,
    changePassword,
  );
});

webAuthRoute.get('/get-cart-related-products', getCartRelatedProductList);

webAuthRoute.group('/wishlist', (webAuthRoute) => {
  webAuthRoute.post(
    '/add',
    [
      body('product')
        .notEmpty()
        .withMessage('product field is required')
        .custom(async (product) => {
          const checkExists = await VendorProduct.findOne({ _id: product, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid product id!');
          } else {
            return true;
          }
        }),
    ],
    webValidation,
    addProduct,
  );

  webAuthRoute.post(
    '/add-multiple',
    [
      body('product')
        .notEmpty()
        .withMessage('product field is required')
        .isArray()
        .withMessage('product field must be in array format'),
    ],
    webValidation,
    addMultipleProduct,
  );

  webAuthRoute.post('/',
    [
      body('count').optional(),
      body('page').optional(),
      body('all').optional(),
    ]
    , webValidation, listProduct);

  webAuthRoute.post(
    '/remove',
    [
      body('product')
        .notEmpty()
        .withMessage('product field is required')
        .custom(async (product) => {
          if (isValidObjectId(product)) {
            return true;
          }

          throw new Error('Invalid product id!');
        }),
    ],
    webValidation,
    removeProduct,
  );
});

webAuthRoute.group('/cart', (webAuthRoute) => {
  webAuthRoute.post(
    '/add',
    [
      body('product')
        .notEmpty()
        .withMessage('product field is required')
        .custom(async (product) => {

          if (!product || !isValidObjectId(product)) {
            throw new Error('Invalid id!');
          }
          const checkExists = await VendorProduct.findOne({ _id: product, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid product id!');
          } else {
            return true;
          }
        }),
      body('quantity')
        .notEmpty()
        .withMessage('quantity field is required')
        .isNumeric()
        .withMessage('quantity value should be numeric')
        .custom((value) => {
          if (parseFloat(value) <= 0) {
            throw new Error('quantity value should be greater than 0');
          }
          return true;
        }),
      body('deliveryDate')
        .notEmpty()
        .withMessage('deliveryDate value is mandatory')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('deliveryDate must be in yyyy-mm-dd format')
        .custom(async (date) => {
          let providedDate = new Date(date);
          let currentDate = new Date();
          if (providedDate > currentDate) {
            return true;
          }
          throw new Error('deliveryDate must be an upcoming date');
        }),
      body('deliveryType')
        .optional()
        .isIn(['home', 'office', 'celebration'])
        .withMessage("deliveryType value should be either 'home', 'office' or 'celebration'"),
      body('nameOnCake')
        .optional(),
      body('messageForCelebration')
        .optional(),
      body('weightOfCake')
        .optional(),
      body('imageOnCake')
        .optional()
    ],
    webValidation,
    addProductToCart,
  );

  webAuthRoute.get('/',
    listProductOfCart);

  webAuthRoute.put(
    '/update',
    [
      body('product')
        .notEmpty()
        .withMessage('product field is required')
        .custom(async (product) => {

          if (!product || !isValidObjectId(product)) {
            throw new Error('Invalid id!');
          }
          const checkExists = await VendorProduct.findOne({ _id: product, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid product id!');
          } else {
            return true;
          }
        }),
      body('nameOnCake')
        .optional(),
      body('messageForCelebration')
        .optional(),
      body('weightOfCake')
        .optional(),
      body('imageOnCake')
        .optional(),
      body('deliveryType')
        .optional(),
      body('deliveryDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('deliveryDate must be in yyyy-mm-dd format')
        .custom(async (date) => {
          let providedDate = new Date(date);
          let currentDate = new Date();
          if (providedDate > currentDate) {
            return true;
          }
          throw new Error('deliveryDate must be an upcoming date');
        }),

      body('quantity')
        .optional()
        .isNumeric()
        .withMessage('quantity value should be numeric'),

    ],
    webValidation,
    updateProductFromCart,
  );
  // webAuthRoute.put(
  //   '/update',
  //   [
  // body('product')
  //   .notEmpty()
  //   .withMessage('product field is required')
  //   .custom(async (product) => {
  //     if (isValidObjectId(product)) {
  //       return true;
  //     }

  //     throw new Error('Invalid product id!');
  //   }),
  //     body('quantity')
  //       .notEmpty()
  //       .withMessage('quantity field is required')
  //       .isNumeric()
  //       .withMessage('quantity value should be numeric'),
  //   ],
  //   webValidation,
  //   modifyProductFromCart,
  // );
});

webAuthRoute.group('/address', (webAuthRoute) => {
  webAuthRoute.post(
    '/add',
    [
      body('name').notEmpty().withMessage('name value is required'),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['Home', 'Office', 'Other'])
        .withMessage("type value should be either 'Home', 'Office' or 'Other'"),
      body('mobile')
        .notEmpty()
        .withMessage('mobile value is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number should be of 10 digits'),
      body('alternateMobile')
        .optional()
        .custom(async (alternateMobile) => {
          if (alternateMobile === '') {
            return true;
          }

          if (alternateMobile && alternateMobile.length !== 10) {
            throw new Error('Alternate mobile number should be of 10 digits');
          }

          return true;
        }),
      body('street').notEmpty().withMessage('street value is required'),
      body('city')
        .notEmpty()
        .withMessage('street value is required')
        .custom(async (city) => {
          if (city === '') {
            return true;
          }

          if (!isValidObjectId(city)) {
            throw new Error('Invalid city, please enter the correct city');
          }

          let checkCity = await City.findOne({ _id: city, isActive: true });
          if (!checkCity) {
            throw new Error('Invalid city, please enter the correct city');
          }
          return true;
        }),
      body('state')
        .notEmpty()
        .withMessage('state value is required')
        .custom(async (state) => {
          if (state === '') {
            return true;
          }

          if (!isValidObjectId(state)) {
            throw new Error('Invalid state, please enter the correct state');
          }

          let checkState = await State.findOne({ _id: state, isActive: true });
          if (!checkState) {
            throw new Error('Invalid state, please enter the correct state');
          }
          return true;
        }),
      body('country')
        .notEmpty()
        .withMessage('country value is required')
        .custom(async (country) => {
          if (country.toLowerCase() !== 'india') {
            throw new Error('Invalid country, please enter the correct country');
          }
          return true;
        }),
      body('postalCode').notEmpty().withMessage('postalCode value is required'),
      body('landmark').optional(),
      body('isDefault').optional().isBoolean(),
    ],
    webValidation,
    addAddress,
  );

  webAuthRoute.get('/',
    listAddress);
  webAuthRoute.get('/:id', detailAddress);
  webAuthRoute.delete('/delete/:id', deleteAddress);

  webAuthRoute.put(
    '/update',
    [
      body('addressId')
        .notEmpty()
        .withMessage('addressId value is required')
        .custom(async (addressId) => {
          if (!isValidObjectId(addressId)) {
            throw new Error('Invalid addressId, please enter the correct addressId');
          }

          let checkAddressId = await Address.findOne({ _id: addressId, isDeleted: false });
          if (!checkAddressId) {
            throw new Error('Invalid addressId, please enter the correct addressId');
          }
          return true;
        }),
      body('name').notEmpty().withMessage('name value is required'),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['Home', 'Office', 'Other'])
        .withMessage("type value should be either 'Home', 'Office' or 'Other'"),
      body('mobile')
        .notEmpty()
        .withMessage('mobile value is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number should be of 10 digits'),
      body('alternateMobile')
        .optional()
        .custom(async (alternateMobile) => {
          if (alternateMobile === '') {
            return true;
          }

          if (alternateMobile && alternateMobile.length !== 10) {
            throw new Error('Alternate mobile number should be of 10 digits');
          }

          return true;
        }),
      body('street').notEmpty().withMessage('street value is required'),
      body('city')
        .notEmpty()
        .withMessage('street value is required')
        .custom(async (city) => {
          if (city === '') {
            return true;
          }

          if (!isValidObjectId(city)) {
            throw new Error('Invalid city, please enter the correct city');
          }

          let checkCity = await City.findOne({ _id: city, isActive: true });
          if (!checkCity) {
            throw new Error('Invalid city, please enter the correct city');
          }
          return true;
        }),
      body('state')
        .notEmpty()
        .withMessage('state value is required')
        .custom(async (state) => {
          if (state === '') {
            return true;
          }

          if (!isValidObjectId(state)) {
            throw new Error('Invalid state, please enter the correct state');
          }

          let checkState = await State.findOne({ _id: state, isActive: true });
          if (!checkState) {
            throw new Error('Invalid state, please enter the correct state');
          }
          return true;
        }),
      body('country')
        .notEmpty()
        .withMessage('country value is required')
        .custom(async (country) => {
          if (country.toLowerCase() !== 'india') {
            throw new Error('Invalid country, please enter the correct country');
          }
          return true;
        }),
      body('postalCode').notEmpty().withMessage('postalCode value is required'),
      body('landmark').optional(),
      body('isDefault').optional().isBoolean(),
    ],
    webValidation,
    updateAddress,
  );

  webAuthRoute.get('/set-default-address/:id', setDefaultAddress);
});

webAuthRoute.group('/billing', (webAuthRoute) => {
  webAuthRoute.post(
    '/get',
    [
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['cart', 'product', 'package'])
        .withMessage("Type value should be either 'cart', 'product' or 'package'"),
      // body('shipping')
      //   .notEmpty()
      //   .withMessage('shipping value is required')
      //   .isIn(['standard', 'free'])
      //   .withMessage("shipping value should be either 'standard' or 'free'"),
      body('paymentMethod')
        .notEmpty()
        .withMessage('paymentMethod value is required')
        .isIn(['cod', 'online'])
        .withMessage("paymentMethod value should be either 'cod' or 'online'"),
      body('product')
        .optional()
        .custom(async (product) => {
          if (product === '') {
            return true;
          }
          if (!isValidObjectId(product)) {
            throw new Error('Invalid product id!');
          }
          let checkProduct = await VendorProduct.findOne({
            _id: product,
            isActive: true,
            status: 'approved',
            isDeleted: false,
          });
          if (!checkProduct) {
            throw new Error('Invalid product id!');
          }
          return true;
        }),
      body('quantity').optional().isInt({ min: 1 }).withMessage('quantity value should be a positive integer'),
      body('coupon').optional(),
      body('deliveryDate')
        .optional()
        // .withMessage('deliveryDate value is mandatory')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('deliveryDate must be in yyyy-mm-dd format')
        .custom(async (date) => {
          let providedDate = new Date(date);
          let currentDate = new Date();
          if (providedDate > currentDate) {
            return true;
          }
          throw new Error('deliveryDate must be an upcoming date');
        }),
    ],
    webValidation,
    getBill,
  );
});

webAuthRoute.group('/coupon', (webAuthRoute) => {
  webAuthRoute.get('/:code', checkCoupon);
});

webAuthRoute.group('/order', (webAuthRoute) => {
  webAuthRoute.post(
    '/place',
    [
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['cart', 'product', 'package'])
        .withMessage("Type value should be either 'cart', 'product' or 'package'"),
      // body('shipping')
      //   .notEmpty()
      //   .withMessage('shipping value is required')
      //   .isIn(['standard', 'free'])
      //   .withMessage("shipping value should be either 'standard' or 'free'"),
      body('paymentMethod')
        .notEmpty()
        .withMessage('paymentMethod value is required')
        .isIn(['cod', 'online'])
        .withMessage("paymentMethod value should be either 'cod' or 'online'"),
      body('product')
        .optional()
        .custom(async (product) => {
          if (product === '') {
            return true;
          }
          if (!isValidObjectId(product)) {
            throw new Error('Invalid product id!');
          }
          let checkProduct = await VendorProduct.findOne({
            _id: product,
            isActive: true,
            status: 'approved',
            isDeleted: false,
          });
          if (!checkProduct) {
            throw new Error('Invalid product id!');
          }
          return true;
        }),
      body('quantity').optional().isInt({ min: 1 }).withMessage('quantity value should be a positive integer'),
      body('coupon').optional(),
      body('address')
        .notEmpty()
        .withMessage('address value is required')
        .custom(async (address, { req }) => {
          if (!isValidObjectId(address)) {
            throw new Error('Invalid address id!');
          }

          let checkAddress = await Address.findOne({
            _id: address,
            userId: req.apiUser._id,
            isDeleted: false,
          });

          if (!checkAddress) {
            throw new Error('Invalid address id!');
          }
          return true;
        }),
      body('deliveryDate')
        .optional()
        // .withMessage('deliveryDate value is mandatory')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('deliveryDate must be in yyyy-mm-dd format')
        .custom(async (date) => {
          let providedDate = new Date(date);
          let currentDate = new Date();
          if (providedDate > currentDate) {
            return true;
          }
          throw new Error('deliveryDate must be an upcoming date');
        }),
      body('deliveryType')
        .optional()
        .isIn(['home', 'office', 'celebration'])
        .withMessage("deliveryType value should be either 'home', 'office' or 'celebration'"),
      body('nameOnCake')
        .optional()
      ,
      body('messageForCelebration')
        .optional()
      ,
      body('weightOfCake')
        .optional()
    ],
    webValidation,
    placeOrder,
  );

  webAuthRoute.post('/list',
    [
      body("page").optional(),
      body("count").optional(),
      body("all").optional()
    ], webValidation, orderList);
  webAuthRoute.get('/details/:id', orderDetails);
  webAuthRoute.put('/cancel',
    [
      body('id').notEmpty().withMessage('id value is required!'),
      body('productId')
        .notEmpty()
        .withMessage('productId value is required!')
        .custom(async (productId) => {
          if (productId && isValidObjectId(productId)) {
            let checkExists = await Order.findOne({ "productDetails._id": productId });
            if (!checkExists) {
              throw new Error('Invalid order id!');
            }
            return true;
          }
          throw new Error('Invalid order id!');

        }),
      body('reason').optional(),
    ],
    cancelOrder);
});

webAuthRoute.group('/payment', (webAuthRoute) => {
  webAuthRoute.post(
    '/verify',
    [
      body('order_id').notEmpty().withMessage('order_id value is required'),
      body('payment_id').notEmpty().withMessage('payment_id value is required'),
    ],
    webValidation,
    paymentVerification,
  );
});

webAuthRoute.group('/review', (webAuthRoute) => {
  webAuthRoute.post(
    '/rate',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid product id!');
          }
          let checkExists = await VendorProduct.findOne({ _id: id, isActive: true, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid product id!');
          }
          return true;
        }),
      body('rate')
        .notEmpty()
        .withMessage('rate value is required')
        .isDecimal({ min: 1, max: 5 })
        .withMessage('rate value should be in the range of 1 to 5'),
      body('review').optional(),
    ],
    webValidation,
    reviewProduct,
  );

  webAuthRoute.put(
    '/edit',
    [
      body('reviewId')
        .notEmpty()
        .withMessage('reviewId value is required')
        .custom(async (reviewId) => {
          if (!isValidObjectId(reviewId)) {
            throw new Error('Invalid review id!');
          }
          let checkExists = await Review.findOne({ _id: reviewId });
          if (!checkExists) {
            throw new Error('Invalid review id!');
          }
          return true;
        }),
      body('rate').optional().isDecimal({ min: 1, max: 5 }).withMessage('rate value should be in the range of 1 to 5'),
      body('review').optional(),
    ],
    webValidation,
    editReviewProduct,
  );

  webAuthRoute.post(
    '/list-by-product-id',
    [
      body('productId')
        .notEmpty()
        .withMessage('productId value is required')
        .custom(async (productId) => {
          if (!isValidObjectId(productId)) {
            throw new Error('Invalid product id!');
          }
          let checkExists = await VendorProduct.findOne({
            _id: productId,
            isDeleted: false,
            isActive: true,
            status: 'approved',
          });
          if (!checkExists) {
            throw new Error('Invalid product id!');
          }
          return true;
        }),
      body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
      body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    ],
    webValidation,
    listReviewByProductId,
  );

  webAuthRoute.post(
    '/like-review',
    [
      body('reviewId')
        .notEmpty()
        .withMessage('reviewId value is required')
        .custom(async (reviewId) => {
          if (!isValidObjectId(reviewId)) {
            throw new Error('Invalid review id!');
          }
          let checkExists = await Review.findOne({ _id: reviewId });
          if (!checkExists) {
            throw new Error('Invalid review id!');
          }
          return true;
        }),
    ],
    webValidation,
    likeReview,
  );

  webAuthRoute.post(
    '/dislike-review',
    [
      body('reviewId')
        .notEmpty()
        .withMessage('reviewId value is required')
        .custom(async (reviewId) => {
          if (!isValidObjectId(reviewId)) {
            throw new Error('Invalid review id!');
          }
          let checkExists = await Review.findOne({ _id: reviewId });
          if (!checkExists) {
            throw new Error('Invalid review id!');
          }
          return true;
        }),
    ],
    webValidation,
    unlikeReview,
  );
});

webAuthRoute.group('/reminder', (webAuthRoute) => {
  webAuthRoute.post(
    '/add',
    [
      body('event').notEmpty().withMessage('name value is required'),
      body('date')
        .notEmpty()
        .withMessage('date value is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('date must be in yyyy-mm-dd format'),
      body('description').optional(),
    ],
    webValidation,
    addReminder,
  );

  webAuthRoute.get('/',
    listReminder);
  webAuthRoute.get('/:id', detailReminder);

  webAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required')
        .custom(async (id, { req }) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid reminder id, please enter the correct reminder id!');
          }

          let checkReminderId = await Reminder.findOne({ _id: id, userId: req.apiUser._id });
          if (!checkReminderId) {
            throw new Error('Invalid reminder id, please enter the correct reminder id!');
          }
          return true;
        }),
      body('event').notEmpty().withMessage('name value is required'),
      body('date')
        .notEmpty()
        .withMessage('date value is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('date must be in yyyy-mm-dd format'),
      body('description').optional(),
      body('isActive').optional().isBoolean().withMessage('isActive value should be booleans'),
    ],
    webValidation,
    updateReminder,
  );

  webAuthRoute.delete('/delete/:id', deleteReminder);
});

//************************** ADD VEMDOR BECOME PARTNER ROUTES STARTS********************************************************** */

webRoute.group('/vendor', (webRoute) => {
  webRoute.post(
    '/become-a-partner',
    [
      body('name').notEmpty().withMessage('name value is required'),
      body('email')
        .notEmpty()
        .withMessage('email value is required')
        .isEmail()
        .withMessage('Email should be valid format')
        .custom(async (email) => {
          let checkExists = await Vendor.findOne({ email: email });
          let checkExistsInUnverifiedVendor = await UnVerifiedVendor.findOne({ email: email });

          if (checkExists || checkExistsInUnverifiedVendor) {
            throw new Error('email already in exists!');
          }
          return true;
        }),
      body('category')
        .notEmpty()
        .withMessage('category value is required'),
      body('mobile')
        .notEmpty()
        .withMessage('mobile value is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number should be of 10 digits')
        .custom(async (mobile) => {
          let checkExists = await Vendor.findOne({ mobile: mobile });
          let checkMobile = await UnVerifiedVendor.findOne({ mobile: mobile });
          if (checkExists || checkMobile) {
            throw new Error('number already in exists!');
          }
          return true;
        }),

      body('pan')
        .optional(),
      body('gst')
        .optional(),
      body('aadhar')
        .optional()
      ,
    ],
    webValidation,
    addVendorBecomePartner,
  );

});

//************************** ADD VEMDOR BECOME PARTNER ROUTES END********************************************************** */



//************************** ADD Request Callbacks ROUTES STARTS********************************************************** */

webRoute.group('/request-callback', (webRoute) => {
  webRoute.post(
    '/',
    [
      body('name').notEmpty().withMessage("Name is required!"),
      body('mobile')
        .notEmpty().withMessage("Mobile is required!"),
      body('queries')
        .optional(),

    ],
    webValidation,
    createRequestCallbacks,
  );

});

//************************** ADD Request Callbacks ROUTES END********************************************************** */

//************************** Premium Event ROUTES STARTS********************************************************** */

webRoute.group('/premium-events', (webRoute) => {
  webRoute.get(
    '/',
    PremiumEventLists,
  );
  webRoute.post(
    '/list',
    [body('slug').notEmpty().withMessage("slug is required!").custom(async (slug) => {
      // if (!id || !isValidObjectId(id)) {
      //   throw new Error('Invalid id!');
      // }
      let CheckPremiumCategory = await PremiumEvent.findOne({ slug: slug, isDeleted: false });
      if (!CheckPremiumCategory) {
        throw new Error('Invalid premium category!');
      }

    }),
    body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
    body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    body('sort').optional(),
    body('filter')
      .notEmpty()
      .withMessage('filter value is required')
      .isArray()
      .withMessage('filter value should be an array'),],
    webValidation,
    getProductBYPremiumEvent,
  );

});

//************************** Premium Event ROUTES END********************************************************** */


//************************** Video Section ROUTES STARTS********************************************************** */

webRoute.group('/video-section', (webRoute) => {
  webRoute.get(
    '/',

    listVideoSection,
  );
  webRoute.get('/details/:id', videoSectionDetails)

});

//************************** Video Section ROUTES END********************************************************** */



//************************** ADD Request Callbacks ROUTES STARTS********************************************************** */

webRoute.group('/request-query', (webRoute) => {
  webRoute.post(
    '/',
    [
      body('productId').notEmpty().withMessage("Product id is required!"),
      body('name').notEmpty().withMessage("Name is required!"),
      body('mobile')
        .notEmpty().withMessage("Mobile is required!"),
      body('query')
        .optional(),

    ],
    webValidation,
    createRequestQuery,
  );

});

//************************** ADD Push Notification  ROUTES STARTS********************************************************** */
webAuthRoute.group('/notification', (webAuthRoute) => {
  webAuthRoute.get(
    '/app-notification',
    appNotification,
  );
  webAuthRoute.delete(
    '/delete-multiple-notification',
    [
      body("notificationId")
        .notEmpty().isArray({ min: 1 })
        .withMessage("Notification Id Field is Required").custom(async (notificationId) => {
          let notifyArr = []
          if (notificationId && Array.isArray(notificationId)) {
            for (let id of notificationId) {
              notifyArr.push(id)
            }
          }
          let checkExists = await Notification.find({ _id: { $in: notifyArr } });
          if (checkExists.length !== notificationId.length) {
            throw new Error('Invalid id!');
          }
        }),
    ],
    webValidation,
    deleteManyNotification,
  );
  webAuthRoute.post(
    '/delete-notification',
    deleteNotification,
  );


  webAuthRoute.post(
    "/read-unread-notification",
    [
      body("type")
        .notEmpty()
        .withMessage("type Field is Required")
        .custom((value) => {
          if (
            value === "read" ||
            value === "unread"
          ) {
            return true;
          }
          throw new Error("type must be read or unread");
        }),
      body("notificationId")
        .notEmpty()
        .withMessage("Notification Id Field is Required"),
    ],
    webValidation,
    readUnreadNotification
  );

});

//************************** ADD Push Notification ROUTES END********************************************************** */

//************************** UPDATE DEVICE ID ROUTES STARTS ********************************************************** */

webAuthRoute.group('/device', (webAuthRoute) => {
  webAuthRoute.post(
    '/update-device-id',
    [
      body("deviceId")
        .notEmpty()
        .withMessage("deviceId Field is Required"),
    ],
    webValidation,
    updateDeviceId,
  );


});
// ************************* UPDATE DEVICE ID ROUTES ENDS ********************************************************************************


//************************** OCCASION  ROUTES STARTS ********************************************************** */

webRoute.group('/occasion', (webRoute) => {
  webRoute.get(
    '/',
    listOccasion,
  );

});
// ************************* OCCASION ROUTES ENDS ********************************************************************************
//************************** QUERY  ROUTES STARTS ********************************************************** */

webRoute.group('/query', (webRoute) => {
  webRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage("Name is required!"),
      body('email').notEmpty().withMessage("Email is required!"),
      body('mobile')
        .notEmpty().withMessage("Mobile is required!"),
      body('query')
        .optional(),

    ],
    webValidation,
    createQuery,
  );

});
// ************************* QUERY ROUTES ENDS ********************************************************************************
//************************** GIFT TYPE PRODUCTS ROUTES STARTS ********************************************************** */

webRoute.group('/gift-type', (webRoute) => {
  webRoute.post(
    '/list',
    [body('slug').notEmpty().withMessage("slug is required!").custom(async (slug) => {
      let checkExists = await GiftType.findOne({ slug: slug, isDeleted: false });
      if (!checkExists) {
        throw new Error('Invalid gift type!');
      }
    }),
    body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
    body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    body('sort').optional(),
    body('filter')
      .notEmpty()
      .withMessage('filter value is required')
      .isArray()
      .withMessage('filter value should be an array'),],
    webValidation,
    getProductByGiftType,
  );

});
// ************************* GIFT TYPE PRODUCTS ROUTES ENDS ********************************************************************************
