import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLikes =  asyncHandler(async (req,res) =>{

    const {videoId} =  req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
      }

    const alreadyLiked = await Like.findOne({
        video : videoId,
        likedBy : req.user?._id
    })
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isLiked : false},
                "video like removed sucessfully "
            )
        );
    }
})
