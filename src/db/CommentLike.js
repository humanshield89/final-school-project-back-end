module.exports = (mongoose) => {
  const CommentLikeSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  });

  return mongoose.model("CommentLike", CommentLikeSchema);
};
