import express from 'express';
import { body } from 'express-validator';
export const adminRoute = express.Router();
export const adminAuthRoute = express.Router();
import expressGroupRoutes from 'express-group-routes';
/***************************
        CUSTOM IMPORTS
 ****************************/

import { adminValiation } from '../validators/adminValidation.js';
import { adminChangePassword, adminLogin, adminProfile } from '../controllers/admin/authController.js';
import {
  createCustomer,
  createUser,
  deleteUser,
  listUser,
  updateCustomer,
  updateUser,
  userDetails,
  verifyUser,
} from '../controllers/admin/userController.js';
import User from '../models/User.js';
import {
  createSegment,
  deleteSegment,
  listSegment,
  segmentDetails,
  updateSegment,
} from '../controllers/admin/segmentController.js';
import Segment from '../models/Segment.js';
import {
  addSlugInCategory,
  categoryDetails,
  createCategory,
  deleteCategory,
  listCatgory,
  updateCategory,
} from '../controllers/admin/categoryController.js';
import Category from '../models/Category.js';
import {
  // ProdctStrToArr,
  createProduct,
  deleteProduct,
  listProduct,
  productDetails,
  updateProduct,
} from '../controllers/admin/productController.js';
import { isValidObjectId } from 'mongoose';
import Product from '../models/Product.js';
import Role from '../models/Role.js';
import File from '../models/File.js';
import { listRoles } from '../controllers/admin/roleController.js';
import {
  approveProduct,
  deleteVendorProduct,
  detailProduct,
  listVendorProduct,
  updateVendorProduct,
} from '../controllers/admin/vendorProductController.js';
import VendorProduct from '../models/VendorProduct.js';
import { addSetting, getSettingDetails, deleteSettings } from '../controllers/admin/settingsController.js';
import {
  getFilterCategory,
  getFilterCategoryValue,
  addCategoryValue,
  addFilterCategory,
  removeFilterCategory,
  removeFilterCategoryValue,
  updateFilterCategory,
  updateFilterCategoryValue,
  getFilterCategoryValueDetails,
  getFilterCategoryDetails,
  FilterFieldList,
  addSortingValue,
  getFilterSortingList,
  getFilterSortingValue,
  updateFilterSortingValue,
  removeFilterSorting,
} from '../controllers/admin/filterController.js';
import FilterCategory from '../models/FilterCategory.js';
import FilterValue from '../models/FilterValue.js';
import {
  createSubCategory,
  deleteSubCategory,
  listSubCatgory,
  subCategoryDetails,
  updateSubCategory,
} from '../controllers/admin/subCategoryController.js';
import SubCategory from '../models/SubCategory.js';
import {
  addBanner,
  deleteBanner,
  getBannerDetails,
  getBannerList,
  updateBanner,
} from '../controllers/admin/bannerController.js';
import {
  couponDetails,
  createCoupon,
  deleteCoupon,
  listCoupon,
  updateCoupon,
} from '../controllers/admin/couponController.js';
import Coupon from '../models/Coupon.js';
import {
  addSlugInEvent,
  createEvent,
  deleteEvent,
  eventDetails,
  listEvent,
  updateEvent,
} from '../controllers/admin/eventController.js';
import EventGroup from '../models/EventsGroup.js';
import {
  createPage,
  deletePage,
  listPage,
  pageDetails,
  updatePage,
} from '../controllers/admin/staticPageController.js';
import Page from '../models/Pages.js';
import {
  PoojaElementDetails,
  addItemsToPackage,
  createFest,
  createPoojaElement,
  createPoojaPackage,
  deleteFest,
  deletePoojaElement,
  deletePoojaPackage,
  editFest,
  editPoojaElement,
  editPoojaPackage,
  festDetails,
  listFest,
  listPoojaElement,
  listPoojaPackage,
  poojaPackageDetails,
  removeItemsToPackage,
  replaceItemsToPackage,
} from '../controllers/admin/calendarController.js';
import Calendar from '../models/Calendar.js';
import PoojaElement from '../models/PoojaElement.js';
import PoojaPackage from '../models/PoojaPackage.js';
import Sort from '../models/Sort.js';
import {
  addBannerButton,
  addEventBanner,
  deleteBannerButton,
  deleteEventBanner,
  detailsBannerButton,
  detailsEventBanner,
  editEventBannerButtons,
  listBannerButton,
  listEventBanner,
  updateBannerButton,
  updateEventBanner,
} from '../controllers/admin/eventBannerController.js';
import EventBanner from '../models/EventBanner.js';
import EventBannerButton from '../models/EventBannerButton.js';
import {
  dashboardDetails,
  dashboardDetailsApis,
  getRecentAddProductLists,
  getTopSellingProductLists,
} from '../controllers/admin/dashboardController.js';
import { orderDetails, orderLists } from '../controllers/admin/orderController.js';
import { approvedVendorBecomePartner, becomePartnerLists } from '../controllers/admin/approvedController.js';
import { deleteProductReview, getProductReviews, updateProductRating } from '../controllers/admin/reviewsController.js';
import Review from '../models/Review.js';
import PageCategory from '../models/PageCategory.js';
import {
  createPageCategory,
  deletePageCategory,
  listPageCategory,
  pageCategoryDetails,
  updateCategoryPage,
} from '../controllers/admin/staticPageCategoryControlller.js';
import { getAllOrders, upateOrderStatus } from '../controllers/admin/updateOrderStatus.js';
import Order from '../models/Order.js';
import { requestCallBackDetails, requestCallBackLists } from '../controllers/admin/requestCallbackForAdminController.js';
import PremiumEvent from '../models/PremiumEvent.js';
import { makeObjectId } from '../helpers/helper.js';
import { addSlugInPremiumEvent, createPremiumEvent, deletePremiumEvent, listPremiumEvent, premiumEventDetails, updatePremiumEvent } from '../controllers/admin/premiumEvent.js';
import { createVideoSection, deleteVideoSection, listVideoSection, updateVideoSection, videoSectionDetails } from '../controllers/admin/uploadVideoController.js';
import UploadVideo from '../models/UploadVideo.js';
import { createSegmentDiscount, deleteSegmentDiscount, listSegmentDiscount, segmentDiscountDetails, updateSegmentDiscount } from '../controllers/admin/segmentDiscount.js';
import SegmentDiscount from '../models/SegmentDiscount.js';
import { notificationList, sendPushNotificationAdmin } from '../controllers/admin/adminNotification.js';
import Occasion from '../models/Occasion.js';
import { createOccasion, deleteOccasion, listOccasion, occasionDetails, updateOccasion } from '../controllers/admin/occasionController.js';
import GiftType from '../models/GiftType.js';
import { createGiftType, deleteGiftType, giftTypeDetails, listGiftType, updatGiftType } from '../controllers/admin/giftTypeController.js';
import { queryDetails, queryLists } from '../controllers/admin/contactusController.js';

/***************************
        Admin Login
***************************/

adminRoute.post(
  '/login',
  [body('email', 'Email field is Required').notEmpty(), body('password', 'Password field is Required').notEmpty()],
  adminLogin,
);

/******************************************************
        Admin authenticated routes
******************************************************/

adminAuthRoute.group('/profile', (adminAuthRoute) => {
  adminAuthRoute.get('/', adminProfile);

  adminAuthRoute.post(
    '/change-password',
    [
      body('old').notEmpty().withMessage('old field is required'),
      body('new').notEmpty().withMessage('new field is required'),
    ],
    adminValiation,
    adminChangePassword,
  );
});

/************************ ROLE ROUTES START ************************/
adminAuthRoute.group('/roles', (adminAuthRoute) => {
  adminAuthRoute.get('/', listRoles);
});
/************************ ROLE CRUD ROUTES END ************************/

/************************ SETTINGS ROUTES START ************************/
adminAuthRoute.group('/setting', (adminAuthRoute) => {
  adminAuthRoute.post('/add', addSetting);

  adminAuthRoute.get('/get', getSettingDetails);
  adminAuthRoute.delete('/delete/:field', deleteSettings);
});
/************************ SETTINGS ROUTES END ************************/

