import express from 'express';
import { uploadImage } from '../controllers/common/fileController.js';
import { encryptedUrl } from '../controllers/common/encryptedUrlController.js';
import { filterCategoryList } from '../controllers/common/filterController.js';
import { getSettingDetails } from '../controllers/common/generalSettings.js';
export const commonRoute = express.Router();

/************************ FILE ROUTES START ************************/
commonRoute.get('/general-settings', getSettingDetails);
/************************ FILE ROUTES START ************************/

/************************ FILE ROUTES START ************************/
commonRoute.post('/image-upload', uploadImage);
/************************ FILE ROUTES START ************************/

/************************ VERIFY CUSTOMER EMAIL START ************************/
commonRoute.get('/verify-email/:token', encryptedUrl);
/************************ VERIFY CUSTOMER EMAIL END ************************/

/************************ FILTER START ************************/
commonRoute.group('/filter', (commonRoute) => {
  commonRoute.get('/category', filterCategoryList);
  // commonRoute.get('/category/:id', filterCategoryValue);
});
/************************ FILTER END ************************/
