import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  addFilter,
  removeFilter,
  updateFilter,
} from '../../helpers/helper.js';
import Segment from '../../models/Segment.js';

export const createSegment = async (req, res) => {
  try {
    let user = req.apiUser;

    let checkData = await Segment.findOne({ slug: req.body.name.split(' ').join('_').toLowerCase() });

    if (checkData) {
      return sendResponseWithoutData(res, 200, true, 'Slug already exists please use another name!.');
    }

    const dataSave = await Segment.create({
      name: req.body.name,
      slug: req.body.name.split(' ').join('_').toLowerCase(),
      image: req.body.file,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      await addFilter('Segment', req.body.name, dataSave.id);

      return sendResponseWithoutData(res, 200, true, 'Segment has been added Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listSegment = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await Segment.find({ isDeleted: false })
      .populate({ path: 'image', select: '_id url' })
      .select('-isDeleted -__v')
      .lean();

    for (let segment of data) {
      if (segment.image && 'url' in segment.image && segment.image.url.length > 0) {
        let segmentUrl = segment.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
        segment.image = segmentUrl;
      } else {
        segment.image = null;
      }
    }

    return sendResponseWithData(
      res,
      200,
      true,
      data.length > 0 ? 'Segment list get Successfully' : 'No segment found',
      data,
      true,
    );
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const segmentDetails = async (req, res) => {
  try {
    let segmentId = req?.params?.id;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    if (!segmentId || !isValidObjectId(segmentId)) {
      return sendResponseWithoutData(res, 400, false, 'Invalid id!');
    }

    if (segmentId) {
      let segmentInfo = await Segment.findOne({ _id: segmentId, isDeleted: false })
        .populate({ path: 'image', select: '_id url' })
        .select('-isDeleted -__v')
        .lean();

      if (segmentInfo && segmentInfo.image && 'url' in segmentInfo.image && segmentInfo.image.url.length > 0) {
        segmentInfo.image.url = segmentInfo.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
      }

      if (!segmentInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid segment id!');
      }

      return sendResponseWithData(res, 200, true, 'Segment details fetched successfully!', segmentInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid segment id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateSegment = async (req, res) => {
  try {
    let user = req.apiUser;

    let updatedData = {
      name: req.body.name,
      isActive: req.body.isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('image' in req.body && req.body.image) {
      updatedData.image = req.body.file;
    }

    let dataSave = await Segment.updateOne(
      { _id: req.body.id },
      {
        $set: updatedData,
      },
    );

    if (dataSave.modifiedCount > 0) {
      updateFilter('Segment', req.body.id, req.body.name);

      return sendResponseWithoutData(res, 200, true, 'Segment has been updated Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteSegment = async (req, res) => {
  try {
    let segmentId = req?.params?.id;

    const segmentInfo = await Segment.findOne({ _id: segmentId, isDeleted: false });

    if (!segmentInfo) {
      return sendResponseWithoutData(res, 400, false, 'Invalid segment Id!');
    }

    let dataSave = await Segment.updateOne(
      { _id: segmentId },
      {
        $set: {
          isDeleted: true,
        },
      },
    );

    if (dataSave.modifiedCount > 0) {
      await removeFilter('Segment', req.params.id);
      return sendResponseWithoutData(res, 200, true, 'Segment has been deleted Successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
