import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CategoriesSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
        },
        products:[{
            type: Schema.Types.ObjectId,
            ref: "Products"
        }],
    },
    {
        timestamps: true,
    }
);

const CategoriesModel = mongoose.model("Category",CategoriesSchema);

export default CategoriesModel;