const { VideoModel, CommentModel, CommentLikeModel } = require("../db");
const { requireSession } = require("../middlewares/requireSessionMiddleware");

module.exports = (app) => {
  //post a comment
  app.post("/video/:id/comment", requireSession, async (req, res, next) => {
    const videoId = req.params.id;
    const { comment } = req.body;
    const user = res.locals.session.user;
    const video = await VideoModel.findById(videoId);
    if (!video) {
      return res.status(404).json({
        message: "video not found",
      });
    }
    if (!comment) {
      return res.status(400).json({
        message: "comment required",
      });
    }
    const newComment = new CommentModel({
      video: videoId,
      user: user,
      likes: 0,
      comment,
    });
    const savedComment = await newComment.save();
    return res.status(200).json({
      message: "comment saved",
      data: { user, savedComment, comments: video.comments + 1 },
    });
  });
  //get a video's comments
  app.get("/video/:id/comment", async (req, res, next) => {
    const videoId = req.params.id;
    const comments = await CommentModel.find({
      video: videoId,
    }).sort({
      createdAt: -1,
    });
    return res.json({ comments });
  });

  //like a comment
  app.post("/comment/:id/like", requireSession, async (req, res, next) => {
    const commentId = req.params.id;
    const user = res.locals.session.user;
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.json({
        message: "comment not found",
      });
    }

    const isLiked = await CommentLikeModel.findOne({
      comment: commentId,
      user: user,
    });

    if (isLiked) {
      return res.json({
        message: "this comment already liked by this user",
      });
    }
    const like = new CommentLikeModel({
      comment: commentId,
      user: user,
    });
    await CommentModel.findOneAndUpdate(
      { _id: commentId },
      { $inc: { likes: 1 } }
    ).exec();
    await like.save();
    return res.json({
      message: "comment liked",
    });
  });
  //unlike a comment
  app.delete("/comment/:id/like", requireSession, async (req, res, next) => {
    const commentId = req.params.id;
    const user = res.locals.session.user;
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.json({
        message: "comment not found",
      });
    }
    const isLiked = await CommentLikeModel.findOne({
      comment: commentId,
      user: user,
    });

    if (!isLiked) {
      return res.json({
        message: "this comment is not liked by this user",
      });
    }
    await CommentLikeModel.deleteOne({
      comment: commentId,
      user: user,
    });
    const updatedComment = await CommentModel.findOneAndUpdate(
      { _id: commentId },
      { $inc: { likes: -1 } }
    ).exec();

    return res.json({
      message: "comment liked",
      comment: updatedComment,
    });
  });
  //check is liked
  app.get("/comment/:id/like", requireSession, async (req, res, next) => {
    const commentId = req.params.id;
    const user = res.locals.session.user;
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.json({
        message: "comment not found",
      });
    }
    const isLiked = await CommentLikeModel.findOne({
      comment: commentId,
      user: user,
    });
    if (!isLiked) {
      return res.json({
        isLiked: false,
        likes: comment.likes,
      });
    } else {
      return res.json({
        isLiked: true,
        likes: comment.likes,
      });
    }
  });
};
