import express from 'express';
import { body } from 'express-validator';
export const assistantRoute = express.Router();
export const assistantAuthRoute = express.Router();
import { assistantLogin } from '../controllers/Assistant/authController.js';
import { assistantValiation } from '../validators/assistantValidation.js';
import expressGroupRoutes from 'express-group-routes';
import {
  approveProduct,
  // createProduct,
  // deleteProduct,
  detailProduct,
  listProduct,
  updateProduct,
  // updateProduct,
} from '../controllers/Assistant/productController.js';
import Category from '../models/Category.js';
import { isValidObjectId } from 'mongoose';
import { assistantPasswordChange, assistantProfile } from '../controllers/Assistant/profileController.js';
import { categoryDetails, listCatgory } from '../controllers/Assistant/categoryController.js';
import VendorProduct from '../models/VendorProduct.js';
import { dashboardAssistantPoductDetails } from '../controllers/Assistant/dashboardController.js';

/******************************************************
                assistant auths start
******************************************************/

assistantRoute.group('/auth', (assistantRoute) => {
  assistantRoute.post(
    '/login',
    [body('email', 'email field is Required').notEmpty(), body('password', 'password field is Required').notEmpty()],
    assistantLogin,
  );
});

/******************************************************
                assistant auths end
******************************************************/

/************************ ASSISTANT PROFILE ROUTES START ************************/
assistantAuthRoute.group('/profile', (assistantAuthRoute) => {
  assistantAuthRoute.get('/', assistantProfile);

  assistantAuthRoute.post(
    '/change-password',
    [
      body('old').notEmpty().withMessage('old field is required'),
      body('new').notEmpty().withMessage('new field is required'),
    ],
    assistantValiation,
    assistantPasswordChange,
  );
});
/************************ ASSISTANT PROFILE ROUTES END ************************/

/************************ PRODUCT CRUD ROUTES START ************************/
assistantAuthRoute.group('/product', (assistantAuthRoute) => {
  // assistantAuthRoute.post(
  //   '/create',
  //   [
  //     body('name').notEmpty().withMessage('name field is required'),
  //     body('category')
  //       .notEmpty()
  //       .withMessage('category field is required')
  //       .custom(async (category) => {
  //         if (!isValidObjectId(category)) {
  //           throw new Error('Invalid category, please enter the correct category');
  //         }

  //         const checkExists = await Category.findOne({ _id: category, isDeleted: false });

  //         if (!checkExists) {
  //           throw new Error('Invalid category, please provide the correct segment!');
  //         } else {
  //           return true;
  //         }
  //       }),
  //     body('price')
  //       .notEmpty()
  //       .withMessage('price field is required')
  //       .custom((price) => {
  //         let priceInt = Number(price);
  //         if (Number.isInteger(priceInt) && priceInt > 0) {
  //           return true;
  //         }
  //         throw new Error('Price must be a number and cannot be in negative.');
  //       }),
  //     body('file').optional(),
  //   ],
  //   assistantValiation,
  //   createProduct,
  // );

  assistantAuthRoute.post(
    '/list',
    [body('category').optional(), body('status').optional()],
    assistantValiation,
    listProduct,
  );

  assistantAuthRoute.put(
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
        .withMessage('vendorPrice must be a number and cannot be in negative.')
        .custom((vendorPrice, { req }) => {
          if (Number(vendorPrice) > Number(req.body.price)) {
            throw new Error('vendorPrice should be lesser than price!');
          }
          return true;
        }),

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
      body('stock')
        .notEmpty()
        .withMessage('stock value is required')
        .isInt({ min: 0 })
        .withMessage('stock value should be a positive integer'),
      body('file')
        .optional()
        .custom(async (file) => {
          if (!isValidObjectId(file)) {
            throw new Error('Invalid file id, please enter the correct file id!');
          }

          const checkExists = await File.findOne({ _id: file, isDeleted: false });

          if (!checkExists) {
            throw new Error('Invalid file id, please enter the correct file id!');
          } else {
            return true;
          }
        }),
    ],
    assistantValiation,
    updateProduct,
  );

  // assistantAuthRoute.delete('/delete/:id', deleteProduct);

  assistantAuthRoute.get('/details/:id', detailProduct);

  assistantAuthRoute.put(
    '/approve',
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
      body('status')
        .notEmpty()
        .withMessage('approval field is required')
        .custom((status) => {
          if (status === 'pending' || status === 'approved' || status === 'rejected') {
            return true;
          }
          throw new Error(
            'Invalid value for status! Value can only be one of them ("approved","pending" or "rejected")',
          );
        }),
      body('reason').optional(),
    ],
    assistantValiation,
    approveProduct,
  );
});
/************************ PRODUCT CRUD ROUTES END ************************/

/************************ ASSISTANT CATEGORY ROUTES START ************************/
assistantAuthRoute.group('/category', (assistantAuthRoute) => {
  // assistantAuthRoute.post(
  //   '/create',
  //   [
  //     body('name').notEmpty().withMessage('name field is required')
  //   ],
  //   assistantValiation,
  //   createCategory,
  // );

  assistantAuthRoute.get('/', listCatgory);

  assistantAuthRoute.get('/:id', categoryDetails);

  // assistantAuthRoute.put(
  //   '/update',
  //   [
  //     body('id')
  //       .notEmpty()
  //       .withMessage('id field is required')
  //       .custom(async (id) => {
  //         const checkExists = await Category.findOne({ _id: id, isDeleted: false });

  //         if (!checkExists) {
  //           throw new Error('Invalid category id!');
  //         } else {
  //           return true;
  //         }
  //       }),
  //     body('name').notEmpty().withMessage('name field is required'),
  //     body('isActive').isBoolean().withMessage('isActive field is required'),
  //   ],
  //   assistantValiation,
  //   updateCategory,
  // );

  // assistantAuthRoute.delete('/delete/:id', deleteCategory);
});
/************************ ASSISTANT CATEGORY ROUTES END ************************/

/************************ ASSISTANT DASHBOARD ROUTES START ************************/
assistantAuthRoute.group('/dashboard', (assistantAuthRoute) => {
  assistantAuthRoute.get('/', dashboardAssistantPoductDetails);
});
/************************ ASSISTANT DASHBOARD ROUTES END *********************/