import express from 'express';
import { body } from 'express-validator';
export const vendorRoute = express.Router();
export const vendorAuthRoute = express.Router();
import expressGroupRoutes from 'express-group-routes';
/***************************
        CUSTOM IMPORTS
 ****************************/

import { vendorValiation } from '../validators/vendorValidation.js';
import {
  vendorForgotPassword,
  vendorLogin,
  vendorResetPassword,
  vendorSignUp,
} from '../controllers/vendor/authController.js';
import User from '../models/User.js';
import { vendorPasswordChange, vendorProfile } from '../controllers/vendor/vendorController.js';
import {
  addProductInSection,
  addSlugInVendorProduct,
  createProduct,
  listProduct,
  productDetails,
  removeProductInSection,
  // updateProductInSection,
} from '../controllers/vendor/productController.js';
import { categoryDetails, listCategory } from '../controllers/vendor/categoryController.js';
import Category from '../models/Category.js';
import Segment from '../models/Segment.js';
import { isValidObjectId } from 'mongoose';
import File from '../models/File.js';
import { listProductTemplate, productTemplateDetails } from '../controllers/vendor/productTemplateController.js';
import Product from '../models/Product.js';
import VendorProduct from '../models/VendorProduct.js';
import { vendorOrderDetails, vendorOrderLists } from '../controllers/vendor/orderController.js';
import Order from '../models/Order.js';
import { dashboardDetailLists } from '../controllers/vendor/dashboardController.js';
import { vendorUpateOrderStatus } from '../controllers/vendor/vendorUpdateOrderStatus.js';
import { requestQueryLists } from '../controllers/vendor/requestQueryForCallBacksController.js';

/******************************************************
                vendor auths start
******************************************************/

vendorRoute.group('/auth', (vendorRoute) => {
  vendorRoute.post(
    '/sign-up',
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
          const checkExists = await User.findOne({ email: email, type: 'vendor', isDeleted: false });

          if (checkExists) {
            throw new Error('email already in exists!');
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
            throw new Error('mobile already in exists!');
          } else {
            return true;
          }
        }),
      body('password').notEmpty().withMessage('password field is required'),
      body('segment')
        .notEmpty()
        .withMessage('segment field is required')
        .custom(async (segment) => {
          if (!isValidObjectId(segment)) {
            throw new Error('Invalid segment, please provide the correct segment!');
          }
          const checkExists = await Segment.findOne({ _id: segment, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid segment, please provide the correct segment!');
          } else {
            return true;
          }
        }),
    ],
    vendorValiation,
    vendorSignUp,
  );

  vendorRoute.post(
    '/login',
    [
      body('email').notEmpty().withMessage('email field is required'),
      body('password').notEmpty().withMessage('password field is required'),
    ],
    vendorValiation,
    vendorLogin,
  );

  vendorRoute.post(
    '/forgot-password',
    [body('email').notEmpty().withMessage('email field is required')],
    vendorValiation,
    vendorForgotPassword,
  );

  vendorRoute.post(
    '/reset-password',
    [body('password').notEmpty().withMessage('password field is required')],
    vendorValiation,
    vendorResetPassword,
  );
});

/******************************************************
                vendor auths end
******************************************************/

/************************  VENDOR PROFILE ROUTES START ************************/

vendorAuthRoute.group('/profile', (vendorAuthRoute) => {
  vendorAuthRoute.get('/', vendorProfile);

  vendorAuthRoute.post(
    '/change-password',
    [
      body('old').notEmpty().withMessage('old field is required'),
      body('new').notEmpty().withMessage('new field is required'),
    ],
    vendorValiation,
    vendorPasswordChange,
  );
});
/************************  VENDOR PROFILE ROUTES END ************************/

/************************  VENDOR CATEGORY ROUTES START ************************/
vendorAuthRoute.group('/category', (vendorAuthRoute) => {
  vendorAuthRoute.get('/list', listCategory);

  vendorAuthRoute.get('/:id', categoryDetails);
});
/************************  VENDOR CATEGORY ROUTES END ************************/

/************************  VENDOR PACKAGE ROUTES START ************************/
// vendorAuthRoute.group('/package', (vendorAuthRoute) => {
//   vendorAuthRoute.post(
//     '/list',
//     [
//       body('category')
//         .optional()
//         .custom(async (category) => {
//           if (category === '') {
//             return true;
//           }

//           if (!isValidObjectId(category)) {
//             throw new Error('Invalid category, please enter the correct category');
//           }

//           return true;
//         }),
//       body('status')
//         .optional()
//         .custom(async (status) => {
//           if (status === '') {
//             return true;
//           }

