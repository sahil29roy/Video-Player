import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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
        if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
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

const changeFullName = asyncHandler(async(req,res)=>{

    const {fullName} = req.body

    const user = await User.findById(req.user?._id)

    if (!fullName || typeof fullName !== "string") {
        throw new ApiError(400, "fullName is required and must be a valid string!");
      }

    user.fullName = fullName
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {fullName}, "fullName changed successfully"))
})

const changeEmail = asyncHandler(async(req,res)=>{

    const {email} = req.body

    const user = await User.findById(req.user?._id)

    if (!email || typeof email !== "string") {
        throw new ApiError(400, "email is required and must be a valid string!");
      }

    user.email = email
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {email}, "email changed successfully"))
})

const updateAvatar = asyncHandler(async(req,res)=>{
     const avatarLocalPath = req.file?.avatar[0]?.path

     if(!avatarLocalPath){
        throw new ApiError(400, "No file uploaded!")
     }
     const avatar = await uploadOnCloudinary(avatarLocalPath)

     if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar");
     }

     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $Set : {
                avatar : avatar.url
            }
        },
        {new : true}
     ).select("-password")

     return res.status(200)
     .json(new ApiResponse(200,user,"Avatar changed sucessfully"));
})

const UpdateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.coverImage[0]?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"No file Uploaded!")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400,"Error while uploading coverImage")
    }

    const user = User.findByIdAndUpdate(
        user?._id,
        {
            $Set : {
                coverImage : coverImage.url
            }
        }
        ,{new : true}
    )
    return res
    .status(200)
    .json(200,user,"CoverImage changed sucessfully")
})

const getUserChannelProfile = asyncHandler( async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400, " username is missing!")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                forignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                forignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                subscribedToCount :{
                    $size : "subscribedTo"
                },
                isSubscribed  : {
                    if : {$in : [req.user?._id, "$subscriber.subscriber"]},
                    then : true,
                    else : false
                }
            }
        },
        {
            $project : {
                fullname : 1,
                username : 1,
                subscriberCount : 1,
                subscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }
    console.loh(channel)
    console.log("***********************************")
    console.log(chanel[0])
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched sucessfully")
    )
} )

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField:'watchHistory',
                forignField : "_id",
                as : "watchHistory",
                pipeline:[
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            forignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner: {
                                $first :"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    changeFullName,
    refreshAccessToken,
    changeEmail,
    updateAvatar,
    UpdateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};