const jwt = require('jsonwebtoken')
const User = require('../model/User')


//Middleware for User Token Authentication.

exports.userAuth = async (req, res, next) => {
    try {
      // Get the token from the header
      const token = req.header("x-auth-token");
      // Check if no token
      if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
      }
  
      const decoded = jwt.verify(token, "shreyashsecretkey");
      const user = await User.findById(decoded.user_id);
      if (user === null) {
        return res.status(401).json({ msg: "User does not exist" });
      }
      req.user = user;
      res.locals.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ msg: "Authorization failed" });
    }
  }