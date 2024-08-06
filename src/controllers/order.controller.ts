import OrderModel from '@/models/orders.model';
import ProductsModel from '@/models/products.model';
import { IReqProduct, IReqUser } from '@/utils/interfaces';
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

    async findAll(req: Request, res: Response) {

    }
};