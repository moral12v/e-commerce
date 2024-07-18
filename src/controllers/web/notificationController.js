import { isValidObjectId } from "mongoose";
import { errorLog } from "../../../config/logger.js";
import { sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from "../../helpers/helper.js";
import Notification from "../../models/Notification.js";

export const appNotification = async (req, res) => {
    try {
        let user = req.apiUser
        const hostname = req.headers.host;
        const protocol = req.protocol;
        // let customer = await authValues(req.headers['authorization']);

        // let notifications = await Notification.find({ customerId: customer?._id }).sort({ createdAt: -1 });
        let notifications = await Notification.find({ userId: user?._id }).sort({ createdAt: -1 }).select('-userId -__v');

        let notificationWithImage = [];
        for (let i = 0; i < notifications.length; i++) {
            notificationWithImage.push({ ...notifications[i]._doc, })
            // notificationWithImage.push({ ...notifications[i]._doc, image: (notifications[i].image) ? await getImageSingedUrlById(notifications[i].image) : '' })
        }
        if (notificationWithImage.length > 0) {
            return sendResponseWithData(res, 200, true, "Notification List get Successfully!!", notificationWithImage);
        } else {
            return sendResponseWithoutData(res, 400, false, "No Record Found!!");
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
}

export const readUnreadNotification = async (req, res) => {
    try {
        // let customer = await authValues(req.headers['authorization']);
        let user = req.apiUser;
        let notification = await Notification.findOne({ _id: req?.body?.notificationId, userId: user?._id });
        if (notification) {
            let type = (req?.body?.type == "read") ? true : false;
            await Notification.findByIdAndUpdate(notification?._id, { $set: { isRead: type } });
            return sendResponseWithData(res, 201, true, `Notification has been ${req?.body?.type} Successfully!!`);
        } else {
            return sendResponseWithoutData(res, 400, false, "Notification Id is invalid!!");
        }
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
}

export const deleteManyNotification = async (req, res) => {
    try {
        let { notificationId } = req.body;

        await Notification.deleteMany({ _id: { $in: notificationId } });
        return sendResponseWithoutData(res, 200, true, "Notification has been deleted Successfully!!");
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
}
export const deleteNotification = async (req, res) => {
    try {
        // let customer = await authValues(req.headers['authorization']);
        let user = req.apiUser;
        await Notification.deleteMany({ userId: user?._id });
        return sendResponseWithoutData(res, 200, true, "Notification has been deleted Successfully!!");
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
}