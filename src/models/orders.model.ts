import mongoose from 'mongoose';

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
                min: [1, "Quantity can not be less than 1"],
                max: [5, "Quantity can not be more than 5"],
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


const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;

