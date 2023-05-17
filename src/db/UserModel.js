const bcrypt = require("bcrypt");
const { generatePermanentURL } = require("../s3");
module.exports = (mongoose) => {
  const UserSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        min: 8,
      },
      avatarImg: {
        type: String,
      },
      coverImg: {
        type: String,
      },
      follows: {
        type: Number,
        defaultValue: 0,
      },
      set: { type: Boolean },
    },
    {
      timestamps: true,
    }
  );
  UserSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    return next();
  });
  UserSchema.methods.comparePassword = async function (condidatePassword) {
    const user = this;
    return bcrypt.compare(condidatePassword, user.password);
  };
  UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    user.id = user._id;
    delete user._id;
    delete user.email;
    if (user.avatarImg) user.avatarImg = generatePermanentURL(user.avatarImg);
    if (user.coverImg) user.coverImg = generatePermanentURL(user.coverImg);
    return user;
  };
  return mongoose.model("User", UserSchema);
};
