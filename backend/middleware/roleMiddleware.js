const isAuthor = (req, res, next) => {
    if (req.user.role !== "author") {
      return res.status(403).json({
        message: "Only authors are allowed to perform this action",
      });
    }
    next();
  };
  
  module.exports = { isAuthor };