# E-Commerce-App
E-Commerce Website using Nodejs, Express, Typescript, MongoDB

## Manual Installation

Clone the repo:

```bash
git clone https://github.com/Andro-burchuladze/E-Commerce-App.git
cd E-Commerce-App
```

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Commands

Running locally:

```bash
npm run dev
```

Testing:

```bash
# run all tests
npm run test


## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Node envoriment
NODE_ENV=development

# Port number
PORT=3000

# URL of the Mongo DB
MONGODB_URL=mongodb://127.0.0.1:27017/E-Commerce-app

# JWT
# JWT secret key
JWT_SECRET=thisisasamplesecret
# Number of minutes or days after which a token expires
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_VIA_MOBILE_NUMBER_EXPIRATION_MINUTES=30
JWT_RESET_PASSWORD_VIA_EMAIL_EXPIRATION_MINUTES=30
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=30
JWT_VERIFY_MOBILE_NUMBER_EXPIRATION_MINUTES=30


# SMTP configuration options for the email service
SMTP_HOST=email-server
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=support@yourapp.com
```

## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--interfaces      # Interfaces files
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```
