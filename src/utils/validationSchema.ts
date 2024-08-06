import * as Yup from 'yup';

// ObjectId Validation MongoDB
const objectIdValidation = Yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId ');

// User Auth Validation
const registerValidation = Yup.object().shape({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    passwordConfirmation: Yup.string().oneOf(
        [Yup.ref("password"), ""],
        "Passwords must match"
    ),
});


const loginValidation = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
});


const profileValidation = Yup.object().shape({
    fullName: Yup.string().required(),
    password: Yup.string().required(),
    passwordConfirmation: Yup.string().oneOf(
        [Yup.ref("password"), ""],
        "Passwords must match"
    ),
    profilePicture: Yup.string(),
});

// Category Data Validation

const categoryValidation = Yup.object().shape({
    name: Yup.string().required(),
    products: Yup.array().of(objectIdValidation).optional(),
});

// Order Product Validation
const orderItemValidation = Yup.object().shape({
    name: Yup.string().required(),
    productId: objectIdValidation.required(),
    price: Yup.number().required(),
    quantity: Yup.number().required()
        .min(1, "Quantity cannot be less than 1")
        .max(5, "Quantity cannot be more than 5"),
});
const orderValidation = Yup.object().shape({
    grandTotal: Yup.number().required(),
    orderItems: Yup.array().of(orderItemValidation).required(),
    createdBy: objectIdValidation.required(),
    status: Yup.string().oneOf(["pending", "completed", "cancelled"]).default("pending"),
});

// Product Data Validation
const productValidation = Yup.object().shape({
    name: Yup.string().required(),
    price: Yup.number().required(),
    category: Yup.string().required(),
    description: Yup.string().required(),
    images: Yup.array().of(Yup.string()).required().min(1),
    qty: Yup.number().required().min(1),
});

export{
    Yup,
    registerValidation,
    loginValidation,
    profileValidation,
    orderValidation,
    categoryValidation,
    productValidation,
};



