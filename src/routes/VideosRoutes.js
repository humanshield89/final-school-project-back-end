const { UserModel, VideoModel, LikeModel, CommentModel } = require("../db");
const { requireSession } = require("../middlewares/requireSessionMiddleware");
const { uploadToS3 } = require("../s3");

module.exports = (app) => {
  app.post("/video", requireSession, async (req, res, next) => {
    const session = res.locals.session;
    const user = await UserModel.findById(session.user);
    const { tags, title } = req.body;
    const video = req.files?.video;
    if (!video || !tags || !title) {
      return res.json({
        message: "video and title and at least one tag is required ",
      });
    }
    const tagsArr = tags?.split(",", [tags?.length]);
    const path = `public/${user.name}/videos/${video.md5}${
      "." + video.name.split(".")?.[1] || ""
    }`;
    const tempVideo = new VideoModel({
      title: title,
      videoURL: path,
      tags: tagsArr,
      user: session.user,
      commentsCount: 0,
      likesCount: 0,
      SharesCount: 0,
      ranksCount: 0,
      rankRate: 5,
    });
    const savedVideo = await tempVideo.save();
    await uploadToS3(video.data, path);
    return res.json({
      message: "video posted ",
    });
  });
  app.get("/video/:id", async (req, res, next) => {
    const { id } = req.params;
    const video = await VideoModel.findById(id);
    if (!video) {
      return res.status(404).json({
        message: "video not found",
      });
    }
    const userInfo = await UserModel.findById(video.user);
    return res.status(200).json({
      data: { video, userInfo },
    });
  });
  app.get("/video", async (req, res, next) => {
    const videos = await VideoModel.find()
      .sort({
        createdAt: -1,
      })
      .limit(10);
    return res.json({
      data: {
        videos,
      },
    });
  });
  //likes routs
  //like
  app.post("/video/:id/like", requireSession, async (req, res, next) => {
    const videoId = req.params.id;
    const user = res.locals.session.user;
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        message: "video not found",
      });
    }
    const isLiked = await LikeModel.find({
      video: videoId,
      user: user,
    });
    if (isLiked.length !== 0) {
      return res.json({
        message: "this video already liked by this user",
      });
    }
    const like = new LikeModel({
      video: videoId,
      user: user,
    });
    await like.save();
    return res.json({
      message: "liked successful",
      likes: video.likes,
    });
  });
  //unlike
  app.delete("/video/:id/like", requireSession, async (req, res, next) => {
    const videoId = req.params.id;
    const user = res.locals.session.user;
    const video = await VideoModel.findById(videoId);
    if (!video) {
      res.status(404).json({
        message: "video not found",
      });
    }
    const isLiked = await LikeModel.find({
      video: videoId,
      user: user,
    });
    if (isLiked.length === 0) {
      return res.json({
        message: "video is not liked by this user",
      });
    }
    await LikeModel.deleteOne({
      video: videoId,
      user: user,
    });
    return res.json({
      message: "video unLiked successful",
      likes: video.likes,
    });
  });
  // check is like
  app.get("/video/:id/like", requireSession, async (req, res, next) => {
    const videoId = req.params.id;
    const user = res.locals.session.user;
    const video = await VideoModel.findById(videoId);
    if (!video) {
      res.status(404).json({
        message: "video not found",
      });
    }
    const isLiked = await LikeModel.find({
      video: videoId,
      user: user,
    });
    if (isLiked.length === 0) {
      return res.json({
        isLiked: false,
      });
    } else {
      return res.json({
        isLiked: true,
        likes: video.likes,
      });
    }
  });

  app.post("/video/:id/view", async (req, res) => {
    const videoId = req.params.id;

    const video = await VideoModel.findOneAndUpdate(
      { _id: videoId },
      { $inc: { views: 1 } },
      { new: true }
    ).exec();

    return res.json({
      status: "success",
      data: video,
    });
  });
};
