import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { Product } from '../../src/models';
import { userOne, userTwo, admin, insertUsers, userThree } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { IProductDocument } from "../../src/interfaces/Product.interface";

setupTestDB();

describe('Admin/products routes', () => {
    describe('POST /v1/admin/products', () => {
        interface ISku {
            sku: string,
            image: string,
            quantity: number,
            price: {
                buy: number,
                sell: number,
                discount: number
            },
            attributes: object
        }
        interface IProduct {
            item: string,
            categories: Array<string>,
            skus: Array<ISku>
        }
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
                    }
                ],
            };
        });
        test('should return 201 and successfully create product if request data is ok', async () => {
            await insertUsers([admin]);
            const res = await request(app)
                .post('/v1/admin/products')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newProduct)
                .expect(httpStatus.CREATED);

            expect(res.body).toEqual({
                id: expect.anything(),
                item: newProduct.item,
                categories: newProduct.categories,
                skus: [{
                    ...newProduct.skus[0],
                    _id: expect.anything(),
                    isAvailable: true
                }]

            });

            const dbProduct: IProductDocument | null = await Product.findById(res.body.id);
            expect(dbProduct).toBeDefined();
            // TODO: fix this
            // expect(dbProduct).toMatchObject({
            //     item: newProduct.item,
            //     categories: newProduct.categories,
            //     skus: newProduct.skus,
            //     isAvailable: true

            // });
        });

        test('should return 401 if access token is missing', async () => {
            await insertUsers([admin]);
            await request(app)
                .post('/v1/admin/products')
                .send(newProduct)
                .expect(httpStatus.UNAUTHORIZED);
        });


        test('should return 403 error if non-admin user try to access this resource', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post('/v1/admin/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(httpStatus.FORBIDDEN);
        });

        test('should return 400 error if given skus are same', async () => {
            await insertUsers([admin]);
            newProduct.skus[1] = newProduct.skus[0];
            await request(app)
                .post('/v1/admin/products')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newProduct)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if item does not send', async () => {
            await insertUsers([admin]);
            await request(app)
                .post('/v1/admin/products')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    categories: ["phone", "tech"],
                })
                .expect(httpStatus.BAD_REQUEST);
        });
    });
});