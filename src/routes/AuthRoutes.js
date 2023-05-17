const { z } = require("zod");
const { UserModel } = require("../db");
const validate = require("../middlewares/validateMiddleware");
const { generateSessionToken } = require("../services/sessionService");
const { requireSession } = require("../middlewares/requireSessionMiddleware");
const { uploadToS3 } = require("../s3");
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(16),
    lastName: z.string().min(3).max(16),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
module.exports = (app) => {
  app.post("/auth/login", validate(loginSchema), async (req, res, nex) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "This email is not registered",
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const session = await generateSessionToken(user);
    return res.status(200).json({
      message: "Logged in seccessful",
      data: { user, session },
    });
  });
  app.post(
    "/auth/register",
    validate(registerSchema),
    async (req, res, next) => {
      try {
        const { name, lastName, email, password } = req.body;
        const user = new UserModel({
          name,
          lastName,
          email,
          password,
          rank: 5,
          set: false,
        });
        await user.save();
        const session = await generateSessionToken(user);
        return res.status(200).json({
          message: "User registered  seccessful",
          data: { user, session },
        });
      } catch (e) {
        if (e.code === 11000) {
          return res.status(400).json({
            message: "Email already registered",
          });
        }
      }
    }
  );
  app.put("/auth/register/avatar", requireSession, async (req, res, next) => {
    const session = res.locals.session;
    const user = await UserModel.findById(session.user);
    if (!req.files) {
      return res.status(400).json({
        message: "Image Required",
      });
    }
    const avatarImg = req.files.image;
    const path = `public/${user.name}/${avatarImg.md5}${
      "." + avatarImg.name.split(".")?.[1] || ""
    }`;
    user.avatarImg = path;
    await user.save();
    await uploadToS3(avatarImg.data, path);
    return res.json({ data: { user } });
  });
  app.put("/auth/register/cover", requireSession, async (req, res, next) => {
    const session = res.locals.session;
    const user = await UserModel.findById(session.user);
    if (!req.files) {
      return res.status(400).json({
        message: "Image Required",
      });
    }
    const coverImg = req.files.image;
    const path = `public/${user.name}/${coverImg.md5}${
      "." + coverImg.name.split(".")?.[1] || ""
    }`;
    user.coverImg = path;
    user.set = true;
    await user.save();
    await uploadToS3(coverImg.data, path);
    return res.json({ data: { user } });
  });
  app.get("/auth/user/:id", async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    return res.json({ data: { user } });
  });
};
