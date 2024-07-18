import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import EventBanner from '../../models/EventBanner.js';
import EventBannerButton from '../../models/EventBannerButton.js';

// ************************ EVENT BANNER BUTTON ************************

export const addBannerButton = async (req, res) => {
  try {
    let user = req.apiUser;

    let { title, fontColor, isGradient, bgColor, type, typeId } = req.body;

    let newData = {
      title,
      bg_color: bgColor,
      isGradient,
      type,
      typeId,
      font_color: fontColor,
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('logo' in req.body && req.body.logo) {
      newData.logo = req.body.logo;
      newData.darkLogo = req.body.logo;
    }

    if ('darkLogo' in req.body && req.body.darkLogo) {
      newData.darkLogo = req.body.darkLogo;
    }

    if ('darkBgColor' in req.body && req.body.darkBgColor) {
      newData.dark_bg_color = req.body.darkBgColor;
    } else {
      newData.dark_bg_color = bgColor;
    }

    if ('darkFontColor' in req.body && req.body.darkFontColor) {
      newData.dark_font_color = req.body.darkFontColor;
    } else {
      newData.dark_font_color = fontColor;
    }

    let dataSave = await EventBannerButton.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Event banner button added successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event banner button fail to add, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listBannerButton = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let data = await EventBannerButton.aggregate([
      {
        $lookup: {
          from: 'files',
          localField: 'logo',
          foreignField: '_id',
          as: 'logo',
        },
      },
      {
        $addFields: {
          logo: {
            $cond: {
              if: { $gt: [{ $size: '$logo' }, 0] },
              then: {
                $concat: [protocol, '://', hostname, '/', { $arrayElemAt: [{ $arrayElemAt: ['$logo.url', 0] }, 0] }],
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'darkLogo',
          foreignField: '_id',
          as: 'darkLogo',
        },
      },
      {
        $addFields: {
          darkLogo: {
            $cond: {
              if: { $gt: [{ $size: '$darkLogo' }, 0] },
              then: {
                $concat: [
                  protocol,
                  '://',
                  hostname,
                  '/',
                  { $arrayElemAt: [{ $arrayElemAt: ['$darkLogo.url', 0] }, 0] },
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          bg_color: 1,
          dark_bg_color: 1,
          isGradient: 1,
          logo: 1,
          logoArr: 1,
          darkLogo: 1,
          type: 1,
          font_color: 1,
          dark_font_color: 1,
          typeId: 1,
        },
      },
    ]);

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Event banner button list fetched successfully!', data, true);
    }

    return sendResponseWithData(res, 200, true, "There's no event banner button!", data, true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const detailsBannerButton = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let data = await EventBannerButton.findOne({ _id: req.params.id })
        .populate([
          { path: 'logo', select: 'url' },
          { path: 'darkLogo', select: 'url' },
        ])
        .select('-__v -isDeleted')
        .lean();

      if (data) {
        const hostname = req.headers.host;
        const protocol = req.protocol;

        if (data.logo && data.logo.url.length > 0) {
          data.logo.url = data.logo.url.map((item) => `${protocol}://${hostname}/${item}`);
        }
        if (data.darkLogo && data.darkLogo.url.length > 0) {
          data.darkLogo.url = data.darkLogo.url.map((item) => `${protocol}://${hostname}/${item}`);
        }

        return sendResponseWithData(res, 200, true, 'Event banner button details fetched successfully!', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid event banner button id!');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid event banner button id!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const updateBannerButton = async (req, res) => {
  try {
    let { id, title, fontColor, type, typeId, isGradient, bgColor } = req.body;

    let udpatedData = {
      title,
      bg_color: bgColor,
      isGradient,
      type,
      typeId,
      font_color: fontColor,
      updatedAt: Date.now(),
    };

    if ('logo' in req.body && req.body.logo) {
      udpatedData.logo = req.body.logo;
    }

    if ('darkLogo' in req.body && req.body.darkLogo) {
      udpatedData.darkLogo = req.body.darkLogo;
    }

    if ('darkBgColor' in req.body && req.body.darkBgColor) {
      udpatedData.dark_bg_color = req.body.darkBgColor;
    }

    if ('darkFontColor' in req.body && req.body.darkFontColor) {
      udpatedData.dark_font_color = req.body.darkFontColor;
    }

    let dataSave = await EventBannerButton.updateOne({ _id: id }, { $set: udpatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Event banner button updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event banner button fail to update, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const deleteBannerButton = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let data = await EventBannerButton.findOne({ _id: req.params.id });

      if (!data) {
        return sendResponseWithoutData(res, 400, false, 'Invalid event banner button id!');
      }

      let saveData = await EventBannerButton.deleteOne({ _id: req.params.id });

      if (saveData.deletedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Event banner button deleted successfully!');
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid event banner button id!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// ************************ EVENT BANNER START ************************

export const addEventBanner = async (req, res) => {
  try {
    let user = req.apiUser;

    let { title, fontColor, isGradient, bgColor } = req.body;

    let newData = {
      title,
      bg_color: bgColor,
      isGradient,
      font_color: fontColor,
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('image' in req.body && req.body.image) {
      newData.image = req.body.image;
      newData.darkModeImage = req.body.image;
    }

    if ('darkModeImage' in req.body && req.body.darkModeImage) {
      newData.darkModeImage = req.body.darkModeImage;
    }

    if ('darkBgColor' in req.body && req.body.darkBgColor) {
      newData.dark_bg_color = req.body.darkBgColor;
    } else {
      newData.dark_bg_color = bgColor;
    }

    if ('darkFontColor' in req.body && req.body.darkFontColor) {
      newData.dark_font_color = req.body.darkFontColor;
    } else {
      newData.dark_font_color = fontColor;
    }

    let dataSave = await EventBanner.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Event banner added successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event banner fail to add, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listEventBanner = async (req, res) => {
  try {
    let data = await EventBanner.find({ isDeleted: false })
      .populate([{ path: 'buttons', select: '-createdAt -updatedAt -__v' }])
      .select('-__v -isDeleted')
      .lean();

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Event banner list fetched successfully!', data, true);
    }

    return sendResponseWithData(res, 200, true, "There's no event banner!", data, true);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const detailsEventBanner = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let data = await EventBanner.findOne({ _id: req.params.id, isDeleted: false })
        .populate([
          {
            path: 'buttons',
            select: '-createdAt -updatedAt -__v',
            populate: [
              { path: 'logo', select: 'url' },
              { path: 'darkLogo', select: 'url' },
            ],
          },
        ])
        .select('-__v -isDeleted')
        .lean();

      if (data) {
        const hostname = req.headers.host;
        const protocol = req.protocol;
        for (let btn of data.buttons) {
          if (btn.logo && btn.logo.url.length > 0) {
            btn.logo.url = btn.logo.url.map((item) => `${protocol}://${hostname}/${item}`);
          }
          if (btn.darkLogo && btn.darkLogo.url.length > 0) {
            btn.darkLogo.url = btn.darkLogo.url.map((item) => `${protocol}://${hostname}/${item}`);
          }
        }

        return sendResponseWithData(res, 200, true, 'Event banner details fetched successfully!', data);
      }

      return sendResponseWithoutData(res, 400, false, 'Invalid event banner id!');
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid event banner id!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const updateEventBanner = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, title, fontColor, isGradient, isActive, bgColor } = req.body;

    let udpatedData = {
      title,
      isGradient,
      isActive,
      bg_color: bgColor,
      font_color: fontColor,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('darkModeImage' in req.body && req.body.darkModeImage) {
      udpatedData.darkModeImage = req.body.darkModeImage;
    }

    if ('image' in req.body && req.body.image) {
      udpatedData.image = req.body.image;
    }

    if ('darkBgColor' in req.body && req.body.darkBgColor) {
      udpatedData.dark_bg_color = req.body.darkBgColor;
    }

    if ('darkFontColor' in req.body && req.body.darkFontColor) {
      udpatedData.dark_font_color = req.body.darkFontColor;
    }

    let dataSave = await EventBanner.updateOne({ _id: id }, { $set: udpatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Event banner updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event banner fail to update, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const deleteEventBanner = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let data = await EventBanner.findOne({ _id: req.params.id, isDeleted: false }).select('-isDeleted -__v').lean();

      if (!data) {
        return sendResponseWithoutData(res, 400, false, 'Invalid event banner id!');
      }

      let saveData = await EventBanner.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } });
      if (saveData.modifiedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Event banner details fetched successfully!');
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid event banner id!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const editEventBannerButtons = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, button } = req.body;

    let btns = [];
    for (let btn of button) {
      if (isValidObjectId(btn) && (await EventBannerButton.findOne({ _id: btn }))) {
        btns.push(btn);
      }
    }

    let dataSave = await EventBanner.updateOne(
      { _id: id },
      { $set: { buttons: btns, updatedBy: user._id, updatedBy: Date.now() } },
    );

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Event banner button updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Event banner button fail to update, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
