import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { application } from "express";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ ValidateBeforeSave: false })  //try to use incorrect name and check the error 
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh token!")
    }
}

const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(
    async (req, res) => {
        //get user details
        const { fullName, username, email, password } = req.body;
        console.log("password : ", password)
        // validation
        if ([fullName, username, email, password].some((feild) => feild?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }
        // check if user already exists
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            throw new ApiError(400, "Username allready exist!")
        }

        //upload avtar and cover with validation

        const avatarLocalPath = req.files?.avatar[0]?.path;

        let coverImageLocalPath;

        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required ");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar file is Required!");
        }

        //create db call

        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(400, "Something wet wrong while registering user ")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully ")
        )

    }
)

const loginUser = asyncHandler(
    async (req, res) => {

        const { email, username, password } = req.body
        console.log(email);

        if (!username && !email) {
            throw new ApiError(400, "username or email is required")
        }

        const user = await User.findOne(
            {
                $or: [{ username }, { email }]
            }
        )

        if (!user) {
            throw new ApiError(404, "User does not Exist ");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }
        //accessToken and refreshToken
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "User logged In Successfully"
                )
            )

    }
)

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logged out ")
        )
})

const changePassword = asyncHandler(async(req,res)=>{

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const refreshAccessToken = asyncHandler ( async(req,res)=>{

    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","")

        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorised request!");
        }
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401,"Invalid refresh token!")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used!")
        }
        const accessToken = user.generateAccessToken();

        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .json(200,accessToken,"Access Token is refreshed ");

    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid refresh token!")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword
};