//           if (status !== 'rejected' && status !== 'approved' && status !== 'pending') {
//             throw new Error("Invalid value for status, available values are 'approved', 'rejected' and 'pending'");
//           }

//           return true;
//         }),
//     ],
//     vendorValiation,
//     listProduct,
//   );

//   vendorAuthRoute.get('/:id', productDetails);

//   vendorAuthRoute.post(
//     '/add-product-in-my-section',
//     [
//       body('id')
//         .optional()
//         .custom(async (id) => {
//           if (!isValidObjectId(id)) {
//             throw new Error('Invalid id, please enter the correct id');
//           }

//           const checkExists = await Product.findOne({ _id: id, isDeleted: false });

//           if (!checkExists) {
//             throw new Error('Invalid id, please enter the correct id');
//           } else {
//             return true;
//           }
//         }),
//       body('stock')
//         .notEmpty()
//         .withMessage('stock value is required')
//         .isInt({ min: 1 })
//         .withMessage('stock value should be a positive integer'),
//       body('offer').optional().isInt({ min: 0 }).withMessage('offer value should be a positive integer'),
//     ],
//     vendorValiation,
//     addProductInSection,
//   );

//   vendorAuthRoute.post(
//     '/remove-product-in-my-section',
//     [
//       body('id')
//         .optional()
//         .custom(async (id) => {
//           if (!isValidObjectId(id)) {
//             throw new Error('Invalid id, please enter the correct id');
//           }

//           const checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false });

//           if (!checkExists) {
//             throw new Error('Invalid id, please enter the correct id');
//           } else {
//             return true;
//           }
//         }),
//     ],
//     vendorValiation,
//     removeProductInSection,
//   );
// });
/************************  VENDOR PACKAGE ROUTES END ************************/

/************************  VENDOR PRODUCT TEMPLATE ROUTES START ************************/
vendorAuthRoute.group('/product', (vendorAuthRoute) => {
  vendorAuthRoute.post(
    '/create',
    [
      body('name').notEmpty().withMessage('name field is required'),
      body('description').optional(),
      body('category')
        .notEmpty()
        .withMessage('category field is required')
        .custom(async (category) => {
          if (!isValidObjectId(category)) {
            throw new Error('Invalid category, please enter the correct category');
          }

          const checkExists = await Category.findOne({ _id: category, isActive: true, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid category, please provide the correct segment!');
          } else {
            return true;
          }
        }),
      body('subCategory').optional(),
      body('price')
        .notEmpty()
        .withMessage('price field is required')
        .isInt({ min: 1 })
        .withMessage('price value should be a positive integer'),
      body('offer').optional().isInt({ min: 1 }).withMessage('offer value should be a positive integer'),
      body('stock')
        .notEmpty()
        .withMessage('stock value is required')
        .isInt({ min: 1 })
        .withMessage('stock value should be a positive integer'),
      body('deliveryType')
        .notEmpty()
        .withMessage('deliveryType value is required')
        .isIn(['local', 'partner', 'both'])
        .withMessage("deliveryType value should be one of these 'local','partner' or 'both'"),
      body('file')
        .optional().isArray().withMessage('File should be in array!')
        .custom(async (file) => {
          if (!isValidObjectId(file) && !Array.isArray(file)) {
            throw new Error('Invalid file id, please enter the correct file id!');
          }

          for (let img of file) {
            const checkExists = await File.findOne({ _id: img, isDeleted: false });
            if (!checkExists) {
              throw new Error('Invalid file id, please enter the correct file id!');
            }
            return true;
          }
          return true;

        }),
    ],
    vendorValiation,
    createProduct,
  );

  vendorAuthRoute.post(
    '/list',
    [
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
      body('status')
        .optional()
        .custom(async (status) => {
          if (status === '') {
            return true;
          }

          if (status !== 'rejected' && status !== 'approved' && status !== 'pending') {
            throw new Error("Invalid value for status, available values are 'approved', 'rejected' and 'pending'");
          }

          return true;
        }),
    ],
    vendorValiation,
    listProduct,
  );

  vendorAuthRoute.get('/:id', productDetails);

  vendorAuthRoute.post('/add-slug', addSlugInVendorProduct);

  vendorAuthRoute.post(
    '/add-product-in-my-section',
    [
      body('id')
        .optional()
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid id, please enter the correct id');
          }

          const checkExists = await Product.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid id, please enter the correct id');
          } else {
            return true;
          }
        }),
      body('stock')
        .notEmpty()
        .withMessage('stock value is required')
        .isInt({ min: 1 })
        .withMessage('stock value should be a positive integer'),
      body('offer').optional().isInt({ min: 0 }).withMessage('offer value should be a positive integer'),
    ],
    vendorValiation,
    addProductInSection,
  );

  // vendorAuthRoute.put(
  //   '/update-product-in-my-section',
  //   [
  //     body('id')
  //       .optional()
  //       .custom(async (id) => {
  //         if (!isValidObjectId(id)) {
  //           throw new Error('Invalid id, please enter the correct id');
  //         }

  //         const checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false });

  //         if (!checkExists) {
  //           throw new Error('Invalid id, please enter the correct id');
  //         } else {
  //           return true;
  //         }
  //       }),
  //     body('stock')
  //       .notEmpty()
  //       .withMessage('stock value is required')
  //       .isInt({ min: 1 })
  //       .withMessage('stock value should be a positive integer'),
  //     body('offer').optional().isInt({ min: 1 }).withMessage('offer value should be a positive integer'),
  //     body('subCategory').optional(),
  //   ],
  //   vendorValiation,
  //   updateProductInSection,
  // );

  vendorAuthRoute.post(
    '/remove-product-in-my-section',
    [
      body('id')
        .optional()
        .custom(async (id) => {
          if (!isValidObjectId(id)) {
            throw new Error('Invalid id, please enter the correct id');
          }

          const checkExists = await VendorProduct.findOne({ _id: id, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid id, please enter the correct id');
          } else {
            return true;
          }
        }),
    ],
    vendorValiation,
    removeProductInSection,
  );
});
/************************  VENDOR PRODUCT TEMPLATE ROUTES END ************************/

