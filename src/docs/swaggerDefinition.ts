import config from "../config";

// Swagger
const swaggerDef = {
    openapi: "3.0.0",
    info: {
        title: "E-Commerce app documentation",
        version: "1.0.0",
        servers: [
            { url: `localhost${config.port}/v1` },
        ],
    },
};

export default swaggerDef;
