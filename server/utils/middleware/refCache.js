// this middleware add common 'reference level cache' headers to the response
exports.refcache = (req, res, next) => {
  res.header('Cache-Control', 'public, max-age=86400');
  next();
};
