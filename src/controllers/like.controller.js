import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid Video Id");
    }
  
    const alreadyLiked = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });
  
    if (alreadyLiked) {
      await Like.findByIdAndDelete(alreadyLiked._id);
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isLiked: false },
            "Video like removed successfully"
          )
        );
    }
  
    const likeVideo = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
  
    if (!likeVideo) {
      throw new ApiError(500, "Server error while liking the video");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, likeVideo, "Video liked successfully"));
  });
  
  
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
  
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid Comment Id");
    }
  
    const alreadyLiked = await Like.findOne({
      comment: commentId,
      likedBy: req.user?._id, 
    });
  
    if (alreadyLiked) {
      await Like.findByIdAndDelete(alreadyLiked._id);
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isLiked: false },
            "Comment like removed successfully"
          )
        );
    }
  
    const likeComment = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
  
    if (!likeComment) {
      throw new ApiError(500, "Server error while liking the comment");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, likeComment, "Comment liked successfully"));
  });
  

  
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
  
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid Tweet Id");
    }
  
    const alreadyLiked = await Like.findOne({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
  
    if (alreadyLiked) {
      await Like.findByIdAndDelete(alreadyLiked._id);
  
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isLiked: false },
            "Tweet like removed successfully"
          )
        );
    }
  
    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
  
    if (!likeTweet) {
      throw new ApiError(500, "Server error while liking the tweet");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, likeTweet, "Tweet liked successfully"));
  });
  

  export { toggleCommentLike, toggleTweetLike, toggleVideoLike };