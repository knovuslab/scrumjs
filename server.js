var http = require('http')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const db = new sqlite3.Database(
  './db/users.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
)
const { auth } = require('./tools/auth')
const { send_success, makeError } = require('./tools/utli')
const { join } = require('path')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 6767

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public/css'))
app.use(express.static('public/js'))

init()

app.get('/*/?', function (req, res) {
  auth(req, res, user => {
    res.sendFile(join(__dirname, 'public', 'index.html'))
  })
})

app.post('/*/create/?', (req, res) => {
  console.log(req.body)
  auth(req, res, user => {
    if (!req.body.progress) {
      makeError(res, 1001, 'progress is required')
      return
    }
    if (!req.body.title) {
      makeError(res, 1002, 'title is required')
      return
    }
    if (!req.body.description) {
      makeError(res, 1003, 'description is required')
      return
    }
    let sql = `INSERT INTO tasks(title, user_name, description, progress, created_date, modified_date) VALUES(?,?,?,?,datetime("now"),datetime("now"))`
    console.log(sql)
    var stmt = db.prepare(sql)
    stmt.run(
      [req.body.title, user, req.body.description, req.body.progress],
      err => {
        if (err) {
          makeError(res, 1006, err)
          return console.log(err)
        }
        send_success(res, 'Task Created')
      }
    )
  })
})

app.post('/*/user', (req, res) => {
  auth(req, res, user => {
    send_success(res, 'Login in user', { username: user })
  })
})
app.post('/*/update_progress', (req, res) => {
  auth(req, res, user => {
    if (!req.body.progress) {
      makeError(res, 1005, 'progress is required')
      return
    }
    if (!req.body.id) {
      makeError(res, 1005, 'id of the card  is required')
      return
    }
    let sql =
      'UPDATE tasks SET  progress = ?, user_name = ?, modified_date = datetime("now") where id=?'
    console.log(sql, req.body.progress, user, req.body.id)
    var stmt = db.prepare(sql)
    stmt.get(sql, [req.body.progress, user, req.body.id], err => {
      if (err) {
        makeError(res, 1007, err)
        return console.log(err)
      }
      send_success(res, 'Task Progress Updated')
    })
  })
})
app.post('/*/update_card', (req, res) => {
  auth(req, res, user => {
    if (!req.body.progress) {
      makeError(res, 1005, 'progress is required')
      return
    }
    if (!req.body.id) {
      makeError(res, 1005, 'id of the card  is required')
      return
    }
    if (!req.body.title) {
      makeError(res, 1005, 'TItle of the card  is required')
      return
    }
    if (!req.body.description) {
      makeError(res, 1005, 'description of the card  is required')
      return
    }
    let sql =
      'UPDATE tasks SET  title= ?, description = ?, progress = ?, user_name = ?, modified_date = datetime("now") where id=?'
    console.log(sql)
    var stmt = db.prepare(sql)
    stmt.get(
      sql,
      [
        req.body.title,
        req.body.description,
        req.body.progress,
        user,
        req.body.id
      ],
      err => {
        if (err) {
          makeError(res, 1007, err)
          return console.log(err)
        }
        send_success(res, 'Task Card Updated')
      }
    )
  })
})
app.post('/*/cards', (req, res) => {
  auth(req, res, user => {
    let sql = "SELECT * FROM 'tasks'"
    console.log(sql)
    db.all(sql, (err, data) => {
      stmt = null
      if (err) {
        makeError(res, 1008, err)
        return console.log(err)
      }
      send_success(res, 'All card where feteched', data)
    })
  })
})

function init () {
  var stmt = db.prepare(
    "create table IF NOT EXISTS 'tasks'(id INTEGER PRIMARY KEY AUTOINCREMENT, title varchar(32) NOT NULL, user_name varchar(32) NOT NULL, description text, progress INTEGER DEFAULT 0, created_date varchar(32), modified_date varchar(32))"
  )
  stmt.get(err => {
    if (err) return console.log('ERROR SQL Table', err)
  })
}
var s = http.createServer(app)
s.listen(PORT)
console.log(`Initializing server complete http://localhost:${PORT}`)