/************************  VENDOR PRODUCT ROUTES START ************************/
vendorAuthRoute.group('/product-template', (vendorAuthRoute) => {
  vendorAuthRoute.post(
    '/list',
    [
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
    ],
    vendorValiation,
    listProductTemplate,
  );

  // vendorAuthRoute.post(
  //   '/list',
  //   [
  //     body('category')
  //       .optional()
  //       .custom(async (category) => {
  //         if (category === '') {
  //           return true;
  //         }

  //         if (!isValidObjectId(category)) {
  //           throw new Error('Invalid category, please enter the correct category');
  //         }

  //         const checkExists = await Category.findOne({ _id: category, isActive: true, isDeleted: false });

  //         if (!checkExists) {
  //           throw new Error('Invalid category, please enter the correct category');
  //         } else {
  //           return true;
  //         }
  //       }),
  //   ],
  //   vendorValiation,
  //   listProduct,
  // );

  vendorAuthRoute.get('/:id', productTemplateDetails);
});
/************************  VENDOR PRODUCT ROUTES END ************************/
/************************  VENDOR ORDER ROUTES START ************************/
vendorAuthRoute.group('/order', (vendorAuthRoute) => {
  vendorAuthRoute.post('/list', vendorOrderLists);

  vendorAuthRoute.post(
    '/',
    [
      body('id')
        .notEmpty()
        .custom(async (id) => {
          const checkExists = await Order.findOne({ _id: id });
          if (!checkExists) {
            throw new Error('Invalid id, please enter the correct id');
          } else {
            return true;
          }
        }),
    ],
    vendorValiation,
    vendorOrderDetails,
  );
});

/************************  VENDOR ORDER ROUTES END ************************/

//*****************  VENDOR DASHBAORD API ROUTES STARTS *************************************** */

vendorAuthRoute.group('/dashboard', (vendorAuthRoute) => {
  vendorAuthRoute.get('/', dashboardDetailLists);
});

//*****************  VENDOR DASHBAORD API ROUTES ENDS *************************************** */


//*****************************  UPDATE ORDERS STATUS ROUTES STARTS  ********************************************************* */
vendorAuthRoute.group('/order-status', (vendorAuthRoute) => {

  vendorAuthRoute.put(
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

      body('status').notEmpty().withMessage('Status fields is required.').isIn(['pending', 'confirmed', 'cancelled', 'delivered', 'processed', 'dispatched']
      )
        .withMessage("status value can be either 'pending', 'confirmed', 'cancelled', 'delivered', 'processed', or 'dispatched'!"),
    ],
    vendorValiation,
    vendorUpateOrderStatus,
  );

});
//******************************* UPDATE ORDERS STATUS ROUTES ENDS ******************************* */


//*****************************  RESQUEST QUERIES ROUTES STARTS  ********************************************************* */
vendorAuthRoute.group('/request-query', (vendorAuthRoute) => {

  vendorAuthRoute.post(
    '/',
    [
      body('page').optional().isInt({ min: 1 }).withMessage('page value should be an positive number'),
      body('count').optional().isInt({ min: 1 }).withMessage('count value should be an positive number'),
    ],
    vendorValiation,
    requestQueryLists,
  );

});
//******************************* RESQUEST QUERIES ROUTES ENDS ******************************* */