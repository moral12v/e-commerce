import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
} from '../../helpers/helper.js';
import UploadVideo from '../../models/UploadVideo.js';

export const createVideoSection = async (req, res) => {
  try {
    let user = req.apiUser;

    const dataSave = await UploadVideo.create({
      title: req.body.title,
      hindiTitle: req.body.hindiTitle,
      description: req.body.description,
      hindiDescription: req.body.hindiDescription,
      videoUrl: req.body.videoUrl,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Video section has been added Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Failed to video section creation!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listVideoSection = async (req, res) => {
  try {
    let data = await UploadVideo.find({ isDeleted: false })
      .select('-isDeleted -__v')
      .lean();

    if (data && data.length > 0) {
      return sendResponseWithData(
        res,
        200,
        true,
        "Video section lists fetched successfully!",
        data,
      );
    }
    return sendResponseWithoutData(
      res,
      400,
      false,
      "Video section lists not found!",
    );
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const videoSectionDetails = async (req, res) => {
  try {
    let { id } = req?.params

    if (!id || !isValidObjectId(id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid id!');
    }

    let checkVideoSection = await UploadVideo.findOne({ _id: id, isDeleted: false }).select('-isDeleted -__v')


    if (!checkVideoSection) {
      return sendResponseWithoutData(res, 400, false, 'Invalid video section id!');
    }

    return sendResponseWithData(res, 200, true, 'Video section details fetched successfully!', checkVideoSection);

  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateVideoSection = async (req, res) => {
  try {
    let user = req.apiUser;

    let updatedData = {
      isActive: req.body.isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('title' in req.body && req.body.title) {
      updatedData.title = req.body.title;
    }
    if ('hindiTitle' in req.body && req.body.hindiTitle) {
      updatedData.hindiTitle = req.body.hindiTitle;
    }
    if ('description' in req.body && req.body.description) {
      updatedData.description = req.body.description;
    }
    if ('hindiDescription' in req.body && req.body.hindiDescription) {
      updatedData.hindiDescription = req.body.hindiDescription;
    }

    if ('videoUrl' in req.body && Array.isArray(req.body.videoUrl)) {
      updatedData.videoUrl = req.body.videoUrl.length > 0 ? req.body.videoUrl : null;
    } else {
      updatedData.videoUrl = null;
    }

    let dataSave = await UploadVideo.updateOne(
      { _id: req.body.id },
      {
        $set: updatedData,
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Video section has been updated Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Failed to video section update!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteVideoSection = async (req, res) => {
  try {
    let { id } = req?.params;

    if (!id || !isValidObjectId(id)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid Id!');
    }

    const videoSectionInfo = await UploadVideo.findOne({ _id: id, isDeleted: false });

    if (!videoSectionInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid video section Id!');
    }

    let dataSave = await UploadVideo.updateOne(
      { _id: id },
      {
        $set: {
          isDeleted: true,
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Video section has been deleted Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'failed to vedio section deletion!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
