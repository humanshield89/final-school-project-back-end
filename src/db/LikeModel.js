const VideoModel = require("./VideoModel");

module.exports = (mongoose) => {
  const LikeSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  });

  LikeSchema.post("save", async function (doc) {
    // increment the likes by 1 for video id
    const videoId = doc.video;
    console.log("afterSave triggered for ", doc.video);

    await VideoModel.findOneAndUpdate(
      { _id: videoId },
      { $inc: { likes: 1 } }
    ).exec();
  });

  LikeSchema.post("deleteOne", async function (doc) {
    const videoId = this._conditions?.video;
    await VideoModel.findOneAndUpdate(
      { _id: videoId },
      { $inc: { likes: -1 } }
    ).exec();
  });

  return mongoose.model("Like", LikeSchema);
};
