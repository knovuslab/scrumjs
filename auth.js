const config = require('./config.json')
var tokens = config.keys
let users = config.users

function auth (req, res, callback) {
  let token = /^\/([A-z\d]+)\/?([A-z\d]+)?\/?$/.exec(req.originalUrl)

  if (!token || tokens.indexOf(token[1]) == -1) {
    res.status(403).json({msg:"Not Autherized"})
    return
  }
  let user = users[tokens.indexOf(token[1])]
  callback(user)
}
exports.auth = auth
