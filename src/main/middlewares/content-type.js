module.exports = {
  contentType: (req, res, next) => {
    res.type("json");
    next();
  },
};
