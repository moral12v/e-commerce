import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { makeObjectId, sendErrorResponse, sendResponseWithData, sendResponseWithoutData } from '../../helpers/helper.js';
import VendorProduct from '../../models/VendorProduct.js';
import RequestCallBackForVendor from '../../models/RequestCallBackForVendor.js';



export const createRequestQuery = async (req, res) => {
    try {

        let { productId, name, mobile, query } = req.body;

        if (!productId || !isValidObjectId(productId)) {
            return sendResponseWithoutData(res, 400, false, 'Invalid id!');
        }
        let findProduct = await VendorProduct.findOne({ _id: productId, isDeleted: false });

        if (!findProduct) {
            return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
        }

        let newData = {
            productId: productId,
            vendorId: findProduct.vendor
        };

        if ('name' in req.body) {
            newData.name = name
        }
        if ('mobile' in req.body) {
            newData.mobile = mobile
        }
        if ('query' in req.body) {
            newData.query = query
        }

        let newRequestCallback = await RequestCallBackForVendor.create(newData);

        if (newRequestCallback) {
            return sendResponseWithoutData(res, 200, true, 'Request query created successfully!');
        }

        return sendResponseWithoutData(res, 400, false, 'Fail to creation Request query!');
    } catch (error) {
        errorLog(error);
        sendErrorResponse(res);
    }
};


