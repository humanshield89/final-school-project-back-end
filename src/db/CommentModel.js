const { compare } = require("bcrypt");
const VideoModel = require("./VideoModel");

module.exports = (mongoose) => {
  const CommentSchema = new mongoose.Schema(
    {
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
      comment: {
        type: String,
        required: true,
      },
      likes: {
        type: Number,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
    }
  );
  CommentSchema.post("save", async function (doc) {
    const videoId = doc.video;
    console.log("afterSave triggered for ", doc.video);

    await VideoModel.findOneAndUpdate(
      { _id: videoId },
      { $inc: { comments: 1 } }
    ).exec();
  });

  CommentSchema.post("deleteOne", async function (doc) {
    const videoId = this._conditions?.video;
    await VideoModel.findOneAndUpdate(
      { _id: videoId },
      { $inc: { comments: -1 } }
    ).exec();
  });
  CommentSchema.methods.toJSON = function () {
    comment = this.toObject();
    comment.id = comment._id;
    delete comment._id;
    delete comment.__v;
    return comment;
  };
  return mongoose.model("Comment", CommentSchema);
};
