import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse } from '../../helpers/helper.js';
import Category from '../../models/Category.js';

export const listCategory = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await Category.find({ isDeleted: false })
      .populate({ path: 'image', select: '_id url' })
      .select('_id name image slug')
      .lean();



    for (let category of data) {
      if (category.image && 'url' in category.image && category.image.url.length > 0) {
        let categoryUrl = category.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
        category.image = categoryUrl;
      } else {
        category.image = null;
      }
    }

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Category list get successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No category found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
}