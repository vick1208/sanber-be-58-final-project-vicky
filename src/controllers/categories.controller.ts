import CategoriesModel from '@/models/categories.model';
import ProductsModel from '@/models/products.model';
import { Request, Response } from 'express';


export default {
    async create(req: Request, res: Response) {
        try {

            const category = await CategoriesModel.findOne({
                name: req.body.name
            });

            if (category) {
                return res.status(400).json({
                    detail: `Category with name ${req.body.name} already exist`,
                    message: "Failed create category",
                });
            }
            const newCategory = await CategoriesModel.create(req.body);
            res.status(201).json({
                data: newCategory,
                message: "Success create category"
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed create category"
            });
        }
    },
    async findAll(req: Request, res: Response) {
        try {
            const categories = await CategoriesModel.find();
            res.status(200).json({
                data: categories,
                message: "Success get all categories"
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed get all categories"
            });
        }
    },
    async findOne(req: Request, res: Response) {
        try {
            const category = await CategoriesModel.findOne({
                _id: req.params.id,
            }).populate("products");

            if (!category) {
                return res.status(404).json({
                    detail: "Category not found with the given id",
                    message: "Failed get one category",
                });
            }
            res.status(200).json({
                data: category,
                message: "Success get one category"
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed get one category"
            });
        }
    },
    async update(req: Request, res: Response) {
        try {
            const existingCategory = await CategoriesModel.findOne({
                _id: { $ne: req.params.id },
                name: req.body.name
            });

            if (existingCategory) {
                return res.status(400).json({
                    detail: `Category with name ${req.body.name} already exist`,
                    message: "Failed create category"
                });
            }

            const category = await CategoriesModel.findOneAndUpdate(
                { _id: req.params.id },
                req.body,
                { new: true }
            );

            if (!category) {
                return res.status(404).json({
                    detail: "Category not found with the given id",
                    message: "Failed get one category",
                });
            }

            res.status(200).json({
                data: category,
                message: "Success update product",
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed update product",
            });
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const category = await CategoriesModel.findOneAndDelete({
                _id: req.params.id,
            });

            if (!category) {
                return res.status(404).json({
                    detail: "Category not found with the given id",
                    message: "Failed get one category",
                });
            }
            await ProductsModel.updateMany(
                {category: req.params.id},
                {$set:{category:null}}
            );
            

            res.status(200).json({
                data: category,
                message: "Success delete product",
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                data: err.message,
                message: "Failed delete product",
            });
        }
    },
};