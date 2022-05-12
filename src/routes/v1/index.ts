import express from "express"
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import adminUserRoute from './admin.user.route';
import adminProductRoute from './admin.product.route';
import config from "../../config";


const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/users',
        route: userRoute,
    },
    {
        path: '/admin/users',
        route: adminUserRoute,
    },
    {
        path: '/admin/products',
        route: adminProductRoute,
    },
    {
        path: '/docs',
        route: docsRoute,
    },

];

const devRoutes = [
    // routes available only in development mode
    {
        path: '/docs',
        route: docsRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

/* istanbul ignore next */
// if (config.env === 'development') {
//     devRoutes.forEach((route) => {
//         router.use(route.path, route.route);
//     });
// }

export default router;