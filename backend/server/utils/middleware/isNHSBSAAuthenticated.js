const config = require('../../config/config');
const jwt = require('jsonwebtoken');

const isAuthorised =  (req, res, next) => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  const nhsBsaSecret = config.get('jwt.nhsBsaSecret');

  try {
    const decoded =  jwt.verify(token, nhsBsaSecret);

    if (decoded) return next();
    return  res.status(401).json({ error: 'Invalid token' });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.isAuthorised = isAuthorised;
