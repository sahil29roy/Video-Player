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
        owner: req.user?._id,
    });

    if (!uploadComment) {
        throw new ApiError(500, "Failed to upload the comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, uploadComment, "Comment added successfully"));
});



const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    if (!content) {
        throw new ApiError(400, "No comment provided");
    }

    const getComment = await Comment.findById(commentId);

    if (req.user?._id.toString() !== getComment?.owner.toString()) {
        throw new ApiError(400, "User is not the owner of this comment");
    }

    const uploadComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content,
            },
        },
        { new: true }
    );

    if (!uploadComment) {
        throw new ApiError(500, "Failed to update comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                uploadComment,
                "Comment has been updated Successfully"
            )
        );
});



const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const getComment = await Comment.findById(commentId);

    if (!getComment) {
        throw new ApiError(400, "Comment does not exist")
    }

    if (getComment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "User is not the owner of this comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(500, "Unable to delete the comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment deleted Successfully"));
});

export { addComment, updateComment, deleteComment };