/************************ BANNER ROUTES START ************************/
adminAuthRoute.group('/banner', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/add',
    [
      body('title').notEmpty().withMessage('title field is required'),
      body('description').optional(),
      body('file')
        .notEmpty()
        .withMessage('file field is required')
        .custom(async (file) => {
          if (!isValidObjectId(file)) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          const checkExists = await File.findOne({ _id: file, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          return true;
        }),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['segment', 'category', 'sub_category'])
        .withMessage("shipping value should be either 'segment', 'category' or 'sub_category'"),
      body('typeId')
        .notEmpty()
        .withMessage('typeId field is required')
        .custom(async (typeId, { req }) => {
          if (!isValidObjectId(typeId)) {
            throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
          }

          if (req.body.type === 'segment') {
            let checkSegment = await Segment.findOne({ _id: typeId, isDeleted: false });
            if (!checkSegment) {
              throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
            }
          } else if (req.body.type === 'category') {
            let checkCategory = await Category.findOne({ _id: typeId, isDeleted: false });
            if (!checkCategory) {
              throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
            }
          } else if (req.body.type === 'sub_category') {
            let checkSubCategory = await SubCategory.findOne({ _id: typeId, isDeleted: false });
            if (!checkSubCategory) {
              throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
            }
          } else {
            throw new Error('Invalid type value selected, please provide the correct typev value!');
          }

          return true;
        }),
    ],
    adminValiation,
    addBanner,
  );

  adminAuthRoute.get('/', getBannerList);
  adminAuthRoute.get('/:id', getBannerDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id').notEmpty().withMessage('id field is required'),
      body('title').notEmpty().withMessage('title field is required'),
      body('description').optional(),
      body('file')
        .notEmpty()
        .withMessage('file field is required')
        .custom(async (file) => {
          if (!isValidObjectId(file)) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          const checkExists = await File.findOne({ _id: file, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          return true;
        }),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['segment', 'category', 'sub_category'])
        .withMessage("shipping value should be either 'segment', 'category' or 'sub_category'"),
      body('isActive')
        .notEmpty()
        .withMessage('isActive value is required')
        .isBoolean()
        .withMessage('isActive value should be boolean'),
      body('typeId')
        .notEmpty()
        .withMessage('typeId field is required')
        .custom(async (typeId, { req }) => {
          if (!isValidObjectId(typeId)) {
            throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
          }

          if (req.body.type === 'segment') {
            let checkSegment = await Segment.findOne({ _id: typeId, isDeleted: false });
            if (!checkSegment) {
              throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
            }
          } else if (req.body.type === 'category') {
            let checkCategory = await Category.findOne({ _id: typeId, isDeleted: false });
            if (!checkCategory) {
              throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
            }
          } else if (req.body.type === 'sub_category') {
            let checkSubCategory = await SubCategory.findOne({ _id: typeId, isDeleted: false });
            if (!checkSubCategory) {
              throw new Error('Invalid typeId, please provide the correct typeId according to the type field!');
            }
          } else {
            throw new Error('Invalid type value selected, please provide the correct typev value!');
          }

          return true;
        }),
    ],
    adminValiation,
    updateBanner,
  );

  adminAuthRoute.delete('/delete/:id', deleteBanner);
});
/************************ BANNER ROUTES END ************************/

/************************ EVENT BANNER ROUTES START ************************/
adminAuthRoute.group('/event-banner', (adminAuthRoute) => {
  // ********* EVENT BANNER BUTTON *********
  adminAuthRoute.post(
    '/button/add',
    [
      body('title').notEmpty().withMessage('title field is required'),
      body('logo').optional(),
      body('darkLogo').optional(),
      body('fontColor').notEmpty().withMessage('fontColor field is required'),
      body('darkFontColor').optional(),
      body('isGradient')
        .notEmpty()
        .withMessage('isGradient field is required')
        .isBoolean()
        .withMessage('isGradient value should be boolean'),
      body('bgColor')
        .notEmpty()
        .withMessage('bgColor field is required')
        .isArray()
        .withMessage('bgColor value should be an array!'),
      body('darkBgColor').optional().isArray().withMessage('darkBgColor value should be an array!'),
      body('type')
        .notEmpty()
        .withMessage('type value is required!')
        .isIn(['segment', 'category', 'sub_category', 'package', 'product'])
        .withMessage("type should be one of these 'segment', 'category', 'sub_category', 'package' or 'product'"),
      body('typeId').notEmpty().withMessage('typeId value is required!'),
    ],
    adminValiation,
    addBannerButton,
  );

  adminAuthRoute.get('/button', listBannerButton);
  adminAuthRoute.get('/button/:id', detailsBannerButton); // populate typeId

  adminAuthRoute.put(
    '/button/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid event banner button id!');
          }
          let checkExists = await EventBannerButton.findOne({ _id: id });
          if (!checkExists) {
            throw new Error('Invalid event banner button id!');
          }

          return true;
        }),
      body('title').notEmpty().withMessage('title field is required'),
      body('logo').optional(),
      body('darkLogo').optional(),
      body('fontColor').notEmpty().withMessage('fontColor field is required'),
      body('darkFontColor').optional(),
      body('isGradient')
        .notEmpty()
        .withMessage('isGradient field is required')
        .isBoolean()
        .withMessage('isGradient value should be boolean'),
      body('bgColor')
        .notEmpty()
        .withMessage('bgColor field is required')
        .isArray()
        .withMessage('bgColor value should be an array!'),
      body('darkBgColor').optional().isArray().withMessage('darkBgColor value should be an array!'),
      body('type')
        .notEmpty()
        .withMessage('type value is required!')
        .isIn(['segment', 'category', 'sub_category', 'package', 'product'])
        .withMessage("type should be one of these 'segment', 'category', 'sub_category', 'package' or 'product'"),
      body('typeId').notEmpty().withMessage('typeId value is required!'),
    ],
    adminValiation,
    updateBannerButton,
  );

  adminAuthRoute.delete('/button/delete/:id', deleteBannerButton);

  // ********* EVENT BANNER *********
  adminAuthRoute.post(
    '/add',
    [
      body('title').notEmpty().withMessage('title field is required'),
      body('image').optional(),
      body('darkModeImage').optional(),
      body('fontColor').notEmpty().withMessage('fontColor field is required'),
      body('darkFontColor').optional(),
      body('isGradient')
        .notEmpty()
        .withMessage('isGradient field is required')
        .isBoolean()
        .withMessage('isGradient value should be boolean'),
      body('bgColor')
        .notEmpty()
        .withMessage('bgColor field is required')
        .isArray()
        .withMessage('bgColor value should be an array!'),
      body('darkBgColor').optional().isArray().withMessage('darkBgColor value should be an array!'),
    ],
    adminValiation,
    addEventBanner,
  );

  adminAuthRoute.get('/', listEventBanner);
  adminAuthRoute.get('/:id', detailsEventBanner);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid event banner id!');
          }
          let checkExists = await EventBanner.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid event banner id!');
          }

          return true;
        }),
      body('title').notEmpty().withMessage('title field is required'),
      body('image').optional(),
      body('darkModeImage').optional(),
      body('fontColor').notEmpty().withMessage('fontColor field is required'),
      body('darkFontColor').optional(),
      body('isGradient')
        .notEmpty()
        .withMessage('isGradient field is required')
        .isBoolean()
        .withMessage('isGradient value should be boolean'),
      body('isActive')
        .notEmpty()
        .withMessage('isActive field is required')
        .isBoolean()
        .withMessage('isActive value should be boolean'),
      body('bgColor')
        .notEmpty()
        .withMessage('bgColor field is required')
        .isArray()
        .withMessage('bgColor value should be an array!'),
      body('darkBgColor').optional().isArray().withMessage('darkBgColor value should be an array!'),
    ],
    adminValiation,
    updateEventBanner,
  );

  adminAuthRoute.delete('/delete/:id', deleteEventBanner);

  adminAuthRoute.put(
    '/update-button',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid event banner id!');
          }
          let checkExists = await EventBanner.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid event banner id!');
          }

          return true;
        }),
      body('button')
        .notEmpty()
        .withMessage('button field is required')
        .isArray({ max: 3 })
        .withMessage('button value should be an array with not more than 3 buttons!'),
    ],
    adminValiation,
    editEventBannerButtons,
  );
});
/************************ EVENT BANNER ROUTES END ************************/

/************************ FILTER ROUTES START ************************/
adminAuthRoute.group('/filter', (adminAuthRoute) => {
  adminAuthRoute.get('/get-fields', FilterFieldList);

  adminAuthRoute.post(
    '/category/add',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          let checkExists = await FilterCategory.findOne({ name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Filter category name already exists!');
          }
          return true;
        }),
      body('field').notEmpty().withMessage("'field' field is required"),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['range', 'match'])
        .withMessage("type value can either be 'range' or 'match'"),
      body('multiSelect')
        .notEmpty()
        .withMessage('multiSelect value is required')
        .isBoolean()
        .withMessage('multiSelect should be an boolean value')
        .custom((multiSelect, { req }) => {
          if (req.body.type === 'match' && multiSelect === true) {
            throw new Error("multiSelect is not available with type 'match'");
          }

          return true;
        }),
    ],
    adminValiation,
    addFilterCategory,
  );

  adminAuthRoute.put(
    '/category/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          let checkExists = await FilterCategory.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid Filter category id!');
          }
          return true;
        }),
      body('name').notEmpty().withMessage('name field is required'),
      body('field').notEmpty().withMessage("'field' field is required"),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['range', 'match'])
        .withMessage("type value can either be 'range' or 'match'"),
      body('isActive')
        .notEmpty()
        .withMessage('isActive field is required')
        .isBoolean()
        .withMessage('isActive field requires boolean type value'),
      body('multiSelect')
        .notEmpty()
        .withMessage('multiSelect value is required')
        .isBoolean()
        .withMessage('multiSelect should be an boolean value'),
    ],
    adminValiation,
    updateFilterCategory,
  );

  adminAuthRoute.get('/category', getFilterCategory);
  adminAuthRoute.get('/category/details/:id', getFilterCategoryDetails);
  adminAuthRoute.delete('/category/delete/:id', removeFilterCategory);

  // ********* Filter category start *********

  adminAuthRoute.post(
    '/category/value/add',
    [
      body('category')
        .notEmpty()
        .withMessage('category field is required')
        .custom(async (category) => {
          if (!isValidObjectId(category)) {
            throw new Error('Invalid filter category!');
          }
          let checkExists = await FilterCategory.findOne({
            _id: category,
            isDeleted: false,
          });

          if (!checkExists) {
            throw new Error('Invalid filter category!');
          }
          return true;
        }),
      body('title').notEmpty().withMessage('title field is required'),
      body('min').optional().isInt({ min: 0 }).withMessage('min value should be an positive integer'),
      body('max').optional().isInt({ min: 0 }).withMessage('max value should be an positive integer'),
      body('match').optional(),
    ],
    adminValiation,
    addCategoryValue,
  );

  adminAuthRoute.get('/category/value/:id', getFilterCategoryValue);
  adminAuthRoute.get('/category/value/:categoryId/:id', getFilterCategoryValueDetails);

  adminAuthRoute.put(
    '/category/value/delete',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          let checkExists = await FilterValue.findOne({
            _id: id,
            isDeleted: false,
          });

          if (!checkExists) {
            throw new Error('Invalid filter category value id!');
          }
          return true;
        }),
    ],
    adminValiation,
    removeFilterCategoryValue,
  );

  adminAuthRoute.put(
    '/category/value/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          let checkExists = await FilterValue.findOne({
            _id: id,
            isDeleted: false,
          });

          if (!checkExists) {
            throw new Error('Invalid filter category value id!');
          }
          return true;
        }),
      body('title').notEmpty().withMessage('title field is required'),
      body('min').optional().isInt({ min: 0 }).withMessage('min value should be an positive integer'),
      body('max').optional().isInt({ min: 0 }).withMessage('max value should be an positive integer'),
      body('match').optional(),
      body('isActive')
        .notEmpty()
        .withMessage('isActive field is required')
        .isBoolean()
        .withMessage('isActive field requires boolean type value'),
    ],
    adminValiation,
    updateFilterCategoryValue,
  );

  // ********* Filter sorting start *********

  adminAuthRoute.post(
    '/sorting/value/add',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          let checkExists = await Sort.findOne({
            name: name,
            isDeleted: false,
          });

          if (checkExists) {
            throw new Error('Sorting with this name already exists!');
          }
          return true;
        }),
      body('field').notEmpty().withMessage('field value is required'),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['ascending', 'descending'])
        .withMessage("type value can either be 'ascending' or 'descending'"),
    ],
    adminValiation,
    addSortingValue,
  );

  adminAuthRoute.get('/sorting/list', getFilterSortingList);
  adminAuthRoute.get('/sorting/value/:id', getFilterSortingValue);
  adminAuthRoute.delete('/sorting/delete/:id', removeFilterSorting);

  adminAuthRoute.put(
    '/sorting/value/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid filter sorting id!');
          }
          let checkExists = await Sort.findOne({
            _id: id,
            isDeleted: false,
          });

          if (!checkExists) {
            throw new Error('Invalid filter sorting id!');
          }
          return true;
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name, { req }) => {
          let checkExists = await Sort.findOne({
            _id: { $ne: req.body.id },
            name: name,
            isDeleted: false,
          });

          if (checkExists) {
            throw new Error('Sorting with this name already exists!');
          }
          return true;
        }),
      body('type')
        .notEmpty()
        .withMessage('type value is required')
        .isIn(['ascending', 'descending'])
        .withMessage("type value can either be 'ascending' or 'descending'"),
      body('isActive')
        .notEmpty()
        .withMessage('isActive field is required')
        .isBoolean()
        .withMessage('isActive field requires boolean type value'),
    ],
    adminValiation,
    updateFilterSortingValue,
  );
});
/************************ FILTER ROUTES END ************************/

