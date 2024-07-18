import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Page from '../../models/Pages.js';

export const staticListPage = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let filter = { isDeleted: false, isActive: true };

    let pipeline = [
      { $match: { ...filter } },

      {
        $lookup: {
          from: 'pagecategories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'icon',
          foreignField: '_id',
          as: 'icon',
        },
      },
      {
        $lookup: {
          from: 'files',
          localField: 'darkModeIcon',
          foreignField: '_id',
          as: 'darkModeIcon',
        },
      },

      {
        $addFields: {
          category: {
            $cond: {
              if: { $gt: [{ $size: '$category' }, 0] },
              then: { $arrayElemAt: ['$category', 0] },
              else: null,
            },
          },
          icon: {
            $cond: {
              if: { $gt: [{ $size: '$icon' }, 0] },
              then: { $arrayElemAt: ['$icon', 0] },
              else: null,
            },
          },
          darkModeIcon: {
            $cond: {
              if: { $gt: [{ $size: '$darkModeIcon' }, 0] },
              then: { $arrayElemAt: ['$darkModeIcon', 0] },
              else: null,
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          title: 1,
          slug: 1,
          description: 1,
          content: 1,
          'icon.url': 1,
          'darkModeIcon.url': 1,
          'category._id': 1,
          'category.name': 1,
        },
      },

      {
        $addFields: {
          pages: [
            {
              title: '$title',
              slug: '$slug',
              description: '$description',
              content: '$content',
              icon: '$icon',
              darkModeIcon: '$darkModeIcon',
            },
          ],
        },
      },

      {
        $project: {
          title: 0,
          slug: 0,
          description: 0,
          content: 0,
          icon: 0,
          darkModeIcon: 0,
        },
      },
    ];


    let data = await Page.aggregate(pipeline);

    if (data.length > 0) {
      for (let page of data) {
        for (let doc of page?.pages) {
          if (doc && 'icon' in doc && doc.icon && doc.icon.url.length > 0) {
            doc.icon = doc.icon.url.map((item) => `${protocol}://${hostname}/${item}`);
          }
          if (doc && 'darkModeIcon' in doc && doc.darkModeIcon && doc.darkModeIcon.url.length > 0) {
            doc.darkModeIcon = doc.darkModeIcon.url.map((item) => `${protocol}://${hostname}/${item}`);
          }
        }
      }
      return sendResponseWithData(res, 200, true, 'Page list get fetched successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No pages found!', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const staticPageDetails = async (req, res) => {
  try {
    if ('slug' in req.params && req.params.slug) {
      const hostname = req.headers.host;
      const protocol = req.protocol;
      let filter = { slug: req.params.slug, isDeleted: false, isActive: true };

      let data = await Page.findOne(filter)
        .populate([
          { path: 'icon', select: 'url' },
          { path: 'darkModeIcon', select: 'url' },
        ])
        .select('-isActive -isDeleted -__v -createdBy -updatedBy -createdAt -updatedAt')
        .lean();

      if (data) {
        if ('icon' in data && data.icon && data.icon.url.length > 0) {
          data.icon = data.icon.url.map((item) => `${protocol}://${hostname}/${item}`);
        }
        if ('darkModeIcon' in data && data.darkModeIcon && data.darkModeIcon.url.length > 0) {
          data.darkModeIcon = data.darkModeIcon.url.map((item) => `${protocol}://${hostname}/${item}`);
        }
        return sendResponseWithData(res, 200, true, 'Page details fetched successfully', data);
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid page slug!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
