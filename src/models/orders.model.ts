import mongoose from 'mongoose';

import UserModel from './users.model';
import mail from '@/utils/mail';


const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        grandTotal: {
            type: Number,
            required: true,
        },
        orderItems: [{
            name: {
                type: String,
                required: true,
            },
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Products",
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                min: [1, "Quantity cannot be less than 1"],
                max: [5, "Quantity cannot be more than 5"],
                required: true,
            }
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);


OrderSchema.post('save', async function (doc, next) {
    const order = doc;
    const user = await UserModel.findById(order.createdBy);

    if (!user) {
        console.error("User not found for an order:",order._id);
        next(new Error("User not found for the order"));
        return;
    }

    const mailContent = await mail.render("invoice.ejs",{
        customerName: user.fullName,
        orderItems: order.orderItems,
        grandTotal: order.grandTotal,
        contactEmail: process.env.MAIL_USER,
        companyName: "Toserba Typescript",
        year: new Date().getFullYear(),
    });

    await mail.send({
        to: user.email,
        subject: "T",
        content: mailContent,
    });

    next();
});


const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;

