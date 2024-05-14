import { Router } from "express";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);


router.route("/toggle/comment/:commentId").post(toggleCommentLike);
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike);
router.route("/toggle/video/:videoId").post(toggleVideoLike);

export default router;