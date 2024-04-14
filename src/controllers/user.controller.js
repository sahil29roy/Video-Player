import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(
    async (req,res)=>{
        //get user details
        const {fullName,username,email,password} = req.body;
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

        // validation
        if([fullName,username,email,password].some((feild)=> feild?.trim()==="")){
            throw new ApiError(400,"All fields are required");
        }
        // check if user already exists
        const existedUser = await User.findOne({
            $or: [{username},{email}]
        })
        if(existedUser){
            throw new ApiError(400,"Username allready exist!")
        }

        //upload avtar and cover with validation

        const avtarLocalPath = req.files?.avtar[0]?.path;

        let coverImageLocalPath ;

        if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        if(!avtarLocalPath){
            throw new ApiError(400,"Avtar file is required ");
        }

        const avtar = await uploadOnCloudinary(avtarLocalPath);

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avtar){
            throw new ApiError(400,"Avtar file is Required ");
        }

        //create db call

        const user = await User.create({
            fullName,
            username : username.toLowerCase(),
            email,
            avtar : avtar.url,
            coverImage : coverImage?.url || ""
        })

        const createdUser = await user.findById(user._id).select(" -password -refreshToken");

        if(!createdUser){
            throw new ApiError(400,"Something wet wrong while registering user ")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User registered successfully ")
        )


    }
)

export {registerUser};