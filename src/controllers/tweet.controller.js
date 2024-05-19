import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body;
  
    if (!content) {
      throw new ApiError(400, "Content is required");
    }
  
    const createdTweet = await Tweet.create({
      content,
      owner: req.user?._id,
    });
  
    if (!createdTweet) {
      throw new ApiError(500, "Error while creating Tweet");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, createdTweet, "Tweet created successfully"));
  });


  const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;
    const { content } = req.body;
  
    if (!content) {
      throw new ApiError(400, "Tweet content is required");
    }
  
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid Tweet ID");
    }
  
    const tweet = await Tweet.findById(tweetId);
  
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
  
    if (tweet?.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "Only owner can edit their tweet");
    }
  
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );
    if (!updatedTweet) {
      throw new ApiError(400, "Error while uploading tweet");
    }
  
    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
  });

  
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only owner can delete their tweet");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, "Server error while deleting the tweet");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

