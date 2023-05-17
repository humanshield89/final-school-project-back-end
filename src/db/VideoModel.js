const { generatePermanentURL } = require("../s3");
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    videoURL: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: {
      type: Number,
      defaultValue: 0,
    },
    likes: {
      type: Number,
      defaultValue: 0,
    },
    shares: {
      type: Number,
      defaultValue: 0,
    },
    views: {
      type: Number,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

VideoSchema.methods.toJSON = function () {
  const video = this.toObject();
  video.id = video._id;
  delete video._id;
  delete video.__v;
  video.videoURL = generatePermanentURL(video.videoURL);
  return video;
};

const Model = mongoose.model("Video", VideoSchema);

module.exports = Model;
