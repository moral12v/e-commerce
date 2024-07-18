import { validationResult } from "express-validator";
import httpStatusCodes from "../../utils/statusCodes.js";

export const vendorValiation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(httpStatusCodes.HTTP_STATUS_BAD_REQUEST).json({
            status: false,
            msg: errors?.array()[0]?.msg
        });
    }else{
        next();
    }    
}