import ProductsModel from '@/models/products.model';
import { IReqProduct, IReqUser } from '@/utils/interfaces';
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

                    const orderedItem : IReqProduct['product'] = {
                        name: product?.name,
                        productId: product?._id.toString(),
                        price: product?.price,
                        quantity: orderItem.quantity,
                    };

                    product.qty -= orderItem.quantity;
                    await product.save({session});

                    grandTotal += orderedItem.price * orderedItem.quantity;
                    orderItemsArray.push(orderedItem);
                }
            }

            
        } catch (error) {

        }

    }
};