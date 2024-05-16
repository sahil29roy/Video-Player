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