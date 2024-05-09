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
      const pipeline = [];

      if(userId){
        pipeline.push({
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        })
      }

      //TODO : complete push for title

      pipeline.push({
        $match : {
          isPublished : true
        }
      })

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

      const videoLocalPath = req.files?.videoFile[0]?.path;
      const thumbnailLocalPath = req.files?.videoFile[0]?.path;

      if (!videoLocalPath) {
        throw new ApiError(400, "Video file is missing");
      }
      if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is missing");
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
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
    
    const video = Video.aggregate([
      {
        $match : {
          _id : new mongoose.Types.ObjectId(videoId)
        }
      },
      {
        $lookup : {
          form : "likes",
          localfield : "_id",
          foreignField : "videos",
          as : "likes"
        }
      },
      {
        $lookup : {
          form : "comments",
          localfield : "_id",
          foreignField : "videos",
          as : "comments"
        }
      },
      {
        $lookup : "users",
        localfield : "owner",
        forignField : "_id",
        as : "owner",
        pipeline : [
          {
            $lookup : {
              from : "subscriptions",
              localfield : "_id",
              forignField : "channel",
              as : "subscribers"
            }
          },
          {
            $addFields : {
              subscriberCount : {
                $size : "$subscribers"
              },
              isSubscribed : {
                $cond : {
                  if : {
                    $in : [req.user?._id,"$subscribers.subscriber"]
                  },
                  then : true,
                  else : false,
                },
              },
            }
          },
            {
              $project : {
                username : 1,
                "avatar.url": 1,
                subscribersCount: 1,
                isSubscribed: 1,
              }
          }
        ]
      },
      {
        $addFields : {
          likesCount : {
            $size :  "$likes"
          },
          owner : {
            $first : "$owner",
          },
          isLiked : {
            $cond : {
              if : {
                $in : [req.user?._id, "$likes.likedBy"]
              },
              then : true,
              else : false
            }
          }
        }
      }, 
      {
        $addFields: {
          commentsCount: {
            $size: "$comments"
          }
        }
      },      
      {
        $project : {
          "videoFile.url": 1,
          title: 1,
          description: 1,
          views: 1,
          createdAt: 1,
          duration: 1,
          comments: 1,
          owner: 1,
          likesCount: 1,
          isLiked: 1,
        }
      }
    ])
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
  
    if(!videoId){
      throw new ApiError(400, "Video Id not provided");
    }
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video Id");
    }
     const { title, description } = req.body;
     if (!title || !description ) {
      throw new ApiError(400, "ALl fields are required");
    }
    const thumbnailLocalPath =  req.file?.path;

    if(!thumbnailLocalPath){
      throw new ApiError(400, " thumbnail is missing ");
    }

    const oldVideo = await await Video.findById(videoId);

    if(!oldVideo){
      throw new ApiError(404,"Old Video not found");
    }
    //TODO : delete thumbnail url from cloudinary

    const thumbnail = await Video.findByIdAndUpdate(
      videoId,
      {
        $set : {
          title , 
          description,
          thumbnail : thumbnail.url
        }
      },
      {new : true}
    );
    if (!video) {
      throw new ApiError(500, "Video not found after updating the details");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
      throw new ApiError(400,"Video Id is not provided");
    }
    if(!isValidObjectId(videoId)) {
  	throw new ApiError(400,"Invalid Video Id");
    }

    const video = await Video.findById(videoId);
    if(!video){
      throw new ApiError(400,"No video with given id exists ")
    }

    const deletedVideo = await Video.findByIdAndDelete(video);

    if(!deletedVideo){
      throw new ApiError(500,"Error in deleting the video");
    }
    //TODS : delete from cloudinary 
    return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo,"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
      throw new ApiError(404,"Video not found")
    }

    const togglePublish = await Video.findByIdAndUpdate(
      videoId ,
    {  $set: {
        isPublished : !Video.isPublished,
      },},
      {new : true}
    );

    return res
    .status(200)
    .json(
      new ApiResponse(200,togglePublish,"isPublished is successfully toggled")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}