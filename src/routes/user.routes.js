import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    changePassword
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
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
router.route("/update/passwordChange").post(verifyJwt,changePassword)

export default router;

// /user/register