import { Types } from "mongoose"
import { Product } from "../../src/models";
import { IProduct } from "../../src/interfaces/Product.interface";

export const productOne: IProduct = {
    _id: new Types.ObjectId(),
    item: "iphone7",
    categories: ["phone", "apple"],
    skus: [
        {
            sku: "iphone7-128-Black",
            image: "path",
            quantity: 5,
            price: {
                buy: 100,
                sell: 120,
                discount: 0
            },
            attributes: {
                color: "#ffffff",
                storage: "128gb",
                ram: "4gb",
            }
        },
        {
            sku: "iphone7-32-Black",
            image: "path",
            quantity: 2,
            price: {
                buy: 80,
                sell: 90,
                discount: 0
            },
            attributes: {
                color: "#000000",
                storage: "32gb",
                ram: "4gb",
            }
        }
    ],
};



export const productTwo: IProduct = {
    _id: new Types.ObjectId(),
    item: "macbook-pro-2021",
    categories: ["apple", "laptop"],
    skus: [
        {
            sku: "macbookpro14-m1pro-16g-512g",
            image: "path",
            quantity: 10,
            price: {
                buy: 500,
                sell: 600,
                discount: 0
            },
            attributes: {
                cpu: "m1 pro",
                storage: "512",
                ram: "16gb",
                display: "14 inch"
            }
        },
        {
            sku: "macbookpro16-m1promax-16g-512g",
            image: "path",
            quantity: 2,
            price: {
                buy: 600,
                sell: 700,
                discount: 0
            },
            attributes: {
                cpu: "m1 pro-max",
                storage: "512",
                ram: "16gb",
                display: "16 inch"
            }
        },
    ],
};

export const productThree: IProduct = {
    _id: new Types.ObjectId(),
    item: "iphone12",
    categories: ["phone", "apple"],
    skus: [
        {
            sku: "iphone12-128-Black",
            image: "path",
            quantity: 5,
            price: {
                buy: 200,
                sell: 230,
                discount: 0
            },
            attributes: {
                color: "#000000",
                storage: "128gb",
                ram: "6gb",
            }
        },
        {
            sku: "iphone12-256-Black",
            image: "path",
            quantity: 12,
            price: {
                buy: 220,
                sell: 250,
                discount: 10
            },
            attributes: {
                color: "#000000",
                storage: "256gb",
                ram: "6gb",
            }
        }
    ],
};


export const insertProducts = async function <Type>(products: Array<Type>) {
    await Product.insertMany(products.map((product) => (product)));
};
