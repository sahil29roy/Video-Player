import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name){
        throw new ApiError(400,"playlist name is required!")
    }
    if(!description){
        throw new ApiError(400,"Discription is required!")
    }


    const playlist = await  Playlist.create(
        {
            name,
            description,
            owner: req.user?._id,
        }
    )
     
    const createdPlaylist = await Playlist.findById(playlist._id);

    if(!createdPlaylist){
        throw new ApiError(400,"Playlist not created ")
    }

    return res.status(201).json(
        new ApiResponse(200,createPlaylist,"playlist created successfully ")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId!")
    }

    const playlist = Playlist.aggregate([
        {
            $match : {
                owner : mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "videos",
                foreignField : "_id",
                as : "videos"
            }
        },
        {
            $addFields : {
                totalVideos : {
                    $size : "$videos"
                },
                totalViews : {
                    $sum : "videos.views"
                }
            }
        },
        {
            $project : {
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }
    ]);

    if(!playlist){
        throw new ApiError(400, "Playlist not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched sucessfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}