/************************ USER CRUD ROUTES START ************************/
adminAuthRoute.group('/user', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('name should be more than 2 character or less than 30'),
      body('email')
        .notEmpty()
        .withMessage('email field is required')
        .custom(async (email) => {
          const checkExists = await User.findOne({ email: email, isDeleted: false });

          if (checkExists) {
            throw new Error('email already in Exist');
          } else {
            return true;
          }
        }),
      body('mobile')
        .notEmpty()
        .withMessage('mobile field is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('mobile value should be consist of 10 numbers')
        .custom(async (mobile) => {
          const checkExists = await User.findOne({ mobile: mobile, isDeleted: false });

          if (checkExists) {
            throw new Error('mobile already in Exist');
          } else {
            return true;
          }
        }),
      body('password').notEmpty().withMessage('password field is required'),
      body('role')
        .notEmpty()
        .withMessage('role field is required')
        .custom(async (role) => {
          if (!isValidObjectId(role)) {
            throw new Error('Invalid role!');
          }
          const checkExists = await Role.findOne({ _id: role, name: { $ne: 'admin' }, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid role!');
          } else {
            return true;
          }
        }),
      body('segment')
        .notEmpty()
        .withMessage('segment field is required')
        .custom(async (segment) => {
          if (!isValidObjectId(segment)) {
            throw new Error('Invalid segment!');
          }
          const checkExists = await Segment.findOne({ _id: segment, isActive: true, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment!');
          }
          return true;
        }),
    ],
    adminValiation,
    createUser,
  );

  adminAuthRoute.post(
    '/create-customer',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('name should be more than 2 character or less than 30'),
      body('email')
        .notEmpty()
        .withMessage('email field is required')
        .custom(async (email) => {
          const checkExists = await User.findOne({ email: email, isDeleted: false });

          if (checkExists) {
            throw new Error('email already in Exist');
          } else {
            return true;
          }
        }),
      body('mobile')
        .notEmpty()
        .withMessage('mobile field is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('mobile value should be consist of 10 numbers')
        .custom(async (mobile) => {
          const checkExists = await User.findOne({ mobile: mobile, isDeleted: false });

          if (checkExists) {
            throw new Error('mobile already in Exist');
          } else {
            return true;
          }
        }),
      body('password').notEmpty().withMessage('password field is required'),
    ],
    adminValiation,
    createCustomer,
  );

  // adminAuthRoute.post(
  //   '/list',
  //   [
  //     body('verifyCheck')
  //       .optional()
  //       .custom(async (verifyCheck) => {
  //         if (verifyCheck == 0 || verifyCheck == 1) {
  //           return true;
  //         } else {
  //           throw new Error("Invalid verifyCheck value, (0 for 'unverified' and 1 for 'verified')");
  //         }
  //       }),
  //     // body('role')
  //     //   .optional()
  //     //   .custom(async (role) => {
  //     //     if (role === '') {
  //     //       return true;
  //     //     }

  //     //     if (!isValidObjectId(role)) {
  //     //       throw new Error('Invalid role!');
  //     //     }
  //     //     const checkExists = await Role.findOne({ _id: role, name: { $ne: 'admin' }, isDeleted: false });

  //     //     if (!checkExists) {
  //     //       throw new Error('Invalid role!');
  //     //     } else {
  //     //       return true;
  //     //     }
  //     //   }),
  //   ],
  //   adminValiation,
  //   listUser,
  // );

  adminAuthRoute.post(
    '/list/assistant',
    [
      body('verifyCheck')
        .optional()
        .custom(async (verifyCheck) => {
          if (verifyCheck == 0 || verifyCheck == 1) {
            return true;
          } else {
            throw new Error("Invalid verifyCheck value, (0 for 'unverified' and 1 for 'verified')");
          }
        }),
    ],
    adminValiation,
    listUser,
  );

  adminAuthRoute.post(
    '/list/vendor',
    [
      body('verifyCheck')
        .optional()
        .custom(async (verifyCheck) => {
          if (verifyCheck == 0 || verifyCheck == 1) {
            return true;
          } else {
            throw new Error("Invalid verifyCheck value, (0 for 'unverified' and 1 for 'verified')");
          }
        }),
    ],
    adminValiation,
    listUser,
  );

  adminAuthRoute.post(
    '/list/customer',
    [
      body('verifyCheck')
        .optional()
        .custom(async (verifyCheck) => {
          if (verifyCheck == 0 || verifyCheck == 1) {
            return true;
          } else {
            throw new Error("Invalid verifyCheck value, (0 for 'unverified' and 1 for 'verified')");
          }
        }),
    ],
    adminValiation,
    listUser,
  );

  adminAuthRoute.get('/:id', userDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid user id!');
          }
          const checkExists = await User.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid user id!');
          } else {
            return true;
          }
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('name should be more than 2 character or less than 30'),
      body('email').notEmpty().withMessage('email field is required'),
      body('mobile')
        .notEmpty()
        .withMessage('mobile field is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('mobile value should be consist of 10 numbers'),
      body('isVerified').notEmpty().isBoolean().withMessage('isVerified field is required'),
      body('isActive').notEmpty().isBoolean().withMessage('isActive field is required'),
      body('role')
        .notEmpty()
        .withMessage('role field is required')
        .custom(async (role) => {
          if (!isValidObjectId(role)) {
            throw new Error('Invalid role!');
          }
          const checkExists = await Role.findOne({ _id: role, name: { $ne: 'admin' }, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid role!');
          } else {
            return true;
          }
        }),
      body('segment')
        .notEmpty()
        .withMessage('segment field is required')
        .custom(async (segment) => {
          if (!isValidObjectId(segment)) {
            throw new Error('Invalid segment!');
          }
          const checkExists = await Segment.findOne({ _id: segment, isActive: true, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment!');
          }
          return true;
        }),
    ],
    adminValiation,
    updateUser,
  );

  adminAuthRoute.put(
    '/update-customer',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid customer id!');
          }
          const checkExists = await User.findOne({ _id: id, type: 'customer', isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid customer id!');
          } else {
            return true;
          }
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .isLength({ min: 3, max: 30 })
        .withMessage('name should be more than 2 character or less than 30'),
      body('email').notEmpty().withMessage('email field is required'),
      body('mobile')
        .notEmpty()
        .withMessage('mobile field is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('mobile value should be consist of 10 numbers'),
      body('isVerified')
        .notEmpty()
        .withMessage('isVerified field is required')
        .isBoolean()
        .withMessage('isVerified field must be an boolean'),
      body('isActive')
        .notEmpty()
        .withMessage('isActive field is required')
        .isBoolean()
        .withMessage('isActive field must be an boolean'),
    ],
    adminValiation,
    updateCustomer,
  );

  adminAuthRoute.delete('/delete/:id', adminValiation, deleteUser);

  adminAuthRoute.post(
    '/verify-vendor',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid user!');
          }
          const checkExists = await User.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid user!');
          } else {
            return true;
          }
        }),
      body('verify').notEmpty().isBoolean().withMessage('verify field is required'),
    ],
    adminValiation,
    verifyUser,
  );
});
/************************ USER CRUD ROUTES END ************************/

