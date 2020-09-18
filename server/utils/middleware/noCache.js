// this middleware add common 'no cache' headerst to the response
exports.nocache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, max-age=0, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};
