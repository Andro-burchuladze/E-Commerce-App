import Joi from 'joi';

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
        PORT: Joi.number().default(3000),
        MONGODB_URL: Joi.string().required().description('Mongo DB url'),
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
        JWT_RESET_PASSWORD_VIA_MOBILE_NUMBER_EXPIRATION_MINUTES: Joi.number().default(10).description('minutes after which reset password via mobile number token expires'),
        JWT_RESET_PASSWORD_VIA_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10).description('minutes after which reset password via email token expires'),
        JWT_VERIFY_MOBILE_NUMBER_EXPIRATION_MINUTES: Joi.number().default(10).description('minutes after which verify mobile number token expires'),
        JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10).description('minutes after which verify email token expires'),
        KAVENEGAR_APIKEY: Joi.string().required().description('kavanegar api key'),
        EMAIL_HOST: Joi.string().required().description('host for email'),
        EMAIL_PORT: Joi.number().required().description('port for email'),
        EMAIL_USERNAME: Joi.string().required().description('username for email'),
        EMAIL_PASSWORD: Joi.string().required().description('password for email'),
        EMAIL_FROM: Joi.string().required().description('From for email'),

    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : '')
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordViaMobileNumberExpirationMinutes: envVars.JWT_RESET_PASSWORD_VIA_MOBILE_NUMBER_EXPIRATION_MINUTES,
        resetPasswordViaEmailExpirationMinutes: envVars.JWT_RESET_PASSWORD_VIA_EMAIL_EXPIRATION_MINUTES,
        verifyMobileNumberExpirationMinutes: envVars.JWT_RESET_PASSWORD_VIA_MOBILE_NUMBER_EXPIRATION_MINUTES,
        verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    },
    email: {
        host: envVars.EMAIL_HOST,
        port: envVars.EMAIL_PORT,
        auth: {
            user: envVars.EMAIL_USERNAME,
            pass: envVars.EMAIL_PASSWORD,
        },
        from: envVars.EMAIL_FROM
    },
    sms: {
        kavenegar: envVars.KAVENEGAR_APIKEY
    }
}