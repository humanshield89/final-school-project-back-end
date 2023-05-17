const mongoose = require("mongoose");
const userSchema = require("./UserModel");
const SessionSchema = require("./SessionModel");
const VideoSchema = require("./VideoModel");
const LikeSchema = require("./LikeModel");
const CommentSchema = require("./CommentModel");
const CommentLikeSchema = require("./CommentLike");
module.exports = {
  connect: () => {
    mongoose
      .connect(process.env.DB_HOST)
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => console.log("err"));
  },
  UserModel: userSchema(mongoose),
  SessionModel: SessionSchema(mongoose),
  VideoModel: VideoSchema,
  LikeModel: LikeSchema(mongoose),
  CommentModel: CommentSchema(mongoose),
  CommentLikeModel: CommentLikeSchema(mongoose),
};