/************************ SEGMENT CRUD ROUTES START ************************/
adminAuthRoute.group('/segment', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          const checkExists = await Segment.findOne({ name: name, isDeleted: false });

          if (checkExists) {
            throw new Error('name already exists');
          } else {
            return true;
          }
        }),
      body('file')
        .notEmpty()
        .withMessage('file field is required')
        .custom(async (file) => {
          if (!isValidObjectId(file)) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          const checkExists = await File.findOne({ _id: file, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          return true;
        }),
    ],
    adminValiation,
    createSegment,
  );

  adminAuthRoute.get('/', listSegment);

  adminAuthRoute.get('/:id', segmentDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          const checkExists = await Segment.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment!');
          } else {
            return true;
          }
        }),
      body('name').notEmpty().withMessage('name field is required'),
      body('isActive').isBoolean().withMessage('isActive field is required'),
      body('file').optional(),
      // .custom(async (file) => {
      //   if (!isValidObjectId(file)) {
      //     throw new Error('Invalid file, please provide the correct file!');
      //   }
      //   const checkExists = await File.findOne({ _id: file, isDeleted: false });

      //   if (!checkExists) {
      //     throw new Error('Invalid file, please provide the correct file!');
      //   }
      //   return true;
      // }),
    ],
    adminValiation,
    updateSegment,
  );

  adminAuthRoute.delete('/delete/:id', deleteSegment);
});
/************************ SEGMENT CRUD ROUTES END ************************/

/************************ CATEGORY CRUD ROUTES START ************************/
adminAuthRoute.group('/category', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage('name field is required'),
      body('file')
        .notEmpty()
        .withMessage('file field is required')
        .custom(async (file) => {
          if (!isValidObjectId(file)) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          const checkExists = await File.findOne({ _id: file, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid file, please provide the correct file!');
          }
          return true;
        }),
      body('segment')
        .notEmpty()
        .withMessage('segment field is required')
        .custom(async (segment) => {

          if (!segment || !isValidObjectId(segment)) {
            throw new Error('Invalid id!');
          }
          const checkExists = await Segment.findOne({ _id: segment, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment, please provide the correct segment!');
          } else {
            return true;
          }
        }),
    ],
    adminValiation,
    createCategory,
  );

  adminAuthRoute.post(
    '/list',
    [
      body('segment')
        .optional()
        .custom(async (segment) => {
          if (segment === '') {
            return true;
          }

          if (!segment || !isValidObjectId(segment)) {
            throw new Error('Invalid id!');
          }

          const checkExists = await Segment.findOne({ _id: segment, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment, please enter the correct role');
          } else {
            return true;
          }
        }),
    ],
    listCatgory,
  );
  adminAuthRoute.get('/add-slug', addSlugInCategory);
  adminAuthRoute.get('/:id', categoryDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          const checkExists = await Category.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid category id!');
          } else {
            return true;
          }
        }),
      body('name').notEmpty().withMessage('name field is required'),
      body('segment')
        .notEmpty()
        .withMessage('segment field is required')
        .custom(async (segment) => {
          const checkExists = await Segment.findOne({ _id: segment, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid segment!');
          } else {
            return true;
          }
        }),
      body('file').optional(),
      body('slug').optional(),
      // .custom(async (file) => {
      //   if (!isValidObjectId(file)) {
      //     throw new Error('Invalid file, please provide the correct file!');
      //   }
      //   const checkExists = await File.findOne({ _id: file, isDeleted: false });

      //   if (!checkExists) {
      //     throw new Error('Invalid file, please provide the correct file!');
      //   }
      //   return true;
      // }),
      body('isActive').isBoolean().withMessage('isActive field is required'),
    ],
    adminValiation,
    updateCategory,
  );

  adminAuthRoute.delete('/delete/:id', deleteCategory);

});
/************************ CATEGORY CRUD ROUTES END ************************/

/************************ SUB CATEGORY CRUD ROUTES START ************************/
adminAuthRoute.group('/sub-category', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage('name field is required'),
      body('file').optional(),
      body('category')
        .notEmpty()
        .withMessage('category field is required')
        .custom(async (category) => {

          if (!category || !isValidObjectId(category)) {
            throw new Error('Invalid id!');
          }

          const checkExists = await Category.findOne({ _id: category, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid category, please provide the correct category!');
          } else {
            return true;
          }
        }),
    ],
    adminValiation,
    createSubCategory,
  );

  adminAuthRoute.post(
    '/list',
    [
      body('category')
        .optional()
        .custom(async (category) => {
          if (category === '') {
            return true;
          }
          const checkExists = await Category.findOne({ _id: category, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid category, please provide the correct category!');
          } else {
            return true;
          }
        }),
    ],
    adminValiation,
    listSubCatgory,
  );

  adminAuthRoute.get('/:id', subCategoryDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          const checkExists = await SubCategory.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid sub category id!');
          } else {
            return true;
          }
        }),
      body('name').notEmpty().withMessage('name field is required'),
      body('category')
        .notEmpty()
        .withMessage('category field is required')
        .custom(async (category) => {
          const checkExists = await Category.findOne({ _id: category, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid category!');
          } else {
            return true;
          }
        }),
      body('file').optional(),
      body('isActive').isBoolean().withMessage('isActive field is required'),
    ],
    adminValiation,
    updateSubCategory,
  );

  adminAuthRoute.delete('/delete/:id', deleteSubCategory);
});
/************************ SUB CATEGORY CRUD ROUTES END ************************/

