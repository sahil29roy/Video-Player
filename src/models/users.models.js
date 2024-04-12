import mongoose, { Schema } from "mongoose";

const UserserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true,
        index: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true,
    },
    fullName : {
        type: String,
        required: true,
        trim: true, 
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password: {
        type: String,   //bcrypt
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String //jwt
    }
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)