import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    changeFullName,
    refreshAccessToken,
    changeEmail,
    updateAvatar,
    UpdateCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";
// import {User} from "../models/users.models.js"
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

//update
router.route("/update/passwordChange").post(verifyJwt,changePassword)
router.route("/update/fullNameChange").post(verifyJwt, changeFullName)
router.route("/update/emailChange").post(verifyJwt, changeEmail)
router.route("/update/updateAvatar").post(verifyJwt
,upload.single("avatar"), updateAvatar)
router.route("/update/coverImageChange").post(verifyJwt, upload.single("coverImage"),UpdateCoverImage)

router.route("/profile/:username").get(verifyJwt, getUserChannelProfile)
router.route("/history").get(verifyJwt, getWatchHistory)


export default router;

// /user/register