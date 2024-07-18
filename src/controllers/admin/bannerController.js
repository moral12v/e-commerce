import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import Setting from '../../models/Setting.js';
import { isValidObjectId } from 'mongoose';
import File from '../../models/File.js';

export const addBanner = async (req, res) => {
  try {
    let { title, file, type, typeId } = req.body;

    const newBannerId = `banner${Date.now()}`;
    const bannerObj = {
      id: newBannerId,
      title,
      description: req.body.description || '',
      image: makeObjectId(file),
      type,
      typeId,
      isActive: true,
    };

    let settingData = await Setting.findOneAndUpdate(
      {
        name: 'banner',
        isDeleted: false,
      },
      {
        $push: {
          data: bannerObj,
        },
      },
    );

    if (settingData) {
      return sendResponseWithoutData(res, 200, true, 'Settings added!');
    }
    return sendResponseWithoutData(res, 400, false, 'Settings fail to add!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getBannerList = async (req, res) => {
  try {
    let bannerData = await Setting.findOne({
      name: 'banner',
      isDeleted: false,
    })
      .populate({ path: 'data.image' })
      .select('data -_id')
      .lean();

    if (bannerData) {
      const hostname = req.headers.host;
      const protocol = req.protocol;

      for (let banner of bannerData.data) {
        if (isValidObjectId(banner.image)) {
          banner.image = await File.findOne({ _id: banner.image, isDeleted: false }).select('_id url').lean();

          banner.image = banner.image?.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
        }
      }

      return sendResponseWithData(res, 200, true, 'Banner list fetched successfully!', bannerData);
    }
    return sendResponseWithData(res, 400, false, 'Banner not availbale!', bannerData);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const getBannerDetails = async (req, res) => {
  try {
    let id = req.params.id;

    let bannerDetails = await Setting.findOne({
      name: 'banner',
      isDeleted: false,
      'data.id': id,
    })
      .select('data.$ -_id')
      .lean();

    if (bannerDetails) {
      const hostname = req.headers.host;
      const protocol = req.protocol;
      bannerDetails = bannerDetails.data[0];

      if (isValidObjectId(bannerDetails.image)) {
        bannerDetails.image = await File.findOne({ _id: bannerDetails.image, isDeleted: false })
          .select('_id url')
          .lean();

        bannerDetails.image.url = bannerDetails.image?.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
      }

      return sendResponseWithData(res, 200, true, 'Settings details fetched successfully!', bannerDetails);
    }
    return sendResponseWithData(res, 400, false, 'Invalid settings id!', bannerDetails);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateBanner = async (req, res) => {
  try {
    let { id, title, file, type, typeId, isActive } = req.body;

    let bannerDetails = await Setting.findOne({
      name: 'banner',
      isDeleted: false,
      'data.id': id,
    })
      .select('data.$ -_id')
      .lean();

    if (bannerDetails) {
      await Setting.updateOne(
        {
          name: 'banner',
          isDeleted: false,
          'data.id': id,
        },
        {
          $set: {
            'data.$.title': title,
            'data.$.description': req.body.description || '',
            'data.$.image': makeObjectId(file),
            'data.$.type': type,
            'data.$.typeId': typeId,
            'data.$.active': isActive,
          },
        },
      );

      return sendResponseWithoutData(res, 200, true, 'Banner updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid banner id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteBanner = async (req, res) => {
  try {
    let id = req.params.id;

    let bannerDetails = await Setting.findOne({
      name: 'banner',
      isDeleted: false,
      'data.id': id,
    })
      .select('data.$ -_id')
      .lean();

    if (bannerDetails) {
      await Setting.updateOne(
        {
          name: 'banner',
          isDeleted: false,
        },
        {
          $pull: {
            data: { id: id },
          },
        },
      );

      return sendResponseWithData(res, 200, true, 'Banner deleted successfully!', bannerDetails);
    }

    return sendResponseWithData(res, 400, false, 'Invalid banner id!', bannerDetails);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
