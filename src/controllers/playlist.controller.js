import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name) {
        throw new ApiError(400, "playlist name is required!")
    }
    if (!description) {
        throw new ApiError(400, "Discription is required!")
    }


    const playlist = await Playlist.create(
        {
            name,
            description,
            owner: req.user?._id,
        }
    )

    if(!playlist){
        throw new ApiError(400,"failed to create playlist")
    }

    const createdPlaylist = await Playlist.findById(playlist._id);

    if (!createdPlaylist) {
        throw new ApiError(400, "Playlist not found ")
    }

    return res.status(201).json(
        new ApiResponse(200, createPlaylist, "playlist created successfully ")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId!")
    }

    const playlist = Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ]);

    if (!playlist) {
        throw new ApiError(400, "Playlist not found!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched sucessfully")
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, " PlaylistId not found!")
    }
    const playlist = Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist does not exist ")
    }
    const playlistVideos = Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $match: {
                "videos.isPublished": true,
            },
        },
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner"
            }
        },
        {
            $addFields : {
                totalVideos : {
                    $size : "$videos"
                },
                totalViews : {
                    $sum : "$videos.views"
                },
                owner : {
                    $first : "$owner"
                }
            }
        },
        {
            $project : {
                name : 1,
                description : 1,
                createdAt : 1,
                updatedAt : 1,
                totalVideos : 1,
                totalViews : 1,
                videos : {
                    _id : 1,
                    "videoFile.url" : 1,
                    "thumbnail.url": 1,
                    title : 1,
                    description :1,
                    createdAt :1,
                    duration : 1,
                    views : 1
                },
                owner : {
                    username : 1,
                    fullName : 1,
                    "avatar.url" : 1
                }
            }
        }
        
    ]);

    if(!playlistVideos){
        throw new ApiError(500, "Server error while aggregating playlist videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistVideos,"Playlist fetched sucessfully ")
    )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new ApiError(400, "Provide valid playlist and video Id");
      } 
      const video = await Video.findById(videoId);

      if (!video) {
        throw new ApiError(400, "Video not found");
      }

      const playlist = await Playlist.findById(playlistId);

      if (!playlist) {
        throw new ApiError(400, "Playlist not found");
      }

      if(playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "only owner can add video to their playlist ");
      }

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet : {
                videos : videoId,
            },
        },
        { new : true}
      );

      if (!updatedPlaylist) {
        throw new ApiError(500, "Error while adding the video to the playlist");
      }

      return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video added successfully to the playlist"
        )
      );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
  
    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
      throw new ApiError(400, "Provide valid playlist or video Id");
    }
  
    const video = await Video.findById(videoId);
    const playlist = await Playlist.findById(playlistId);
  
    if (!video) {
      throw new ApiError(400, "Video not found");
    }
    if (!playlist) {
      throw new ApiError(400, "Playlist not found");
    }
  
    if (
      (playlist.owner?.toString() && video.owner.toString()) !==
      req.user?._id.toString()
    ) {
      throw new ApiError(400, "Only owner can add video to their playlist");
    }
  
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      { new: true }
    );
    if (!updatedPlaylist) {
      throw new ApiError(500, "Error while adding the video to the playlist");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          "Video removed successfully from the playlist"
        )
      );
  });

  const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
  
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid playlist Id");
    }
  
    const playlist = await Playlist.findById(playlistId);
  
    if (!playlist) {
      throw new ApiError(400, "Playlist not found");
    }
  
    if (playlist.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "You are not authorized to delete the playlist");
    }
  
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  
    if (!deletedPlaylist) {
      throw new ApiError(500, "Server error while deleting playlist");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
      );
  });


  const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
  
    if (!(name && description)) {
      throw new ApiError(400, "All fields are required , name and description");
    }
  
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid playlist Id");
    }
  
    const playlist = await Playlist.findById(playlistId);
  
    if (!playlist) {
      throw new ApiError(400, "Playlist not found");
    }
  
    if (playlist.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "Only owner can edit the playlist");
    }
  
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          name,
          description,
        },
      },
      { new: true }
    );
  
    if (!updatedPlaylist) {
      throw new ApiError(500, "Server error while updating the playlist");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
      );
  });

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}