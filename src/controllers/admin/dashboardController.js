import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import VendorProduct from '../../models/VendorProduct.js';


export const dashboardDetails = async (req, res) => {
  try {
    let filter = { isDeleted: false, type: 'customer' };

    let getUsers = await User.find(filter);

    let getOrders = await Order.find({ status: 'confirmed' });

    let totalAmount = getOrders.reduce((acc, order) => acc + order.amountToPay, 0);

    let data = {
      totalUsers: getUsers.length,
      totalOrders: getOrders.length,
      totalAmount,
    };

    if (data) {
      return sendResponseWithData(res, 200, true, 'List fetched Successfully!', data);
    } else {
      return sendResponseWithoutData(res, 400, false, 'No data available!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
export const getRecentAddProductLists = async (req, res) => {
  try {
    let filter = { isDeleted: false, isActive: true };

    let data = await Product.find(filter)
      .sort({ createdAt: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    if (data) {
      return sendResponseWithData(res, 200, true, 'List fetched Successfully!', data);
    } else {
      return sendResponseWithoutData(res, 200, false, 'No data available!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const getTopSellingProductLists = async (req, res) => {
  try {
    let filter = { isDeleted: false, isActive: true };

    let data = await VendorProduct.find(filter)
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let updatedData = data.map((product) => {
      let totalRevenue = product.vendorPrice * product.sales;
      return {
        ...product._doc,
        totalRevenue,
      };
    });

    if (updatedData.length > 0) {
      return sendResponseWithData(res, 200, true, 'List fetched Successfully!', updatedData);
    } else {
      return sendResponseWithoutData(res, 200, false, 'No data available!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// export const getTopSellerLists = async (req, res) => {
//   try {
//     let filter = { isDeleted: false, isActive: true };

//     let products = await VendorProduct.find(filter)
//       .sort({ sales: -1 })
//       .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
//       .populate({ path: 'vendor', select: 'name' });

//     let vendorSales = {};

//     products.forEach((product) => {
//       let { vendor, sales, vendorPrice, name } = product;

//       if (sales > 0) {
//         if (!vendorSales[vendor.name]) {
//           vendorSales[vendor.name] = {
//             totalSales: 0,
//             totalRevenue: 0,
//             products: [],
//           };
//         }

//         let productRevenue = sales * vendorPrice;
//         vendorSales[vendor.name].totalSales += sales;
//         vendorSales[vendor.name].totalRevenue += productRevenue;
//         vendorSales[vendor.name].products.push({
//           name,
//           vendorPrice,
//           sales,
//           productRevenue,
//         });
//       }
//     });

//     let vendorSalesArray = Object.keys(vendorSales).map((vendorName) => ({
//       vendorName,
//       totalSales: vendorSales[vendorName].totalSales,
//       totalRevenue: vendorSales[vendorName].totalRevenue,
//       products: vendorSales[vendorName].products,
//     }));

//     vendorSalesArray.sort((a, b) => b.totalSales - a.totalSales);

//     let topSellingVendor = vendorSalesArray[0];

//     // const totalSalesAllProducts = vendorSalesArray.reduce((acc, vendor) => acc + vendor.totalSales, 0);

//     if (topSellingVendor) {
//       return sendResponseWithData(res, 200, true, 'Top Selling Vendor!', topSellingVendor);
//     } else {
//       return sendResponseWithoutData(res, 200, false, 'No data available!');
//     }
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };

export const dashboardDetailsApis = async (req, res) => {
  try {
    let filter = { isDeleted: false, type: 'customer' };

    let getUsers = await User.find(filter);
    let getOrders = await Order.find();
    let totalAmount = getOrders.reduce((acc, order) => acc + order.totalAmountToPay, 0);
    totalAmount.toFixed(2);

    let data2 = await Product.find({ isDeleted: false, isActive: true })
      .sort({ createdAt: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let data3 = await VendorProduct.find({ isDeleted: false })
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let updatedData = data3.map((product) => {
      let totalRevenue = product.vendorPrice * product.sales;
      return {
        ...product._doc,
        totalRevenue,
      };
    });
    let filterData = { isDeleted: false, isActive: true }

    let products = await VendorProduct.aggregate([
      {
        $match: {
          ...filterData
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'vendor',
          foreignField: '_id',
          as: 'vendorDetails',
        },
      },
      {
        $match: {
          "vendorDetails.isDeleted": false
        }
      },

      {
        $group: {
          _id: '$_id',
          name: { $first: '$vendorDetails.name' },
          sales: { $first: '$sales' },
          vendorPrice: { $first: '$vendorPrice' },
          totalSales: { $sum: '$sales' },
          totalRevenue: { $first: { '$multiply': ['$sales', '$vendorPrice'] } }
          // createdAt: { $first: '$createdAt' },
          // updatedAt: { $first: '$updatedAt' },
        },
      },

      {
        $project: {
          vendorName: { $arrayElemAt: ['$name', 0] },
          sales: 1,
          vendorPrice: 1,
          totalSales: 1,
          totalRevenue: 1,


        },
      },

    ]).sort({ sales: -1 });

    let vendorSales = {};

    for (let product of products) {
      let { sales, totalRevenue, totalSales, vendorName } = product;

      if (sales > 0 && vendorName) {
        if (!vendorSales[vendorName]) {
          vendorSales[vendorName] = { totalSales: 0, totalRevenue: 0 };
        }

        vendorSales[vendorName].totalSales += totalSales;
        vendorSales[vendorName].totalRevenue += totalRevenue;
      }
    }

    let vendorSalesArray = Object.keys(vendorSales).map((vendorName) => ({
      vendorName,
      totalSales: vendorSales[vendorName].totalSales,
      totalRevenue: vendorSales[vendorName].totalRevenue,

    }));

    vendorSalesArray.sort((a, b) => b.totalSales - a.totalSales);

    let topSellingVendor = vendorSalesArray
    let dataObj = {
      totalUsers: getUsers.length,
      totalOrders: getOrders.length,
      totalAmount,
      TopSellerVendorLists: data2,
      TopSellingProductLists: updatedData,
      topSellingVendor,
    };
    if (Object.keys(dataObj).length > 0) {
      return sendResponseWithData(res, 200, true, 'All Details fetched successfully!', dataObj);
    }

    return sendResponseWithoutData(res, 400, false, 'Failed to fetched details!');
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};


export const dashboardDetailsApis1 = async (req, res) => {
  try {
    let filter = { isDeleted: false, type: 'customer' };

    let getUsers = await User.find(filter);
    let getOrders = await Order.find();
    let totalAmount = getOrders.reduce((acc, order) => acc + order.totalAmountToPay, 0);

    let data2 = await Product.find({ isDeleted: false, isActive: true })
      .sort({ createdAt: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let data3 = await VendorProduct.find({ isDeleted: false })
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let updatedData = data3.map((product) => {
      let totalRevenue = product.vendorPrice * product.sales;
      return {
        ...product._doc,
        totalRevenue,
      };
    });

    let products = await VendorProduct.find({ isDeleted: false, isActive: true })
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
      .populate({ path: 'vendor', select: 'name' });

    // let vendorSales = {};

    // for(let product of products){
    //   let { vendor, sales, vendorPrice } = product;
    //   if (sales > 0) {
    //     if (vendor && vendor.name) {    
    //       if (!vendorSales[vendor.name]) {
    //         vendorSales[vendor.name] = {
    //           totalSales: 0,
    //           totalRevenue: 0,
    //         };
    //       }

    //       let productRevenue = sales * vendorPrice;
    //       vendorSales[vendor.name].totalSales += sales;
    //       vendorSales[vendor.name].totalRevenue += productRevenue;
    //     } 
    //   }

    // }

    // for(let product of products){
    //   let { vendor, sales, vendorPrice } = product;
    //   if (sales > 0 && vendor && vendor.name) {   
    //       if (!vendorSales[vendor.name]) {
    //         vendorSales[vendor.name] = {
    //           totalSales: 0,
    //           totalRevenue: 0,
    //         };
    //       }

    //       let productRevenue = sales * vendorPrice;
    //       vendorSales[vendor.name].totalSales += sales;
    //       vendorSales[vendor.name].totalRevenue += productRevenue;

    //   }

    // }


    const vendorSales = products.reduce((acc, product) => {
      const { vendor, sales, vendorPrice } = product;
      if (sales > 0 && vendor && vendor.name) {
        acc[vendor.name] = acc[vendor.name] || { totalSales: 0, totalRevenue: 0 };
        acc[vendor.name].totalSales += sales;
        acc[vendor.name].totalRevenue += sales * vendorPrice;
      }
      return acc;
    }, {});


    let vendorSalesArray = Object.keys(vendorSales).map((vendorName) => ({
      vendorName,
      totalSales: vendorSales[vendorName].totalSales,
      totalRevenue: vendorSales[vendorName].totalRevenue,

    }));

    vendorSalesArray.sort((a, b) => b.totalSales - a.totalSales);

    let topSellingVendor = vendorSalesArray;
    let dataObj = {
      totalUsers: getUsers.length,
      totalOrders: getOrders.length,
      totalAmount,
      TopSellerVendorLists: data2,
      TopSellingProductLists: updatedData,
      topSellingVendor,

    };

    if (Object.keys(dataObj).length > 0) {
      return sendResponseWithData(res, 200, true, 'All Details fetched successfully!', dataObj);
    }

    return sendResponseWithoutData(res, 400, false, 'Failed to fetch details!', dataObj);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};



