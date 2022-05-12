import { Product } from '../../../src/models';
import { IProduct } from '../../../src/interfaces/Product.interface';
import { off } from 'process';

describe('Product model', () => {
    describe('Product validation', () => {
        let newProduct: IProduct;
        beforeEach(() => {
            newProduct = {
                item: "iphone7",
                categories: ["phone", "tech"],
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
                            cpu: "m1 pro",
                            storage: "512",
                            ram: "16gb",
                            display: "14 inch"
                        }
                    },
                    {
                        sku: "iphone7-32-Black",
                        image: "path",
                        quantity: 2,
                        price: {
                            buy: 80,
                            sell: 100,
                            discount: 0
                        },
                        attributes: {
                            cpu: "m1 pro",
                            storage: "512",
                            ram: "16gb",
                            display: "14 inch"
                        }
                    }
                ],
            };
        });

        it('should correctly validate a valid product', async () => {
            await expect(new Product(newProduct).validate()).resolves.toBeUndefined();
        });
    });
});