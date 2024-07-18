import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Page from '../../models/Pages.js';
import File from '../../models/File.js';
import PageCategory from '../../models/PageCategory.js';

export const createPage = async (req, res) => {
  try {
    let user = req.apiUser;

    let { title, slug, categoryId } = req.body;

    if (categoryId && isValidObjectId(categoryId)) {
      let checkExists = await PageCategory.findOne({ _id: categoryId, isDeleted: false });
      if (!checkExists) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category id!');
      }
    }

    let newData = {
      title,
      slug,
      category: categoryId,
      description: req.body.description || '',
      content: req.body.content || '',
      createdBy: user._id,
      updatedBy: user._id,
    };

    if ('icon' in req.body && isValidObjectId(req.body.icon)) {
      let checkExists = await File.findOne({ _id: req.body.icon, isDeleted: false });
      if (checkExists) {
        newData.icon = req.body.icon;
      }
    }

    if ('darkModeIcon' in req.body && isValidObjectId(req.body.darkModeIcon)) {
      let checkExists = await File.findOne({ _id: req.body.darkModeIcon, isDeleted: false });
      if (checkExists) {
        newData.darkModeIcon = req.body.darkModeIcon;
      }
    }

    let dataSave = await Page.create(newData);

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Page created successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Fail to create page, try again in sometime!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listPage = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;
    let filter = { isDeleted: false };

    if ('isActive' in req.body) {
      filter.isActive = req.body.isActive;
    }

    let data = await Page.find(filter)
      .populate([
        { path: 'icon', select: 'url' },
        { path: 'darkModeIcon', select: 'url' },
      ])
      .select('-content -isDeleted -__v')
      .lean();

    if (data.length > 0) {
      for (let page of data) {
        if (page && 'icon' in page && page.icon && page.icon.url.length > 0) {
          page.icon = page.icon.url.map((item) => `${protocol}://${hostname}/${item}`);
        }
        if (page && 'darkModeIcon' in page && page.darkModeIcon && page.darkModeIcon.url.length > 0) {
          page.darkModeIcon = page.darkModeIcon.url.map((item) => `${protocol}://${hostname}/${item}`);
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

export const pageDetails = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      const hostname = req.headers.host;
      const protocol = req.protocol;
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await Page.findOne(filter)
        .populate([
          { path: 'icon', select: 'url' },
          { path: 'darkModeIcon', select: 'url' },
        ])
        .select('-isDeleted -__v')
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

    return sendResponseWithoutData(res, 400, false, 'Invalid page id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updatePage = async (req, res) => {
  try {
    let user = req.apiUser;

    let { id, title, slug } = req.body;

    let updatedData = {
      title,
      slug,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('categoryId' in req.body) {
      updatedData.category = req.body.categoryId;
    }
    if ('description' in req.body) {
      updatedData.description = req.body.description;
    }
    if ('content' in req.body) {
      updatedData.content = req.body.content;
    }

    if ('icon' in req.body && isValidObjectId(req.body.icon)) {
      let checkExists = await File.findOne({ _id: req.body.icon, isDeleted: false });
      if (checkExists) {
        updatedData.icon = req.body.icon;
      }
    }

    if ('darkModeIcon' in req.body && isValidObjectId(req.body.darkModeIcon)) {
      let checkExists = await File.findOne({ _id: req.body.darkModeIcon, isDeleted: false });
      if (checkExists) {
        updatedData.darkModeIcon = req.body.darkModeIcon;
      }
    }

    let dataSave = await Page.updateOne({ _id: id }, { $set: updatedData });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Page has been updated successfully!');
    }

    return sendResponseWithoutData(res, 400, false, 'Page fail to update, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deletePage = async (req, res) => {
  try {
    if ('id' in req.params && isValidObjectId(req.params.id)) {
      let filter = { _id: req.params.id, isDeleted: false };

      let data = await Page.findOne(filter).select('-isDeleted -__v').lean();

      if (!data) {
        return sendResponseWithoutData(res, 400, false, 'Invalid page id!');
      }

      let saveData = await Page.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } });
      if (saveData.modifiedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Page deleted successfully');
      }
    }

    return sendResponseWithoutData(res, 400, false, 'Invalid page id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
