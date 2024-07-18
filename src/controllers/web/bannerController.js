import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse } from '../../helpers/helper.js';
import File from '../../models/File.js';
import Setting from '../../models/Setting.js';


export const getBanner = async (req, res) => {
  try {
    let data = await Setting.findOne({ isActive: true, isDeleted: false, name: 'banner' }).select('data -_id').lean();
    data.data = data.data.filter((e) => 'isActive' in e && e.isActive && isValidObjectId(e.image));

    const hostname = req.headers.host;
    const protocol = req.protocol;

    data.data = await Promise.all(
      data.data.map(async (item) => {
        let imgUrl = await File.findOne({ _id: item.image, isDeleted: false }).select('url').lean();
        imgUrl.url = imgUrl.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
        item.image = imgUrl;
        return item;
      }),
    );

    if (data) {
      return res.status(200).json({
        status: true,
        msg: 'Banner fetched successfully',
        data: data.data || [],
        count: data.data.length || 0,
      });
    }

    return sendResponseWithData(res, 400, false, 'Banner not found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
