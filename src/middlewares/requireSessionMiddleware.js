const { SessionModel } = require("../db");

module.exports = {
  requireSession: async (req, res, next) => {
    const sessionToken = req.headers["x-session-token"];
    const session = await SessionModel.findOne({
      token: sessionToken,
    });
    if (!session) {
      return res.json({
        message: "Invalid Session Token",
      });
    }
    if (session.hasExpired()) {
      return res.json({
        message: "Session Expired",
      });
    }
    res.locals.session = session;
    next();
  },
};
