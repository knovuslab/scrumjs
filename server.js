var http = require('http')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database(
  './users.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
)
var fs = require('fs')
var path = require('path')
const { callbackify } = require('util')
var PORT = 6767
const config = require('./config.json')
var tokens = config.keys
let users = config.users

var stmt = db.prepare(
  "create table IF NOT EXISTS 'tasks'(id INTEGER PRIMARY KEY AUTOINCREMENT, title varchar(32) NOT NULL, user_name varchar(32) NOT NULL, description text, progress INTEGER DEFAULT 0, created_date varchar(32), modified_date varchar(32))"
)

function handle_http (request, response) {
  console.log('request ', request.url)
  let token = /^\/([A-z\d]+)\/?([A-z\d]+)?$/.exec(request.url)

  if (!token || tokens.indexOf(token[1]) == -1) {
    response.writeHead(403, { 'Content-Type': 'application/json' })
    response.end("{'msg':'Not Autherized'}")
    return
  }
  let user = users[tokens.indexOf(token[1])]
  var filePath = './' + (!token[2] ? '' : token[2])
  if (filePath == './') {
    filePath = './index.html'
  }
  if (filePath == './create') {
    fetchPostData(request, response, function (post_data) {
      if (!post_data.progress) {
        makeError(response, 200, 1001, 'progress is required')
        return
      }
      if (!post_data.title) {
        makeError(response, 200, 1002, 'title is required')
        return
      }
      if (!post_data.description) {
        makeError(response, 200, 1003, 'description is required')
        return
      }
      if (!post_data.username) {
        makeError(response, 200, 1004, 'username is required')
        return
      }
      let sql =
        'INSERT INTO users(title, user_name, description, progress, created_date, modified_date) VALUES(?,?,?,?,datetime("now"),datetime("now"))'
      console.log(sql)
      var stmt = db.prepare(sql)
      stmt.get(
        [
          post_data.title,
          post_data.username,
          post_data.description,
          post_data.progress
        ],
        err => {
          console.log(err)
          send_success(response, 'Task Created')
        }
      )
    })
  }

  var extname = String(path.extname(filePath)).toLowerCase()
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  }

  var contentType = mimeTypes[extname] || 'application/octet-stream'

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('./404.html', function (error, content) {
          response.writeHead(404, { 'Content-Type': 'text/html' })
          response.end(content, 'utf-8')
        })
      } else {
        response.writeHead(500)
        response.end(
          'Sorry, check with the site admin for error: ' + error.code + ' ..\n'
        )
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType })
      response.end(content, 'utf-8')
    }
  })
}
var s = http.createServer(handle_http)
s.listen(PORT)
console.log(`Initializing server complete http://localhost/${PORT}`)

function send_success (res, msg) {
  var d = new Date()
  res.writeHead(http_code, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      success: true,
      msg: msg,
      date:
        d.getHours() +
        ':' +
        d.getMinutes() +
        ':' +
        d.getSeconds() +
        ' ' +
        d.getMonth() +
        '/' +
        d.getDate() +
        '/' +
        d.getFullYear()
    })
  )
}

function makeError (res, http_code, err_code, err_msg) {
  var d = new Date()
  res.writeHead(http_code, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      err_code: err_code,
      err_msg: err_msg,
      date:
        d.getHours() +
        ':' +
        d.getMinutes() +
        ':' +
        d.getSeconds() +
        ' ' +
        d.getMonth() +
        '/' +
        d.getDate() +
        '/' +
        d.getFullYear()
    })
  )
}
function fetchPostData (request, response, callback) {
  var post_data = ''
  /*  console.log('===========+++++++++===========')
    console.log('-------Incoming Request --------')
    console.log('===========+++++++++===========') */

  request.on('readable', function () {
    var d = request.read()
    console.log(d)

    if (d) {
      if (typeof d == 'string') {
        post_data += d
      } else if (typeof d == 'object') {
        post_data += d.toString('utf8')
      }
    }
  })

  request.on('end', function () {
    console.log(post_data)
    if (!post_data) {
      makeError(response, 200, '1000', 'no data sent to the node')
      return
    }
    post_data = parse(post_data)
    console.log(post_data)
    callback(post_data)
  })
}