/************************ EVENTS CRUD ROUTES START ************************/
adminAuthRoute.group('/events', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          let checkExists = await EventGroup.findOne({ name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Event with this name already exists!');
          }

          return true;
        }),
      body('description').optional(),
      body('file')
        .optional()
        .custom(async (file) => {
          if (file === '') {
            return true;
          }

          let checkExists = await File.findOne({ _id: file, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid file id!');
          }

          return true;
        }),
      body('group')
        .notEmpty()
        .withMessage('group value is required')
        .isArray()
        .withMessage('group value should be an array')
        .custom(async (group) => {
          for (const id of group) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}',The 'group' field only accepts category and sub-category IDs.`);
            }
            let idExists = await Category.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid value '${id}',The 'group' field only accepts category IDs.`);
            }
          }
          return true;
        }),
    ],
    adminValiation,
    createEvent,
  );

  adminAuthRoute.post(
    '/',
    [body('isActive').optional().isIn(['0', '1']).withMessage("isActive value should be one of these '0' or '1'")],
    adminValiation,
    listEvent,
  );

  adminAuthRoute.get('/add-slug', addSlugInEvent);
  adminAuthRoute.get('/:id', eventDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          let checkExists = await EventGroup.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid event id!');
          }

          return true;
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name, { req }) => {
          let checkExists = await EventGroup.findOne({ _id: { $ne: req.body.id }, name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Event with this name already exists!');
          }

          return true;
        }),
      body('description').optional(),
      body('file')
        .optional()
        .custom(async (file) => {
          if (file === '') {
            return true;
          }

          let checkExists = await File.findOne({ _id: file, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid file id!');
          }

          return true;
        }),
      body('group')
        .notEmpty()
        .withMessage('group value is required')
        .isArray()
        .withMessage('group value should be an array')
        .custom(async (group) => {
          for (const id of group) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}',The 'group' field only accepts category IDs.`);
            }
            let idExists = await Category.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid value '${id}',The 'group' field only accepts category IDs.`);
            }
          }
          return true;
        }),
    ],
    adminValiation,
    updateEvent,
  );

  adminAuthRoute.delete('/delete/:id', deleteEvent);
});
/************************ EVENTS CRUD ROUTES END ************************/

/************************ PRODUCT CRUD ROUTES START ************************/
adminAuthRoute.group('/product', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage('name field is required'),
      body('description').optional(),
      body('hindiDescription').optional(),
      body('hindiName').optional(),
      body('category').notEmpty()
        .withMessage('category field is required').isArray().withMessage('category value should be an array!')
        .custom(async (category) => {
          for (let cat of category) {

            if (!isValidObjectId(cat)) {
              throw new Error('Invalid category, please enter the correct category');
            }
            const checkExists = await Category.findOne({ _id: cat, isDeleted: false });
            if (!checkExists) {
              throw new Error('Invalid category, please provide the correct category!');
            }
          }
          return true;

        }),
      body('subCategory').optional(),
      body('mrp')
        .notEmpty()
        .withMessage('mrp field is required')
        .isInt({ min: 0 })
        .withMessage('mrp must be a number and cannot be in negative.'),
      body('price')
        .notEmpty()
        .withMessage('price field is required')
        .isInt({ min: 0 })
        .withMessage('Price must be a number and cannot be in negative.')
        .custom((price, { req }) => {
          if (Number(price) > Number(req.body.mrp)) {
            throw new Error('Price cannot be more than mrp');
          }
          return true;
        }),
      body('vendorPrice')
        .notEmpty()
        .withMessage('vendorPrice field is required')
        .isInt({ min: 0 })
        .withMessage('vendorPrice must be a number and cannot be in negative.'),
      body('deliveryType')
        .notEmpty()
        .withMessage('deliveryType value is required')
        .isIn(['local', 'partner', 'both'])
        .withMessage("deliveryType value should be one of these 'local','partner' or 'both'"),
      body('file').optional().isArray().withMessage("file value should be in array!").custom(async (file) => {
        // if (file === '') {
        //   return true;
        // }
        if (!isValidObjectId(file) && !Array.isArray(file)) {
          throw new Error('Invalid file id, please enter the correct file id');
        }

        for (let img of file) {
          let checkFile = await File.findOne({ _id: makeObjectId(img), isDeleted: false });

          if (!checkFile) {
            throw new Error('Invalid file id')
          }
          return true;
        }
        return true;
      }),
    ],
    adminValiation,
    createProduct,
  );

  adminAuthRoute.post(
    '/list',
    [
      // body('segment')
      //   .optional()
      //   .custom(async (segment) => {
      //     if (segment === '') {
      //       return true;
      //     }
      //     const checkExists = await Segment.findOne({ _id: segment, isDeleted: false });

      //     if (!checkExists) {
      //       throw new Error('Invalid segment, please enter the correct segment');
      //     } else {
      //       return true;
      //     }
      //   }),
      body('category')
        .optional()
        .custom(async (category) => {
          if (category === '') {
            return true;
          }

          if (!isValidObjectId(category)) {
            throw new Error('Invalid category, please enter the correct category');
          }

          const checkExists = await Category.findOne({ _id: category, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid category, please enter the correct category');
          } else {
            return true;
          }
        }),
    ],
    adminValiation,
    listProduct,
  );

  // adminAuthRoute.get('/change-str-to-arr', ProdctStrToArr);

  adminAuthRoute.get('/:id', productDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid product id, please enter the correct product');
          }
          const checkExists = await Product.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid product id!');
          } else {
            return true;
          }
        }),
      body('name').notEmpty().withMessage('name field is required'),
      body('category')
        .notEmpty()
        .withMessage('category field is required')
        .custom(async (category) => {
          if (!isValidObjectId(category)) {
            throw new Error('Invalid category, please enter the correct category');
          }
          const checkExists = await Category.findOne({ _id: category, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid category, please provide the correct segment!');
          } else {
            return true;
          }
        }),
      body('subCategory').optional(),
      body('description').optional(),
      body('hindiDescription').optional(),
      body('hindiName').optional(),
      body('mrp')
        .notEmpty()
        .withMessage('mrp field is required')
        .isInt({ min: 0 })
        .withMessage('mrp must be a number and cannot be in negative.'),
      body('vendorPrice')
        .notEmpty()
        .withMessage('vendorPrice field is required')
        .isInt({ min: 0 })
        .withMessage('vendorPrice must be a number and cannot be in negative.'),
      body('price')
        .notEmpty()
        .withMessage('price field is required')
        .isInt({ min: 0 })
        .withMessage('Price must be a number and cannot be in negative.')
        .custom((price, { req }) => {
          if (Number(price) > Number(req.body.mrp)) {
            throw new Error('Price cannot be more than mrp');
          }
          return true;
        }),
      body('deliveryType')
        .notEmpty()
        .withMessage('deliveryType value is required')
        .isIn(['local', 'partner', 'both'])
        .withMessage("deliveryType value should be one of these 'local','partner' or 'both'"),
      body('file').optional().isArray().withMessage("file value should be in array!").custom(async (file) => {
        // if (file === '') {
        //   return true;
        // }
        if (!isValidObjectId(file) && !Array.isArray(file)) {
          throw new Error('Invalid file id, please enter the correct file id');
        }

        for (let img of file) {
          let checkFile = await File.findOne({ _id: makeObjectId(img), isDeleted: false });

          if (!checkFile) {
            throw new Error('Invalid file id')
          }
          return true;
        }
        return true;
      }),
      body('isActive').notEmpty().isBoolean().withMessage('isActive field is required'),
      body('videoUrl').optional(),
    ],
    adminValiation,
    updateProduct,
  );

  adminAuthRoute.delete('/delete/:id', deleteProduct);
});
/************************ PRODUCT CRUD ROUTES END ************************/

/************************ VENDOR PRODUCT CRUD ROUTES START ************************/
adminAuthRoute.group('/vendor-product', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/list',
    [
      body('segment')
        .optional()
        .custom(async (segment) => {
          if (segment === '') {
            return true;
          }

          if (!isValidObjectId(segment)) {
            throw new Error('Invalid segment, please enter the correct segment');
          }

          return true;
        }),
      body('category')
        .optional()
        .custom(async (category) => {
          if (category === '') {
            return true;
          }

          if (!isValidObjectId(category)) {
            throw new Error('Invalid category, please enter the correct category');
          }
          return true;
        }),
      body('status').optional(),
    ],
    adminValiation,
    listVendorProduct,
  );

  adminAuthRoute.get('/:id', detailProduct);

  adminAuthRoute.put(
    '/approve',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid vendor product id, please enter the correct product');
          }
          const checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid vendor product id!');
          } else {
            return true;
          }
        }),
      body('status')
        .notEmpty()
        .withMessage('status field is required')
        .isIn(['pending', 'rejected', 'approved'])
        .withMessage('Invalid value for status! Value can only be one of them ("approved","pending" or "rejected")'),
      body('reason').optional(),
    ],
    adminValiation,
    approveProduct,
  );

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid product id, please enter the correct product');
          }
          const checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid product id!');
          } else {
            return true;
          }
        }),
      body('mrp')
        .notEmpty()
        .withMessage('mrp field is required')
        .isInt({ min: 0 })
        .withMessage('Mrp must be a number and cannot be in negative.'),
      body('price')
        .notEmpty()
        .withMessage('price field is required')
        .isInt({ min: 0 })
        .withMessage('Price must be a number and cannot be in negative.')
        .custom((price, { req }) => {
          if (Number(price) > Number(req.body.mrp)) {
            throw new Error('price should be lesser than mrp!');
          }
          return true;
        }),
      body('vendorPrice')
        .notEmpty()
        .withMessage('vendorPrice field is required')
        .isInt({ min: 0 })
        .withMessage('vendorPrice must be a number and cannot be in negative.'),
      body('name').notEmpty().withMessage('name field is required'),
      body('description').optional(),
      body('category')
        .notEmpty()
        .withMessage('category field is required')
        .custom(async (category) => {
          if (!isValidObjectId(category)) {
            throw new Error('Invalid category, please enter the correct category');
          }

          const checkExists = await Category.findOne({
            _id: category,
            isActive: true,
            isDeleted: false,
          });

          if (!checkExists) {
            throw new Error('Invalid category, please provide the correct segment!');
          } else {
            return true;
          }
        }),
      body('subCategory').optional(),
      body('offer').optional().isInt({ min: 0 }).withMessage('offer value should be a positive integer'),
      body('mrp').optional().isInt({ min: 0 }).withMessage('mrp value should be a positive integer'),
      body('stock')
        .notEmpty()
        .withMessage('stock value is required')
        .isInt({ min: 0 })
        .withMessage('stock value should be a positive integer'),
      body('deliveryType')
        .notEmpty()
        .withMessage('deliveryType value is required')
        .isIn(['local', 'partner', 'both'])
        .withMessage("deliveryType value should be one of these 'local','partner' or 'both'"),
      body('file').optional().isArray().withMessage("file value should be in array!").custom(async (file) => {
        // if (file === '') {
        //   return true;
        // }
        if (!isValidObjectId(file) && !Array.isArray(file)) {
          throw new Error('Invalid file id, please enter the correct file id');
        }

        for (let img of file) {
          let checkFile = await File.findOne({ _id: makeObjectId(img), isDeleted: false });

          if (!checkFile) {
            throw new Error('Invalid file id')
          }
          return true;
        }
        return true;
      }),
    ],
    adminValiation,
    updateVendorProduct,
  );
  adminAuthRoute.delete('/:id', deleteVendorProduct);

});
/************************ VENDOR PRODUCT CRUD ROUTES END ************************/

/************************ COUPON CRUD ROUTES START ************************/
adminAuthRoute.group('/coupon', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('code').optional(),
      body('type')
        .notEmpty()
        .withMessage('type field is required')
        .isIn(['flat', 'percentage'])
        .withMessage("type value should be one of these 'flat' or 'percentage'"),
      body('discount')
        .notEmpty()
        .withMessage('discount field is required')
        .isInt({ min: 0 })
        .withMessage('discount value should be an positive integer')
        .custom(async (discount, { req }) => {
          if (req.body.type === 'percentage' && discount > 99) {
            throw new Error('Invalid value for discount, please provide a value under 100 percent!');
          }
          return true;
        }),
      body('discountUpTo').optional(),
      body('totalLimit')
        .notEmpty()
        .withMessage('totalLimit field is required')
        .isInt({ min: 0 })
        .withMessage('totalLimit value should be an positive integer'),
      body('userLimit')
        .notEmpty()
        .withMessage('userLimit field is required')
        .isInt({ min: 0 })
        .withMessage('userLimit value should be an positive integer')
        .custom(async (userLimit, { req }) => {
          if (Number(userLimit) > Number(req.body.totalLimit)) {
            throw new Error('Invalid value for userLimit, userLimit cannot be greator than totalLimit!');
          }
          return true;
        }),
      body('expiredAt')
        .notEmpty()
        .withMessage('expiredAt field is required')
        .custom((expiredAt) => {
          const expirationDate = new Date(expiredAt);

          const currentDate = new Date();
          const expirationDateWithoutTime = new Date(
            expirationDate.getFullYear(),
            expirationDate.getMonth(),
            expirationDate.getDate(),
          );

          const currentDateWithoutTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
          );

          if (expirationDateWithoutTime <= currentDateWithoutTime) {
            throw new Error('expiredAt must be a date greater than the current date');
          }
          return true;
        }),
    ],
    adminValiation,
    createCoupon,
  );

  adminAuthRoute.post('/list', listCoupon);

  adminAuthRoute.get('/:id', couponDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          const checkExists = await Coupon.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid coupon id!');
          } else {
            return true;
          }
        }),
      body('code')
        .notEmpty()
        .withMessage('code field is required')
        .custom(async (code, { req }) => {
          const checkExists = await Coupon.findOne({ _id: { $ne: req.body.id }, code: code, isDeleted: false });

          if (checkExists) {
            throw new Error('Code already exists, use some other unique code!');
          } else {
            return true;
          }
        }),
      body('type')
        .notEmpty()
        .withMessage('type field is required')
        .isIn(['flat', 'percentage'])
        .withMessage("type value should be one of these 'flat' or 'percentage'"),
      body('discount')
        .notEmpty()
        .withMessage('discount field is required')
        .isInt({ min: 0 })
        .withMessage('discount value should be an positive integer')
        .custom(async (discount, { req }) => {
          if (req.body.type === 'percentage' && discount > 99) {
            throw new Error('Invalid value for discount, please provide a value under 100 percent!');
          }
          return true;
        }),
      body('discountUpTo').optional(),
      body('totalLimit')
        .notEmpty()
        .withMessage('totalLimit field is required')
        .isInt({ min: 0 })
        .withMessage('totalLimit value should be an positive integer'),
      body('userLimit')
        .notEmpty()
        .withMessage('userLimit field is required')
        .isInt({ min: 0 })
        .withMessage('userLimit value should be an positive integer')
        .custom(async (userLimit, { req }) => {
          if (Number(userLimit) > Number(req.body.totalLimit)) {
            throw new Error('Invalid value for userLimit, userLimit cannot be greator than totalLimit!');
          }
          return true;
        }),
      body('expiredAt')
        .notEmpty()
        .withMessage('expiredAt field is required')
        .custom((expiredAt) => {
          const expirationDate = new Date(expiredAt);

          const currentDate = new Date();
          const expirationDateWithoutTime = new Date(
            expirationDate.getFullYear(),
            expirationDate.getMonth(),
            expirationDate.getDate(),
          );

          const currentDateWithoutTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
          );

          if (expirationDateWithoutTime <= currentDateWithoutTime) {
            throw new Error('expiredAt must be a date greater than the current date');
          }
          return true;
        }),
    ],
    adminValiation,
    updateCoupon,
  );

  adminAuthRoute.delete('/delete/:id', deleteCoupon);
});
/************************ COUPON CRUD ROUTES END ************************/

/************************ STATIC PAGES CRUD ROUTES START ************************/
adminAuthRoute.group('/static-page', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('categoryId')
        .notEmpty()
        .withMessage('categoryId value is required!')
        .custom(async (categoryId) => {
          let checkExists = await Page.findOne({ category: categoryId, isDeleted: false });
          if (checkExists) {
            throw new Error('Page with this category already exists!');
          }
          return true;
        }),
      body('title')
        .notEmpty()
        .withMessage('title value is required!')
        .custom(async (title) => {
          let checkExists = await Page.findOne({ title, isDeleted: false });
          if (checkExists) {
            throw new Error('Page with this title already exists!');
          }
          return true;
        }),
      body('slug')
        .notEmpty()
        .withMessage('slug value is required!')
        .custom(async (slug) => {
          let checkExists = await Page.findOne({ slug, isDeleted: false });
          if (checkExists) {
            throw new Error('slug with this title already exists!');
          }
          return true;
        }),
      body('description').optional(),
      body('content').optional(),
      body('icon').optional(),
      body('darkModeIcon').optional(),
    ],
    adminValiation,
    createPage,
  );

  adminAuthRoute.post(
    '/list',
    [body('iActive').optional().isBoolean().withMessage('isActive only accepts boolean values!')],
    adminValiation,
    listPage,
  );

  adminAuthRoute.get('/:id', pageDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          let checkExists = await Page.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid page id!');
          }
          return true;
        }),
      body('categoryId')
        .notEmpty()
        .withMessage('categoryId value is required!')
        .custom(async (categoryId) => {
          let checkExists = await PageCategory.findOne({ _id: categoryId, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid category id!');
          }
          return true;
        }),
      body('title')
        .notEmpty()
        .withMessage('title value is required!')
        .custom(async (title, { req }) => {
          let checkExists = await Page.findOne({ title, _id: { $ne: req.body.id }, isDeleted: false });
          if (checkExists) {
            throw new Error('Page with this title already exists!');
          }
          return true;
        }),
      body('slug')
        .notEmpty()
        .withMessage('slug value is required!')
        .custom(async (slug, { req }) => {
          let checkExists = await Page.findOne({ slug, _id: { $ne: req.body.id }, isDeleted: false });
          if (checkExists) {
            throw new Error('slug with this title already exists!');
          }
          return true;
        }),
      body('description').optional(),
      body('content').optional(),
      body('icon').optional(),
      body('darkModeIcon').optional(),
    ],
    adminValiation,
    updatePage,
  );

  adminAuthRoute.delete('/delete/:id', deletePage);
});
/************************ STATIC PAGES CRUD ROUTES END ************************/

/**************************** STATIC PAGES CATEGORY ROUTES STARTS ***************************************************** */

adminAuthRoute.group('/static-page-category', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name value is required!')
        .custom(async (name) => {
          let checkExists = await PageCategory.findOne({ name, isDeleted: false });
          if (checkExists) {
            throw new Error('Category already exists!');
          }
          return true;
        }),
    ],
    adminValiation,
    createPageCategory,
  );

  adminAuthRoute.post(
    '/list',
    [body('iActive').optional().isBoolean().withMessage('isActive only accepts boolean values!')],
    adminValiation,
    listPageCategory,
  );

  adminAuthRoute.get('/:id', pageCategoryDetails);

  adminAuthRoute.put('/update/:id', [body('name').optional()], adminValiation, updateCategoryPage);

  adminAuthRoute.delete('/delete/:id', deletePageCategory);
});

/**************************** STATIC PAGES CATEGORY ROUTES ENDS ***************************************************** */

/************************ POOJA ITEMS CRUD ROUTES START ************************/
adminAuthRoute.group('/pooja-element', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage('name value is required!'),
      body('description').optional(),
      body('file').optional(),
    ],
    adminValiation,
    createPoojaElement,
  );

  adminAuthRoute.get('/', listPoojaElement);

  adminAuthRoute.get('/:id', PoojaElementDetails);

  adminAuthRoute.put(
    '/edit',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          let checkExists = await PoojaElement.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid pooja element id!');
          }
          return true;
        }),
      body('name').notEmpty().withMessage('name value is required!'),
      body('description').optional(),
      body('file').optional(),
      body('isActive')
        .notEmpty()
        .withMessage('isActive value is required!')
        .isBoolean()
        .withMessage('isActive value should be boolean type!'),
    ],
    adminValiation,
    editPoojaElement,
  );

  adminAuthRoute.delete('/delete/:id', deletePoojaElement);
});
/************************ POOJA ITEMS CRUD ROUTES END ************************/

/************************ POOJA PACKAGE CRUD ROUTES START ************************/
adminAuthRoute.group('/pooja-package', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage('name value is required!'),
      body('description').optional(),
      body('file').optional(),
      body('mrp').optional(),
      body('price')
        .notEmpty()
        .withMessage('price value is required!')
        .isInt({ min: 0 })
        .withMessage('price value should be an positive number'),
      body('stock')
        .notEmpty()
        .withMessage('stock value is required!')
        .isInt({ min: 1 })
        .withMessage('stock value should be an positive number'),
      body('segment')
        .notEmpty()
        .withMessage('segment value is required!')
        .custom(async (segment) => {
          if (!isValidObjectId(segment)) {
            throw new Error('Invalid segment id!');
          }
          let checkExists = await Segment.findOne({ _id: segment, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid segment id!');
          }
          return true;
        }),
    ],
    adminValiation,
    createPoojaPackage,
  );

  adminAuthRoute.get('/', listPoojaPackage);

  adminAuthRoute.get('/:id', poojaPackageDetails);

  adminAuthRoute.put(
    '/edit',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          let checkExists = await PoojaPackage.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid pooja package id!');
          }
          return true;
        }),
      body('name').notEmpty().withMessage('name value is required!'),
      body('description').optional(),
      body('file').optional(),
      body('mrp').optional(),
      body('price').notEmpty().withMessage('price value is required!').isInt({ min: 0 }),
      // body('elements').optional().isArray().withMessage('elements value should be an array!'),
      body('stock')
        .notEmpty()
        .withMessage('stock value is required!')
        .isInt({ min: 0 })
        .withMessage('stock value should be an positive number'),
      body('isActive')
        .notEmpty()
        .withMessage('isActive value is required!')
        .isBoolean()
        .withMessage('isActive value should be boolean type!'),
      body('segment')
        .notEmpty()
        .withMessage('segment value is required!')
        .custom(async (segment) => {
          if (!isValidObjectId(segment)) {
            throw new Error('Invalid segment id!');
          }
          let checkExists = await Segment.findOne({ _id: segment, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid segment id!');
          }
          return true;
        }),
    ],
    adminValiation,
    editPoojaPackage,
  );

  adminAuthRoute.delete('/delete/:id', deletePoojaPackage);

  adminAuthRoute.post(
    '/add-item-to-package',
    [
      body('packageId')
        .notEmpty()
        .withMessage('packageId field is required')
        .custom(async (packageId) => {
          let checkExists = await PoojaPackage.findOne({ _id: packageId, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid package id!');
          }
          return true;
        }),
      body('element')
        .notEmpty()
        .withMessage('element field is required!')
        .isArray()
        .withMessage('element value should be an array!'),
    ],
    adminValiation,
    addItemsToPackage,
  );

  adminAuthRoute.post(
    '/remove-item-to-package',
    [
      body('packageId')
        .notEmpty()
        .withMessage('packageId field is required')
        .custom(async (packageId) => {
          let checkExists = await PoojaPackage.findOne({ _id: packageId, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid package id!');
          }
          return true;
        }),
      body('element')
        .notEmpty()
        .withMessage('element field is required!')
        .isArray()
        .withMessage('element value should be an array!'),
    ],
    adminValiation,
    removeItemsToPackage,
  );

  adminAuthRoute.post(
    '/replace-item-to-package',
    [
      body('packageId')
        .notEmpty()
        .withMessage('packageId field is required')
        .custom(async (packageId) => {
          let checkExists = await PoojaPackage.findOne({ _id: packageId, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid package id!');
          }
          return true;
        }),
      body('element')
        .notEmpty()
        .withMessage('element field is required!')
        .isArray()
        .withMessage('element value should be an array!'),
    ],
    adminValiation,
    replaceItemsToPackage,
  );
});
/************************ POOJA PACKAGE CRUD ROUTES END ************************/

/************************ CALENDAR CRUD ROUTES START ************************/
adminAuthRoute.group('/calendar', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create-fest',
    [
      body('name').notEmpty().withMessage('name value is required!'),
      body('date').notEmpty().withMessage('date value is required!'),
      body('description').optional(),
      body('file').optional(),
      body('packageId')
        .optional()
        .custom(async (packageId) => {
          let checkExists = await PoojaPackage.findOne({ _id: packageId, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid package id!');
          }
          return true;
        }),
    ],
    adminValiation,
    createFest,
  );

  adminAuthRoute.post(
    '/get-list',
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
    adminValiation,
    listFest,
  );

  adminAuthRoute.get('/get-list/:id', festDetails);

  adminAuthRoute.put(
    '/edit-fest',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          let checkExists = await Calendar.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid calendar fest id!');
          }
          return true;
        }),
      body('name').notEmpty().withMessage('name value is required!'),
      body('date').notEmpty().withMessage('date value is required!'),
      body('isActive')
        .notEmpty()
        .withMessage('isActive value is required!')
        .isBoolean()
        .withMessage('isActive value should be boolean type!'),
      body('description').optional(),
      body('file').optional(),
      body('packageId')
        .optional()
        .custom(async (packageId) => {
          let checkExists = await PoojaPackage.findOne({ _id: packageId, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid package id!');
          }
          return true;
        }),
    ],
    adminValiation,
    editFest,
  );

  adminAuthRoute.delete('/delete/:id', deleteFest);
});
/************************ CALENDAR CRUD ROUTES END ************************/
/************************ DASHBOARD ROUTES START ************************/

adminAuthRoute.group('/dashboard', (adminAuthRoute) => {
  adminAuthRoute.get('/get-dashboard-list', dashboardDetails);
  adminAuthRoute.get('/get-recent-product-list', getRecentAddProductLists);
  adminAuthRoute.get('/get-top-selling-product-list', getTopSellingProductLists);
  adminAuthRoute.get('/dashboard-details-list', dashboardDetailsApis);
});
adminAuthRoute.group('/order', (adminAuthRoute) => {
  adminAuthRoute.post('/', orderLists);
  adminAuthRoute.get('/:id', orderDetails);
});

/************************ DASHBOARD ROUTES END ************************/
//************************* APPROVED VENDOR ROUTES STARTS******************************** */

adminAuthRoute.group('/become-a-partner', (adminAuthRoute) => {
  adminAuthRoute.post('/approval', [body('id').notEmpty().withMessage('Id is required!'),], adminValiation, approvedVendorBecomePartner);
  adminAuthRoute.post('/list', [
    body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
    body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
  ], adminValiation, becomePartnerLists);


});

//************************* APPROVED VENDOR ROUTES ENDS******************************** */

//*****************************  REVIEWS ROUTES STARTS  ********************************************************* */
adminAuthRoute.group('/reviews', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          if (id && isValidObjectId(id)) {

            let checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false });
            if (!checkExists) {
              throw new Error('Invalid product id!');
            }
            return true;
          }
          throw new Error('Invalid product id!');
        }),
    ],
    adminValiation,
    getProductReviews,
  );
  // adminAuthRoute.put(
  //   '/edit-review',
  //   [
  //     body('id')
  //       .notEmpty()
  //       .withMessage('id value is required!')
  //       .custom(async (id) => {
  //         if (id && isValidObjectId(id)) {
  //           let checkExists = await Review.findOne({ _id: id });
  //           if (!checkExists) {
  //             throw new Error('Invalid product id!');
  //           }
  //           return true;
  //         }
  //         throw new Error('Invalid product id!');
  //       }),

  //     // body('comment').optional(),
  //     body('rate').optional(),
  //   ],
  //   adminValiation,
  //   updateProductReview,
  // );
  adminAuthRoute.put(
    '/edit-review',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          if (id && isValidObjectId(id)) {
            let checkExists = await VendorProduct.findOne({ _id: id });
            if (!checkExists) {
              throw new Error('Invalid product id!');
            }
            return true;
          }
          throw new Error('Invalid product id!');
        }),

      body('rate').optional().isInt({ min: 1, max: 5 }).withMessage('rating value should be between 1 to 5'),
    ],
    adminValiation,
    updateProductRating,
  );
  adminAuthRoute.delete('/:id', deleteProductReview);
});
//*****************************  REVIEWS ROUTES ENDS  ********************************************************* */

//*****************************  UPDATE ORDERS STATUS ROUTES STARTS  ********************************************************* */
adminAuthRoute.group('/order-status', (adminAuthRoute) => {
  adminAuthRoute.get('/', getAllOrders);
  adminAuthRoute.put(
    '/edit-status',
    [
      body('id')
        .notEmpty()
        .withMessage('id value is required!')
        .custom(async (id) => {
          if (id && isValidObjectId(id)) {
            let checkExists = await Order.findOne({ _id: id });
            if (!checkExists) {
              throw new Error('Invalid order id!');
            }
            return true;
          }
          throw new Error('Invalid order id!');

        }),
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

      body('status').notEmpty().withMessage('Status fields is required.').isIn(['pending', 'confirmed', 'cancelled', 'delivered', 'processed', 'dispatched'])
        .withMessage("status value can be either 'pending','confirmed','cancelled' or 'delivered','processed','dispatched'"),
    ],
    adminValiation,
    upateOrderStatus,
  );

});
//*****************************  UPDATE ORDERS STATUS ROUTES ENDS  ********************************************************* */


/************************ Segment Discount CRUD ROUTES START ************************/
adminAuthRoute.group('/segment-discount', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('segmentId').notEmpty().withMessage('segmentId field is required').custom(async (segmentId) => {
        if (!segmentId || !isValidObjectId(segmentId)) {
          throw new Error('Invalid segmentId, please provide the correct segmentId!');
        }
        const checkExists = await Segment.findOne({ _id: segmentId, isDeleted: false });

        if (!checkExists) {
          throw new Error('Invalid file, please provide the correct file!');
        }
        return true;
      }),
      body('discountValue').notEmpty().withMessage('discountValue field is required'),

    ],
    adminValiation,
    createSegmentDiscount
  );

  adminAuthRoute.get(
    '/list',
    listSegmentDiscount,
  );

  adminAuthRoute.get('/:id', segmentDiscountDetails);


  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {

          if (!id || !isValidObjectId(id)) {
            throw new Error('Invalid id!');
          }
          const checkExists = await SegmentDiscount.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment discount id!');
          } else {
            return true;
          }
        }),
      body('segmentId')
        .notEmpty()
        .withMessage('segmentId field is required')
        .custom(async (segmentId) => {
          if (!segmentId || !isValidObjectId(segmentId)) {
            throw new Error('Invalid segmentId, please provide the correct segmentId!');
          }
          const checkExists = await Segment.findOne({ _id: segmentId, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment discount id!');
          } else {
            return true;
          }
        }),
      body('discountValue').optional().custom(async (discountValue) => {
        if (discountValue < 0 || discountValue >= 100) {
          throw new Error('Discount value should be greater than 0 and less then 100!');
        }
      }),

    ],
    adminValiation,
    updateSegmentDiscount,
  );

  adminAuthRoute.delete('/delete/:id', deleteSegmentDiscount);
});
/************************ Segment Discount CRUD ROUTES END ************************/



//************************** ADD Request Callbacks ROUTES STARTS********************************************************** */

adminAuthRoute.group('/request-callback', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/list',
    [
      body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
      body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    ],
    adminValiation,
    requestCallBackLists,
  );

  adminAuthRoute.get('/:id', requestCallBackDetails);

});

//************************** ADD Request Callbacks ROUTES END********************************************************** */



/************************ Premium EVENTS CRUD ROUTES START ************************/
adminAuthRoute.group('/premium-events', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          let checkExists = await PremiumEvent.findOne({ name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Event with this name already exists!');
          }

          return true;
        }),
      body('description').optional(),
      body('file')
        .optional()
        .custom(async (file) => {
          if (file === '') {
            return true;
          }

          let checkExists = await File.findOne({ _id: file, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid file id!');
          }

          return true;
        }),
      body('category')
        .notEmpty()
        .withMessage('category value is required')
        .isArray()
        .withMessage('category value should be an array')
        .custom(async (category) => {
          for (const id of category) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'.`);
            }
            let idExists = await Category.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid category id!`);
            }
          }
          return true;
        }),
      body('subCategory')
        .notEmpty()
        .withMessage('subCategory value is required')
        .isArray()
        .withMessage('subCategory value should be an array')
        .custom(async (subCategory) => {
          for (const id of subCategory) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'.`);
            }
            let idExists = await SubCategory.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid sub category id!`);
            }
          }
          return true;
        }),
      body('segment')
        .notEmpty()
        .withMessage('segment value is required')
        .isArray()
        .withMessage('segment value should be an array')
        .custom(async (segment) => {
          for (const id of segment) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'.`);
            }
            let idExists = await Segment.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid segment id!`);
            }
          }
          return true;
        }),

    ],
    adminValiation,
    createPremiumEvent,
  );

  adminAuthRoute.post(
    '/',
    [body('isActive').optional().isIn(['0', '1']).withMessage("isActive value should be one of these '0' or '1'")],
    adminValiation,
    listPremiumEvent,
  );

  adminAuthRoute.get('/:id', premiumEventDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!id || !isValidObjectId(id)) {
            throw new Error('Invalid id!');
          }
          let checkExists = await PremiumEvent.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid premium event id!');
          }

          return true;
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name, { req }) => {
          let checkExists = await PremiumEvent.findOne({ _id: { $ne: req.body.id }, name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Premium event with this name already exists!');
          }

          return true;
        }),
      body('description').optional(),
      body('slug').optional(),
      body('file')
        .optional()
        .custom(async (file) => {
          if (file === '') {
            return true;
          }

          let checkExists = await File.findOne({ _id: file, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid file id!');
          }

          return true;
        }),
      body('category')
        .notEmpty()
        .withMessage('category value is required')
        .isArray()
        .withMessage('category value should be an array')
        .custom(async (category) => {
          for (const id of category) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}',The 'category' field only accepts category IDs.`);
            }
            let idExists = await Category.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid category id!`);
            }
          }
          return true;
        }),
      body('subCategory')
        .notEmpty()
        .withMessage('subCategory value is required')
        .isArray()
        .withMessage('subCategory value should be an array')
        .custom(async (subCategory) => {
          for (const id of subCategory) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'!`);
            }
            let idExists = await SubCategory.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid subCategory id!`);
            }
          }
          return true;
        }),
      body('segment')
        .notEmpty()
        .withMessage('segment value is required')
        .isArray()
        .withMessage('segment value should be an array')
        .custom(async (segment) => {
          for (const id of segment) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'!`);
            }
            let idExists = await Segment.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid segment id!`);
            }
          }
          return true;
        }),
    ],
    adminValiation,
    updatePremiumEvent,
  );

  adminAuthRoute.post('/add-slug', addSlugInPremiumEvent);
  adminAuthRoute.delete('/delete/:id', deletePremiumEvent);
});
/************************Premium EVENTS CRUD ROUTES END ************************/


/************************ Video Section CRUD ROUTES START ************************/
adminAuthRoute.group('/video-section', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('title')
        .notEmpty()
        .withMessage('Title field is required!'),
      body('hindiTitle')
        .optional()
      ,
      body('description').optional(),
      body('hindiDescription').optional(),
      body('videoUrl').notEmpty().withMessage('Video url field is required!'),
    ],
    adminValiation,
    createVideoSection,

  );

  adminAuthRoute.post(
    '/',
    [body('isActive').optional().isIn(['0', '1']).withMessage("isActive value should be one of these '0' or '1'")],
    adminValiation,
    listVideoSection,
  );

  adminAuthRoute.get('/:id', videoSectionDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!id || !isValidObjectId(id)) {
            throw new Error('Invalid id!');
          }
          let checkExists = await UploadVideo.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid video section id!');
          }

          return true;
        }),

      body('title').optional(),
      body('hindiTitle').optional(),
      body('description').optional(),
      body('hindiDescription').optional(),
      body('videoUrl').optional(),
    ],
    adminValiation,
    updateVideoSection,
  );

  adminAuthRoute.delete('/delete/:id', deleteVideoSection);
});
/************************ Video Section CRUD ROUTES END ************************/


/************************ PUSH NOTIFICATION ROUTES ROUTES START ************************/
adminAuthRoute.group('/notify', (adminAuthRoute) => {

  adminAuthRoute.post(
    "/send-push-notification",
    [
      body("title", "Title field is Required").notEmpty(),
      body("description", "Description field is Required").notEmpty(),
      // body("imageId").optional().custom(async (imageId) => {
      //   let image = await Upload.findById(imageId);
      //   if (image) {
      //     if (image.relatedWith === "Notification") {
      //       return true;
      //     } else {
      //       throw new Error("Image Belong to Different Category");
      //     }
      //   } else {
      //     throw new Error("Image Not found!");
      //   }
      // }),
    ],
    adminValiation,
    sendPushNotificationAdmin
  );

  adminAuthRoute.get('/', notificationList)

});
/************************ PUSH NOTIFICATION ROUTES END ************************/

/************************ OCCASION CRUD ROUTES START ************************/
adminAuthRoute.group('/occasion', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          let checkExists = await Occasion.findOne({ name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Occasion with this name already exists!');
          }

          return true;
        }),
      body('giftType')
        .notEmpty()
        .withMessage('giftType field is required')
        .custom(async (giftType) => {
          let giftArr = []
          if (giftType && Array.isArray(giftType)) {
            for (let data of giftType) {
              giftArr.push(data)
            }
          }
          let checkExists = await GiftType.findOne({ $or: [{ _id: { $in: giftArr } }], isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid gift id!');
          }

          return true;
        }),

    ],
    adminValiation,
    createOccasion,
  );

  adminAuthRoute.get(
    '/',
    listOccasion,
  );

  adminAuthRoute.get('/:id', occasionDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!id || !isValidObjectId(id)) {
            throw new Error('Invalid id!');
          }
          let checkExists = await Occasion.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid occasion id!');
          }

          return true;
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name, { req }) => {
          let checkExists = await Occasion.findOne({ _id: { $ne: req.body.id }, name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Occasion with this name already exists!');
          }

          return true;
        }),
      body('giftType')
        .notEmpty()
        .withMessage('giftType field is required')
        .custom(async (giftType) => {
          let giftArr = []
          if (giftType && Array.isArray(giftType)) {
            for (let data of giftType) {
              giftArr.push(data)
            }
          }
          let checkExists = await GiftType.findOne({ $or: [{ _id: { $in: giftArr } }], isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid gift id!');
          }

          return true;
        }),

    ],
    adminValiation,
    updateOccasion,
  );

  adminAuthRoute.delete('/delete/:id', deleteOccasion);
});
/************************ OCCASION CRUD ROUTES END ************************/

/************************ GIFT TYPE ROUTES START ************************/
adminAuthRoute.group('/gift-type', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/create',
    [
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name) => {
          let checkExists = await GiftType.findOne({ name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Gift with this name already exists!');
          }

          return true;
        }),

      body('category')
        .notEmpty()
        .withMessage('category value is required')
        .isArray()
        .withMessage('category value should be an array')
        .custom(async (category) => {
          for (const id of category) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'.`);
            }
            let idExists = await Category.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid category id!`);
            }
          }
          return true;
        }),
      body('subCategory')
        .notEmpty()
        .withMessage('subCategory value is required')
        .isArray()
        .withMessage('subCategory value should be an array')
        .custom(async (subCategory) => {
          for (const id of subCategory) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'.`);
            }
            let idExists = await SubCategory.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid sub category id!`);
            }
          }
          return true;
        }),

    ],
    adminValiation,
    createGiftType,
  );

  adminAuthRoute.get(
    '/',
    listGiftType,
  );

  adminAuthRoute.get('/:id', giftTypeDetails);

  adminAuthRoute.put(
    '/update',
    [
      body('id')
        .notEmpty()
        .withMessage('id field is required')
        .custom(async (id) => {
          if (!id || !isValidObjectId(id)) {
            throw new Error('Invalid id!');
          }
          let checkExists = await GiftType.findOne({ _id: id, isDeleted: false });
          if (!checkExists) {
            throw new Error('Invalid gift id!');
          }

          return true;
        }),
      body('name')
        .notEmpty()
        .withMessage('name field is required')
        .custom(async (name, { req }) => {
          let checkExists = await PremiumEvent.findOne({ _id: { $ne: req.body.id }, name: name, isDeleted: false });
          if (checkExists) {
            throw new Error('Gift with this name already exists!');
          }

          return true;
        }),
      body('slug').optional(),

      body('category')
        .notEmpty()
        .withMessage('category value is required')
        .isArray()
        .withMessage('category value should be an array')
        .custom(async (category) => {
          for (const id of category) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}',The 'category' field only accepts category IDs.`);
            }
            let idExists = await Category.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid category id!`);
            }
          }
          return true;
        }),
      body('subCategory')
        .notEmpty()
        .withMessage('subCategory value is required')
        .isArray()
        .withMessage('subCategory value should be an array')
        .custom(async (subCategory) => {
          for (const id of subCategory) {
            if (!isValidObjectId(id)) {
              throw new Error(`Invalid value '${id}'!`);
            }
            let idExists = await SubCategory.findOne({ _id: id, isDeleted: false });
            if (!idExists) {
              throw new Error(`Invalid subCategory id!`);
            }
          }
          return true;
        }),

    ],
    adminValiation,
    updatGiftType,
  );

  adminAuthRoute.delete('/delete/:id', deleteGiftType);
});
/************************ GIFT TYPE CRUD ROUTES END ************************/

//************************** QUERIES ROUTES STARTS********************************************************** */

adminAuthRoute.group('/query', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/list',
    [
      body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
      body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    ],
    adminValiation,
    queryLists,
  );

  adminAuthRoute.get('/:id', queryDetails);

});

//************************** QUERIES ROUTES END********************************************************** */

