import { Request, Response } from "express";
import Order from "../models/Order";

export const getReportSummary = async (req: Request, res: Response) => {
  try {
    const [totalOrders, revenueResult, topProducts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: 1,
            totalSold: 1,
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      data: {
        totalOrders,
        totalRevenue,
        topProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};