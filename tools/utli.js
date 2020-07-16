function getDate () {
  var d = new Date()
  return (
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
  )
}
function send_success (res, msg, data) {
  var d = new Date()
  res.status(200).json({
    success: true,
    msg: msg,
    data: data,
    date: getDate()
  })
}
function makeError (res, err_code, err_msg) {
  res.status(200).json({
    err_code: err_code,
    err_msg: err_msg,
    date: getDate()
  })
}
exports.send_success = send_success
exports.makeError = makeError
