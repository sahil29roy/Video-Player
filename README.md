# Video Player API

## Description

This is a RESTful API for a video player application. It provides endpoints for user authentication, video management, and playlist handling. The API is built using Node.js, Express.js, and MongoDB, with additional dependencies for various functionalities.

## Features

- User authentication using JSON Web Tokens (JWT)
- Video management, including upload, deletion, and retrieval
- Playlist creation, modification, and management
- Secure password hashing using bcrypt
- Cloudinary integration for image and video storage
- Pagination support using mongoose-aggregate-paginate-v2

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install the dependencies.

## Usage

1. Set up environment variables by creating a `.env` file and adding necessary configurations.
2. Start the server by running `npm run dev`.
3. Use tools like Postman or curl to interact with the API endpoints.

## Dependencies

- bcrypt: ^5.1.1
- cloudinary: ^2.1.0
- cookie-parser: ^1.4.6
- dotenv: ^16.4.5
- express: ^4.19.2
- jsonwebtoken: ^9.0.2
- mongoose: ^8.3.0
- mongoose-aggregate-paginate-v2: ^1.0.7
- multer: ^1.4.5-lts.1

## Dev Dependencies

- nodemon: ^3.1.0
- prettier: 3.2.5

## License

This project is licensed under the ISC License.
