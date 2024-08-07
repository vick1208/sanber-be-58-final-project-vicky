import OrderModel from '@/models/orders.model';
import ProductsModel from '@/models/products.model';
import UserModel from '@/models/users.model';
import { IPaginationQuery, IReqProduct, IReqUser } from '@/utils/interfaces';
import { orderValidation, Yup } from '@/utils/validationSchema';
import { Request, Response } from 'express';
import mongoose from 'mongoose';



export default {
    async create(req: Request, res: Response) {
        const createdBy = (req as IReqUser).user.id;
        const { orderItems, status } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let grandTotal: number = 0;
            const orderItemsArray: { productId: string; quantity: number }[] = [];
            for (const orderItem of orderItems) {
                const product = await ProductsModel.findById(orderItem.productId).session(session);
                if (product) {
                    if (orderItem.quantity > product.qty) {
                        await session.abortTransaction();
                        await session.endSession();

                        return res.status(400).json({
                            message: "Failed add order items",
                            detail: `Item quantity cannot exceed current product quantity, current ${product.name} quantity : ${product.qty}`,
                        });
                    }

                    const orderedItem: IReqProduct['product'] = {
                        name: product?.name,
                        productId: product?._id.toString(),
                        price: product?.price,
                        quantity: orderItem.quantity,
                    };

                    product.qty -= orderItem.quantity;
                    await product.save({ session });

                    grandTotal += orderedItem.price * orderedItem.quantity;
                    orderItemsArray.push(orderedItem);
                }
            }

            const orderValidated = await orderValidation.validate({
                grandTotal: grandTotal,
                createdBy: createdBy,
                orderItems: orderItemsArray,
                status: status,
            });

            const newOrder = await OrderModel.create([orderValidated], { session });

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({
                message: "Success create order",
                data: newOrder,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error instanceof Yup.ValidationError) {
                res.status(400).json({
                    message: "Fail create order",
                    detail: error.errors,
                });
                return;
            }

            const err = error as Error;

            res.status(500).json({
                message: "Fail create order",
                detail: err.message,
            });
        }
    },

    async findAllUserOrder(req: Request, res: Response) {
        const userId = (req as IReqUser).user.id;

        const user = await UserModel.findById(userId);

        try {
            const {
                page = 1,
                limit = 10,
            } = req.query as unknown as IPaginationQuery;

            const { status } = req.query as { status: string };
            const validStatus = ["pending", "completed", "cancelled"];

            const queryUser: { [key: string]: any } = {
                createdBy: userId,
            }

            if (status) {
                const requestedStatus = status.toLowerCase();
                if (!validStatus.includes(requestedStatus)) {
                    return res.status(404).json({
                        message: "Failed to get user's order history",
                        detail: `${requestedStatus} is not a valid status`,
                    });
                }

                queryUser.status = status;
            }
            const orders = await OrderModel.find(queryUser)
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = orders.length;

            res.status(200).json({
                page: +page,
                limit: +limit,
                total,
                totalPages: Math.ceil(total / limit),
                user: user,
                orders: orders,
            });

        } catch (error) {

            const err = error as Error;

            res.status(500).json({
                message: "Failed to get user's order history",
                detail: err.message,
            });
        }
    }
};