import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!userId) {
        throw new ApiError(400, "User Id not provided");
      }
    
      if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
      }
      const pipeline =[];
      //TODO : complete code

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if (!(title && description)) {
        throw new ApiError(
          400,
          "Please provide a valid video title and description"
        );
      }
      const videoFile = await uploadOnCloudinary(videoLocalPath);

      if(!videoFile){
        throw new ApiError(400,"Video file not uploaded to cloudinary");
      }

      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

      if(!thumbnail){
        throw new ApiError(400,"Thumbnail file not uploaded to cloudinary")
    }

    const uploadVideo = await Video.create({
        title,
        description,
        videoFile : videoFile.url,
        thumbnail: thumbnail.url,
        owner : req.user._id,
        duration : videoFile.duration
    });

    if(!uploadVideo){
        throw new ApiError(
            500,"Something went wrong while saving video on database"
        );
    }

    return res
    .status(200)
    .json(new ApiResponse(200,uploadVideo,"Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}