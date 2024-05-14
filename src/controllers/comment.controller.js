import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is not valid");
    }

    if (!content) {
        throw new ApiError(400, "Content not provided");
    }

    const uploadComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    if (!uploadComment) {
        throw new ApiError(500, "Failed to upload the comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, uploadComment, "Comment added successfully"));
})