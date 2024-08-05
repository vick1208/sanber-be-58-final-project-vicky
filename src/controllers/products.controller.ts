import { Request, Response } from "express";
import ProductsModel from "@/models/products.model";
import * as Yup from 'yup';
import CategoriesModel from "@/models/categories.model";

const createValidationSchema = Yup.object().shape({
  name: Yup.string().required(),
  price: Yup.number().required(),
  category: Yup.string().required(),
  description: Yup.string().required(),
  images: Yup.array().of(Yup.string()).required().min(1),
  qty: Yup.number().required().min(1),
});

interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
export default {
  async create(req: Request, res: Response) {
    try {

      const product = await ProductsModel.findOne({
        name: req.body.name,
      });

      if (product) {
        return res.status(400).json({
          detail: `product with name ${req.body.name} already existed`,
          message: "Failed create product",
        });
      }

      const {category} = req.body;

      if (category) {
        const categoryFound = await CategoriesModel.findById(category);
        if (!categoryFound) {
          return res.status(404).json({
            detail: "Category not found with the given category id",
            message: "Failed create product",
          });
        }
      } else {
        return res.status(404).json({
          detail: "Category id field cannot be empty",
          message: "Failed create product",
        });

      }

      await createValidationSchema.validate(req.body);

      const newProduct = await ProductsModel.create(req.body);

      await CategoriesModel.findByIdAndUpdate(
        category,
        {$push: {products: newProduct._id}},
        {new:true, useFindAndModify:false},
      );

      res.status(201).json({
        data: newProduct,
        message: "Success create product",
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        res.status(400).json({
          data: error.errors,
          message: "Failed create product",
        });
        return;
      }
      const err = error as Error;
      
      res.status(500).json({
        data: err.message,
        message: "Failed create product",
      });
    }
  },
  async findAll(req: Request, res: Response) {
    try {

      const {
        limit = 10,
        page = 1,
        search = ""
      } = req.query as unknown as IPaginationQuery;

      const query = {};

      if (search) {
        Object.assign(query, {
          name: { $regex: search, $options: "i" }
        });
      }

      const result = await ProductsModel.find(query)
      .limit(limit)
      .skip((page - 1)*limit)
      .sort({createdAt: -1})
      .populate('category');

      const total = await ProductsModel.countDocuments(query);

      res.status(200).json({
        data: result,
        message: "Success get all products",
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total/limit)
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed get all products",
      });
    }
  },
  async findOne(req: Request, res: Response) {
    try {
      const product = await ProductsModel.findOne({
        _id: req.params.id,
      }).populate('category');


      if (!product) {
        return res.status(404).json({
          detail: "Product not found with the given id",
          message: "Failed get one product",
        });
      }

      res.status(200).json({
        data: product,
        message: "Success get one product",
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        data: err.message,
        message: "Failed get one product",
      });
    }
  },
  async update(req: Request, res: Response) {
    try {

      const existingProduct = await ProductsModel.findOne({
        _id: { $ne: req.params.id },
        name: req.body.name,
      });

      if (existingProduct) {
        return res.status(404).json({
          detail: `Product with name ${req.body.name} already exist`,
          message: "Failed update product"
        });
      }

      const { category } = req.body;

      if (category) {
        const categoryFound = await CategoriesModel.findById(category);
        if (!categoryFound) {
          return res.status(404).json({
            detail: "Category not found with the given category id",
            message: "Failed create product"
          });
        }
      }
      
      const product = await ProductsModel.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
          new: true,
        }
      );

      if (!product) {
        return res.status(404).json({
          detail: "Product not found with the given id",
          message: "Failed update product"
        });
      } else {
        const categoryFound = await CategoriesModel.findById(category);
        if (categoryFound) {
          const productExist = categoryFound.products.includes(product._id);
          if (!productExist) {
            categoryFound.products.push(product._id);
            await categoryFound.save();
          }
        }
      }

      res.status(200).json({
        data: product,
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
      const product = await ProductsModel.findOneAndDelete({
        _id: req.params.id,
      });

      if (!product) {
        return res.status(404).json({
          detail: "Product not found with the given id",
          message: "Failed delete product",
        });
      }


      await CategoriesModel.updateOne(
        { _id: product.category },
        { $pull: { products: product._id } }
      );

      res.status(200).json({
        data: product,
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
