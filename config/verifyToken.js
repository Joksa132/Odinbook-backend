const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader)
    if (!bearerHeader) {
      throw new Error("You must provide authorization header")
    }
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    const decoded = jwt.verify(bearerToken, process.env.secret_key)
    console.log(decoded)
    req.user = decoded;
    next();
  }
  catch (e) {
    console.log(e)
    res.status(403).send(e)
  }
}

module.exports = verifyToken;