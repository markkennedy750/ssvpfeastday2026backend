const ApiError = require('../utils/ApiError');

const adminAuth = (req, res, next) => {
  const key = req.header('x-admin-api-key');
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return next(new ApiError(401, 'Unauthorized: invalid or missing admin API key'));
  }
  next();
};

module.exports = adminAuth;
