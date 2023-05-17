const authRoutes = require("./AuthRoutes");
const videoRoutes = require("./VideosRoutes");
const commentsRoutes = require("./CommentsRoutes");
module.exports = (app) => {
  app.get("/status", (req, res, next) => {
    res.send("OK");
  });
  authRoutes(app);
  videoRoutes(app);
  commentsRoutes(app);
};
