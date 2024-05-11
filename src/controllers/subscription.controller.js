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



    const getUserChannelSubscribers = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        if(channelId){
            throw new ApiError(400,"ChannelId not provided")
        }
        if (!isValidObjectId(channelId)) {
          throw new ApiError(400, "Invalid channel Id");
        }
      
        const subscriberList = await Subscription.aggregate([
          {
            $match: {
              channel: new mongoose.Types.ObjectId(channelId),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
              pipeline: [
                {
                  $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribedToSubscriber",
                  },
                },
                {
                  $addFields: {
                    subscribedToSubscriber: { //issubscribed
                      $cond: {
                        if: {
                          $in: [channelId, "$subscribedToSubscriber.subscriber"],
                        },
                        then: true,
                        else: false,
                      },
                    },
                    subscribersCount: {
                      $size: "$subscribedToSubscriber",
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$subscriber",
            //unwind haar array ka doccument ko alag alag kr deta hai [user1,user1] -> user1, user2 alag alag kr deta hai
          },
          {
            $project: {
              _id: 0,  //not channel user id 
              subscriber: {
                _id: 1,
                username: 1,
                fullName: 1,
                "avatar.url": 1,
                subscribedToSubscriber: 1,
                subscribersCount: 1,
              },
            },
          },
        ]);
        if(!subscriberList){
            throw new ApiError(500,"Failed to find subscriber")
        }
        return res
          .status(200)
          .json(
            new ApiResponse(200, subscribers, "subscribers fetched successfully")
          );
      });


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid subscriber Id");
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}