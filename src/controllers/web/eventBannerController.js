import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendErrorResponse } from '../../helpers/helper.js';
import EventBanner from '../../models/EventBanner.js';

export const listEventBanner = async (req, res) => {
  try {
    //   let data = await EventBanner.find({ isDeleted: false })
    //     .populate([{ path: 'buttons', select: '-createdAt -updatedAt -__v' }])
    //     .select('-__v -isDeleted')
    //     .lean();

    const hostname = req.headers.host;
    const protocol = req.protocol;



    let data = await EventBanner.aggregate([
      { $match: { isActive: true, isDeleted: false } },
      {
        $lookup: {
          from: 'files',
          localField: 'image',
          foreignField: '_id',
          as: 'image',
        },
      },
      {
        $addFields: {
          image: {
            $cond: {
              if: { $gt: [{ $size: '$image' }, 0] },
              then: {
                $concat: [protocol, '://', hostname, '/', { $arrayElemAt: [{ $arrayElemAt: ['$image.url', 0] }, 0] }],
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'darkModeImage',
          foreignField: '_id',
          as: 'darkModeImage',
        },
      },
      {
        $addFields: {
          darkModeImage: {
            $cond: {
              if: { $gt: [{ $size: '$darkModeImage' }, 0] },
              then: {
                $concat: [
                  protocol,
                  '://',
                  hostname,
                  '/',
                  { $arrayElemAt: [{ $arrayElemAt: ['$darkModeImage.url', 0] }, 0] },
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'eventbannerbuttons',
          localField: 'buttons',
          foreignField: '_id',
          as: 'buttons',
        },
      },
      {
        $unwind: { path: '$buttons', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'buttons.logo',
          foreignField: '_id',
          as: 'buttons.logo',
        },
      },
      {
        $addFields: {
          'buttons.logo': {
            $cond: {
              if: { $gt: [{ $size: '$buttons.logo' }, 0] },
              then: {
                $concat: [
                  protocol,
                  '://',
                  hostname,
                  '/',
                  { $arrayElemAt: [{ $arrayElemAt: ['$buttons.logo.url', 0] }, 0] },
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'buttons.darkLogo',
          foreignField: '_id',
          as: 'buttons.darkLogo',
        },
      },
      {
        $addFields: {
          'buttons.darkLogo': {
            $cond: {
              if: { $gt: [{ $size: '$buttons.darkLogo' }, 0] },
              then: {
                $concat: [
                  protocol,
                  '://',
                  hostname,
                  '/',
                  { $arrayElemAt: [{ $arrayElemAt: ['$buttons.darkLogo.url', 0] }, 0] },
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          image: { $first: '$image' },
          darkModeImage: { $first: '$darkModeImage' },
          bg_color: { $first: '$bg_color' },
          dark_bg_color: { $first: '$dark_bg_color' },
          isGradient: { $first: '$isGradient' },
          dark_font_color: { $first: '$dark_font_color' },
          font_color: { $first: '$font_color' },
          buttons: { $push: '$buttons' },
        },
      },
      {
        $unset: ['buttons.createdAt', 'buttons.updatedAt', 'buttons.__v'],
      },
      {
        $project: {
          title: 1,
          image: 1,
          darkModeImage: 1,
          bg_color: 1,
          dark_bg_color: 1,
          isGradient: 1,
          font_color: 1,
          dark_font_color: 1,
          buttons: 1,
        },
      },
    ]);

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Event banner list fetched successfully!', data, true);
    }

    return sendResponseWithData(res, 200, true, "There's no event banner!", data, true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
