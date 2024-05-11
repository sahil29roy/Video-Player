import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId){
        throw new ApiError(404,"Channel not found");
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }
    const isSubscribed = await Subscription.findOne(
        {
            subscriber : req.user?._id,
            channel : channelId
        }
    )
    if (isSubscribed) {
        // Unsubscribe user to the channel
        await Subscription.findByIdAndDelete(isSubscribed._id);
        //return
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { isSubscribed: false },
              "Unsubscribed successfully"
            )
          );
        }

        const subscribing = await Subscription.create(
            {
                subscriber : req.user?._id,
                channel : channelId,
            }
        );

        if(!subscribing){
            throw new ApiError(500, "Server error while subscribing");
        }
        return res
        .status(200)
        .json(
          new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
        );
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params  
    if(channelId){
        throw new ApiError(400,"ChannelId not provided")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id");
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            },
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                forignField : "_id",
                as : "subscriber",
                pipeline : [
                    //TODO : add pipelines for user -> subscriber
                ]
            }
        }
        
    ])
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}