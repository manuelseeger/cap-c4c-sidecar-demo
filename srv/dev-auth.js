module.exports = function devAuth(req, res, next) {
  // only used during development to mock authentication
  req.user = new cds.User({
    id: "SEEG",
    roles: [],
    attr: {},
  });
  next();
};
