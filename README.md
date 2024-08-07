# Final Project Back End Node.js

## Introduction

Project Akhir Sanbercode Node.js menggunakan _framework_ Express.js untuk melakukan proses CRUD data dengan menggunakan MongoDB, TypeScript,dan Cloudinary.

### Public URL Railway

Railway deployment : [Final Project Link](https://sanber-be-58-final-project-vicky-production.up.railway.app/api).

## API Endpoints

### User Authentication

| Method | Endpoints           | Description                          |  Need JWT Token|
| ------ | ------------------- | ------------------------------------ | -----|
| `POST` | `/auth/register`    | Register user baru | No                  |
| `POST` | `/auth/login`       | Login user     | No       |
| `GET`  | `/api/auth/me`      | Mendapatkan user profile |  Yes |
| `PUT`  | `/api/auth/profile` | Edit user profile (Admin role)  |Yes |

### Category Routes

|Method|Endpoints|Description|
|---| ---| ---|
| `GET`   | `/categories`   | Mendapat semua data category   |
|`GET`|`/categories/:id`| Mendapatkan data category dari id |
|`POST`|`/categories`|Membuat data category|
|`PUT`|`/categories/:id`| Edit data category dari id |
|`DELETE`|`/categories/:id`| Hapus data category dari id |

### File Images

|Method|Endpoints|Description|
|---| ---| ---|
| `POST`   | `/upload`   | Upload satu file gambar   |
| `POST`|`/uploads`|Upload beberapa file gambar (max 10)|

### Product Routes

|Method|Endpoints|Description|
|---| ---| ---|
|  `GET`  | `/products`   |  Mendapat semua data product  |
|`GET`|`/products/:id`| Mendapatkan data product dari id |
|`POST`|`/products`|Membuat data product|
|`PUT`|`/products/:id`| Edit data product dari id |
|`DELETE`|`/products/:id`| Hapus data product dari id |

### Order Routes

|Method|Endpoints|Description|  Need JWT Token|
|---| ---| ---|---|
|  `GET`  |  `/orders`  | Mendapatkan semua order dari data user dan product | Yes  |
|`POST`|`/orders`| Membuat order product | Yes |

## Authorization Request Header

* Auth Type: Bearer Token
* Value : Bearer `<JWT token>`

## Request Body Format

Base URL: <https://sanber-be-58-final-project-vicky-production.up.railway.app/api>

* Method POST Order

```json
{
    "orderItems": [
        {
            "productId": "_id dari model Product",
            "quantity": 2
        },
        {
            "productId": "_id dari model Product",
            "quantity": 1
        },
    ]
}
```

* Method POST and PUT Product Data

```json
{
    "name": "Nama Produk",
    "description": "Deskripsi Produk",
    "images": [
        "test1.jpg"
        "test2.jpg",
        "test3.jpg"
    ],
    "price": 1,
    "qty": 1,
    "category": "_id dari model Category"
}
```

* Method POST and PUT Category Data

```json
{
    "name": "Nama Kategori"
}
```

* Method POST Register User

```json
{
    "email": "Email User Baru",
    "fullName": "Nama User Baru",
    "password": "Password User Baru",
    "username": "Username User Baru",
    "roles": [
        "user"|"admin"
    ]
}
```

* Method POST Login User

```json
{
    "email": "Email User",
    "password": "Password User"
}
```
