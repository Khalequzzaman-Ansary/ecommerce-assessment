import { Request, Response } from "express";
import Cart from "../models/Cart";
import Order from "../models/Order";
import Product from "../models/Product";

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const orderItems: {
      product: any;
      name: string;
      price: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    let totalAmount = 0;

    for (const item of cart.items as any[]) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in the cart no longer exists",
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      const lineTotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        lineTotal,
      });

      totalAmount += lineTotal;
    }

    // Deduct stock only after all validation passes
    for (const item of cart.items as any[]) {
      const product = item.product;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};