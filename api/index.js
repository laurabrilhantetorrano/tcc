const app = require('../backend/src/app');

module.exports = (req, res) => {
  const originalUrl = req.url;
  if (req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/';
  }

  const done = () => {
    req.url = originalUrl;
  };

  res.once('finish', done);
  res.once('close', done);

  return app(req, res);
};
