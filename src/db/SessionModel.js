module.exports = (mongoose) => {
  const SessionSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  SessionSchema.methods.hasExpired = function () {
    return this.expiryDate < new Date();
  };
  SessionSchema.methods.toJSON = function () {
    const session = this.toObject();
    delete session.user;
    delete session._id;
    delete session.__v;
    return session;
  };
  return mongoose.model("Session", SessionSchema);
};
